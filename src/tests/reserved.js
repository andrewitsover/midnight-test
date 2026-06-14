import { test } from '../run.js';
import { strict as assert } from 'assert';
import { 
  Database, 
  Table, 
  cascade, 
  check, 
  computed, 
  concat, 
  index, 
  length, 
  like, 
  nil, 
  text
} from '@andrewitsover/midnight';

class Users extends Table {
  and = text;
  or = index(text);
  check = check(text, { in: ['m', 'f'] });
  select = index(text);
  from = nil.text;

  where = () => concat(this.and, ' ', this.or);
}

class Roles extends Table {
  on = cascade(Users);
}

const setup = () => {
  const database = new Database(':memory:');
  const db = database.getClient({ Users, Roles });
  const sql = db.diff();
  db.migrate(sql);

  db.users.insert({
    and: 'and',
    or: 'or',
    check: 'm',
    select: 'select',
    from: 'from'
  });

  return db;
}

test('reserved words in table definitions', async () => {
  const database = new Database(':memory:');
  using db = database.getClient({ Users, Roles });
  const sql = db.diff();
  db.migrate(sql);
});

test('computed with reserved words', async () => {
  using db = setup();
  const where = db.users.get(null, 'where');
  assert.equal(where, 'and or');
});

test('symbol query with reserved words', async () => {
  using db = setup();
  const users = db.query(c => {
    const { users: u } = c;
    return {
      select: {
        and: u.and,
        where: u.where,
        computed: length(u.select)
      },
      where: {
        [u.and]: like('an%')
      },
      orderBy: u.from
    }
  });
  const user = users.at(0);
  assert.equal(user.where, 'and or');
});
