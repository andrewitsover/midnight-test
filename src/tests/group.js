import { strict as assert } from 'assert';
import { test } from '../run.js';
import { db } from '../drivers/sqlite.js';

test('groupBy', async () => {
  const towns = await db.fighters
    .groupBy('hometown')
    .avg({
      column: {
        height: 'heightCm'
      },
      where: {
        avg: c => c.gt(170)
      },
      limit: 3
    });
  assert.equal(towns.at(1).height, 173);
  const groupArray = await db.events
    .groupBy('locationId')
    .array({
      select: {
        events: true
      },
      limit: 3
    });
  const group = groupArray.at(1);
  assert.equal(group.events.at(0).id, group.locationId);
  const groupValues = await db.events
    .groupBy('locationId')
    .array({
      select: {
        startTimes: 'startTime'
      },
      limit: 3
    });
  const startTimes = groupValues.at(1).startTimes;
  assert.equal(startTimes.every(s => typeof s === 'string'), true);
});
