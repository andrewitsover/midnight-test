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
      as: 'detailedEvents'
    }
  });
  await db.subquery(c => {
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
        [jsonArrayLength(otherNames)]: gt(1)
      },
      as: 'fighterNames'
    };
  });
  await db.subquery(c => {
    const {
      locations: l,
      events: e,
      jsonGroupArray
    } = c;
    const select = {
      id: l.id,
      name: l.name,
      events: jsonGroupArray({
        select: {
          id: e.id,
          name: e.name
        }
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
    } = c.events;
    return {
      select: {
        locationId,
        startTime: c.max(startTime)
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
      as: 'heightRanks'
    }
  });
}

export default middle;
