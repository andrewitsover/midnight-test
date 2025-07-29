import { SQLiteDatabase } from 'flyweightjs';
import { join } from 'path';
import * as tables from './tables.js';

const path = join(import.meta.dirname, `../../databases/test.db`);
const database = new SQLiteDatabase(path);
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
