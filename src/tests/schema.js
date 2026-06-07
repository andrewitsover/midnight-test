import { strict as assert } from 'assert';
import { test } from '../run.js';
import { from, diff } from '../drivers/sqlite.js';
import {
  Table,
  BaseTable,
  FTSTable,
  ExternalFTSTable,
  check,
  primary,
  index,
  gt,
  unique,
  text,
  now,
  attributes,
  cast,
  strfTime,
  nil,
  references,
  init,
  int,
  unindexed,
  prefix,
  cascade
} from '@andrewitsover/midnight';

const squash = (s) => s.replaceAll(/\s+/gm, ' ').trim();
const compare = (a, b) => assert.equal(squash(a), squash(b));

test('schema', async () => {
  class Rankings extends BaseTable {
    id = check(primary.int, { is: 1 });
    rank = index(check(2, { in: [1, 2, 3] }), rank => ({
      where: {
        [rank]: gt(1)
      }
    }));
  }
  const rankResult = from({ Rankings });
  const rank = rankResult.schema.at(0);
  assert.equal(rank.columns.find(c => c.name === 'rank').default, '2');
  assert.equal(rank.indexes.at(0).where, 'rank > 1');
  const date = new Temporal.PlainDate(1997, 1, 2);
  class Users extends Table {
    name = unique(text);
    createdAt = check(now.plainDate, { is: gt(date) });

    [attributes] = () => {
      const computed = cast(strfTime('%Y', this.createdAt), 'integer');
      return index(computed);
    }
  };
  const userResult = from({ Users });
  const user = userResult.schema.at(0);
  assert.equal(user.indexes.at(0).type, 'unique');
  assert.equal(user.indexes.at(0).on, 'name');
  assert.equal(user.indexes.at(1).on, `cast(strftime('%Y', createdAt) as integer)`);
  assert.equal(user.checks.at(0).sql.startsWith(`createdAt > '1997`), true);
  const userSql = userResult.database.diff();
  const expected = `create table users (
      id integer not null,
      name text not null,
      createdAt text not null default (temporal_now_plain_date()),
      primary key (id),
      constraint users_3e857fda check (createdAt > '1997-01-02')
    ) strict;

    create unique index users_cf21f6de on users(name);
    create index users_b8644331 on users(cast(strftime('%Y', createdAt) as integer));`;
  compare(userSql, expected);
});

test('add and remove column', async () => {
  const previous = class Users extends BaseTable {
    id = primary.int;
  }
  const current = class Users extends BaseTable {
    id = primary.int;
    name = text;
  }
  const add = diff({ Users: previous }, { Users: current });
  compare(add, 'alter table users add column name text not null;');
  const remove = diff({ Users: current }, { Users: previous });
  compare(remove, 'alter table users drop column name;');
});

test('rename column', async () => {
  const previous = class Users extends BaseTable {
    id = primary.int;
    name = text;
  }
  const current = class Users extends BaseTable {
    id = primary.int;
    displayName = text;
  }
  const rename = diff({ Users: previous }, { Users: current });
  compare(rename, 'alter table users rename column name to displayName;');
});

test('add and remove indexes', async () => {
  const previous = class Users extends Table {
    name = text;
  }
  const current = class Users extends Table {
    name = unique(text);
  }
  const add = diff({ Users: previous }, { Users: current });
  compare(add, 'create unique index users_cf21f6de on users(name);');
  const remove = diff({ Users: current }, { Users: previous });
  compare(remove, 'drop index users_cf21f6de;');
});

test('alter columns', async () => {
  const previous = class Users extends Table {
    name = index(text);
    hometown = text;
  }
  const current = class Users extends Table {
    name = index(nil.text);
    hometown = 'Brisbane';
  }
  const sql = diff({ Users: previous }, { Users: current });
  const expected = `create table temp_users (
      id integer not null,
      name text,
      hometown text not null default 'Brisbane',
      primary key (id)
    ) strict;


    insert into temp_users (id, name, hometown) select id, name, hometown from users;
    drop table users;
    alter table temp_users rename to users;
    create index users_82a3537f on users(name);
    pragma foreign_key_check;`;
  compare(sql, expected);
});

test('drop tables', async () => {
  class Locations extends Table {
    name = text;
  }
  class Events extends Table {
    name = text;
    locationId = references(Locations);
  }
  const current = {
    Locations,
    Events
  };
  const updated = {
    Locations
  };
  const sql = diff(current, updated);
  compare(sql, 'drop table events;');
});

test('default literals', async () => {
  class Locations extends Table {
    name = 'Brisbane';
  }
  const result = from({ Locations });
  const table = result.schema.at(0);
  const column = table.columns.find(c => c.name === 'name');
  assert.equal(column.default, `'Brisbane'`);
});

test('foreign keys in attributes', async () => {
  class Locations extends Table {
    name = text;
  }
  class Events extends Table {
    name = text;
    locationId = references(Locations);
  }
  const result = from({ Locations, Events });
  const events = result.schema.find(t => t.name === 'events');
  const foreignKey = events.foreignKeys.at(0);
  assert.equal(foreignKey.columns.at(0), 'locationId');
  assert.equal(foreignKey.references.table, 'locations');
});

test('foreign keys in fields', async () => {
  class Locations extends Table {
    name = text;
  }
  class Events extends Table {
    name = text;
    locationId = references(Locations);
  }
  const result = from({ Locations, Events });
  const events = result.schema.find(t => t.name === 'events');
  const foreignKey = events.foreignKeys.at(0);
  assert.equal(foreignKey.columns.at(0), 'locationId');
  assert.equal(foreignKey.references.table, 'locations');
});

test('multiple actions', async () => {
  class Locations extends Table {
    name = text;
  }
  class Events extends Table {
    name = text;
    locationId = references(Locations, {
      onDelete: 'cascade',
      onUpdate: 'set default'
    });
  }
  const result = from({ Locations, Events });
  const events = result.schema.find(t => t.name === 'events');
  const actions = events.foreignKeys.at(0).actions;
  assert.equal(actions.includes('on delete cascade'), true);
  assert.equal(actions.includes('on update set default'), true);
});

test('foreign key options', async () => {
  class Locations extends Table {
    name = text;
  }
  class Events extends Table {
    name = text;
    locationId = cascade(Locations);
  }
  const result = from({ Locations, Events });
  const events = result.schema.find(t => t.name === 'events');
  const index = events.indexes.find(index => index.on === 'locationId');
  assert.equal(index !== undefined, true);
  const foreignKey = events.foreignKeys.at(0);
  assert.equal(foreignKey.actions.at(0), 'on delete cascade');
});

test('null foreign key', async () => {
  class Locations extends Table {
    name = text;
  }
  class Events extends Table {
    name = text;
    locationId = nil.references(Locations);
    code = init('x');
  }
  const result = from({ Locations, Events });
  const events = result.schema.find(t => t.name === 'events');
  const locationId = events.columns.find(c => c.name === 'locationId');
  const code = events.columns.find(c => c.name === 'code');
  assert.equal(locationId.notNull, false);
  assert.equal(code.default, `'x'`);
});

test('complex checks', async () => {
  class Users extends Table {
    name = text;
    age = int;

    [attributes] = () => {
      return check({
        or: [
          { [this.name]: 'Andrew' },
          { [this.age]: 3 }
        ]
      });
    }
  }
  const result = from({ Users });
  const users = result.schema.find(t => t.name === 'users');
  assert.equal(users.checks.at(0).sql, `name = 'Andrew' or age = 3`);
});

test('content fts5 table', async () => {
  class Emails extends Table {
    to = text;
    body = text;
  }
  const email = new Emails();
  class Searches extends ExternalFTSTable {
    to = email.to;
    body = email.body;
  }
  const result = from({ Emails, Searches });
  const table = result.schema.find(t => t.name === 'searches');
});

test('contentless fts5 table', async () => {
  class Emails extends FTSTable {
    uuid = unindexed;
    to = text;
    body = text;

    [prefix] = 3;
  }
  const result = from({ Emails });
  const table = result.schema.find(t => t.name === 'emails');
  const count = table.columns.filter(c => c.name === 'rowid').length;
  assert.equal(count, 1);
});

test('add not null to column', async () => {
  const previous = class Books extends BaseTable {
    id = primary.int;
    title = nil.text;
    author = text;
  }
  const current = class Books extends BaseTable {
    id = primary.int;
    title = text;
    author = text;
  }
  const sql = diff({ Books: previous }, { Books: current });
  compare(sql, 'alter table books alter column title set not null;');
});

test('drop not null from column', async () => {
  const previous = class Books extends BaseTable {
    id = primary.int;
    title = text;
    author = text;
  }
  const current = class Books extends BaseTable {
    id = primary.int;
    title = nil.text;
    author = text;
  }
  const sql = diff({ Books: previous }, { Books: current });
  compare(sql, 'alter table books alter column title drop not null;');
});

test('add check to column', async () => {
  const previous = class Books extends BaseTable {
    id = primary.int;
    title = text;
    author = text;
  }
  const current = class Books extends BaseTable {
    id = primary.int;
    title = text;
    author = check(text, { is: 'Andrew' });
  }
  const sql = diff({ Books: previous }, { Books: current });
  compare(sql, `alter table books add constraint books_17eef01c check (author = 'Andrew');`);
});

test('remove check from column', async () => {
  const previous = class Books extends BaseTable {
    id = primary.int;
    title = text;
    author = check(text, { is: 'Andrew' });
  }
  const current = class Books extends BaseTable {
    id = primary.int;
    title = text;
    author = text;
  }
  const sql = diff({ Books: previous }, { Books: current });
  compare(sql, `alter table books drop constraint books_17eef01c;`);
});

test('add column with expression default', async () => {
  const previous = class Books extends BaseTable {
    id = primary.int;
    title = text;
  }
  const current = class Books extends BaseTable {
    id = primary.int;
    title = text;
    createdAt = now.instant;
  }
  const sql = diff({ Books: previous }, { Books: current });
  assert.equal(sql.startsWith('create table temp_books'), true);
});
