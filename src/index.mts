/* c8 ignore start */
import './lib/tracing.mjs';
import { run } from './server.mjs';

run().catch((e) => console.error(e));
/* c8 ignore stop */
