import { SQLiteDatabase, Table } from '@andrewitsover/midnight';
import { test } from '../run.js';
import { strict as assert } from 'assert';

class Users extends Table {
  id = this.IntPrimary;
  name;
  createdAt = this.Null(this.Date);
  active = this.Null(this.Bool);
  social = this.Null(this.Json);
}

const database = new SQLiteDatabase(':memory:');
const db = database.getClient({ Users });
const sql = db.diff();
db.migrate(sql);

const name = 'Andrew';

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
  const createdAt = new Date();
  const id = db.users.insert({ 
    name,
    createdAt,
    active: false
  });
  const user = db.users.get({ id });
  assert.equal(user.createdAt.getTime(), createdAt.getTime());
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
