import { BaseTable, Database, Table } from '@andrewitsover/midnight';
import { test } from '../run.js';
import { strict as assert } from 'assert';
import { randomUUID } from 'crypto';

const database = new Database(':memory:');
const uuid = database.createFunction({
  returnType: Table.TextPrimary,
  lambda: () => randomUUID()
});
const compare = database.createFunction({
  returnType: Table.Int,
  options: {
    deterministic: true
  },
  lambda: (a, b) => {
    const { from, compare } = Temporal.ZonedDateTime;
    const d = from(a);
    const e = from(b);
    return compare(d, e);
  }
});

class Users extends BaseTable {
  id = uuid();
  name;
  createdAt = this.Null.ZonedDateTime;
  isActive = this.Null.Bool;
}
const db = database.getClient({ Users });
const sql = db.diff();
db.migrate(sql);

test('insert lambda', async () => {
  const id = db.users.insert({ name: 'Andrew' });
  const user = db.users.get({ id });
  assert.equal(user.id.length, 36);
});

test('insert many lambda', async () => {
  const inserts = [
    { id: randomUUID(), name: 'Penelope' },
    { name: 'Susan' },
    { name: 'James' }
  ];
  db.users.insertMany(inserts);
  const users = db.users.many();
  const exists = users.some(u => u.id.length !== 36);
  assert.equal(exists, false);
});

test('upsert lambda', async () => {
  const name = 'John';
  const id = db.users.upsert({
    values: {
      id: randomUUID(),
      name
    },
    target: 'id',
    set: {
      name
    }
  });
  const user = db.users.get({ id });
  assert.equal(user !== undefined, true);
});

test('function in where', async () => {
  db.users.delete();
  const now = Temporal.Now.zonedDateTimeISO();
  const rows = [
    {
      name: 'Andrew',
      createdAt: now.subtract({ days: 1 })
    },
    {
      name: 'Penelope',
      createdAt: now.add({ days: 1 })
    },
    {
      name: 'James',
      createdAt: now.add({ days: 2 })
    }
  ];
  db.users.insertMany(rows);
  const users = db.query(c => {
    const { users: u, gte } = c;
    const compared = compare(u.createdAt, now);
    return {
      select: u,
      where: {
        [compared]: gte(0)
      }
    }
  });
  assert.equal(users.length, 2);
  assert.equal(users.some(u => u.name === 'Andrew'), false);
});

test('regex', async () => {
  db.users.delete();
  db.users.insertMany([
    { name: 'Andrew' },
    { name: 'Penelope' },
    { name: 'James' }
  ]);
  const users = db.users.many({ name: c => c.like(/e[a-z]$/) });
  assert.equal(users.length, 2);
  assert.equal(users.some(u => u.name === 'Penelope'), false);
});

test('symbol regex', async () => {
  db.users.delete();
  db.users.insertMany([
    { name: 'Andrew' },
    { name: 'Penelope' },
    { name: 'James' }
  ]);
  const users = db.query(c => {
    const { users: u, like } = c;
    return {
      select: u,
      where: {
        [u.name]: like(/e[a-z]$/)
      }
    }
  });
  assert.equal(users.length, 2);
  assert.equal(users.some(u => u.name === 'Penelope'), false);
});

test('symbol regex with two arguments', async () => {
  db.users.delete();
  db.users.insertMany([
    { name: 'Andrew', isActive: false },
    { name: 'Penelope', isActive: false },
    { name: 'James', isActive: true }
  ]);
  const users = db.query(c => {
    const { users: u, like } = c;
    return {
      select: u,
      where: {
        [u.isActive]: like(u.name, /e[a-z]$/)
      }
    }
  });
  assert.equal(users.length, 2);
  assert.equal(users.some(u => u.name === 'Andrew'), false);
});

test('symbol regex in select', async () => {
  db.users.delete();
  db.users.insertMany([
    { name: 'Andrew' },
    { name: 'Penelope' },
    { name: 'James' }
  ]);
  const users = db.query(c => {
    const { users: u, like } = c;
    return {
      select: {
        name: u.name,
        matches: like(u.name, /e[a-z]$/)
      }
    }
  });
  assert.equal(users.filter(u => u.matches).length, 2);
});
