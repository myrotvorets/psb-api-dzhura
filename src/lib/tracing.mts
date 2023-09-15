/* istanbul ignore file */

import { EventEmitter } from 'node:events';
import { OpenTelemetryConfigurator } from '@myrotvorets/opentelemetry-configurator';
import { KnexInstrumentation } from '@myrotvorets/opentelemetry-plugin-knex';

if (+(process.env.ENABLE_TRACING || 0)) {
    const configurator = new OpenTelemetryConfigurator({
        serviceName: 'psb-api-dzhura',
        instrumentations: [new KnexInstrumentation()],
    });

    configurator.start();
    EventEmitter.defaultMaxListeners += 5;
}
