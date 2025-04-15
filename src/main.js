import { run } from './run.js';
import { join } from 'path';
import { readdir } from 'fs/promises';

const path = (subPath) => {
  const url = new URL(subPath, import.meta.url);
  return url.pathname;
}

const folder = path('tests');
const files = await readdir(folder);

await Promise.all(files.map(name => {
  const path = join(folder, name);
  const url = new URL(`file://${path}`);
  return import(url.href);
}));

await run();
