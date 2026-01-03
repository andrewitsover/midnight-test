import { TursoDatabase } from '@andrewitsover/midnight';
import { createClient } from '@libsql/client';
import { join } from 'path';
import * as tables from './tables.js';

const path = (subPath) => join(import.meta.dirname, `../${subPath}`);

const client = createClient({
  url: `file:${path('../databases/test.db')}`
});
const database = new TursoDatabase({
  db: client
});
const db = database.getClient(tables);

export {
  db,
  database
}
