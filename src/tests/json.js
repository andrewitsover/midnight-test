import { compare } from '../utils.js';
import { test } from '../run.js';

test('json', async (context) => {
  const { db, rewrite } = context.common;
  const instagram = await db.fighters.instagram();
  compare(instagram, 'fighterInstagram', rewrite);
});
