import { dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { readFile } from 'node:fs/promises';
import { describe, it } from 'mocha';
import { expect } from 'chai';
import { autoP, makeClickable } from '../../../src/lib/textutils.mjs';

describe('makeClickable', () => {
    const patterns = [
        [' ', ''],
        ['example.com', 'example.com'],
        ['https://example.com', '<a href="https://example.com">https://example.com</a>'],
        ['https://example.com.', '<a href="https://example.com">https://example.com</a>.'],
        ['Text http://example.com more text', 'Text <a href="http://example.com">http://example.com</a> more text'],
        ['ftp://example.com', 'ftp://example.com'],
        ['https://', 'https://'],
        ['https://.', 'https://.'],
    ];

    patterns.forEach(([input, expected]) => {
        it(`should convert '${input}' to '${expected}'`, () => {
            const actual = makeClickable(input);
            expect(actual).to.equal(expected);
        });
    });
});

describe('autoP', () => {
    it('should process the "first post" correctly', async () => {
        const base = dirname(fileURLToPath(import.meta.url));
        const [input, expected] = await Promise.all([
            readFile(`${base}/fixtures/first-post-input.txt`, { encoding: 'utf-8' }),
            readFile(`${base}/fixtures/first-post-expected.txt`, { encoding: 'utf-8' }),
        ]);
        expect(autoP(input)).to.equal(expected);
    });
});