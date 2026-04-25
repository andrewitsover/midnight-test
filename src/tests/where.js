import { Database, Table } from '@andrewitsover/midnight';
import { test } from '../run.js';
import { strict as assert } from 'assert';

class Users extends Table {
  id = this.IntPrimary;
  name;
  createdAt = this.Date;
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
  createdAt: new Date(1997, 2, 21),
  gender: male,
  social: { instagram: 'andrewiscool' }
});
db.users.insert({
  id: 2,
  name: 'John',
  createdAt: new Date(1998, 4, 18),
  gender: male,
  social: { instagram: 'johniscool' }
});
db.users.insert({
  id: 3,
  name: 'Susan',
  createdAt: new Date(1999, 7, 2),
  gender: female,
  social: { instagram: 'susaniscool' }
});
db.users.insert({
  id: 4,
  name: 'Penelope',
  createdAt: new Date(2000, 0, 10),
  gender: female,
  social: { instagram: 'penelopeiscool' }
});
db.users.insert({
  id: 5,
  name: 'Samuel',
  createdAt: new Date(2001, 0, 13),
  gender: male,
  social: { instagram: 'samueliscool' }
});

test('first', async () => {
  const user = db.users.first({
    where: {
      name: 'Samuel'
    }
  });
  assert.equal(user.name, 'Samuel');
});

test('first ordered', async () => {
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
  const users = db.users.query({
    where: {
      gender: male
    }
  });
  assert.equal(users.length, 3);
});

test('query and', async () => {
  const users = db.users.query({
    where: {
      and: [
        { createdAt: c => c.gt(new Date(1997, 3, 21)) },
        { createdAt: c => c.lt(new Date(2001, 0, 13)) },
      ]
    }
  });
  assert.equal(users.length, 3);
});

test('query or', async () => {
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
  const users = db.users.query({
    where: {
      and: [
        { name: ['Andrew', 'John', 'Susan'] },
        {
          or: [
            { gender: female },
            { createdAt: c => c.not(new Date(1997, 2, 21)) }
          ]
        }
      ]
    }
  });
  assert.equal(users.length, 2);
});

test('query or and', async () => {
  const users = db.users.query({
    where: {
      or: [
        { name: ['Andrew', 'John'] },
        {
          and: [
            { gender: female },
            { createdAt: c => c.gt(new Date(1999, 7, 2)) }
          ]
        }
      ]
    }
  });
  const females = users.filter(u => u.gender === female).length;
  assert.equal(users.length, 3);
  assert.equal(females, 1);
});
