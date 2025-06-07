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
  const filtered = locations
    .flatMap(l => l.events)
    .filter(e => e.count === 1);
  assert.equal(filtered.length, 2);
  const cards = await db.cards.query({
    where: {
      id: [8, 15, 20, 30, 34]
    },
    include: {
      methods: (t, c) => t.fights
        .groupBy(['cardId', 'methodId'])
        .max({
          column: 'id',
          where: {
            cardId: c.id
          },
          orderBy: 'max',
          limit: 2
        })
    }
  });
  const max = cards.at(0).methods.at(1).max;
  assert.equal(max, 23);
});
