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
  primary,
  nil,
  bool,
  coalesce,
  multiply
} from '@andrewitsover/midnight';

class Buildings extends Table {
  name = text;
  height = real;
  age = int;
  distance = bigInt;
}

class Cities extends Table {
  name = text;
  population = nil.int;
  year = nil.int;
  area = nil.bigInt;
  created = nil.instant;
  active = nil.bool;
}

const distance = 2n ** 60n;

const setup = () => {
  const database = new Database(':memory:');
  const db = database.getClient({ Buildings, Cities });
  const sql = db.diff();
  db.migrate(sql);

  db.buildings.insert({
    id: 1,
    name: 'The Empire State Building',
    height: 24.5,
    age: 30,
    distance
  });

  db.cities.insert({
    id: 1,
    name: 'New York City',
    year: 1997,
    population: 100,
    area: 240n,
    created: Temporal.Now.instant(),
    active: true
  });
  db.cities.insert({
    id: 2,
    name: 'Portland',
    year: 2026,
    area: 120n,
    created: Temporal.Now.instant(),
    active: false
  });

  return db;
}

test('coalesce bigInt', async () => {
  using db = setup();
  const city = db.first(t => {
    const { cities: c } = t;
    const year = coalesce(c.population, c.year);
    const land = multiply(c.area, 10n);
    return {
      select: {
        year,
        land
      },
      where: {
        [c.id]: 2
      }
    }
  });
  assert.equal(typeof city.year, 'number');
  assert.equal(typeof city.land, 'bigint');
});
