import { strict as assert } from 'assert';
import { test } from '../run.js';
import { from, diff } from '../drivers/sqlite.js';
import { Table } from 'flyweightjs';

const squash = (s) => s.replaceAll(/\s+/gm, ' ').trim();
const compare = (a, b) => assert.equal(squash(a), squash(b));

test('schema', async () => {
  class Rankings extends Table {
    id = this.Intp;
    rank = this.Int;

    Attributes = () => {
      return {
        [this.Index]: {
          on: this.rank,
          where: {
            [this.rank]: this.Gt(1)
          }
        },
        [this.rank]: 2,
        [this.rank]: [1, 2, 3],
        [this.Check]: {
          [this.id]: 1
        }
      };
    }
  }
  const rankResult = from({ Rankings });
  const rank = rankResult.schema.at(0);
  assert.equal(rank.columns.find(c => c.name === 'rank').default, 2);
  assert.equal(rank.indexes.at(0).where, 'rank > 1');
  class Users extends Table {
    id = this.Intp;
    name = this.Text;
    createdAt = this.Now;

    Attributes = () => {
      const date = new Date(Date.UTC(1997, 1, 2));
      return {
        [this.createdAt]: this.Gt(date),
        [this.Unique]: this.name,
        [this.Index]: this.Cast(this.StrfTime('%Y', this.createdAt), 'integer')
      }
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
      check (createdAt > '1997-02-02T00:00:00.000Z'),
    ) strict;

    create unique index users_unique_name on users(name);
    create index users_caststrftimey_created_at_as_integer on users(cast(strftime('%Y', createdAt) as integer));`;
  compare(userSql, expected);
});

test('add and remove column', async () => {
  const previous = class Users extends Table {
    id = this.Intp;
  }
  const current = class Users extends Table {
    id = this.Intp;
    name = this.Text;
  }
  const add = diff({ Users: previous }, { Users: current });
  compare(add, 'alter table users add column name text not null;');
  const remove = diff({ Users: current }, { Users: previous });
  compare(remove, 'alter table users drop column name;');
});

test('add and remove indexes', async () => {
  const previous = class Users extends Table {
    id = this.Intp;
    name = this.Text;
  }
  const current = class Users extends Table {
    id = this.Intp;
    name = this.Text;

    Attributes = () => {
      return {
        [this.Unique]: this.name
      }
    }
  }
  const add = diff({ Users: previous }, { Users: current });
  compare(add, 'create unique index users_unique_name on users(name);');
  const remove = diff({ Users: current }, { Users: previous });
  compare(remove, 'drop index users_unique_name;');
});

test('alter columns', async () => {
  const previous = class Users extends Table {
    id = this.Intp;
    name = this.Text;
    hometown = this.Text;

    Attributes = () => {
      return {
        [this.Index]: this.name
      }
    }
  }
  const current = class Users extends Table {
    id = this.Intp;
    name = this.Textx;
    hometown = this.Text;

    Attributes = () => {
      return {
        [this.hometown]: 'Brisbane',
        [this.Index]: this.name
      }
    }
  }
  const sql = diff({ Users: previous }, { Users: current });
  const expected = `create table temp_users (
      id integer not null,
      name text,
      hometown text not null default 'Brisbane',
      primary key (id),
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
    id = this.Intp;
    name = this.Text;
  }
  class Events extends Table {
    id = this.Intp;
    name = this.Text;
    locationId = this.Int;

    Attributes = () => {
      return {
        [this.locationId]: Locations
      }
    }
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
    id = this.Intp;
    name = 'Brisbane';
  }
  const result = from({ Locations });
  const table = result.schema.at(0);
  const column = table.columns.find(c => c.name === 'name');
  assert.equal(column.default, 'Brisbane');
});

test('foreign keys in attributes', async () => {
  class Locations extends Table {
    id = this.Intp;
    name = this.Text;
  }
  class Events extends Table {
    id = this.Intp;
    name = this.Text;
    locationId = this.Int;

    Attributes = () => {
      return {
        [this.locationId]: Locations
      }
    }
  }
  const result = from({ Locations, Events });
  const events = result.schema.find(t => t.name === 'events');
  const foreignKey = events.foreignKeys.at(0);
  assert.equal(foreignKey.columns.at(0), 'locationId');
  assert.equal(foreignKey.references.table, 'locations');
});

test('foreign keys in fields', async () => {
  class Locations extends Table {
    id = this.Intp;
    name = this.Text;
  }
  class Events extends Table {
    id = this.Intp;
    name = this.Text;
    locationId = Locations;
  }
  const result = from({ Locations, Events });
  const events = result.schema.find(t => t.name === 'events');
  const foreignKey = events.foreignKeys.at(0);
  assert.equal(foreignKey.columns.at(0), 'locationId');
  assert.equal(foreignKey.references.table, 'locations');
});
