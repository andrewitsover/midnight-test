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
const from = (schema) => {
  const database = new SQLiteDatabase();
  database.getClient(schema);
  return {
    database,
    schema: database.schema
  }
}
const diff = (previous, current) => {
  const previousDb = new SQLiteDatabase();
  previousDb.getClient(previous);
  const saved = previousDb.getSchema();
  const db = new SQLiteDatabase();
  db.getClient(current);
  return db.diff(saved);
}

export {
  db,
  database,
  from,
  diff
}
