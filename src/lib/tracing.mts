/* c8 ignore start */
import { OpenTelemetryConfigurator } from '@myrotvorets/opentelemetry-configurator';
import { HttpInstrumentation } from '@opentelemetry/instrumentation-http';
import { ExpressInstrumentation } from '@opentelemetry/instrumentation-express';
import { MySQL2Instrumentation } from '@opentelemetry/instrumentation-mysql2';
import { KnexInstrumentation } from '@myrotvorets/opentelemetry-plugin-knex';

if (!+(process.env.ENABLE_TRACING || 0)) {
    process.env.OTEL_SDK_DISABLED = 'true';
}

const configurator = new OpenTelemetryConfigurator({
    serviceName: 'psb-api-identigraf',
    instrumentations: [
        new ExpressInstrumentation(),
        new HttpInstrumentation(),
        new KnexInstrumentation(),
        new MySQL2Instrumentation(),
    ],
});

configurator.start();
/* c8 ignore stop */
