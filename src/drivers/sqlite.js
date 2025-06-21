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
      weightClasses: w,
      fighterCoaches: fc,
      coaches: c
    } = tables;

    const select = {
      ...f,
      weightClass: w.name,
      coach: c.name
    };
    
    const join = [
      [f.weightClassId, w.id],
      [f.id, fc.figherId],
      [c.id, fc.coachId]
    ];
    return {
      select,
      join,
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
