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
    files: path('drivers/files.js'),
    computed: path('drivers/computed.json')
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
  db.fighters.compute({
    displayName: (c, f) => f.concat(c.name, ' (', c.nickname, ')'),
    instagram: c => c.social.instagram
  });
  return {
    db,
    database,
    paths
  }
}

export default makeContext;
