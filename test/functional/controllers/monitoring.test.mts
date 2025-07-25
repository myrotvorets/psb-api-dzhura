import type { RequestListener } from 'node:http';
import { expect } from 'chai';
import request from 'supertest';
import mockKnex from 'mock-knex';
import { healthChecker } from '../../../src/controllers/monitoring.mjs';
import { container } from '../../../src/lib/container.mjs';
import { configureApp, createApp } from '../../../src/server.mjs';

describe('MonitoringController', function () {
    let app: RequestListener;

    before(async function () {
        await container.dispose();
        const application = createApp();
        configureApp(application);
        app = application as RequestListener;

        mockKnex.mock(container.resolve('db'));
    });

    beforeEach(function () {
        // eslint-disable-next-line @typescript-eslint/no-unused-expressions
        expect(healthChecker).not.to.be.undefined;
        healthChecker!.shutdownRequested = false;
    });

    after(function () {
        mockKnex.unmock(container.resolve('db'));
        return container.dispose();
    });

    afterEach(function () {
        mockKnex.getTracker().uninstall();
        process.removeAllListeners('SIGTERM');
    });

    const checker200 = (endpoint: string): Promise<unknown> =>
        request(app).get(`/monitoring/${endpoint}`).expect('Content-Type', /json/u).expect(200);

    const checker503 = (endpoint: string): Promise<unknown> => {
        healthChecker!.shutdownRequested = true;
        return request(app).get(`/monitoring/${endpoint}`).expect('Content-Type', /json/u).expect(503);
    };

    describe('Liveness Check', function () {
        it('should succeed', function () {
            return checker200('live');
        });

        it('should fail when shutdown requested', function () {
            return checker503('live');
        });
    });

    describe('Readiness Check', function () {
        it('should succeed', function () {
            return checker200('ready');
        });

        it('should fail when shutdown requested', function () {
            return checker503('ready');
        });
    });

    describe('Health Check', function () {
        it('should succeed', function () {
            return checker200('health');
        });

        it('should fail when shutdown requested', function () {
            return checker503('health');
        });
    });
});
