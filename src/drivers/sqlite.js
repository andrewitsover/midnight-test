import { Database } from '@andrewitsover/midnight';
import { join } from 'path';
import * as tables from './tables.js';

const path = join(import.meta.dirname, `../../databases/test.db`);
const setup = () => {
  const database = new Database(path);
  const db = database.getClient(tables);
  return db;
}

const from = (schema) => {
  const database = new Database();
  const db = database.getClient(schema);
  return {
    database: db,
    schema: database.schema
  }
}
const diff = (previous, current) => {
  const previousDb = new Database();
  previousDb.getClient(previous);
  const saved = previousDb.getSchema();
  const database = new Database();
  const db = database.getClient(current);
  const result = db.diff(saved);
  return result.sql;
}

export {
  setup,
  from,
  diff
}
