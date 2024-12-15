/* eslint-disable @typescript-eslint/no-unused-expressions */
import { expect } from 'chai';
import mockKnex from 'mock-knex';
import { container, initializeContainer } from '../../../src/lib/container.mjs';
import { ModelService } from '../../../src/services/modelservice.mjs';
import { CriminalModel } from '../../../src/models/criminal.mjs';
import { CriminalAttachmentModel } from '../../../src/models/criminalattachment.mjs';

describe('decode', function () {
    let service: ModelService;

    before(async function () {
        await container.dispose();
        initializeContainer();
        mockKnex.mock(container.resolve('db'));
        service = container.resolve('modelService');
    });

    after(function () {
        return container.dispose();
    });

    afterEach(function () {
        mockKnex.getTracker().uninstall();
    });

    describe('getters', function () {
        it('criminal should return CriminalModel', function () {
            expect(service.criminal).to.be.an('object').that.is.instanceOf(CriminalModel);
        });

        it('criminalAttachment should return CriminalAttachmentModel', function () {
            expect(service.criminalAttachment).to.be.an('object').that.is.instanceOf(CriminalAttachmentModel);
        });
    });

    describe('#transaction', function () {
        it('should start a transaction', async function () {
            const tracker = mockKnex.getTracker();
            let lastStep = 0;
            let isTrx: boolean | undefined;
            tracker.on('query', (query, step) => {
                lastStep = step;
                expect(step).to.be.lessThanOrEqual(4);
                expect(query.transacting).to.be.true;
                switch (step) {
                    case 1:
                        expect(query.method).to.be.undefined;
                        expect(query.sql).to.equal('BEGIN;');
                        break;

                    case 2:
                        expect(query.method).to.equal('select');
                        expect(query.sql).to.contain(CriminalModel.tableName);
                        break;

                    case 3:
                        expect(query.method).to.equal('select');
                        expect(query.sql).to.contain(CriminalAttachmentModel.tableName);
                        break;

                    case 4:
                        expect(query.method).to.be.undefined;
                        expect(query.sql).to.equal('COMMIT;');
                        break;

                    /* no default */
                }

                query.response([]);
            });
            tracker.install();

            await service.transaction(async (trx, models) => {
                isTrx = trx.isTransaction;
                await models.criminal.searchByName('', 0);
                await models.criminalAttachment.byIds([0]);
            });

            expect(isTrx).to.be.true;
            expect(lastStep).to.equal(4);
        });

        it('should support read-only transactions', async function () {
            const tracker = mockKnex.getTracker();
            let lastStep = 0;
            let isTrx: boolean | undefined;
            tracker.on('query', (query, step) => {
                lastStep = step;
                expect(query.transacting).to.be.true;
                switch (step) {
                    case 1:
                        expect(query.method).to.be.undefined;
                        expect(query.sql).to.equal('SET TRANSACTION READ ONLY;');
                        break;

                    case 2:
                        expect(query.method).to.be.undefined;
                        expect(query.sql).to.equal('BEGIN;');
                        break;

                    case 3:
                        expect(query.method).to.be.undefined;
                        expect(query.sql).to.equal('COMMIT;');
                        break;

                    /* no default */
                }

                query.response([]);
            });
            tracker.install();

            await service.transaction(
                (trx) => {
                    isTrx = trx.isTransaction;
                    return Promise.resolve();
                },
                { readOnly: true },
            );

            expect(isTrx).to.be.true;
            expect(lastStep).to.equal(3);
        });
    });
});
