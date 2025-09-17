const {getNewsUrl} = require("../../src/core");

describe('given an obfuscated URL', () => {
    it('gets the final google news URL', async () => {
        const googleNewsURL = 'https://news.google.com/rss/articles/CBMitwFBVV95cUxNaFZrREEyZ1BKd0FVc01xdVFzMUNvLU5VTUs4QVU5YXZwYndBZEFIQktHdXl1RTBUYjYwVVFXVEtlaXN3UU9fOUVhc3BweW1iUjJEMTQzcmxlUzJpYmxtYS1XcVB6cEpDaGlOUTBZa3VxV09QVkFhWEowdTE1aVNZb3owelhaaHEyTkM3Nm9FT3l3UjZIQWR2TzRFM3lYVzAwN0lhXzYzdHNoeERpNVdSdzhNZENmU0k?oc=5';
        const actual = await getNewsUrl(googleNewsURL)
        const expected = 'https://www.thetruthaboutcars.com/cars/news-blog/gm-temporarily-cutting-production-of-gmc-hummer-and-others-45130672'
        expect(actual).toEqual(expected)
    }, 15_000);
});

