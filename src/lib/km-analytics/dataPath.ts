import path from 'node:path';

/** Runtime path to the JSON store (dev and Node builds). */
export const KM_ANALYTICS_FILE = path.join(process.cwd(), 'src/lib/data/km-analytics.json');
