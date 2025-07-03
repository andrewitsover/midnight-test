/**
 * @param {import('./sqlite.d.ts').TypedDb} db
 */
const middle = async (db) => {
  db.fighters.compute({
    displayName: (c, f) => f.concat(c.name, ' (', c.nickname, ')'),
    instagram: c => c.social.instagram,
    heightInches: (c, f) => f.round(f.divide(c.heightCm, 2.54))
  });
  await db.subquery(c => {
    const {
      locations: l,
      events: e
    } = c.tables;
    const join = {
      [e.locationId]: l.id
    };
    return {
      select: {
        ...e,
        location: l.name
      },
      join,
      as: 'detailedEvents'
    }
  });
  await db.subquery(c => {
    const {
      fighters: f,
      otherNames: n
    } = c.tables;
    const otherNames = c.aggregate.jsonGroupArray(n.name);
    const select = {
      id: f.id,
      name: f.name,
      otherNames
    };
    return {
      select,
      leftJoin: {
        [f.id]: n.fighterId
      },
      groupBy: f.id,
      having: {
        [c.compute.jsonArrayLength(otherNames)]: c.compare.gt(1)
      },
      as: 'fighterNames'
    };
  });
  await db.subquery(c => {
    const {
      locations: l,
      events: e
    } = c.tables;
    const select = {
      id: l.id,
      name: l.name,
      events: c.compute.jsonGroupArray({
        id: e.id,
        name: e.name
      })
    };
    const join = {
      [l.id]: e.locationId
    };
    return {
      select,
      join,
      groupBy: l.id,
      as: 'locationEvents'
    }
  });
  await db.subquery(c => {
    const { 
      locationId, 
      startTime 
    } = c.tables.events;
    return {
      select: {
        locationId,
        startTime: c.aggregate.max(startTime)
      },
      groupBy: locationId,
      as: 'eventTimes'
    }
  });
  await db.subquery(c => {
    const { 
      id, 
      name, 
      heightCm 
    } = c.tables.fighters;
    return {
      select: {
        id,
        name,
        heightCm,
        heightRank: c.window.rowNumber({
          orderBy: heightCm,
          desc: true
        })
      },
      as: 'heightRanks'
    }
  });
}

export default middle;
