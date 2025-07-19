import { database } from './drivers/sqlite.js';

const tests = [];
const clean = new Map();
let last;

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

const makeRun = (group) => {
  const { name, tests } = group;
  const cleanUp = clean.get(name);
  return async () => {
    try {
      await tests({ rewrite });
    }
    catch (e) {
      if (cleanUp) {
        await cleanUp();
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
    await database.close();
    process.exit();
  }
  catch (e) {
    await database.close();
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
