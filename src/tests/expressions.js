import { Database, Table, pick, omit } from '@andrewitsover/midnight';
import { test } from '../run.js';
import { strict as assert } from 'assert';
import { functions } from '@andrewitsover/midnight';

const { unixEpoch, multiply, not, like } = functions;

const Instant = Temporal.Instant;

class Users extends Table {
  name;
  createdAt = this.Now.Instant;
}

const database = new Database(':memory:');
const db = database.getClient({ Users });
const sql = db.diff();
db.migrate(sql);

const rows = ['Andrew', 'Susan', 'Penelope', 'Samuel', 'James'].map(name => ({ name }));
db.users.insertMany(rows);

test('unixEpoch', async () => {
  const users = db.queryValues(c => {
    const { users: u } = c;
    return {
      select: multiply(unixEpoch(u.createdAt, 'subsec'), 1000)
    }
  });
});

test('symbol in query', async () => {
  db.query(c => {
    const { users: u } = c;
    return {
      select: {
        ...u
      },
      where: {
        [u.name]: like(/e.$/)
      }
    }
  });
  db.query(c => {
    const { users: u } = c;
    return {
      select: {
        ...u
      },
      where: {
        [u.name]: like(/e.$/)
      }
    }
  });
  db.query(c => {
    const { users: u } = c;
    return {
      select: {
        ...u
      },
      where: {
        [u.name]: like(/e.$/)
      }
    }
  });
});
