import { SQLiteDatabase, Table } from '@andrewitsover/midnight';
import { test } from '../run.js';
import { strict as assert } from 'assert';

class Users extends Table {
  id = this.IntPrimary;
  name;
}

test('memory', async () => {
  const database = new SQLiteDatabase(':memory:');
  const db = database.getClient({ Users });
  const sql = db.diff();
  await db.migrate(sql);
  await db.users.insert({ name: 'Andrew' });
  const users = await db.users.many();
  assert.equal(users.length, 1);
  assert.equal(users.at(0).name, 'Andrew');
  await database.close();
});
