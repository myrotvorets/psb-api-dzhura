/* c8 ignore start */
import { EventEmitter } from 'node:events';
import { OpenTelemetryConfigurator } from '@myrotvorets/opentelemetry-configurator';
import { HttpInstrumentation } from '@opentelemetry/instrumentation-http';
import { ExpressInstrumentation } from '@opentelemetry/instrumentation-express';
import { MySQL2Instrumentation } from '@opentelemetry/instrumentation-mysql2';
import { KnexInstrumentation } from '@myrotvorets/opentelemetry-plugin-knex';

if (+(process.env.ENABLE_TRACING || 0)) {
    const configurator = new OpenTelemetryConfigurator({
        serviceName: 'psb-api-dzhura',
        instrumentations: [
            new KnexInstrumentation(),
            new HttpInstrumentation(),
            new ExpressInstrumentation(),
            new MySQL2Instrumentation(),
        ],
    });

    configurator.start();
    EventEmitter.defaultMaxListeners += 5;
}
/* c8 ignore end */
