import { readdir, readFile } from 'node:fs/promises';
import path from 'node:path';
import { gzipSync } from 'node:zlib';
import assert from 'node:assert/strict';

// Track the template's UI payload separately from each book's search index/content.
const budgets = { '.js':120*1024, '.css':50*1024, '.woff2':150*1024 };
const totals = Object.fromEntries(Object.keys(budgets).map(extension => [extension,0]));
const directory = new URL('../dist/_astro/',import.meta.url);
for (const file of await readdir(directory,{recursive:true})) {
  const extension = path.extname(file);
  if (!(extension in totals)) continue;
  const contents = await readFile(new URL(file.replaceAll(path.sep,'/'),directory));
  totals[extension] += extension === '.woff2' ? contents.length : gzipSync(contents).length;
}
for (const [extension,limit] of Object.entries(budgets)) {
  console.log(`${extension}: ${(totals[extension]/1024).toFixed(1)} KiB / ${limit/1024} KiB${extension === '.woff2' ? '' : ' (gzip)'}`);
  assert.ok(totals[extension]>0,`No ${extension} assets found. Build first.`);
  assert.ok(totals[extension]<=limit,`${extension} UI payload exceeds its documented budget.`);
}
