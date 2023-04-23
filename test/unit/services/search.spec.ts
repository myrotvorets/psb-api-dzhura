import mockKnex from 'mock-knex';
import knexpkg from 'knex';
import { Model } from 'objection';
import SearchService from '../../../src/services/search.mjs';
import { buildKnexConfig } from '../../../src/knexfile.mjs';
import { attachmentResponse, criminalResponse } from '../../fixtures/queryresponses.js';
import { resultItems } from '../../fixtures/results.js';
import CriminalAttachment from '../../../src/models/criminalattachment.mjs';

class MySearchService extends SearchService {
    public static testPrepareName(name: string): string | null {
        return SearchService.prepareName(name);
    }

    public static testGetThumbnails(atts: readonly CriminalAttachment[]): Record<number, string> {
        return SearchService.getThumbnails(atts);
    }
}

describe('SearchService', () => {
    describe('prepareName', () => {
        const tester = (input: string, expected: string | null): void => {
            const actual = MySearchService.testPrepareName(input);
            expect(actual).toBe(expected);
        };

        const table1: [string, string | null][] = [
            ['путинхуйло', null],
            ['путин путин', null],
            ['Путин путин', null],
            ['Путин  путин ', null],
            ['Путин@ #путин ', null],
            ['@@@ ### $$$', null],
        ];

        it.each(table1)('should discard names having less than two unique lexemes (%s)', tester);

        const table2: [string, string][] = [
            ['пУтин владимир', '>"путин владимир" +путин +владимир'],
            ['Путин путин владимир', '>"путин владимир" +путин +владимир'],
            ['Путин@ #владимир ', '>"путин владимир" +путин +владимир'],
            ['путин-хуйло', '>"путин хуйло" +путин +хуйло'],
        ];

        it.each(table2)('should correctly handle names with two lexemes (%s => %s)', tester);

        const table3: [string, string][] = [
            [
                'пУтин владимир владимирович',
                '>"путин владимир владимирович" "путин владимир" +путин +владимир владимирович',
            ],
            [
                'Путин-Хуйло Вальдемар Вальдемарович',
                '>"путин хуйло вальдемар вальдемарович" "путин хуйло" +путин +хуйло вальдемар вальдемарович',
            ],
        ];

        it.each(table3)('should correctly handle names with more than two lexemes (%s => %s)', tester);
    });

    describe('getThumbnails', () => {
        it('should insert -150x150 suffix', () => {
            const input: CriminalAttachment[] = [
                CriminalAttachment.fromJson({ id: 1, att_id: 2, path: 'some/file.png', mime_type: 'image/png' }),
                CriminalAttachment.fromJson({
                    id: 3,
                    att_id: 4,
                    path: 'another/filename.jpg',
                    mime_type: 'image/jpeg',
                }),
            ];

            const expected: Record<number, string> = {
                1: 'some/file-150x150.png',
                3: 'another/filename-150x150.jpg',
            };

            expect(MySearchService.testGetThumbnails(input)).toStrictEqual(expected);
        });

        it('should use the first attachemnt for the criminal', () => {
            const input: CriminalAttachment[] = [
                CriminalAttachment.fromJson({ id: 1, att_id: 2, path: '1.png', mime_type: 'image/png' }),
                CriminalAttachment.fromJson({ id: 1, att_id: 3, path: '2.jpg', mime_type: 'image/jpeg' }),
            ];

            const expected: Record<number, string> = {
                1: '1-150x150.png',
            };

            expect(MySearchService.testGetThumbnails(input)).toStrictEqual(expected);
        });
    });

    describe('search', () => {
        const knex = knexpkg.default;
        const db = knex(buildKnexConfig({ MYSQL_DATABASE: 'fake' }));
        beforeEach(() => {
            mockKnex.mock(db);
            Model.knex(db);
        });

        afterEach(() => {
            mockKnex.getTracker().uninstall();
            mockKnex.unmock(db);
        });

        const table1 = [
            ['путинхуйло'],
            ['путин путин'],
            ['Путин путин'],
            ['Путин  путин '],
            ['Путин@ #путин '],
            ['@@@ ### $$$'],
        ];

        it.each(table1)('should return null when prepareName returns falsy value (%s)', (name: string) => {
            return expect(SearchService.search(name)).resolves.toBeNull();
        });

        it('should return an empty array if there are no matches', () => {
            const tracker = mockKnex.getTracker();
            tracker.on('query', (query, step) => {
                switch (step) {
                    case 1: // BEGIN
                    case 3: // COMMIT
                        expect(query.transacting).toBe(true);
                        expect(query.method).toBeUndefined();
                        query.response([]);
                        break;

                    case 2:
                        expect(query.transacting).toBe(true);
                        expect(query.method).toBe('select');
                        expect(query.bindings).toHaveLength(4);
                        query.response([]);
                        break;

                    default:
                        throw new Error('UNEXPECTED');
                }
            });

            tracker.install();
            return expect(SearchService.search('Путин Владимир')).resolves.toEqual([]);
        });

        it('should return the expected results', () => {
            const tracker = mockKnex.getTracker();
            tracker.on('query', (query, step) => {
                switch (step) {
                    case 1: // BEGIN
                    case 4: // COMMIT
                        expect(query.transacting).toBe(true);
                        expect(query.method).toBeUndefined();
                        query.response([]);
                        break;

                    case 2:
                        expect(query.transacting).toBe(true);
                        expect(query.method).toBe('select');
                        expect(query.bindings).toHaveLength(4);
                        query.response(criminalResponse);
                        break;

                    case 3:
                        expect(query.transacting).toBe(true);
                        expect(query.method).toBe('select');
                        expect(query.bindings).toHaveLength(3);
                        query.response(attachmentResponse);
                        break;

                    default:
                        throw new Error('UNEXPECTED');
                }
            });

            tracker.install();
            return expect(SearchService.search('Our mock will find everything')).resolves.toEqual(resultItems);
        });
    });
});
