const tests = [];

const testName = process.argv[3];

const addTests = (name, test) => {
  if (testName && name !== testName) {
    return;
  }
  tests.push({ name, test });
};

if (testName && tests.length === 0) {
  throw Error(`there is no test named "${testName}"`);
}

const run = async () => {
  for (const item of tests) {
    const { name, test } = item;
    try {
      await test();
    }
    catch (e) {
      console.log(`The ${name} test failed`);
      throw e;
    }
  }
  if (testName) {
    console.log(`${testName} passed`);
  }
  else {
    console.log('All tests passed');
  }
}

const test = addTests;

export {
  test,
  run
}
