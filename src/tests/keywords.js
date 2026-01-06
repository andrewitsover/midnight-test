import { test } from '../run.js';
import { strict as assert } from 'assert';
import createData from './data.js';

const db = await createData();

test('log', async () => {
  let data;
  await db.users.query({
    where: {
      name: 'Andrew'
    },
    log: (info) => data = info
  });
  assert.equal(typeof data.sql, 'string');
  data = null;
  await db.query(c => {
    const { users: u, drawings: d } = c;
    return {
      select: {
        name: u.name,
        drawing: d.data
      },
      where: {
        [u.id]: [1, 2, 3]
      },
      join: [u.id, d.userId],
      log: (info) => data = info
    }
  });
  assert.equal(typeof data.sql, 'string');
  assert.equal(typeof data.params, 'object');
  assert.equal(typeof data.durationMs, 'number');
  data = null;
  await db.users.groupBy('isActive').array({
    select: {
      name: 'name'
    },
    log: (info) => data = info
  });
  assert.equal(typeof data.sql, 'string');
  data = null;
  await db.users.count({
    log: (info) => data = info
  });
  assert.equal(typeof data.sql, 'string');
});

test('orderBy', async () => {
  const asc = await db.users.query({
    orderBy: 'name'
  });
  const desc = await db.users.query({
    orderBy: 'name',
    desc: true
  });
  asc.reverse();
  assert.equal(asc.length > 0, true);
  assert.deepStrictEqual(asc, desc);
});

test('limit and offset', async () => {
  const limit = await db.users.query({
    limit: 2
  });
  assert.equal(limit.length, 2);
  const offset = await db.users.query({
    offset: 1,
    limit: 1
  });
  assert.equal(offset.length, 1);
  assert.deepStrictEqual(limit.at(1), offset.at(0));
});

test('distinct', async () => {
  const id = await db.users.insert({ name: 'Bradley' });
  const total = await db.users.count();
  const distinct = await db.users.query({
    return: 'name',
    distinct: true
  });
  assert.equal(distinct.length + 1, total);
  await db.users.delete({ id });
});

test('omit', async () => {
  const users = await db.users.query({
    omit: 'id'
  });
  const hasId = users.some(u => Object.hasOwn(u, 'id'));
  const hasName = users.every(u => Object.hasOwn(u, 'name'));
  assert.equal(hasId, false);
  assert.equal(hasName, true);
});

test('return', async () => {
  const names = await db.users.query({
    return: 'name'
  });
  assert.equal(names.length > 0, true);
  assert.equal(names.every(n => typeof n === 'string'), true);
  const name = await db.users.first({
    return: 'name',
    where: {
      id: 1
    }
  });
  assert.equal(typeof name, 'string');
});

test('select', async () => {
  const user = await db.users.first({
    select: ['name', 'isActive'],
    where: {
      id: 1
    }
  });
  assert.equal(Object.hasOwn(user, 'name'), true);
  assert.equal(Object.hasOwn(user, 'isActive'), true);
  assert.equal(Object.hasOwn(user, 'createdAt'), false);
  const users = await db.users.query({
    select: ['name', 'isActive']
  });
  assert.equal(users.length > 0, true);
  assert.equal(users.every(u => Object.hasOwn(u, 'name')), true);
  assert.equal(users.some(u => Object.hasOwn(u, 'createdAt')), false);
});
