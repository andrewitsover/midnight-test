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
  await db.view(tables => {
    const {
      fighters: f,
      fighterCoaches: fc,
      coaches: c
    } = tables;

    const join = [
      [f.id, fc.fighterId],
      [c.id, fc.coachId]
    ];
    
    return {
      select: {
        ...f,
        coach: c.name
      },
      join,
      where: {
        [f.isActive]: true,
        [c.id]: 1
      },
      as: 'detailedFighters'
    }
  });
}

export default middle;
