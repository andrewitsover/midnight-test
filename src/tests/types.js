import { makeTypes } from 'flyweight-client';
import { compareTypes } from '../utils.js';
import { writeFile, rm } from 'fs/promises';
import { join } from 'path';
import { createProgram, getPreEmitDiagnostics } from 'typescript';
import { test } from '../run.js';

test('types', async (context) => {
  const { db, database, paths, rewrite } = context.common;
  db.fighters.compute({
    displayName: (c, f) => f.concat(c.name, ' (', c.nickname, ')'),
    instagram: c => c.social.instagram
  });
  await makeTypes({
    db: database,
    paths,
    sample: true,
    testMode: true
  });
  const program = createProgram([paths.types], {
    noEmit: true,
    allowJs: false,
    skipLibCheck: true,
    strict: true
  });
  const diagnostics = getPreEmitDiagnostics(program);
  if (diagnostics.length > 0) {
    throw Error('Type declaration file has errors.');
  }
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
