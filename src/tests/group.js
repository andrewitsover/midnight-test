import { strict as assert } from 'assert';
import { test } from '../run.js';

test('groupBy', async (context) => {
  const db = context.common.db;
  const towns = await db.fighters
    .groupBy('hometown')
    .avg({
      column: 'heightCm',
      limit: 3,
      alias: 'height',
      where: {
        avg: a => a.gt(170)
      }
    });
  assert.equal(towns.at(1).height, 173);
  const events = await db.events
    .groupBy('locationId')
    .count({
      include: {
        location: (t, c) => t.locations.get({ id: c.locationId })
      },
      limit: 3
    });
  const event = events.at(1);
  assert.equal(event.locationId, event.location.id);
  assert.equal(event.count, 2);
  const locations = await db.locations.query({
    include: {
      events: (t, c) => t.events
        .groupBy('locationId')
        .count({
          where: {
            locationId: c.id
          }
        })
    },
    limit: 3
  });
  console.log(locations.at(0).events);
});
