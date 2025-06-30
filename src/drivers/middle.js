/**
 * @param {import('./sqlite.d.ts').TypedDb} db
 */
const middle = async (db) => {
  db.fighters.compute({
    displayName: (c, f) => f.concat(c.name, ' (', c.nickname, ')'),
    instagram: c => c.social.instagram,
    heightInches: (c, f) => f.round(f.divide(c.heightCm, 2.54))
  });
  await db.subquery(tables => {
    const {
      locations: l,
      events: e
    } = tables;
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
  await db.subquery((tables, is, compute) => {
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
  await db.subquery((tables, is, compute) => {
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
}

export default middle;
