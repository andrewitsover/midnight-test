import { test } from '../run.js';
import { strict as assert } from 'assert';
import {
  Database,
  Table,
  check,
  json,
  lt,
  plainDate,
  text
} from '@andrewitsover/midnight';

const Date = Temporal.PlainDate;

class Users extends Table {
  name = text;
  createdAt = plainDate;
  gender = check(text, { in: ['m', 'f'] });
  social = json;
}

const male = 'm';
const female = 'f';

const setup = () => {
  const database = new Database(':memory:');
  const db = database.getClient({ Users });
  const sql = db.diff();
  db.migrate(sql);

  db.users.insert({
    id: 1,
    name: 'Andrew',
    createdAt: new Date(1997, 3, 21),
    gender: male,
    social: { instagram: 'andrewiscool' }
  });
  db.users.insert({
    id: 2,
    name: 'John',
    createdAt: new Date(1998, 5, 18),
    gender: male,
    social: { instagram: 'johniscool' }
  });
  db.users.insert({
    id: 3,
    name: 'Susan',
    createdAt: new Date(1999, 8, 2),
    gender: female,
    social: { instagram: 'susaniscool' }
  });
  db.users.insert({
    id: 4,
    name: 'Penelope',
    createdAt: new Date(2000, 1, 10),
    gender: female,
    social: { instagram: 'penelopeiscool' }
  });
  db.users.insert({
    id: 5,
    name: 'Samuel',
    createdAt: new Date(2001, 1, 13),
    gender: male,
    social: { instagram: 'samueliscool' }
  });

  return db;
}

test('delete primary key', async () => {
  using db = setup();
  db.users.delete({ id: 4 });
  const exists = db.users.exists({ id: 4 });
  const count = db.users.count();
  assert.equal(exists, false);
  assert.equal(count, 4);
});

test('delete expression', async () => {
  using db = setup();
  const date = new Date(1999, 8, 2);
  db.users.delete({
    createdAt: lt(date)
  });
  const exists = db.users.exists({
    createdAt: lt(date)
  });
  const count = db.users.count();
  assert.equal(exists, false);
  assert.equal(count, 3);
});

test('delete or', async () => {
  using db = setup();
  db.users.delete({
    or: [
      { name: 'Susan' },
      { gender: female }
    ]
  });
  const exists = db.users.exists({
    or: [
      { name: 'Susan' },
      { gender: female }
    ]
  });
  const count = db.users.count();
  assert.equal(exists, false);
  assert.equal(count, 3);
});
