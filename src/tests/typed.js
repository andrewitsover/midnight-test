import { test } from '../run.js';
import { strict as assert } from 'assert';
import {
  Table, 
  Database, 
  symbol, 
  not, 
  extract, 
  text,
  int,
  typedArray
} from '@andrewitsover/midnight';

class Users extends Table {
  name = text;
  documents = typedArray({
    id: int,
    contents: text,
    createdAt: text,
    authors: typedArray(text)
  });
}

const setup = () => {
  const database = new Database(':memory:');
  const db = database.getClient({ Users });
  const sql = db.diff();
  db.migrate(sql);

  return db;
}

test('typed array', async () => {
  using db = setup();
  const now = Temporal.Now.zonedDateTimeISO();
  const authors = ['Andrew', 'Penelope'];
  const documents = [
    { id: 1, contents: 'It was raining when we arrived.', createdAt: now.toString(), authors },
    { id: 2, contents: 'We came to the house unprepared.', createdAt: now.add({ days: 1 }).toString(), authors }
  ];
  const user = db.users.returnInsert({ name: 'Andrew', documents });
  assert.equal(user.documents.at(0).authors.length, 2);
});

test('typed array with symbols', async () => {
  using db = setup();
  const now = Temporal.Now.zonedDateTimeISO();
  const authors = ['Andrew', 'Penelope'];
  const documents = [
    { id: 1, contents: 'It was raining when we arrived.', createdAt: now.toString(), authors },
    { id: 2, contents: 'We came to the house unprepared.', createdAt: now.add({ days: 1 }).toString(), authors }
  ];
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
  using db = setup();
  const now = Temporal.Now.zonedDateTimeISO();
  const authors = ['Andrew', 'Penelope'];
  const documents = [
    { id: 1, contents: 'It was raining when we arrived.', createdAt: now.toString(), authors },
    { id: 2, contents: 'We came to the house unprepared.', createdAt: now.add({ days: 1 }).toString(), authors }
  ];
  db.users.insert({ name: 'Andrew', documents });
  const user = db.first(c => {
    const { users: u } = c;
    const key = symbol(u.documents)
    return {
      select: {
        name: u.name
      },
      where: {
        [key]: not(null)
      }
    }
  });
  assert.equal(user !== undefined, true);
});

test('extract typed json', async () => {
  using db = setup();
  const now = Temporal.Now.zonedDateTimeISO();
  const authors = ['Andrew', 'Penelope'];
  const documents = [
    { id: 1, contents: 'It was raining when we arrived.', createdAt: now.toString(), authors },
    { id: 2, contents: 'We came to the house unprepared.', createdAt: now.add({ days: 1 }).toString(), authors }
  ];
  const id = db.users.insert({ name: 'Andrew', documents });
  const user = db.first(c => {
    const { users: u } = c;
    const authors = extract(u.documents, (items) => items.at(0).authors);
    return {
      select: {
        id: u.id,
        authors
      }
    }
  });
  assert.equal(user.authors.length, 2);
});
