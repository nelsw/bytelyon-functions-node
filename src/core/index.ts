import * as playwright from 'playwright-aws-lambda';

import 'source-map-support/register';
import {ChromiumBrowser, Page} from "playwright-core";

export const getNewsUrl = async (url: string): Promise<string> => {
    return newPage(url)
        .then(waitForFinalRedirect)
        .catch(err);
}

let browser: ChromiumBrowser | null = null;
const newPage = async (url: string): Promise<Page> => {
    if (!browser) {
        browser = await playwright.launchChromium({
            headless: true,
        });
    }
    const page = await browser.newPage();
    await page.goto(url);
    return page;
}

const redirectsFinished = (url: URL) => {
    const s = url.toString()
    return s.indexOf('https://www.bing.com') === -1
        && s.indexOf('https://news.google.com') === -1;
}

const waitForFinalRedirect = async (page: Page): Promise<string> => {
    await page.waitForURL(redirectsFinished)
    const url = page.url();
    await page.close();
    return url;
}

const err = async (e: any): Promise<string> => {
    console.error(e);
    return e instanceof Error ? e.message : e;
}




