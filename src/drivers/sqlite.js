import { SQLiteDatabase } from 'flyweightjs';
import { join } from 'path';
import sqlite3 from 'better-sqlite3';
import * as tables from './tables.js';

const path = (subPath) => join(import.meta.dirname, `../${subPath}`);

const database = new SQLiteDatabase({
  driver: sqlite3,
  db: path('../databases/test.db')
});
const db = database.getClient(tables);

export {
  db,
  database
}
