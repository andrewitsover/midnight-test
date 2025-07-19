import { SQLiteDatabase } from 'flyweightjs';
import { join } from 'path';
import sqlite3 from 'better-sqlite3';
import getPaths from './paths.js';
import fileSystem from './adaptor.js';
import middle from './middle.js';
import * as tables from './tables.js';

const path = (subPath) => join(import.meta.dirname, `../${subPath}`);

const adaptor = { sqlite3, ...fileSystem };
const common = getPaths('drivers/sqlite.d.ts');
const paths = {
  ...common,
  db: path('../databases/test.db')
};

const database = new SQLiteDatabase({
  adaptor,
  paths
});
const db = database.getClient(tables);
await middle(db);

export {
  db,
  database
}
