import { test } from '../run.js';
import { db, database } from '../drivers/sqlite.js';

test('close', async () => {
  db.cards.many({ eventId: 100 });
  db.fighters.get({ name: n => n.like('Israel%') }, 'id');
  database.close();
});
