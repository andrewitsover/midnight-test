import { strict as assert } from 'assert';
import { test } from '../run.js';

test('group', async (context) => {
  const db = context.common.db;
  const towns = await db.fighters
    .groupBy('hometown')
    .avg({
      column: 'heightCm',
      limit: 3
    });
  console.log(towns);
});
