import { test } from '../run.js';
import { strict as assert } from 'assert';
import {
  Database,
  BaseTable,
  Table,
  max,
  text,
  real,
  int,
  bigInt,
  primary
} from '@andrewitsover/midnight';

class Buildings extends Table {
  name = text;
  height = real;
  age = int;
  distance = bigInt;
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

test('bigInt in max', async () => {
  const max = db.buildings.max({ column: 'distance' });
  assert.equal(max, distance);
});

test('bigInt in symbol max', async () => {
  const longest = db.firstValue(c => {
    const { buildings: b } = c;
    return {
      select: max(b.distance)
    }
  });
  assert.equal(longest, distance);
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
    id = primary.bigInt;
    name = text;
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

test('bigInt in json object', async () => {
  const building = db.first(c => {
    const { buildings: b } = c;
    return {
      select: {
        id: b.id,
        rest: () => ({
          name: b.name,
          distance: b.distance
        })
      }
    }
  });
  assert.equal(typeof building.rest.distance, 'bigint');
});

test('bigInt in json array', async () => {
  const building = db.first(c => {
    const { buildings: b } = c;
    return {
      select: {
        id: b.id,
        rest: [{
          name: b.name,
          distance: b.distance
        }]
      }
    }
  });
  assert.equal(typeof building.rest.at(0).distance, 'bigint');
});
