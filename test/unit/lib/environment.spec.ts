import { Environment, environment } from '../../../src/lib/environment.mjs';

describe('environment', () => {
    const env = { ...process.env };

    afterEach(() => (process.env = { ...env }));

    it('should not allow extra variables', () => {
        const expected: Environment = {
            NODE_ENV: 'development',
            PORT: 3000,
        };

        process.env = {
            NODE_ENV: `${expected.NODE_ENV}`,
            PORT: `${expected.PORT}`,
            EXTRA: 'xxx',
        };

        const actual = { ...environment() };
        expect(actual).toStrictEqual(expected);
    });

    it('should cache the result', () => {
        const expected: Environment = {
            NODE_ENV: 'staging',
            PORT: 3030,
        };

        process.env = {
            NODE_ENV: `${expected.NODE_ENV}`,
            PORT: `${expected.PORT}`,
        };

        let actual = { ...environment(true) };
        expect(actual).toStrictEqual(expected);

        process.env = {
            NODE_ENV: `${expected.NODE_ENV}${expected.NODE_ENV}`,
            PORT: `1${expected.PORT}`,
        };

        actual = { ...environment() };
        expect(actual).toStrictEqual(expected);
    });
});
