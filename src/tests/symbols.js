import { strict as assert } from 'assert';
import { test } from '../run.js';

test('symbols', async (context) => {
  const db = context.common.db;
  const detailed = await db.query(c => {
    const {
      locations: l,
      events: e
    } = c;
    const join = [e.locationId, l.id];
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
    const { id, name } = c.fighters;
    const n = c.otherNames;
    const otherNames = c.group({
      select: n.name,
      where: {
        [n.name]: c.not(null)
      }
    });
    const join = [id, n.fighterId];
    return {
      select: {
        id,
        name,
        otherNames
      },
      where: {
        [id]: 104
      },
      join,
      groupBy: id,
      having: {
        [c.arrayLength(otherNames)]: c.gt(1)
      }
    };
  });
  assert.equal(names.at(0).otherNames.length, 2);
  const locations = await db.query(c => {
    const { id, name } = c.locations;
    const e = c.events;
    const join = [id, e.locationId];
    return {
      select: {
        id,
        name,
        events: c.group({
          id: e.id,
          name: e.name
        })
      },
      join,
      where: {
        [id]: 10
      },
      groupBy: id
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
        stats: c.object({
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
    const join = [
      [f.blueId, b.id],
      [f.redId, r.id]
    ];
    return {
      select: {
        id: f.id,
        blue: b.name,
        red: r.name
      },
      join,
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
      fighterCoaches: fc,
      coaches: c
    } = context;
    const b = context.use(born);
    const { id, name } = context.fighters;
    const join = [
      [id, b.id],
      [id, fc.fighterId, 'left'],
      [c.id, fc.coachId, 'left']
    ];
    return {
      select: {
        id,
        name,
        birthday: b.birthday
      },
      optional: {
        coach: c.name
      },
      join,
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
  const eventCards = db.subquery(c => {
    const {
      events: e,
      cards
    } = c;
    const join = [e.id, cards.eventId];
    return {
      select: {
        eventId: e.id,
        cards: c.group(cards)
      },
      join,
      groupBy: e.id
    }
  });
  const locationEvents = await db.query(c => {
    const { 
      locations: l,
      events: e
    } = c;
    const { cards, eventId } = c.use(eventCards);
    const join = [
      [l.id, e.locationId],
      [e.id, eventId]
    ];
    return {
      select: {
        ...l,
        events: c.group({
          ...e,
          cards
        })
      },
      join,
      groupBy: l.id,
      limit: 1
    }
  });
  const event = locationEvents.at(0).events.at(0);
  const cardId = event.cards.at(0).id;
  assert.equal(cardId, 1);
  const where = await db.query(c => {
    const { events: e } = c;
    return {
      select: {
        ...e
      },
      where: {
        [e.id]: [1, 2, 3]
      }
    }
  });
  assert.equal(where.length, 3);
  const tx = await db.getTransaction();
  try {
    await tx.begin();
    await tx.query(c => {
      const { events: e } = c;
      return {
        select: {
          ...e
        },
        where: {
          [e.id]: 1
        }
      }
    });
    await tx.commit();
  }
  catch (e) {
    await tx.rollback();
    throw e;
  }
  const promise = db.query(c => {
    const { events: e } = c;
    return {
      select: {
        ...e
      },
      where: {
        id: 3
      }
    }
  });
  assert.rejects(promise);
  const distinct = await db.query(c => {
    const f = c.fighters;
    return {
      distinct: {
        height: f.heightCm
      }
    }
  });
  const unique = new Set(distinct.map(d => d.height));
  assert.equal(unique.size, distinct.length);
  const values = await db.query(c => {
    const { id } = c.events;
    return {
      select: id,
      limit: 5
    }
  });
  const numbers = values
    .map(v => typeof v)
    .every(v => v === 'number');
  assert.equal(numbers, true);
  const parsed = await db.query(c => {
    const { fighters: f } = c;
    return {
      select: {
        height: f.heightCm,
        fighters: c.group({
          id: f.id,
          isActive: f.isActive
        })
      },
      groupBy: f.heightCm,
      limit: 3
    }
  });
  const isActive = parsed.at(0).fighters.at(0).isActive;
  assert.equal(typeof isActive, 'boolean');
});
