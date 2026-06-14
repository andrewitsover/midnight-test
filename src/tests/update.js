import { test } from '../run.js';
import { strict as assert } from 'assert';
import {
  Database, 
  Table, 
  gt, 
  lt, 
  iif, 
  eq, 
  text,
  plainDate,
  check,
  json
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

test('update range', async () => {
  using db = setup();
  const after = new Date(1997, 5, 1);
  const before = new Date(2000, 1, 1);
  db.users.update({
    where: {
      and: [
        { createdAt: gt(after) },
        { createdAt: lt(before) }
      ]
    },
    set: {
      name: 'unknown'
    }
  });
  const users = db.users.many({ name: 'unknown' });
  assert.equal(users.length, 2);
});

test('update conditionally', async () => {
  using db = setup();
  db.users.update({
    set: {
      name: c => iif([eq(c.gender, male), 'John'], 'Susan')
    },
    where: {
      name: 'unknown'
    }
  });
  const exists = db.users.exists({ name: 'unknown' });
  assert.equal(exists, false);
});

test('update date', async () => {
  using db = setup();
  const createdAt = Temporal.Now.plainDateISO();
  const id = 3;
  db.users.update({
    where: {
      id
    },
    set: {
      createdAt
    }
  });
  const user = db.users.get({ id });
  assert.equal(user.createdAt.equals(createdAt), true);
});

test('update text with check', async () => {
  using db = setup();
  const id = 4;
  db.users.update({
    where: {
      id
    },
    set: {
      gender: male
    }
  });
  const user = db.users.get({ id });
  assert.equal(user.gender, male);
});

test('update json', async () => {
  using db = setup();
  const id = 1;
  const social = { twitter: 'andrewiscool' };
  db.users.update({
    where: {
      id
    },
    set: {
      social
    }
  });
  const user = db.users.get({ id });
  assert.equal(user.social.twitter, 'andrewiscool');
});

test('update multiple columns', async () => {
  using db = setup();
  db.users.update({
    where: {
      name: 'John',
      gender: male
    },
    set: {
      name: 'Susan',
      gender: female
    }
  });
  const count = db.users.count({ 
    where: { 
      name: 'Susan', 
      gender: female 
    }
  });
  assert.equal(count, 2);
});
