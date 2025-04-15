import { strict as assert } from 'assert';
import { compare } from '../utils.js';
import { test } from '../run.js';

test('sql', async (context) => {
  const { db, rewrite } = context.common;
  const locations = await db.locations.byMethod({ id: 1 });
  const record = await db.fights.byFighter({ id: 342 });
  const common = await db.fighters.common({ fighter1: 17, fighter2: 2624 });
  const methods = await db.methods.byFighter({ fighterId: 17 });
  const result = await db.methods.topSubmission();
  const submission = result.at(0);
  const winners = await db.locations.winners();
  const orderBy = await db.locations.events();
  const detailedEvents = await db.locations.detailedEvents();
  const extract = await db.fighters.extract({ path: '$.instagram' });
  await db.coaches.from();

  compare(locations, 'locationsByMethod', rewrite);
  compare(record, 'fightsByFighter', rewrite);
  compare(common, 'fightersCommon', rewrite);
  compare(methods, 'methodsByFighter', rewrite);
  compare(winners, 'locationWinners', rewrite);
  compare(orderBy, 'aggregateOrderBy', rewrite);
  compare(detailedEvents, 'detailedEvents', rewrite);
  compare(extract, 'fightersExtract', rewrite);

  assert.equal(submission, 'Rear-naked choke');
});
