import sqliteContext from './drivers/sqlite.js';
import tursoContext from './drivers/turso.js';

const tests = [];
const clean = new Map();
let last;

const dbType = process.argv[2];
const rewrite = process.argv[3] === 'true';
const testName = process.argv[4];

const addTests = (name, testGroup) => {
  if (testName && name !== testName) {
    return;
  }
  if (name === 'close') {
    last = { name, tests: testGroup };
  }
  else {
    tests.push({ name, tests: testGroup });
  }
};
const addCleanUp = (name, cleanUp) => clean.set(name, cleanUp);

let context;
if (dbType === 'sqlite') {
  const driver = await sqliteContext();
  const sqlite = {
    ...driver,
    rewrite
  };
  context = {
    common: sqlite,
    sqlite
  };
}
else if (dbType === 'turso') {
  const driver = await tursoContext();
  const turso = {
    ...driver,
    rewrite
  };
  context = {
    common: turso,
    turso
  };
}
if (!context) {
  throw Error('No database supplied');
}

const makeRun = (group) => {
  const { name, tests } = group;
  const cleanUp = clean.get(name);
  return async () => {
    try {
      await tests(context);
    }
    catch (e) {
      if (cleanUp) {
        await cleanUp(context);
      }
      console.log(`The ${name} test failed`);
      throw e;
    }
  }
}

const run = async () => {
  try {
    for (const group of tests) {
      const run = makeRun(group);
      await run();
    }
    if (last) {
      const run = makeRun(last);
      await run();
    }
    if (testName) {
      console.log(`${testName} passed`);
    }
    else {
      console.log('All tests passed');
    }
    if (context.sqlite) {
      const database = context.sqlite.database;
      await database.close();
    }
    process.exit();
  }
  catch (e) {
    if (context.sqlite) {
      const database = context.sqlite.database;
      await database.close();
    }
    throw e;
  }
}

const test = addTests;
const cleanUp = addCleanUp;

export {
  test,
  cleanUp,
  run
}
