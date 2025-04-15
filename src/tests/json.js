import { strict as assert } from 'assert';
import { compare } from '../utils.js';
import { test } from '../run.js';

test('json', async (context) => {
  const { db, rewrite } = context.common;
  const result = await db.fighters.lastFights({ id: 17 });
  const lastFights = result.at(0);
  for (const date of lastFights.dates) {
    assert.equal(date instanceof Date, true);
  }
  const otherNames = await db.fighters.otherNames();
  assert.equal(otherNames.some(n => n.otherNames.length === 0), true);
  const instagram = await db.fighters.instagram();
  compare(instagram, 'fighterInstagram', rewrite);
});
