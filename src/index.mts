/* istanbul ignore file */

import './lib/tracing.mjs';
import { run } from './server.mjs';

run().catch((e) => console.error(e));
