import { test } from '../run.js';
import { strict as assert } from 'assert';
import {
  Database, 
  Table, 
  check, 
  gt, 
  json, 
  lt, 
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

test('first', async () => {
  using db = setup();
  const user = db.users.first({
    where: {
      name: 'Samuel'
    }
  });
  assert.equal(user.name, 'Samuel');
});

test('first ordered', async () => {
  using db = setup();
  const user = db.users.first({
    where: {
      gender: female
    },
    orderBy: 'createdAt',
    desc: true
  });
  assert.equal(user.name, 'Penelope');
});

test('query', async () => {
  using db = setup();
  const users = db.users.query({
    where: {
      gender: male
    }
  });
  assert.equal(users.length, 3);
});

test('query and', async () => {
  using db = setup();
  const users = db.users.query({
    where: {
      and: [
        { createdAt: gt(new Date(1997, 4, 21)) },
        { createdAt: lt(new Date(2001, 1, 13)) },
      ]
    }
  });
  assert.equal(users.length, 3);
});

test('query or', async () => {
  using db = setup();
  const users = db.users.query({
    where: {
      or: [
        { gender: male },
        { name: 'Susan' },
      ]
    }
  });
  assert.equal(users.length, 4);
});

test('query and or', async () => {
  using db = setup();
  const users = db.users.query({
    where: {
      and: [
        { name: ['Andrew', 'John', 'Susan'] },
        {
          or: [
            { gender: female },
            { createdAt: not(new Date(1997, 3, 21)) }
          ]
        }
      ]
    }
  });
  assert.equal(users.length, 2);
});

test('query or and', async () => {
  using db = setup();
  const users = db.users.query({
    where: {
      or: [
        { name: ['Andrew', 'John'] },
        {
          and: [
            { gender: female },
            { createdAt: gt(new Date(1999, 8, 2)) }
          ]
        }
      ]
    }
  });
  const females = users.filter(u => u.gender === female).length;
  assert.equal(users.length, 3);
  assert.equal(females, 1);
});
