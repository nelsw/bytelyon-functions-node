import {Handler} from "aws-lambda";
import {getNewsUrl} from "../../core";

export const handler: Handler<string, string> = async (url: string): Promise<string> => {
    return getNewsUrl(url)
}
