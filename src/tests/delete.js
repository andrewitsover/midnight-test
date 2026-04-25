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

test('delete primary key', async () => {
  db.users.delete({ id: 4 });
  const exists = db.users.exists({ id: 4 });
  const count = db.users.count();
  assert.equal(exists, false);
  assert.equal(count, 4);
});

test('delete expression', async () => {
  db.users.delete({
    createdAt: c => c.lt(new Date(1999, 7, 2))
  });
  const exists = db.users.exists({
    createdAt: c => c.lt(new Date(1999, 7, 2))
  });
  const count = db.users.count();
  assert.equal(exists, false);
  assert.equal(count, 2);
});

test('delete or', async () => {
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
  assert.equal(count, 1);
});
