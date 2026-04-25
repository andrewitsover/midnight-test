import { Database, Table } from '@andrewitsover/midnight';
import { test } from '../run.js';
import { strict as assert } from 'assert';

class Users extends Table {
  and;
  or = this.Index(this.Text);
  check = this.Check(this.Text, { in: ['m', 'f'] });
  select = this.Index(this.Text);
  from = this.Null(this.Text);
  where = this.Concat(this.and, ' ', this.or);
}

class Roles extends Table {
  on = this.Cascade(Users);
}

const database = new Database(':memory:');
const db = database.getClient({ Users, Roles });
const sql = db.diff();

test('reserved words in table definitions', async () => {
  db.migrate(sql);
});

test('insert reserved words', async () => {
  const id = db.users.insert({
    and: 'and',
    or: 'or',
    check: 'm',
    select: 'select',
    from: 'from'
  });
  const exists = db.users.exists({ id });
  assert.equal(exists, true);
});

test('computed with reserved words', async () => {
  const where = db.users.get(null, 'where');
  assert.equal(where, 'and or');
});

test('symbol query with reserved words', async () => {
  const users = db.query(c => {
    const { users: u } = c;
    return {
      select: {
        and: u.and,
        where: u.where,
        computed: c.length(u.select)
      },
      where: {
        [u.and]: c.like('an%')
      },
      orderBy: u.from
    }
  });
  const user = users.at(0);
  assert.equal(user.where, 'and or');
});
