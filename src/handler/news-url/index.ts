import {getNewsUrl} from "../../core";

type Request = {
    url: string;
}

type Response = {
    in: string;
    out: string;
}

export const handler = async (event: Request): Promise<Response> => {
    const url = await getNewsUrl(event.url)
    return {
        in: event.url,
        out: url,
    }
}
