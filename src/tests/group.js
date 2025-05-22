import { strict as assert } from 'assert';
import { test } from '../run.js';

test('group', async (context) => {
  const db = context.common.db;
  const methods = await db.fights.group({
    by: ['weightClassId', 'methodId'],
    alias: {
      count: agg => agg.count()
    },
    orderBy: 'count',
    desc: true,
    limit: 1
  });
  assert.equal(methods.at(0).count, 557);
  const heights = await db.fighters.group({
    by: 'hometown',
    alias: {
      height: agg => agg.avg({ column: 'heightCm' }),
      sample: agg => agg.count()
    },
    where: {
      sample: s => s.gt(1)
    },
    orderBy: 'height',
    desc: true,
    limit: 5
  });
  assert.equal(heights.at(2).height, 193.5);
  const arrayTest = await db.fighters.group({
    by: 'hometown',
    alias: {
      fighters: agg => agg.array(),
      count: agg => agg.count()
    },
    where: {
      count: 9,
      hometown: 'Albuquerque, New Mexico, United States'
    },
    limit: 1
  });
  const sample = arrayTest.at(0);
  assert.equal(sample.fighters.at(0).social.instagram, 'CarlosCondit');
  assert.equal(sample.count, 9);
  assert.equal(sample.fighters.length, 9);
});
