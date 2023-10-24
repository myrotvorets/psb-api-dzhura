/* c8 ignore start */
import { OpenTelemetryConfigurator, getExpressInstrumentations } from '@myrotvorets/opentelemetry-configurator';
import { KnexInstrumentation } from '@myrotvorets/opentelemetry-plugin-knex';
import { initProcessMetrics } from '@myrotvorets/otel-utils';

process.env['OTEL_SERVICE_NAME'] = 'psb-api-dzhura';

export const configurator = new OpenTelemetryConfigurator({
    serviceName: process.env['OTEL_SERVICE_NAME'],
    instrumentations: [...getExpressInstrumentations(), new KnexInstrumentation()],
});

configurator.start();

await initProcessMetrics();

try {
    const { run } = await import('./server.mjs');
    await run();
} catch (e) {
    console.error(e);
}
/* c8 ignore stop */
