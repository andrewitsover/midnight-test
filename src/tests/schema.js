import { strict as assert } from 'assert';
import { test } from '../run.js';
import { from } from '../drivers/sqlite.js';
import { Table } from 'flyweightjs';

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
  console.log(userSql);
});
