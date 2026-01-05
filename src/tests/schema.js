import { strict as assert } from 'assert';
import { test } from '../run.js';
import { from, diff } from '../drivers/sqlite.js';
import { Table, BaseTable, FTSTable, ExternalFTSTable } from '@andrewitsover/midnight';

const squash = (s) => s.replaceAll(/\s+/gm, ' ').trim();
const compare = (a, b) => assert.equal(squash(a), squash(b));

test('schema', async () => {
  class Rankings extends BaseTable {
    id = this.Check(this.IntPrimary, 1);
    rank = this.Index(this.Check(2, [1, 2, 3]), rank => {
      return {
        [rank]: this.Gt(1)
      }
    });
  }
  const rankResult = from({ Rankings });
  const rank = rankResult.schema.at(0);
  assert.equal(rank.columns.find(c => c.name === 'rank').default, 2);
  assert.equal(rank.indexes.at(0).where, 'rank > 1');
  const date = new Date(Date.UTC(1997, 1, 2));
  class Users extends Table {
    name = this.Unique(this.Text);
    createdAt = this.Check(this.Now, this.Gt(date));

    Attributes = () => {
      const computed = this.Cast(this.StrfTime('%Y', this.createdAt), 'integer');
      this.Index(computed);
    }
  };
  const userResult = from({ Users });
  const user = userResult.schema.at(0);
  assert.equal(user.indexes.at(0).type, 'unique');
  assert.equal(user.indexes.at(0).on, 'name');
  assert.equal(user.indexes.at(1).on, `cast(strftime('%Y', createdAt) as integer)`);
  assert.equal(user.checks.at(0).startsWith(`createdAt > '1997`), true);
  const userSql = userResult.database.diff();
  const expected = `create table users (
      id integer not null,
      name text not null,
      createdAt text not null default (date() || 'T' || time() || '.000Z'),
      primary key (id),
      check (createdAt > '1997-02-02T00:00:00.000Z')
    ) strict;

    create unique index users_unique_name on users(name);
    create index users_caststrftimey_created_at_as_integer on users(cast(strftime('%Y', createdAt) as integer));`;
  compare(userSql, expected);
});

test('add and remove column', async () => {
  const previous = class Users extends BaseTable {
    id = this.IntPrimary;
  }
  const current = class Users extends BaseTable {
    id = this.IntPrimary;
    name = this.Text;
  }
  const add = diff({ Users: previous }, { Users: current });
  compare(add, 'alter table users add column name text not null;');
  const remove = diff({ Users: current }, { Users: previous });
  compare(remove, 'alter table users drop column name;');
});

test('rename column', async () => {
  const previous = class Users extends BaseTable {
    id = this.IntPrimary;
    name = this.Text;
  }
  const current = class Users extends BaseTable {
    id = this.IntPrimary;
    displayName = this.Text;
  }
  const rename = diff({ Users: previous }, { Users: current });
  compare(rename, 'alter table users rename column name to displayName;');
});

test('add and remove indexes', async () => {
  const previous = class Users extends Table {
    name = this.Text;
  }
  const current = class Users extends Table {
    name = this.Unique(this.Text);
  }
  const add = diff({ Users: previous }, { Users: current });
  compare(add, 'create unique index users_unique_name on users(name);');
  const remove = diff({ Users: current }, { Users: previous });
  compare(remove, 'drop index users_unique_name;');
});

test('alter columns', async () => {
  const previous = class Users extends Table {
    name = this.Index(this.Text);
    hometown = this.Text;
  }
  const current = class Users extends Table {
    name = this.Index(this.Null(this.Text));
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
    create index users_name on users(name);
    pragma foreign_key_check;`;
  compare(sql, expected);
});

test('drop tables', async () => {
  class Locations extends Table {
    name = this.Text;
  }
  class Events extends Table {
    name = this.Text;
    locationId = this.References(Locations);
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
  assert.equal(column.default, 'Brisbane');
});

test('foreign keys in attributes', async () => {
  class Locations extends Table {
    name = this.Text;
  }
  class Events extends Table {
    name = this.Text;
    locationId = this.References(Locations);
  }
  const result = from({ Locations, Events });
  const events = result.schema.find(t => t.name === 'events');
  const foreignKey = events.foreignKeys.at(0);
  assert.equal(foreignKey.columns.at(0), 'locationId');
  assert.equal(foreignKey.references.table, 'locations');
});

test('foreign keys in fields', async () => {
  class Locations extends Table {
    name = this.Text;
  }
  class Events extends Table {
    name = this.Text;
    locationId = this.References(Locations);
  }
  const result = from({ Locations, Events });
  const events = result.schema.find(t => t.name === 'events');
  const foreignKey = events.foreignKeys.at(0);
  assert.equal(foreignKey.columns.at(0), 'locationId');
  assert.equal(foreignKey.references.table, 'locations');
});

test('multiple actions', async () => {
  class Locations extends Table {
    name = this.Text;
  }
  class Events extends Table {
    name = this.Text;
    locationId = this.References(Locations, {
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
    name = this.Text;
  }
  class Events extends Table {
    name = this.Text;
    locationId = this.Cascade(Locations);
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
    name = this.Text;
  }
  class Events extends Table {
    name = this.Text;
    locationId = this.References(Locations, {
      notNull: false
    });
    code = this.Default('x');
  }
  const result = from({ Locations, Events });
  const events = result.schema.find(t => t.name === 'events');
  const locationId = events.columns.find(c => c.name === 'locationId');
  const code = events.columns.find(c => c.name === 'code');
  assert.equal(locationId.notNull, false);
  assert.equal(code.default, 'x');
});

test('content fts5 table', async () => {
  class Emails extends Table {
    to = this.Text;
    body = this.Text;
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
    uuid = this.Unindexed;
    to;
    body;

    Prefix = 3;
  }
  const result = from({ Emails });
  const table = from({ Emails }).schema.find(t => t.name === 'emails');
});
