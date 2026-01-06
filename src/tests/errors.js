import { test } from '../run.js';
import { strict as assert } from 'assert';
import createData from './data.js';

const db = createData();

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
    const message = 'SqliteError: no such column: fake';
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
