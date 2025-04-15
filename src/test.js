import json from './json.js';
import queries from './queries.js';
import sql from './sql.js';
import types from './types.js';
import transactions from './transactions.js';
import close from './close.js';
import { database } from './db.js';

let tests = [json, queries, sql, types, transactions, close];

const options = {
  dbType: process.argv[2],
  rewrite: process.argv[3] === 'true',
  testName: process.argv[4]
};

if (options.testName) {
  tests = tests.filter(t => t.name === options.testName);
}

for (const test of tests) {
  try {
    await test.run(options);
  }
  catch (e) {
    if (test.cleanUp) {
      await test.cleanUp(options);
    }
    await database.close();
    throw e;
  }
}
await database.close();
if (options.testName) {
  console.log(`${options.testName} passed`);
}
else {
  console.log('All tests passed');
}
process.exit();
