import { test } from '../run.js';
import { db, database } from '../drivers/sqlite.js';
import { functions } from '@andrewitsover/midnight';

const { like } = functions;

test('close', async () => {
  db.cards.many({ eventId: 100 });
  db.fighters.get({ name: like('Israel%') }, 'id');
  database.close();
});
