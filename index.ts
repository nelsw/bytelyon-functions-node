import { Context } from 'aws-lambda';
export const handler = async (event: string, context: Context): Promise<string> => {
    // @ts-ignore
    console.log('Remaining time: ', context.getRemainingTimeInMillis());
    // @ts-ignore
    console.log('Function name: ', context.functionName);
    return context.logStreamName;
};
