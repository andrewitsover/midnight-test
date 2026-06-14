import { test } from '../run.js';
import { strict as assert } from 'assert';
import {
  Database,
  Table,
  text
} from '@andrewitsover/midnight';

class Users extends Table {
  name = text;
}

test('memory', async () => {
  const database = new Database(':memory:');
  using db = database.getClient({ Users });
  const sql = db.diff();
  db.migrate(sql);
  db.users.insert({ name: 'Andrew' });
  const users = db.users.many();
  assert.equal(users.length, 1);
  assert.equal(users.at(0).name, 'Andrew');
});
