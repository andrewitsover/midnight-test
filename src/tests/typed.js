import { Table, Database } from '@andrewitsover/midnight';
import { test } from '../run.js';
import { strict as assert } from 'assert';

class Users extends Table {
  name;
  documents = this.TypedArray({
    id: this.Int,
    contents: this.Text,
    createdAt: this.Text,
    authors: this.TypedArray(this.Text)
  });
}

const database = new Database(':memory:');
const db = database.getClient({ Users });
const sql = db.diff();
db.migrate(sql);

test('typed array', async () => {
  const now = Temporal.Now.zonedDateTimeISO();
  const authors = ['Andrew', 'Penelope'];
  const documents = [
    { id: 1, contents: 'It was raining when we arrived.', createdAt: now, authors },
    { id: 2, contents: 'We came to the house unprepared.', createdAt: now.add({ days: 1 }), authors }
  ];
  const user = db.users.returnInsert({ name: 'Andrew', documents });
  assert.equal(user.documents.at(0).authors.length, 2);
});

test('typed array with symbols', async () => {
  const now = Temporal.Now.zonedDateTimeISO();
  const authors = ['Andrew', 'Penelope'];
  const documents = [
    { id: 1, contents: 'It was raining when we arrived.', createdAt: now, authors },
    { id: 2, contents: 'We came to the house unprepared.', createdAt: now.add({ days: 1 }), authors }
  ];
  db.users.delete();
  const id = db.users.insert({ name: 'Andrew', documents });
  const user = db.first(c => {
    const { users: u } = c;
    return {
      select: {
        id: u.id,
        documents: u.documents
      },
      where: {
        [u.id]: id
      }
    }
  });
  assert.equal(user.documents.at(0).authors.length, 2);
});

test('get symbol from structured type', async () => {
  const user = db.first(c => {
    const { users: u } = c;
    const symbol = c.symbol(u.documents)
    return {
      select: {
        name: u.name
      },
      where: {
        [symbol]: c.not(null)
      }
    }
  });
  assert.equal(user !== undefined, true);
});
