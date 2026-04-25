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
  name: 'Andrew',
  createdAt: new Date(1998, 4, 18),
  gender: male,
  social: { instagram: 'andrewiscool' }
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

test('count', async () => {
  const count = db.users.count({
    where: {
      gender: male
    }
  });
  assert.equal(count, 3);
});

test('count zero', async () => {
  const count = db.users.count({
    where: {
      gender: male,
      name: 'Unknown'
    }
  });
  assert.equal(count, 0);
});

test('count without where', async () => {
  const count = db.users.count();
  assert.equal(count, 5);
});

test('distinct count', async () => {
  const count = db.users.count({
    distinct: 'name',
    where: {
      gender: male
    }
  });
  assert.equal(count, 2);
});

test('exists true', async () => {
  const exists = db.users.exists({
    name: c => c.not('John'),
    createdAt: new Date(1998, 4, 18)
  });
  assert.equal(exists, true);
});

test('exists false', async () => {
  const exists = db.users.exists({
    name: 'John',
    createdAt: new Date(1998, 4, 18)
  });
  assert.equal(exists, false);
});
