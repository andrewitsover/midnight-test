import { strict as assert } from 'assert';
import { test } from '../run.js';
import { db } from '../drivers/sqlite.js';
import { gt, lt, not, lower, substring } from '@andrewitsover/midnight';

test('computed', async () => {
  const displayName = db.fighters.get(null, 'displayName');
  assert.equal(displayName, 'Angga (The Hitman)');
  const fighter = db.fighters.first({
    where: {
      instagram: 'iangarry'
    }
  });
  assert.equal(fighter.name, 'Ian Machado Garry');
  const orderBy = db.fighters.query({
    return: 'instagram',
    where: {
      and: [
        { id: gt(100) },
        { id: lt(120) },
        { instagram: not(null) }
      ]
    },
    orderBy: c => lower(c.instagram)
  });
  assert.equal(orderBy.at(2), 'aoriqileng');
  assert.equal(orderBy.at(-3), 'SertanejoUFC');
  const subMethod = db.events.query({
    orderBy: c => lower(substring(c.name, 7, 2)),
    limit: 5
  });
  assert.equal(subMethod.at(0).id, 547);
  const heights = db.fighters.query({
    select: ['id', 'heightCm', 'heightInches'],
    limit: 5
  });
  assert.equal(heights.at(0).heightInches, 67);
});
