import { addJsonContentTypeMiddleware } from '@myrotvorets/express-microservice-middlewares';
import { Router } from 'express';
import type { Knex } from 'knex';

interface HealthCheck {
    name: string;
    check: () => Promise<void>;
}

type CheckResults = Record<string, 'UP' | 'DOWN'>;

interface HealthCheckResult {
    status: 'UP' | 'DOWN';
    checks: CheckResults;
}

class SimpleHealthChecker {
    private readonly readinessChecks: HealthCheck[] = [];
    private readonly livenessChecks: HealthCheck[] = [];
    public shutdownRequested = false;

    public registerReadinessCheck(check: HealthCheck): void {
        this.readinessChecks.push(check);
    }

    public registerLivenessCheck(check: HealthCheck): void {
        this.livenessChecks.push(check);
    }

    public registerShutdownCheck(): void {
        process.on('SIGTERM', () => {
            this.shutdownRequested = true;
        });
    }

    public checkReadiness(): Promise<HealthCheckResult> {
        return this.runChecks(this.readinessChecks);
    }

    public checkLiveness(): Promise<HealthCheckResult> {
        return this.runChecks(this.livenessChecks);
    }

    private async runChecks(whichChecks: HealthCheck[]): Promise<HealthCheckResult> {
        const checks: CheckResults = {};
        let allHealthy = true;

        for (const check of whichChecks) {
            try {
                // eslint-disable-next-line no-await-in-loop
                await check.check();
                checks[check.name] = 'UP';
            } catch {
                checks[check.name] = 'DOWN';
                allHealthy = false;
            }
        }

        if (this.shutdownRequested) {
            checks['liveness'] = 'DOWN';
            allHealthy = false;
        }

        return {
            status: allHealthy ? 'UP' : 'DOWN',
            checks,
        };
    }
}

export const healthChecker = new SimpleHealthChecker();

export function monitoringController(db: Knex): Router {
    const dbCheck = {
        name: 'database',
        check: async (): Promise<void> => {
            const client = db.client as Knex.Client;
            const connection = (await client.acquireConnection()) as unknown;
            await client.releaseConnection(connection);
        },
    };

    healthChecker.registerReadinessCheck(dbCheck);
    healthChecker.registerShutdownCheck();

    return Router()
        .use(addJsonContentTypeMiddleware)
        .get('/ready', async (_req, res) => {
            const result = await healthChecker.checkReadiness();
            res.status(result.status === 'UP' ? 200 : 503).json(result);
        })
        .get('/live', async (_req, res) => {
            const result = await healthChecker.checkLiveness();
            res.status(result.status === 'UP' ? 200 : 503).json(result);
        });
}
