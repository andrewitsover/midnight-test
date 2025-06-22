import { SQLiteDatabase } from 'flyweightjs';
import { join } from 'path';
import sqlite3 from 'better-sqlite3';
import getPaths from './paths.js';
import fileSystem from './adaptor.js';

const path = (subPath) => join(import.meta.dirname, `../${subPath}`);

const adaptor = { sqlite3, ...fileSystem };
const common = getPaths('drivers/sqlite.d.ts');
const paths = {
  ...common,
  db: path('../databases/test.db')
};

const makeContext = async () => {
  const database = new SQLiteDatabase({
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
