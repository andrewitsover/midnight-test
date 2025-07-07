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
      leftJoin: {
        [f.id]: n.fighterId
      },
      groupBy: f.id,
      having: {
        [jsonArrayLength(otherNames)]: gt(1)
      }
    };
  });
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
          select: {
            id: e.id,
            name: e.name
          }
        })
      },
      join,
      groupBy: l.id
    }
  });
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
  const coalesce = await db.query(c => {
    const {
      id,
      name,
      heightCm,
      reachCm
    } = c.fighters;
    const stats = c.coalesce(name, '');
    return {
      select: {
        id,
        stats
      },
      limit: 1
    }
  });
});
