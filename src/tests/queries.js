import { strict as assert } from 'assert';
import { compare } from '../utils.js';
import { test, cleanUp } from '../run.js';
import { db } from '../drivers/sqlite.js';

test('queries', async () => {
  const cards = db.cards.many({ eventId: 100 });
  const fighterId = db.fighters.get({ name: s => s.like('Israel%') }, 'id');

  compare(cards, 'cardsGet');
  assert.equal(fighterId, 17);

  const id = db.coaches.insert({
    name: 'Eugene Bareman',
    city: 'Auckland'
  });
  assert.equal(id, 1);
  const inserted = db.coaches.get({ id: 1 });
  assert.notEqual(inserted, undefined);
  assert.equal(inserted.city, 'Auckland');
  db.coaches.update({
    where: { id: 1 },
    set: { city: 'Brisbane' }
  });
  const updated = db.coaches.get({ id: 1 });
  assert.equal(updated.city, 'Brisbane');
  db.coaches.delete({ id: 1 });
  const deleted = db.coaches.get({ id: 1 });
  assert.equal(deleted, undefined);
  const limited = db.fighters.query({ limit: 10 });
  assert.equal(limited.length, 10);
  const profiles = db.fighterProfiles.query({
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
  db.coaches.delete();
  db.coaches.insert({ name: 'Andrew', city: 'Brisbane' });
  db.coaches.insert({ name: 'Andrew', city: 'Brisbane' });
  db.coaches.update({
    where: { name: 'Andrew' },
    set: { name: 'Eugene' }
  });
  const count = db.coaches.count({ name: 'Eugene' });
  assert.equal(count, 2);
  db.coaches.delete();
  const fighterCount = db.fighters.count({
    where: {
      and: [
        { id: c => c.gt(10) },
        { id: c => c.lt(15) }
      ]
    }
  });
  assert.equal(fighterCount, 4);
  const whereSelector = db.fighters.get({ social: c => c.instagram.eq('angga_thehitman') });
  assert.equal(whereSelector.id, 2);
  const rows = [];
  for (let i = 0; i < 5; i++) {
    rows.push({
      name: 'test',
      city: 'test'
    });
  }
  db.coaches.insertMany(rows);
  const insertCount = db.coaches.count();
  assert.equal(insertCount, 5);
  db.coaches.delete();
  const upsertId = db.coaches.insert({
    name: 'Test User',
    city: 'Test City'
  });
  db.coaches.upsert({
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
  const upsert = db.coaches.get({ id: upsertId });
  assert.equal(upsert.city, 'Updated City');
  db.coaches.delete();
  const first = db.fighters.first({
    where: {
      id: 3
    }
  });
  assert.equal(first.id, 3);
  const total = db.fighters.count({
    where: {
      heightCm: n => n.not(null)
    }
  });
  const sum = db.fighters.sum({ column: 'heightCm' });
  const avg = db.fighters.avg({ column: 'heightCm' });
  assert.equal(avg, sum / total);
  const time = new Date();
  time.setFullYear(1997);
  const conditions = db.events.query({
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
  const omit = db.events.first({
    where: {
      id: 1
    },
    omit: 'locationId'
  });
  assert.equal(omit.locationId, undefined);
  const coachId = db.coaches.insert({
    name: 'Test',
    city: 'Brisbane'
  });
  db.coaches.update({
    set: {
      city: (c, f) => f.concat(c.city, ', Australia')
    },
    where: {
      id: coachId
    }
  });
  const coach = db.coaches.get({ id: coachId });
  assert.equal(coach.city, 'Brisbane, Australia');
  db.coaches.delete();
  const max = db.events.max({
    column: 'startTime',
    where: {
      id: c => c.lt(10)
    }
  });
  assert.equal(max instanceof Date, true);
});

cleanUp('queries', async () => {
  db.coaches.delete();
});
