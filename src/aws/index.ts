import {APIGatewayProxyHandler} from "aws-lambda";
import {badRequest, errorResponse, okResponse} from "../util/responses";
import * as playwright from "playwright-aws-lambda";
import {getS3SignedUrl, uploadToS3} from "../util/awsWrapper";

export type productPage = {
    title: string | null;
    description: string | null;
    price?: string | null;
    ratings: number;
    image?: string | null;
    author?: string | null;
    details: detail[];
    rankings: ranking[];
    screenshot: string;
}

export type  detail = {
    key: string;
    value: string;
}

export type  ranking = {
    categoryName: string;
    ranking: string;
}

export const playWrightTest: APIGatewayProxyHandler = async (
    event,
    _context
) => {
    if (!event.queryStringParameters?.url) {
        return badRequest;
    }

    try {
        const pageData: productPage = await getPageData(
            event.queryStringParameters.url
        );
        return okResponse(pageData);
    } catch (error: any) {
        // @ts-ignore
        console.log(error);
        return errorResponse(error);
    }
};

const getPageData = async (url: string): Promise<productPage> => {
    const numberPattern: RegExp = /\D/g;
    const key = url.split('/')[url.split('/').length - 1];

    // Create empty productPage object
    const data = {} as productPage;
    data.details = [];
    data.rankings = [];

    //Launch chrmoium browser
    const browser = await playwright.launchChromium();
    // @ts-ignore
    console.log(browser);


    // Create a new page in the browser instance
    const page = await browser.newPage({strictSelectors: false});

    //Load the passed URL
    await page.goto(url);

    //Title
    await page.waitForSelector('id=productTitle');
    const title = page.locator('id=productTitle');
    data.title = await title.textContent();

    //Description
    await page.waitForSelector('id=editorialReviews_feature_div');
    const description = page.locator('id=editorialReviews_feature_div');
    data.description = await description.textContent();

    //Price
    const price = await page.$('span.a-offscreen');
    data.price = await price?.textContent();

    //Ratings
    page.$('#acrCustomerReviewText').then((ratings) => {
        ratings?.textContent().then(rating => {
            data.ratings = rating ? parseInt(rating.replace(numberPattern, '')) : 0
        })
    })

    //Image
    const image = await page.$('#imgBlkFront');
    data.image = await image?.getAttribute('src');

    //Author
    const author = await page.$('a.contributorNameID');
    data.author = await author?.textContent();

    //Details
    const details = await page.$$(
        '#detailBulletsWrapper_feature_div >> ul >> li > span.a-list-item'
    );
    if (details?.length > 0) {
        for (let i = 0; i < details.length; i++) {
            const detail = await details[i]?.$$('span');
            if (detail && detail[0] && detail[1]) {
                data.details.push({
                    key: await detail[0].innerText(),
                    value: await detail[1].innerText(),
                });
            }
        }
    }


    //Rankings
    const rankings = await page.$$('ul.zg_hrsr >> li >> span.a-list-item');
    for (let i = 0; i < rankings.length; i++) {
        const innerText = await rankings[i]?.innerText();
        if (innerText) {
            const parts = innerText.split('in');
            if (parts.length > 1) {
                data.rankings.push({
                    categoryName: parts[1]?.trim() ?? '',
                    ranking: parts[0]?.trim() ?? ''
                });
            }

        }

    }

    //close cookies popup
    const cookies = await page.$('#sp-cc-accept');
    await cookies?.click();

    //Buffer
    const buffer = await page.screenshot({fullPage: true});

    //Upload buffer to s3
    // @ts-ignore
    await uploadToS3({
        // @ts-ignore
        Bucket: process.env.PLAYWRIGHT_SCREENSHOT_BUCKET,
        Key: `${key}.png`,
        Body: buffer,
        ContentType: 'image/png',
        ACL: 'public-read'
    });

    data.screenshot = await getS3SignedUrl({
        // @ts-ignore
        Bucket: process.env.PLAYWRIGHT_SCREENSHOT_BUCKET,
        Key: `${key}.png`,
        Expires: 1000
    });

    await browser.close();

    return data;
};
