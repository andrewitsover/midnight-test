import { Database, Table } from '@andrewitsover/midnight';
import { test } from '../run.js';
import { strict as assert } from 'assert';

const Date = Temporal.PlainDate;

class Users extends Table {
  id = this.IntPrimary;
  name;
  createdAt = this.PlainDate;
  gender = this.Check(this.Text, { in: ['m', 'f'] });
  social = this.Json;
}

const database = new Database(':memory:');
const db = database.getClient({ Users });
const sql = db.diff();
db.migrate(sql);

const male = 'm';
const female = 'f';

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

test('update range', async () => {
  const after = new Date(1997, 5, 1);
  const before = new Date(2000, 1, 1);
  db.users.update({
    where: {
      and: [
        { createdAt: c => c.gt(after) },
        { createdAt: c => c.lt(before) }
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
  db.users.update({
    set: {
      name: (c, f) => f.if(f.eq(c.gender, male), 'John', 'Susan')
    },
    where: {
      name: 'unknown'
    }
  });
  const exists = db.users.exists({ name: 'unknown' });
  assert.equal(exists, false);
});

test('update date', async () => {
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
