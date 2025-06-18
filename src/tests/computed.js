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
    orderBy: (c, f) => f.lower(c.instagram)
  });
  assert.equal(orderBy.at(2), 'aoriqileng');
  assert.equal(orderBy.at(-3), 'SertanejoUFC');
  const subMethod = await db.events.query({
    orderBy: (c, f) => f.lower(f.substring(c.name, 7, 2)),
    limit: 5
  });
  assert.equal(subMethod.at(0).id, 547);
  const heights = await db.fighters.query({
    select: ['id', 'heightCm', 'heightInches'],
    limit: 5
  });
  assert.equal(heights.at(0).heightInches, 67);
});
