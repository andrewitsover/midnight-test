import { strict as assert } from 'assert';
import { compare } from '../utils.js';
import { test } from '../run.js';

test('sql', async (context) => {
  const { db, rewrite } = context.common;
  const locations = await db.locations.byMethod({
    params: { 
      id: 1 
    }
  });
  compare(locations, 'locationsByMethod', rewrite);
  const record = await db.fights.byFighter({
    params: { 
      id: 342 
    }
  });
  compare(record, 'fightsByFighter', rewrite);
  const common = await db.fighters.common({
    params: { 
      fighter1: 17,
      fighter2: 2624
    }
  });
  compare(common, 'fightersCommon', rewrite);
  const methods = await db.methods.byFighter({
    params: { 
      fighterId: 17
    }
  });
  compare(methods, 'methodsByFighter', rewrite);
  const result = await db.methods.topSubmission();
  const submission = result.at(0);
  assert.equal(submission.methodDescription, 'Rear-naked choke');
  const winners = await db.locations.winners();
  compare(winners, 'locationWinners', rewrite);
  const orderBy = await db.locations.events();
  compare(orderBy, 'aggregateOrderBy', rewrite);
  const detailedEvents = await db.locations.detailedEvents();
  compare(detailedEvents, 'detailedEvents', rewrite);
  const extract = await db.fighters.extract({
    params: { 
      path: '$.instagram'
    }
  });
  compare(extract, 'fightersExtract', rewrite);
  await db.coaches.from();
  const closest = await db.locations.distanceFrom({
    select: ['id', 'distanceKm'],
    params: {
      lat: 3.342,
      long: 10.435
    },
    include: {
      events: (t, c) => t.events.many({
        locationId: c.id
      })
    },
    orderBy: 'distanceKm',
    limit: 3
  });
  console.log(closest);
});
