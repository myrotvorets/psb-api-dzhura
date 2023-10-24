/* eslint-disable import/no-named-as-default-member */
import { type Express } from 'express';
import request from 'supertest';
import mockKnex from 'mock-knex';
import { configureApp, createApp } from '../../../src/server.mjs';
import { container } from '../../../src/lib/container.mjs';
import { attachmentResponse, criminalResponse } from '../../fixtures/queryresponses.mjs';
import { resultItems } from '../../fixtures/results.mjs';

describe('SearchController', function () {
    let app: Express;

    before(async function () {
        await container.dispose();
        app = createApp();
        await configureApp(app);

        mockKnex.mock(container.resolve('db'));
    });

    after(function () {
        mockKnex.unmock(container.resolve('db'));
        return container.dispose();
    });

    afterEach(function () {
        mockKnex.getTracker().uninstall();
    });

    describe('Error Handling', function () {
        it('should fail the request without s parameter', function () {
            return request(app)
                .get('/search')
                .expect(400)
                .expect(/"code":"BAD_REQUEST"/u);
        });

        it('should fail the request on an empty s', function () {
            return request(app)
                .get('/search?s=')
                .expect(400)
                .expect(/"code":"BAD_REQUEST"/u);
        });

        it('should fail the request if s is not URL-encoded', function () {
            return request(app)
                .get('/search?s=test+test')
                .expect(400)
                .expect(/"code":"BAD_REQUEST"/u);
        });

        // eslint-disable-next-line mocha/no-setup-in-describe
        ['Medvedev', 'Medvedev Medvedev', 'Putin #@Putin', 'Putin %21%40%23%24%25%5E%26'].forEach((param) =>
            it(`should fail the request if s is invalid ('${param}')`, function () {
                return request(app)
                    .get(`/search?s=${param}`)
                    .expect(400)
                    .expect(/"code":"BAD_SEARCH_TERM"/u);
            }),
        );

        it('should return a 404 on non-existing URLs', function () {
            return request(app).get('/admin').expect(404);
        });

        // eslint-disable-next-line mocha/no-setup-in-describe
        (['post', 'put', 'head', 'delete', 'patch', 'options'] as const).forEach((method) =>
            it(`should return a 405 on disallowed methods ('${method}')`, function () {
                return request(app)[method]('/search').expect(405);
            }),
        );
    });

    describe('Normal operation', function () {
        it('should return the result in the expected format', function () {
            const tracker = mockKnex.getTracker();
            tracker.on('query', (query, step) => {
                const responses = [[], [], criminalResponse, attachmentResponse, []];
                query.response(responses[step - 1]);
            });

            const expected = {
                success: true,
                items: resultItems,
            };

            tracker.install();
            return request(app).get('/search?s=We%20will%20find%20everything').expect(200).expect(expected);
        });
    });
});
