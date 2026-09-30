import { test } from 'node:test';
import assert from 'node:assert/strict';
import { defineBook, orderChapters } from '../../src/lib/book-config.mjs';
import { deployment } from '../../src/lib/deployment.mjs';
import { makeCodeFocusable, focusableTables } from '../../src/lib/code-accessibility.mjs';
import { book } from '../../book.config.mjs';

test('book config is valid without mutating identity', () => assert.equal(defineBook(structuredClone(book)).title, book.title));
for (const [field, value] of [['id','../bad'], ['title',''], ['headline',[]], ['author',' '], ['showAuthorGuide','false'], ['parts',[]]]) {
  test(`invalid ${field} is rejected`, () => assert.throws(() => defineBook({ ...book, [field]: value })));
}
for (const directories of [['a','a'], ['a','a/b'], ['about'], ['../a']]) {
  test(`reject unsafe/overlapping parts: ${directories}`, () => assert.throws(() => defineBook({ ...book, parts: directories.map(directory => ({ label: 'Part', directory })) })));
}
const parts = [{ directory: 'start' }, { directory: 'finish' }];
test('chapter ordering is numeric and does not mutate source', () => {
  const chapters = [{ id: 'finish/end', order: 30 }, { id: 'start', order: 1 }];
  assert.deepEqual(orderChapters(chapters, parts).map(c => c.order), [1,30]);
  assert.equal(chapters[0].order, 30);
});
for (const chapters of [[], [{ id:'start' }], [{ id:'other',order:1 }], [{ id:'start',order:0 }], [{ id:'start',order:1 },{ id:'start/a',order:1 }], [{ id:'finish',order:1 },{ id:'start',order:2 }]]) {
  test(`reject invalid chapter list ${JSON.stringify(chapters)}`, () => assert.throws(() => orderChapters(chapters, parts)));
}
test('deployment defaults to local root', () => assert.deepEqual(deployment({}), { site:'http://localhost:4321',base:'/' }));
test('GitHub project and user sites', () => {
  assert.equal(deployment({ GITHUB_REPOSITORY:'Owner/book' }).base, '/book');
  assert.equal(deployment({ GITHUB_REPOSITORY:'Owner/owner.github.io' }).base, '/');
});
test('custom domain and base override GitHub inference', () => {
  assert.deepEqual(deployment({ GITHUB_REPOSITORY:'owner/book', SITE_URL:'https://books.example.com', BASE_PATH:'/' }), { site:'https://books.example.com',base:'/' });
  assert.equal(deployment({ BASE_PATH:'/books/demo/' }).base, '/books/demo');
});
for (const base of ['relative','//evil.test','/../bad','/a?b','/a#b','/%2f','/a b','/a\\b']) {
  test(`reject unsafe base ${base}`, () => assert.throws(() => deployment({ BASE_PATH:base })));
}
for (const site of ['javascript:alert(1)','https://user:pass@example.com','https://example.com/path','https://example.com?q=1']) {
  test(`reject unsafe site ${site}`, () => assert.throws(() => deployment({ SITE_URL:site })));
}
test('code remains keyboard reachable in static HTML', () => {
  const pre = { type:'element', tagName:'pre', properties:{} };
  makeCodeFocusable({ children:[pre] });
  assert.equal(pre.properties.tabIndex, 0);
  assert.equal(pre.properties.role, 'region');
});
test('table has keyboard focus and accessible name', () => {
  const table = { properties:{} };
  focusableTables.element.visit(table, { setProperty(node,key,value) { node.properties[key] = value; } });
  assert.equal(table.properties.tabIndex, 0);
  assert.ok(table.properties.ariaLabel);
});
