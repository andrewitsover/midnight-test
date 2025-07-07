import { makeTypes } from 'flyweight-client';
import { compareTypes } from '../utils.js';
import { writeFile, rm } from 'fs/promises';
import { join } from 'path';
import { test } from '../run.js';

test('types', async (context) => {
  const { database, paths, rewrite } = context.common;
  await makeTypes({
    db: database,
    paths,
    sample: true,
    testMode: true
  });
  compareTypes(paths.types, rewrite);
  const path = join(paths.sql, 'fights', 'error.sql');
  await writeFile(path, 'select id rom something');
  let error = false;
  try {
    await makeTypes({
      db: database,
      paths,
      testMode: true
    });
  }
  catch (e) {
    error = e.message.includes('near "something": syntax error');
  }
  finally {
    await rm(path);
  }
  if (!error) {
    throw Error('No error message');
  }
});
