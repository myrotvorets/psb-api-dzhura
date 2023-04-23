import { readFile } from 'node:fs/promises';
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

    it.each(patterns)('should convert %s to %s', (input: string, expected: string) => {
        const actual = makeClickable(input);
        expect(actual).toBe(expected);
    });
});

describe('autoP', () => {
    it('should process the "first post" correctly', async () => {
        const [input, expected] = await Promise.all([
            readFile(`${__dirname}/fixtures/first-post-input.txt`, { encoding: 'utf-8' }),
            readFile(`${__dirname}/fixtures/first-post-expected.txt`, { encoding: 'utf-8' }),
        ]);
        expect(autoP(input)).toBe(expected);
    });
});
