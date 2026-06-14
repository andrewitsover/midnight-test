import { test } from '../run.js';
import { strict as assert } from 'assert';
import {
  Database,
  Table,
  check,
  json,
  not,
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
    name: 'Andrew',
    createdAt: new Date(1998, 5, 18),
    gender: male,
    social: { instagram: 'andrewiscool' }
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

test('count', async () => {
  using db = setup();
  const count = db.users.count({
    where: {
      gender: male
    }
  });
  assert.equal(count, 3);
});

test('count zero', async () => {
  using db = setup();
  const count = db.users.count({
    where: {
      gender: male,
      name: 'Unknown'
    }
  });
  assert.equal(count, 0);
});

test('count without where', async () => {
  using db = setup();
  const count = db.users.count();
  assert.equal(count, 5);
});

test('distinct count', async () => {
  using db = setup();
  const count = db.users.count({
    distinct: 'name',
    where: {
      gender: male
    }
  });
  assert.equal(count, 2);
});

test('exists true', async () => {
  using db = setup();
  const exists = db.users.exists({
    name: not('John'),
    createdAt: new Date(1998, 5, 18)
  });
  assert.equal(exists, true);
});

test('exists false', async () => {
  using db = setup();
  const exists = db.users.exists({
    name: 'John',
    createdAt: new Date(1998, 5, 18)
  });
  assert.equal(exists, false);
});
