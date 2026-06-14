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
  database.getClient(schema);
  return {
    database,
    schema: database.schema
  }
}
const diff = (previous, current) => {
  const previousDb = new Database();
  previousDb.getClient(previous);
  const saved = previousDb.getSchema();
  const db = new Database();
  db.getClient(current);
  return db.diff(saved);
}

export {
  setup,
  from,
  diff
}
