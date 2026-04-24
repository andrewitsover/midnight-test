import { SQLiteDatabase, Table } from '@andrewitsover/midnight';
import { test } from '../run.js';
import { strict as assert } from 'assert';

class Users extends Table {
  name;
  createdAt = this.Date;
}

class Roles extends Table {
  name;
}

class UserRoles extends Table {
  userId = this.Cascade(Users);
  roleId = this.Cascade(Roles);
  added = this.Date;
}

class Cars extends Table {
  name;
  ownerId = this.Cascade(Users);
}

const database = new SQLiteDatabase(':memory:');
const db = database.getClient({ Users, Roles, UserRoles, Cars });
const sql = db.diff();
db.migrate(sql);

db.users.insert({
  id: 1,
  name: 'Andrew',
  createdAt: new Date(1997, 2, 21)
});
db.users.insert({
  id: 2,
  name: 'John',
  createdAt: new Date(1998, 4, 18)
});
db.users.insert({
  id: 3,
  name: 'Susan',
  createdAt: new Date(1999, 7, 2)
});
db.users.insert({
  id: 4,
  name: 'Penelope',
  createdAt: new Date(2000, 0, 10)
});
db.users.insert({
  id: 5,
  name: 'Samuel',
  createdAt: new Date(2001, 0, 13)
});
db.users.insert({
  id: 6,
  name: 'James',
  createdAt: new Date(2001, 0, 17)
});

db.roles.insert({
  id: 1,
  name: 'Driver'
});
db.roles.insert({
  id: 2,
  name: 'Hacker'
});
db.roles.insert({
  id: 3,
  name: 'Thief'
});

db.userRoles.insert({
  userId: 1,
  roleId: 1,
  added: new Date(2025, 0, 1)
});
db.userRoles.insert({
  userId: 2,
  roleId: 1,
  added: new Date(2026, 0, 1)
});
db.userRoles.insert({
  userId: 3,
  roleId: 1,
  added: new Date(2026, 0, 1)
});

db.userRoles.insert({
  userId: 1,
  roleId: 2,
  added: new Date(2025, 0, 1)
});
db.userRoles.insert({
  userId: 4,
  roleId: 2,
  added: new Date(2026, 0, 1)
});
db.userRoles.insert({
  userId: 5,
  roleId: 2,
  added: new Date(2026, 0, 1)
});

db.userRoles.insert({
  userId: 2,
  roleId: 3,
  added: new Date(2024, 0, 1)
});
db.userRoles.insert({
  userId: 3,
  roleId: 3,
  added: new Date(2026, 0, 1)
});

db.cars.insert({
  name: 'Mustang',
  ownerId: 1
});
db.cars.insert({
  name: 'Model Y',
  ownerId: 2
});
db.cars.insert({
  name: 'F-150',
  ownerId: 3
});
db.cars.insert({
  name: 'Jaguar',
  ownerId: 3
});
db.cars.insert({
  name: 'Cybertruck',
  ownerId: 2
});

test('no joins and only a computed column', async () => {
  const users = db.queryValues(c => {
    const { users: u, concat } = c;
    return {
      select: concat(u.id, ': ', u.name)
    }
  });
  const user = users.at(0);
  assert.equal(user, '1: Andrew');
});

test('implied many-to-many join', async () => {
  const users = db.query(c => {
    const { users: u, userRoles: ur, roles: r } = c;
    return {
      select: {
        id: u.id,
        name: u.name,
        roles: c.group({
          id: ur.id,
          name: r.name,
          added: ur.added
        })
      }
    }
  });
  const driver = users.at(0).roles.some(r => r.name === 'Driver');
  const count = users.at(1).roles.length;
  assert.equal(driver, true);
  assert.equal(count, 2);
});

test('implied one-to-many join', async () => {
  const users = db.query(context => {
    const { users: u, cars: c, group } = context;
    return {
      select: {
        ...u,
        cars: group(c.name)
      },
      where: {
        [u.id]: 2
      }
    }
  });
  const cars = users.at(0).cars;
  const exists = cars.some(c => c === 'Cybertruck');
  assert.equal(exists, true);
  assert.equal(cars.length, 2);
});

test('implied many-to-one join', async () => {
  const cars = db.query(context => {
    const { cars: c, users: u, object } = context;
    return {
      select: {
        id: c.id,
        name: c.name,
        owner: object({
          id: u.id,
          name: u.name
        })
      }
    }
  });
  const count = cars.filter(c => c.owner.name === 'Susan').length;
  assert.equal(count, 2);
});

test('invalid join', async () => {
  const getCars = () => db.query(context => {
    const { cars: c, roles: r } = context;
    return {
      select: {
        car: c.name,
        role: r.name
      }
    }
  });
  assert.throws(getCars);
});

test('implied many-to-many left join', async () => {
  const users = db.query(c => {
    const { users: u, userRoles: ur, roles: r } = c;
    return {
      select: u,
      maybe: {
        roles: c.group({
          id: ur.id,
          name: r.name
        })
      }
    }
  });
  assert.equal(users.at(-1).roles.length, 0);
});
