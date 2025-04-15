import { TursoDatabase } from 'flyweightjs';
import { createClient } from '@libsql/client';
import files from './files.js';
import { join } from 'path';
import { makeFiles } from 'flyweight-client';

const path = (subPath) => join(import.meta.dirname, `../${subPath}`);

const makeContext = async () => {
  const paths = {
    sql: path('sql'),
    tables: path('sql/tables.sql'),
    views: path('views'),
    types: path('drivers/turso.d.ts'),
    json: path('drivers/types.json'),
    migrations: path('migrations'),
    files: path('drivers/files.js')
  };
  await makeFiles(paths);
  const client = createClient({
    url: `file:${path('../databases/test.db')}`
  });
  const database = new TursoDatabase({
    db: client,
    files
  });
  const db = database.getClient();
  db.locations.define((t, c) => t.events.where({
    locationId: c.id
  }));
  return {
    db,
    database,
    paths
  }
}

export default makeContext;
