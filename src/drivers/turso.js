import { TursoDatabase } from 'flyweightjs';
import { createClient } from '@libsql/client';
import { join } from 'path';
import getPaths from './paths.js';
import adaptor from './adaptor.js';
import middle from './middle.js';

const path = (subPath) => join(import.meta.dirname, `../${subPath}`);

const paths = getPaths('drivers/turso.d.ts');

const makeContext = async () => {
  const client = createClient({
    url: `file:${path('../databases/test.db')}`
  });
  const database = new TursoDatabase({
    db: client,
    adaptor,
    paths
  });
  await database.initialize();
  const db = database.getClient();
  await middle(db);
  return {
    db,
    database,
    paths
  }
}

export default makeContext;
