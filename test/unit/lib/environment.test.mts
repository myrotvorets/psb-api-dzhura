import { expect } from 'chai';
import { type Environment, environment } from '../../../src/lib/environment.mjs';

describe('environment', function () {
    let env: typeof process.env;

    before(function () {
        env = { ...process.env };
    });

    afterEach(function () {
        process.env = { ...env };
    });

    it('should not allow extra variables', function () {
        const expected: Environment = {
            NODE_ENV: 'development',
            PORT: 3000,
            IMAGE_CDN_PREFIX: 'https://cdn.example.com/',
        };

        process.env = {
            NODE_ENV: expected.NODE_ENV,
            PORT: `${expected.PORT}`,
            IMAGE_CDN_PREFIX: expected.IMAGE_CDN_PREFIX,
            EXTRA: 'xxx',
        };

        const actual = { ...environment(true) };
        expect(actual).to.deep.equal(expected);
    });

    it('should cache the result', function () {
        const expected: Environment = {
            NODE_ENV: 'staging',
            PORT: 3030,
            IMAGE_CDN_PREFIX: 'https://cdn.example.com/',
        };

        process.env = {
            NODE_ENV: expected.NODE_ENV,
            PORT: `${expected.PORT}`,
            IMAGE_CDN_PREFIX: expected.IMAGE_CDN_PREFIX,
        };

        let actual = { ...environment(true) };
        expect(actual).to.deep.equal(expected);

        process.env = {
            NODE_ENV: `${expected.NODE_ENV}${expected.NODE_ENV}`,
            PORT: `1${expected.PORT}`,
            IMAGE_CDN_PREFIX: expected.IMAGE_CDN_PREFIX,
        };

        actual = { ...environment() };
        expect(actual).to.deep.equal(expected);
    });
});
