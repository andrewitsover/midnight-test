import { BaseTable, Database } from '@andrewitsover/midnight';
import { test } from '../run.js';
import { strict as assert } from 'assert';

class Users extends BaseTable {
  id = this.IntPrimary;
  name;
  age = 18;
  createdAt = this.Null.Instant;
  active = this.Null.Bool;
  social = this.Null.Json;
  avatar = this.Null.Blob;
}

const database = new Database(':memory:');
const db = database.getClient({ Users });
const sql = db.diff();
db.migrate(sql);

const name = 'Andrew';
const encoder = new TextEncoder();
const decoder = new TextDecoder();
const avatar = encoder.encode('fake avatar');

const validate = (user) => {
  assert.equal(user.createdAt, null);
  assert.equal(user.active, null);
}

test('empty', async () => {
  const id = db.users.insert({ name });
  const user = db.users.get({ id });
  validate(user);
});

test('undefined', async () => {
  const id = db.users.insert({ 
    name,
    createdAt: undefined,
    active: undefined
  });
  const user = db.users.get({ id });
  validate(user);
});

test('null', async () => {
  const id = db.users.insert({ 
    name,
    createdAt: null,
    active: null
  });
  const user = db.users.get({ id });
  validate(user);
});

test('supplied', async () => {
  const createdAt = Temporal.Now.instant();
  const id = db.users.insert({ 
    name,
    createdAt,
    active: false
  });
  const user = db.users.get({ id });
  assert.equal(user.createdAt.equals(createdAt), true);
  assert.equal(user.active, false);
});

test('json', async () => {
  const social = {
    instagram: 'cool',
    twitter: 'person'
  };
  const id = db.users.insert({
    name,
    social
  });
  const user = db.users.get({ id });
  assert.equal(typeof user.social, 'object');
});

test('blob', async () => {
  const id = db.users.insert({
    name,
    avatar
  });
  const user = db.users.get({ id });
  assert.equal(user.avatar instanceof Uint8Array, true);
});

test('insert many with blobs', async () => {
  db.users.delete();
  const users = [
    { name: 'Andrew', avatar: encoder.encode('Andrew') },
    { name: 'Susan', avatar: encoder.encode('Susan') }
  ];
  db.users.insertMany(users);
  const count = db.users.count();
  const user = db.users.get({ name: 'Susan' });
  assert.equal(count, 2);
  assert.equal(decoder.decode(user.avatar), 'Susan');
});

test('insert many with different columns', async () => {
  db.users.delete();
  const users = [
    { name },
    { name, active: true }
  ];
  db.users.insertMany(users);
  const count = db.users.count({
    where: {
      active: true
    }
  });
  assert.equal(count, 1);
});

test('insert with missing default', async () => {
  db.users.delete();
  const users = [
    { name, age: 20 },
    { name }
  ];
  db.users.insertMany(users);
  const count = db.users.count();
  assert.equal(count, 2);
});

test('insert with date primary key', async () => {
  class Users extends BaseTable {
    id = this.InstantPrimary;
    name;
  }

  const database = new Database(':memory:');
  const db = database.getClient({ Users });
  const sql = db.diff();
  db.migrate(sql);

  const date = Temporal.Now.instant();

  const id = db.users.insert({
    id: date,
    name: 'Andrew'
  });
  assert.equal(id instanceof Temporal.Instant, true);
  assert.equal(id.equals(date), true);
});

test('returnInsert', async () => {
  const user = db.users.returnInsert({ name });
  assert.equal(user.name, name);
});

test('returnUpsert', async () => {
  const user = db.users.returnUpsert({
    values: {
      id: 1,
      name
    },
    target: 'id',
    set: {
      name: 'Penelope'
    }
  });
  assert.equal(user.name, 'Penelope');
});

test('returnInsertMany', async () => {
  const createdAt = Temporal.Now.instant();
  const rows = [
    { name: 'Andrew', createdAt },
    { name: 'Penelope', createdAt }
  ];
  const users = db.users.returnInsertMany(rows);
  assert.equal(users.length, 2);
  assert.equal(users.every(u => u.createdAt.equals(createdAt)), true);
});

test('get blob in json', async () => {
  db.users.insert({
    name,
    avatar: encoder.encode(name)
  });
  const user = db.first(c => {
    const { users: u } = c;
    return {
      select: {
        id: u.id,
        rest: c.object({
          name: u.name,
          avatar: u.avatar
        })
      },
      where: {
        [u.avatar]: c.not(null)
      }
    }
  });
  const avatar = decoder.decode(user.rest.avatar);
  assert.equal(user.rest.avatar instanceof Uint8Array, true);
  assert.equal(avatar, 'Andrew');
});

test('get instant in json', async () => {
  const createdAt = Temporal.Now.instant();
  const userId = db.users.insert({
    name,
    createdAt
  });
  const user = db.first(c => {
    const { users: u } = c;
    return {
      select: {
        id: u.id,
        rest: c.object({
          name: u.name,
          createdAt: u.createdAt
        })
      },
      where: {
        [u.id]: userId
      }
    }
  });
  const date = user.rest.createdAt;
  assert.equal(date instanceof Temporal.Instant, true);
  assert.equal(date.equals(createdAt), true);
});
