import { strict as assert } from 'assert';
import { readFileSync, writeFileSync } from 'fs';
import { join, basename } from 'path';

const compare = (actual, result, rewrite) => {
  const path = join('results', `${result}.json`);
  const url = new URL(path, import.meta.url);
  const actualString = JSON.stringify(actual);
  let expected;
  try {
    expected = readFileSync(url, 'utf8');
  }
  catch {
    console.log(`Writing ${result}.json`);
    writeFileSync(url, actualString, 'utf8');
    return;
  }
  try {
    assert.equal(actualString, expected, result);
  }
  catch (e) {
    if (rewrite) {
      writeFileSync(url, actualString, 'utf8');
    }
    else {
      throw Error('Results do not match');
    }
  }
}

const compareTypes = (typesPath, rewrite) => {
  const filename = basename(typesPath);
  const path = join('results', filename);
  const actual = readFileSync(typesPath, 'utf8');
  let expected;
  try {
    expected = readFileSync(new URL(path, import.meta.url), 'utf8');
  }
  catch {
    expected = actual;
    writeFileSync(new URL(path, import.meta.url), actual, 'utf8');
  }
  try {
    assert.equal(actual, expected);
  }
  catch (e) {
    if (rewrite) {
      console.log(`Writing ${filename}`);
      writeFileSync(new URL(path, import.meta.url), actual, 'utf8');
    }
    else {
      throw Error('Type definitions do not match');
    }
  }
}

export {
  compare,
  compareTypes
}
