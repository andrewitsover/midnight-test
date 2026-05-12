import { Database, Table, pick, omit } from '@andrewitsover/midnight';
import { test } from '../run.js';
import { strict as assert } from 'assert';

const Date = Temporal.PlainDate;

class Companies extends Table {
  name;
}

class Orders extends Table {
  name;
  status;
  companyId = this.Cascade(Companies);
}

class Users extends Table {
  name;
  city = this.Null.Text;
  createdAt = this.PlainDate;
  companyId = this.Cascade(Companies);
}

class Roles extends Table {
  name;
}

class UserRoles extends Table {
  userId = this.Cascade(Users);
  roleId = this.Cascade(Roles);
  added = this.PlainDate;
}

class Cars extends Table {
  name;
  ownerId = this.Cascade(Users);
}

const database = new Database(':memory:');
const db = database.getClient({
  Companies,
  Orders,
  Users,
  Roles,
  UserRoles,
  Cars
});
const sql = db.diff();
db.migrate(sql);

db.companies.insert({
  id: 1,
  name: 'Tesla'
});
db.companies.insert({
  id: 2,
  name: 'Ford'
});

db.orders.insert({
  name: 'Model Y',
  status: 'Complete',
  companyId: 1
});
db.orders.insert({
  name: 'Model Y',
  status: 'Processing',
  companyId: 1
});
db.orders.insert({
  name: 'F-150',
  status: 'Processing',
  companyId: 2
});
db.orders.insert({
  name: 'F-150',
  status: 'Processing',
  companyId: 2
});
db.orders.insert({
  name: 'Mustang',
  status: 'Complete',
  companyId: 2
});
db.orders.insert({
  name: 'Mustang',
  status: 'Complete',
  companyId: 2
});

db.users.insert({
  id: 1,
  companyId: 1,
  name: 'Andrew',
  createdAt: new Date(1997, 3, 21)
});
db.users.insert({
  id: 2,
  city: 'Portland',
  companyId: 1,
  name: 'John',
  createdAt: new Date(1998, 5, 18)
});
db.users.insert({
  id: 3,
  city: 'Orlando',
  companyId: 2,
  name: 'Susan',
  createdAt: new Date(1999, 8, 2)
});
db.users.insert({
  id: 4,
  companyId: 1,
  city: 'Orlando',
  name: 'Penelope',
  createdAt: new Date(2000, 1, 10)
});
db.users.insert({
  id: 5,
  companyId: 2,
  city: 'Austin',
  name: 'Samuel',
  createdAt: new Date(2001, 1, 13)
});
db.users.insert({
  id: 6,
  companyId: 2,
  city: 'Portland',
  name: 'James',
  createdAt: new Date(2001, 1, 17)
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
  added: new Date(2025, 1, 1)
});
db.userRoles.insert({
  userId: 2,
  roleId: 1,
  added: new Date(2026, 1, 1)
});
db.userRoles.insert({
  userId: 3,
  roleId: 1,
  added: new Date(2026, 1, 1)
});

db.userRoles.insert({
  userId: 1,
  roleId: 2,
  added: new Date(2025, 1, 1)
});
db.userRoles.insert({
  userId: 4,
  roleId: 2,
  added: new Date(2026, 1, 1)
});
db.userRoles.insert({
  userId: 5,
  roleId: 2,
  added: new Date(2026, 1, 1)
});

db.userRoles.insert({
  userId: 2,
  roleId: 3,
  added: new Date(2024, 1, 1)
});
db.userRoles.insert({
  userId: 3,
  roleId: 3,
  added: new Date(2026, 1, 1)
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

test('certain', async () => {
  const user = db.first(c => {
    const { users: u, not } = c;
    return {
      certain: {
        city: u.city
      },
      where: {
        [u.city]: not(null)
      }
    }
  });
  assert.equal(typeof user.city, 'string');
});

test('certain values', async () => {
  const users = db.queryValues(c => {
    const { users: u, not } = c;
    return {
      certain: u.city,
      where: {
        [u.city]: not(null)
      }
    }
  });
  assert.equal(users.length, 5);
});

test('unused tables', async () => {
  const users = db.query(c => {
    const { users: u, userRoles, roles: r } = c;
    return {
      select: {
        user: u.name,
        role: r.name
      }
    }
  });
  assert.equal(users.length, 8);
});

test('group by same table', async () => {
  const cities = db.query(context => {
    const { users: u, companies: c, group, not } = context;
    return {
      certain: {
        city: u.city,
        users: group({
          name: u.name,
          company: c.name
        })
      },
      where: {
        [u.city]: not(null)
      }
    }
  });
  const user = cities.at(1).users.at(1);
  assert.equal(user.name, 'Penelope');
  assert.equal(user.company, 'Tesla');
});

test('complex aggregate function', async () => {
  const users = db.queryValues(c => {
    const { users: u, companies, orders: o } = c;
    return {
      select: u.name,
      where: {
        [o.status]: 'Complete'
      },
      groupBy: u.id,
      having: {
        [c.count()]: c.gt(1)
      }
    }
  });
  assert.equal(users.length, 3);
});

test('count with relations', async () => {
  const users = db.query(c => {
    const { users: u } = c;
    return {
      select: {
        id: u.id,
        name: u.name,
        company: c.companies.name,
        count: c.count(c.userRoles.roleId)
      }
    }
  });
  assert.equal(users.length, 5);
});

test('symbol pick', async () => {
  const users = db.query(c => {
    const { users: u } = c;
    return {
      select: {
        ...pick(u, [
          'id',
          'name',
          'createdAt'
        ]),
        company: c.companies.name,
        count: c.count(c.userRoles.roleId)
      }
    }
  });
  const user = users.at(0);
  assert.equal('createdAt' in user, true);
  assert.equal('companyId' in user, false);
  assert.equal('city' in user, false);
});

test('symbol omit', async () => {
  const users = db.query(context => {
    const { 
      users: u,
      userRoles: ur,
      companies: c,
      count
    } = context
    return {
      select: {
        ...omit(u, [
          'companyId',
          'city'
        ]),
        company: c.name,
        count: count(ur.roleId)
      }
    }
  });
  const user = users.at(0);
  assert.equal('createdAt' in user, true);
  assert.equal('companyId' in user, false);
});
