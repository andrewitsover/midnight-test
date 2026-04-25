import { Database, Table } from '@andrewitsover/midnight';
import { test } from '../run.js';
import { strict as assert } from 'assert';

class Users extends Table {
  id = this.IntPrimary;
  name;
  age = 18;
  createdAt = this.Null(this.Date);
  active = this.Null(this.Bool);
  social = this.Null(this.Json);
  avatar = this.Null(this.Blob);
}

const database = new Database(':memory:');
const db = database.getClient({ Users });
const sql = db.diff();
db.migrate(sql);

const name = 'Andrew';
const avatar = Buffer.from('fake avatar');

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

test('blob', async () => {
  const id = db.users.insert({
    name,
    avatar
  });
  const user = db.users.get({ id });
  const isBuffer = Buffer.isBuffer(user.avatar);
  assert.equal(isBuffer, true);
});

test('insert many with blobs', async () => {
  db.users.delete();
  const users = [
    { name: 'Andrew', avatar: Buffer.from('Andrew') },
    { name: 'Susan', avatar: Buffer.from('Susan') }
  ];
  db.users.insertMany(users);
  const count = db.users.count();
  const user = db.users.get({ name: 'Susan' });
  assert.equal(count, 2);
  assert.equal(user.avatar.toString(), 'Susan');
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
