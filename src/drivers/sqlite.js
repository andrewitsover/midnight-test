import { SQLiteDatabase } from 'flyweightjs';
import { join } from 'path';
import sqlite3 from 'better-sqlite3';
import getPaths from './paths.js';
import fileSystem from './adaptor.js';
import middle from './middle.js';

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
  await middle(db);
  return {
    db,
    database,
    paths
  }
}

export default makeContext;
