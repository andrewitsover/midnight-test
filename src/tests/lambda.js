import { BaseTable, Database, Table } from '@andrewitsover/midnight';
import { test } from '../run.js';
import { strict as assert } from 'assert';
import { randomUUID } from 'crypto';

class Users extends BaseTable {
  id = this.Function(this.TextPrimary, () => randomUUID());
  name;
}
const database = new Database(':memory:');
const db = database.getClient({ Users });
const sql = db.diff();
db.migrate(sql);

test('insert lambda', async () => {
  const id = db.users.insert({ name: 'Andrew' });
  const user = db.users.get({ id });
  assert.equal(user.id.length, 36);
});

test('insert many lambda', async () => {
  const inserts = [
    { id: randomUUID(), name: 'Penelope' },
    { name: 'Susan' },
    { name: 'James' }
  ];
  db.users.insertMany(inserts);
  const users = db.users.many();
  const exists = users.some(u => u.id.length !== 36);
  assert.equal(exists, false);
});

test('upsert lambda', async () => {
  const name = 'John';
  const id = db.users.upsert({
    values: {
      id: randomUUID(),
      name
    },
    target: 'id',
    set: {
      name
    }
  });
  const user = db.users.get({ id });
  assert.equal(user !== undefined, true);
});
