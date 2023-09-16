/* eslint-disable import/no-named-as-default-member */
import { afterEach, beforeEach, describe, it } from 'mocha';
import { expect } from 'chai';
import mockKnex from 'mock-knex';
import * as knexpkg from 'knex';
import { Model } from 'objection';
import { SearchService } from '../../../src/services/search.mjs';
import { buildKnexConfig } from '../../../src/knexfile.mjs';
import { attachmentResponse, criminalResponse } from '../../fixtures/queryresponses.mjs';
import { resultItems } from '../../fixtures/results.mjs';
import { CriminalAttachment } from '../../../src/models/criminalattachment.mjs';

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
            expect(actual).to.equal(expected);
        };

        const table1: [string, string | null][] = [
            ['путинхуйло', null],
            ['путин путин', null],
            ['Путин путин', null],
            ['Путин  путин ', null],
            ['Путин@ #путин ', null],
            ['@@@ ### $$$', null],
        ];

        table1.forEach(([input, expected]) =>
            it(`should discard names having less than two unique lexemes ('${input}')`, () => tester(input, expected)),
        );

        const table2: [string, string][] = [
            ['пУтин владимир', '>"путин владимир" +путин +владимир'],
            ['Путин путин владимир', '>"путин владимир" +путин +владимир'],
            ['Путин@ #владимир ', '>"путин владимир" +путин +владимир'],
            ['путин-хуйло', '>"путин хуйло" +путин +хуйло'],
        ];

        table2.forEach(([input, expected]) =>
            it(`should correctly handle names with two lexemes ('${input}' => '${expected}')`, () =>
                tester(input, expected)),
        );

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

        table3.forEach(([input, expected]) =>
            it(`should correctly handle names with more than two lexemes ('${input}' => '${expected}')`, () =>
                tester(input, expected)),
        );
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

            expect(MySearchService.testGetThumbnails(input)).to.deep.equal(expected);
        });

        it('should use the first attachment for the criminal', () => {
            const input: CriminalAttachment[] = [
                CriminalAttachment.fromJson({ id: 1, att_id: 2, path: '1.png', mime_type: 'image/png' }),
                CriminalAttachment.fromJson({ id: 1, att_id: 3, path: '2.jpg', mime_type: 'image/jpeg' }),
            ];

            const expected: Record<number, string> = {
                1: '1-150x150.png',
            };

            expect(MySearchService.testGetThumbnails(input)).to.deep.equal(expected);
        });
    });

    describe('search', () => {
        const { knex } = knexpkg.default;
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

        table1.forEach(([name]) =>
            it(`should return null when prepareName returns falsy value ('${name}')`, () =>
                expect(SearchService.search(name)).to.eventually.be.null),
        );

        it('should return an empty array if there are no matches', () => {
            const tracker = mockKnex.getTracker();
            tracker.on('query', (query, step) => {
                switch (step) {
                    case 1: // BEGIN
                    case 3: // COMMIT
                        expect(query.transacting).to.be.true;
                        expect(query.method).to.be.undefined;
                        query.response([]);
                        break;

                    case 2:
                        expect(query.transacting).to.be.true;
                        expect(query.method).to.equal('select');
                        expect(query.bindings).to.have.length(4);
                        query.response([]);
                        break;

                    default:
                        throw new Error('UNEXPECTED');
                }
            });

            tracker.install();
            return expect(SearchService.search('Путин Владимир')).to.become([]);
        });

        it('should return the expected results', () => {
            const tracker = mockKnex.getTracker();
            tracker.on('query', (query, step) => {
                switch (step) {
                    case 1: // BEGIN
                    case 4: // COMMIT
                        expect(query.transacting).to.be.true;
                        expect(query.method).to.be.undefined;
                        query.response([]);
                        break;

                    case 2:
                        expect(query.transacting).to.be.true;
                        expect(query.method).to.equal('select');
                        expect(query.bindings).to.have.length(4);
                        query.response(criminalResponse);
                        break;

                    case 3:
                        expect(query.transacting).to.be.true;
                        expect(query.method).to.equal('select');
                        expect(query.bindings).to.have.length(3);
                        query.response(attachmentResponse);
                        break;

                    default:
                        throw new Error('UNEXPECTED');
                }
            });

            tracker.install();
            return expect(SearchService.search('Our mock will find everything')).to.become(resultItems);
        });
    });
});
