import { Database, BaseTable, Table } from '@andrewitsover/midnight';
import { test } from '../run.js';
import { strict as assert } from 'assert';

class Buildings extends Table {
  name;
  height = this.Real;
  age = this.Int;
  distance = this.BigInt;
}

const database = new Database(':memory:');
const db = database.getClient({ Buildings });
const sql = db.diff();
db.migrate(sql);

const distance = 2n ** 60n;

db.buildings.insert({
  name: 'The Empire State Building',
  height: 24.5,
  age: 30,
  distance
});

test('query bigInt', async () => {
  const building = db.buildings.get();
  assert.equal(typeof building.age, 'number');
  assert.equal(typeof building.distance, 'bigint');
});

test('symbol bigInt', async () => {
  const building = db.first(c => {
    const { buildings: b } = c;
    return {
      select: b
    }
  });
  assert.equal(typeof building.age, 'number');
  assert.equal(typeof building.distance, 'bigint');
});

test('bigInt in json', async () => {
  const building = db.first(c => {
    const { buildings: b } = c;
    return {
      select: {
        id: b.id,
        test: c.object({
          distance: b.distance
        })
      }
    }
  });
  assert.equal(building.test.distance, distance.toString());
});

test('bigInt in max', async () => {
  const max = db.buildings.max({ column: 'distance' });
  assert.equal(max, distance);
});

test('bigInt in symbol max', async () => {
  const max = db.firstValue(c => {
    const { buildings: b, max } = c;
    return {
      select: max(b.distance)
    }
  });
  assert.equal(max, distance);
});

test('insert many with bigInt', async () => {
  db.buildings.delete();
  const distance = 325n;
  const name = 'The Empire State Building';
  const rows = [
    {
      name,
      height: 24.5,
      age: 30,
      distance
    },
    {
      name: 'Changzhou Library',
      height: 10,
      age: 5,
      distance: 29842n
    }
  ];
  db.buildings.insertMany(rows);
  const building = db.buildings.get({ name });
  assert.equal(building.distance, distance);
});

test('insert with bigInt primary key', async () => {
  class Buildings extends BaseTable {
    id = this.BigIntPrimary;
    name;
  }

  const database = new Database(':memory:');
  const db = database.getClient({ Buildings });
  const sql = db.diff();
  db.migrate(sql);

  const id = db.buildings.insert({
    id: 1n,
    name: 'The Empire State Building'
  });
  assert.equal(id, 1n);
});
