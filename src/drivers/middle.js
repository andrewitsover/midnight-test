/**
 * @param {import('./sqlite.d.ts').TypedDb} db
 */
const middle = async (db) => {
  db.fighters.compute({
    displayName: (c, f) => f.concat(c.name, ' (', c.nickname, ')'),
    instagram: c => c.social.instagram,
    heightInches: (c, f) => f.round(f.divide(c.heightCm, 2.54))
  });
  await db.subquery(context => {
    const {
      locations: l,
      events: e
    } = context.tables;
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
  await db.subquery(context => {
    const { tables, compare: is, compute } = context;
    const {
      fighters: f,
      otherNames: n
    } = tables;
    const otherNames = compute.jsonGroupArray(n.name);
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
        [compute.jsonArrayLength(otherNames)]: is.gt(1)
      },
      as: 'fighterNames'
    };
  });
  await db.subquery(context => {
    const { tables, compute } = context;
    const {
      locations: l,
      events: e
    } = tables;
    const select = {
      id: l.id,
      name: l.name,
      events: compute.jsonGroupArray({
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
  await db.subquery(context => {
    const { tables, aggregate: agg } = context;
    const { 
      locationId, 
      startTime 
    } = tables.events;
    return {
      select: {
        locationId,
        startTime: agg.max(startTime)
      },
      groupBy: locationId,
      as: 'eventTimes'
    }
  });
  await db.subquery(context => {
    const { id, name, heightCm } = context.tables.fighters;
    const { rowNumber } = context.window;
    return {
      select: {
        id,
        name,
        heightCm,
        heightRank: rowNumber({
          orderBy: heightCm,
          desc: true
        })
      },
      as: 'heightRanks'
    }
  });
}

export default middle;
