/**
 * Adds two numbers.
 * @param {import('./sqlite').TypedDb} db
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
}

export default middle;
