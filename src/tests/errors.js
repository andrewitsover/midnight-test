import { test } from '../run.js';
import { strict as assert } from 'assert';
import { Database, Table } from '@andrewitsover/midnight';

class Users extends Table {
  id = this.IntPrimary;
  name;
  isActive = true;
  createdAt = this.Now.Instant;
}

class Drawings extends Table {
  userId = this.Cascade(Users);
  data;
}

const database = new Database(':memory:');
const db = database.getClient({ Users, Drawings });
const sql = db.diff();
db.migrate(sql);
db.users.insert({ name: 'Andrew' });
db.users.insert({ name: 'James' });
db.users.insert({ name: 'Bradley', isActive: false });

test('no table', async () => {
  try {
    db.fake.get();
  }
  catch (e) {
    assert.equal(e.message, 'no such table: fake');
  }
});

test('no column', async () => {
  const queries = [
    () => db.users.get({ fake: 3 }),
    () => db.users.many({ fake: 3 }),
    () => db.users.query({
      where: {
        fake: 3
      }
    }),
    () => db.users.first({
      where: {
        fake: 3
      }
    }),
    () => db.users.query({
      orderBy: 'fake'
    }),
    () => db.users.query({
      select: ['fake']
    })
  ];
  for (const query of queries) {
    const message = 'Error: no such column: fake';
    const predicate = (e) => e.message.startsWith(message);
    assert.throws(query, predicate, query);
  }
});

test('wrong types and invalid states', async () => {
  const queries = [
    () => db.users.query({
      select: []
    }),
    () => db.users.query({
      select: 'name'
    }),
    () => db.users.insert({
      isActive: false
    })
  ];
  for (const query of queries) {
    assert.throws(query, null, query);
  }
});
