import { strict as assert } from 'assert';
import { test } from '../run.js';

test('computed', async (context) => {
  const db = context.common.db;
  const displayName = await db.fighters.get(null, 'displayName');
  assert.equal(displayName, 'Angga (The Hitman)');
  const fighter = await db.fighters.first({
    where: {
      instagram: 'iangarry'
    }
  });
  assert.equal(fighter.name, 'Ian Machado Garry');
  const orderBy = await db.fighters.query({
    select: 'instagram',
    where: {
      and: [
        { id: c => c.gt(100) },
        { id: c => c.lt(120) },
        { instagram: c => c.not(null) }
      ]
    },
    orderBy: (f, c) => f.lower(c.instagram)
  });
  assert.equal(orderBy.at(2), 'aoriqileng');
  assert.equal(orderBy.at(-3), 'SertanejoUFC');
});
