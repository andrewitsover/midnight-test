import { join } from 'path';

const path = (subPath) => join(import.meta.dirname, `../${subPath}`);

const getPaths = (types) => {
  return {
    sql: path('sql'),
    tables: path('sql/tables.sql'),
    views: path('views'),
    types: path(types),
    json: path('drivers/types.json'),
    migrations: path('migrations')
  }
}

export default getPaths;
