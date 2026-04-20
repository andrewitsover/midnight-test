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
