import { strict as assert } from 'assert';
import { compare } from '../utils.js';
import { test, cleanUp } from '../run.js';
import { db } from '../drivers/sqlite.js';

test('queries', async () => {
  const cards = await db.cards.many({ eventId: 100 });
  const fighterId = await db.fighters.get({ name: s => s.like('Israel%') }, 'id');

  compare(cards, 'cardsGet');
  assert.equal(fighterId, 17);

  const id = await db.coaches.insert({
    name: 'Eugene Bareman',
    city: 'Auckland'
  });
  assert.equal(id, 1);
  const inserted = await db.coaches.get({ id: 1 });
  assert.notEqual(inserted, undefined);
  assert.equal(inserted.city, 'Auckland');
  await db.coaches.update({
    where: { id: 1 },
    set: { city: 'Brisbane' }
  });
  const updated = await db.coaches.get({ id: 1 });
  assert.equal(updated.city, 'Brisbane');
  await db.coaches.remove({ id: 1 });
  const removed = await db.coaches.get({ id: 1 });
  assert.equal(removed, undefined);
  const limited = await db.fighters.query({ limit: 10 });
  assert.equal(limited.length, 10);
  const profiles = await db.fighterProfiles.query({
    where: {
      fighterProfiles: 'Sao',
    },
    highlight: {
      column: 'hometown',
      tags: ['<b>', '</b>']
    },
    bm25: {
      name: 1,
      hometown: 10
    },
    limit: 5
  });
  compare(profiles, 'fighterProfiles');
  await db.coaches.remove();
  await db.coaches.insert({ name: 'Andrew', city: 'Brisbane' });
  await db.coaches.insert({ name: 'Andrew', city: 'Brisbane' });
  await db.coaches.update({
    where: { name: 'Andrew' },
    set: { name: 'Eugene' }
  });
  const count = await db.coaches.count({ name: 'Eugene' });
  assert.equal(count, 2);
  await db.coaches.remove();
  const fighterCount = await db.fighters.count({
    where: {
      and: [
        { id: c => c.gt(10) },
        { id: c => c.lt(15) }
      ]
    }
  });
  assert.equal(fighterCount, 4);
  const whereSelector = await db.fighters.get({ social: c => c.instagram.eq('angga_thehitman') });
  assert.equal(whereSelector.id, 2);
  const rows = [];
  for (let i = 0; i < 5; i++) {
    rows.push({
      name: 'test',
      city: 'test'
    });
  }
  await db.coaches.insertMany(rows);
  const insertCount = await db.coaches.count();
  assert.equal(insertCount, 5);
  await db.coaches.remove();
  const upsertId = await db.coaches.insert({
    name: 'Test User',
    city: 'Test City'
  });
  await db.coaches.upsert({
    values: {
      id: upsertId,
      name: 'Not User',
      city: 'Not City'
    },
    target: 'id',
    set: {
      city: 'Updated City'
    }
  });
  const upsert = await db.coaches.get({ id: upsertId });
  assert.equal(upsert.city, 'Updated City');
  await db.coaches.remove();
  const first = await db.fighters.first({
    where: {
      id: 3
    }
  });
  assert.equal(first.id, 3);
  const total = await db.fighters.count({
    where: {
      heightCm: n => n.not(null)
    }
  });
  const sum = await db.fighters.sum({ column: 'heightCm' });
  const avg = await db.fighters.avg({ column: 'heightCm' });
  assert.equal(avg, sum / total);
  const time = new Date();
  time.setFullYear(1997);
  const conditions = await db.events.query({
    where: {
      id: n => n.lt(29),
      or: [
        { name: n => n.like('UFC 1_: The%') },
        { id: n => n.lt(10) },
        {
          and: [
            { startTime: n => n.gt(time) },
            { name: n => n.like('%Japan%') }
          ]
        }
      ]
    }
  });
  assert.equal(conditions.at(12).id, 18);
  const omit = await db.events.first({
    where: {
      id: 1
    },
    omit: 'locationId'
  });
  assert.equal(omit.locationId, undefined);
  const coachId = await db.coaches.insert({
    name: 'Test',
    city: 'Brisbane'
  });
  await db.coaches.update({
    set: {
      city: (c, f) => f.concat(c.city, ', Australia')
    },
    where: {
      id: coachId
    }
  });
  const coach = await db.coaches.get({ id: coachId });
  assert.equal(coach.city, 'Brisbane, Australia');
  await db.coaches.remove();
  const max = await db.events.max({
    column: 'startTime',
    where: {
      id: c => c.lt(10)
    }
  });
  assert.equal(max instanceof Date, true);
});

cleanUp('queries', async () => {
  await db.coaches.remove();
});
