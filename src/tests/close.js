import { test } from '../run.js';
import { db, database } from '../drivers/sqlite.js';

test('close', async () => {
  await db.cards.many({ eventId: 100 });
  await db.fighters.get({ name: n => n.like('Israel%') }, 'id');
  await database.close();
});
