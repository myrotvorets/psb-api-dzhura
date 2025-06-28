/* eslint-disable @typescript-eslint/no-unused-expressions */
import { expect } from 'chai';
import mockKnex from 'mock-knex';
import { container, initializeContainer } from '../../../src/lib/container.mjs';
import { SearchService } from '../../../src/services/searchservice.mjs';
import { SearchServiceInterface } from '../../../src/services/searchserviceinterface.mjs';
import { CriminalAttachment } from '../../../src/models/criminalattachment.mjs';
import { attachmentResponse, criminalResponse } from '../../fixtures/queryresponses.mjs';
import { resultItems } from '../../fixtures/results.mjs';

class MySearchService extends SearchService {
    public static testPrepareName(name: string): string | null {
        return SearchService.prepareName(name);
    }

    public static testGetThumbnails(atts: readonly CriminalAttachment[]): Record<number, string> {
        return SearchService.getThumbnails(atts);
    }
}

describe('SearchService', function () {
    describe('prepareName', function () {
        const tester = (input: string, expected: string | null): void => {
            const actual = MySearchService.testPrepareName(input);
            expect(actual).to.equal(expected);
        };

        const table1: [string, null][] = [
            ['путинхуйло', null],
            ['путин путин', null],
            ['Путин путин', null],
            ['Путин  путин ', null],
            ['Путин@ #путин ', null],
            ['@@@ ### $$$', null],
        ];

        // eslint-disable-next-line mocha/no-setup-in-describe
        table1.forEach(([input, expected]) =>
            it(`should discard names having less than two unique lexemes ('${input}')`, function () {
                tester(input, expected);
            }),
        );

        const table2 = [
            ['пУтин владимир', '>"путин владимир" +путин +владимир'],
            ['Путин путин владимир', '>"путин владимир" +путин +владимир'],
            ['Путин@ #владимир ', '>"путин владимир" +путин +владимир'],
            ['путин-хуйло', '>"путин хуйло" +путин +хуйло'],
        ] as const;

        // eslint-disable-next-line mocha/no-setup-in-describe
        table2.forEach(([input, expected]) =>
            it(`should correctly handle names with two lexemes ('${input}' => '${expected}')`, function () {
                tester(input, expected);
            }),
        );

        const table3 = [
            [
                'пУтин владимир владимирович',
                '>"путин владимир владимирович" "путин владимир" +путин +владимир владимирович',
            ],
            [
                'Путин-Хуйло Вальдемар Вальдемарович',
                '>"путин хуйло вальдемар вальдемарович" "путин хуйло" +путин +хуйло вальдемар вальдемарович',
            ],
        ] as const;

        // eslint-disable-next-line mocha/no-setup-in-describe
        table3.forEach(([input, expected]) =>
            it(`should correctly handle names with more than two lexemes ('${input}' => '${expected}')`, function () {
                tester(input, expected);
            }),
        );
    });

    describe('getThumbnails', function () {
        it('should insert -150x150 suffix', function () {
            const input: CriminalAttachment[] = [
                { id: 1, att_id: 2, path: 'some/file.png', mime_type: 'image/png' },
                {
                    id: 3,
                    att_id: 4,
                    path: 'another/filename.jpg',
                    mime_type: 'image/jpeg',
                },
            ];

            const expected: Record<number, string> = {
                1: 'some/file-150x150.png',
                3: 'another/filename-150x150.jpg',
            };

            expect(MySearchService.testGetThumbnails(input)).to.deep.equal(expected);
        });

        it('should use the first attachment for the criminal', function () {
            const input: CriminalAttachment[] = [
                { id: 1, att_id: 2, path: '1.png', mime_type: 'image/png' },
                { id: 1, att_id: 3, path: '2.jpg', mime_type: 'image/jpeg' },
            ];

            const expected: Record<number, string> = {
                1: '1-150x150.png',
            };

            expect(MySearchService.testGetThumbnails(input)).to.deep.equal(expected);
        });
    });

    describe('search', function () {
        let service: SearchServiceInterface;

        before(async function () {
            await container.dispose();
            initializeContainer();
            mockKnex.mock(container.resolve('db'));
            service = container.resolve('searchService');
        });

        after(function () {
            mockKnex.unmock(container.resolve('db'));
            return container.dispose();
        });

        afterEach(function () {
            mockKnex.getTracker().uninstall();
        });

        const table1 = [
            'путинхуйло',
            'путин путин',
            'Путин путин',
            'Путин  путин ',
            'Путин@ #путин ',
            '@@@ ### $$$',
        ] as const;

        // eslint-disable-next-line mocha/no-setup-in-describe
        table1.forEach((name) =>
            it(`should return null when prepareName returns falsy value ('${name}')`, function () {
                return expect(service.search(name)).to.eventually.be.null;
            }),
        );

        it('should return an empty array if there are no matches', function () {
            const tracker = mockKnex.getTracker();
            tracker.on('query', (query, step) => {
                switch (step) {
                    case 1: // SET TRANSACTION READ ONLY
                    case 2: // BEGIN
                    case 4: // COMMIT
                        expect(query.transacting).to.be.true;
                        expect(query.method).to.be.undefined;
                        query.response([]);
                        break;

                    case 3:
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
            return expect(service.search('Путин Владимир')).to.become([]);
        });

        it('should return the expected results', function () {
            const tracker = mockKnex.getTracker();
            tracker.on('query', (query, step) => {
                switch (step) {
                    case 1: // SET TRANSACTION READ ONLY
                    case 2: // BEGIN
                    case 5: // COMMIT
                        expect(query.transacting).to.be.true;
                        expect(query.method).to.be.undefined;
                        query.response([]);
                        break;

                    case 3:
                        expect(query.transacting).to.be.true;
                        expect(query.method).to.equal('select');
                        expect(query.bindings).to.have.length(4);
                        query.response(criminalResponse);
                        break;

                    case 4:
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
            return expect(service.search('Our mock will find everything')).to.become(resultItems);
        });
    });
});
