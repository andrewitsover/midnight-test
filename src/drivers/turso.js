import { TursoDatabase } from 'flyweightjs';
import { createClient } from '@libsql/client';
import { join } from 'path';
import getPaths from './paths.js';
import adaptor from './adaptor.js';

const path = (subPath) => join(import.meta.dirname, `../${subPath}`);

const paths = getPaths('drivers/turso.d.ts');

const makeContext = async () => {
  const client = createClient({
    url: `file:${path('../databases/test.db')}`
  });
  const database = new TursoDatabase({
    db: client,
    adaptor,
    paths
  });
  const db = database.getClient();
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
        [f.isActive]: true
      },
      as: 'detailedFighters'
    }
  });
  return {
    db,
    database,
    paths
  }
}

export default makeContext;
