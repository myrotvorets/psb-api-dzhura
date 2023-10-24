import { ValueType } from '@opentelemetry/api';
import { getMeter } from '@myrotvorets/otel-utils';

const meter = getMeter();

export const requestDurationHistogram = meter.createHistogram('psbapi.request.duration', {
    description: 'Measures the duration of requests.',
    unit: 'ms',
    valueType: ValueType.DOUBLE,
});
