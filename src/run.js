const tests = [];

const testName = process.argv[3];

const addTest = (name, test) => {
  if (testName && name !== testName) {
    return;
  }
  tests.push({ name, test });
};

const run = async () => {
  if (testName && tests.length === 0) {
    throw Error(`there is no test named "${testName}"`);
  }
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

const test = addTest;

export {
  test,
  run
}
