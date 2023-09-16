/* eslint-disable import/no-named-as-default-member */
import { after, afterEach, before, describe, it } from 'mocha';
import express, { type Express } from 'express';
import request from 'supertest';
import * as knexpkg from 'knex';
import mockKnex from 'mock-knex';
import { Model } from 'objection';
import { buildKnexConfig } from '../../../src/knexfile.mjs';
import { configureApp } from '../../../src/server.mjs';
import { attachmentResponse, criminalResponse } from '../../fixtures/queryresponses.mjs';
import { resultItems } from '../../fixtures/results.mjs';

describe('SearchController', () => {
    let app: Express;
    let db: knexpkg.Knex;

    before(() => {
        app = express();

        const { knex } = knexpkg.default;
        db = knex(buildKnexConfig({ MYSQL_DATABASE: 'fake' }));
        mockKnex.mock(db);
        Model.knex(db);

        return configureApp(app);
    });

    after(() => mockKnex.unmock(db));

    afterEach(() => mockKnex.getTracker().uninstall());

    describe('Error Handling', () => {
        it('should fail the request without s parameter', () =>
            request(app)
                .get('/search')
                .expect(400)
                .expect(/"code":"BAD_REQUEST"/u));

        it('should fail the request on an empty s', () =>
            request(app)
                .get('/search?s=')
                .expect(400)
                .expect(/"code":"BAD_REQUEST"/u));

        it('should fail the request if s is not URL-encoded', () =>
            request(app)
                .get('/search?s=test+test')
                .expect(400)
                .expect(/"code":"BAD_REQUEST"/u));

        ['Medvedev', 'Medvedev Medvedev', 'Putin #@Putin', 'Putin %21%40%23%24%25%5E%26'].forEach((param) =>
            it(`should fail the request if s is invalid ('${param}')`, () =>
                request(app)
                    .get(`/search?s=${param}`)
                    .expect(400)
                    .expect(/"code":"BAD_SEARCH_TERM"/u)),
        );

        it('should return a 404 on non-existing URLs', () => request(app).get('/admin').expect(404));

        (['post', 'put', 'head', 'delete', 'patch', 'options'] as const).forEach((method) =>
            it(`should return a 405 on disallowed methods ('${method}')`, () =>
                request(app)[method]('/search').expect(405)),
        );
    });

    describe('Normal operation', () => {
        it('should return the result in the expected format', () => {
            const tracker = mockKnex.getTracker();
            tracker.on('query', (query, step) => {
                const responses = [[], criminalResponse, attachmentResponse, []];
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