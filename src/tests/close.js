import { test } from '../run.js';

test('close', async (context) => {
  if (!context.sqlite) {
    return;
  }
  const db = context.sqlite.db;
  const database = context.sqlite.database;
  await db.cards.many({ eventId: 100 });
  await db.fighters.get({ name: n => n.like('Israel%') }, 'id');
  await database.close();
});
