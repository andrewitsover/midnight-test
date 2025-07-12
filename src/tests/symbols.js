import { strict as assert } from 'assert';
import { test } from '../run.js';

test('symbols', async (context) => {
  const db = context.common.db;
  const detailed = await db.query(c => {
    const {
      locations: l,
      events: e
    } = c;
    const join = {
      [e.locationId]: l.id
    };
    return {
      select: {
        ...e,
        location: l.name
      },
      join,
      limit: 3
    }
  });
  assert.equal(detailed.at(0).location, 'McNichols Sports Arena');
  const names = await db.query(c => {
    const {
      fighters: f,
      otherNames: n,
      jsonGroupArray,
      jsonArrayLength,
      gt
    } = c;
    const otherNames = jsonGroupArray({
      select: n.name,
      where: {
        [n.name]: c.not(null)
      }
    });
    return {
      select: {
        id: f.id,
        name: f.name,
        otherNames
      },
      where: {
        [f.id]: 104
      },
      join: {
        [f.id]: { left: n.fighterId }
      },
      groupBy: f.id,
      having: {
        [jsonArrayLength(otherNames)]: gt(1)
      }
    };
  });
  assert.equal(names.at(0).otherNames.length, 2);
  const locations = await db.query(c => {
    const {
      locations: l,
      events: e,
      jsonGroupArray
    } = c;
    const join = {
      [l.id]: e.locationId
    };
    return {
      select: {
        id: l.id,
        name: l.name,
        events: jsonGroupArray({
          id: e.id,
          name: e.name
        })
      },
      join,
      where: {
        [l.id]: 10
      },
      groupBy: l.id
    }
  });
  assert.equal(locations.at(0).id, 10);
  const eventTimes = await db.query(c => {
    const { 
      locationId, 
      startTime
    } = c.events;
    return {
      select: {
        locationId,
        startTime: c.max(startTime)
      },
      groupBy: locationId,
      limit: 1
    }
  });
  assert.equal(eventTimes.at(0).startTime instanceof Date, true);
  const ranks = await db.query(c => {
    const { 
      id, 
      name, 
      heightCm 
    } = c.fighters;
    return {
      select: {
        id,
        name,
        heightCm,
        heightRank: c.rowNumber({
          orderBy: heightCm,
          desc: true
        })
      },
      limit: 10
    }
  });
  assert.equal(ranks.at(0).heightCm, 213);
  const max = await db.query(c => {
    const { id, name, startTime } = c.events;
    const now = new Date();
    const max = c.max(c.timeDiff(startTime, now));
    return {
      select: {
        id,
        name,
        max
      }
    }
  });
  assert.equal(max.at(0).id, 1);
  const fighters = await db.query(c => {
    const {
      id,
      name,
      heightCm,
      reachCm,
    } = c.fighters;
    return {
      select: {
        id,
        name,
        stats: c.jsonObject({
          heightCm,
          reachCm
        })
      },
      limit: 1
    }
  });
  assert.equal(fighters.at(0).stats.heightCm, 170);
  const fights = await db.query(c => {
    const { 
      fights: f,
      fighters: r,
      fighters: b
    } = c;
    return {
      select: {
        id: f.id,
        blue: b.name,
        red: r.name
      },
      join: {
        [f.blueId]: b.id,
        [f.redId]: r.id
      },
      limit: 1
    }
  });
  const fight = fights.at(0);
  assert.equal(fight.blue, 'Royce Gracie');
  assert.equal(fight.red, 'Gerard Gordeau');
  const born = db.subquery(c => {
    const { id, born } = c.fighters;
    return {
      select: {
        id,
        birthday: born
      }
    }
  });
  const optional = await db.query(context => {
    const {
      fighters: f,
      fighterCoaches: fc,
      coaches: c
    } = context;
    const b = context.use(born);
    return {
      select: {
        id: f.id,
        name: f.name,
        birthday: b.birthday
      },
      optional: {
        coach: c.name
      },
      join: {
        [f.id]: b.id,
        [f.id]: { left: fc.fighterId },
        [c.id]: { left: fc.coachId }
      },
      limit: 5
    }
  });
  assert.equal(optional.at(0).coach, null);
  const types = await db.query(c => {
    const {
      events: e
    } = c;
    const start = new Date();
    const end = new Date();
    const notNull = c.not(e.startTime, null);
    return {
      select: {
        date: c.if(notNull, start, end)
      },
      limit: 10
    }
  });
  assert.equal(types.at(0).date instanceof Date, true);
  const compare = await db.query(c => {
    const { id } = c.fighters;
    return {
      select: {
        notEqual: c.not(id, 3)
      },
      where: {
        [id]: 10
      }
    }
  });
  assert.equal(compare.at(0).notEqual, true);
  const eventCards = db.subquery(context => {
    const {
      events: e,
      cards: c,
      jsonGroupArray
    } = context;
    const { eventId, ...card } = c;
    return {
      select: {
        eventId: e.id,
        cards: jsonGroupArray({ ...card })
      },
      join: {
        [e.id]: c.eventId
      },
      groupBy: e.id
    }
  });
  const locationEvents = await db.query(context => {
    const { 
      locations: l,
      events: e,
      jsonGroupArray
    } = context;
    const { locationId, ...event } = e;
    const c = context.use(eventCards);
    return {
      select: {
        ...l,
        events: jsonGroupArray({
          ...event,
          cards: c.cards
        })
      },
      join: {
        [l.id]: e.locationId,
        [e.id]: c.eventId
      },
      groupBy: l.id,
      limit: 1
    }
  });
  const event = locationEvents.at(0).events.at(0);
  const cardId = event.cards.at(0).id;
  assert.equal(cardId, 1);
});
