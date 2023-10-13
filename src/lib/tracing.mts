/* c8 ignore start */
import { OpenTelemetryConfigurator, getExpressInstrumentations } from '@myrotvorets/opentelemetry-configurator';
import { KnexInstrumentation } from '@myrotvorets/opentelemetry-plugin-knex';

const configurator = new OpenTelemetryConfigurator({
    serviceName: 'psb-api-identigraf',
    instrumentations: [...getExpressInstrumentations(), new KnexInstrumentation()],
});

configurator.start();
/* c8 ignore stop */
