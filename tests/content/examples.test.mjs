// These tests belong to the demonstration book, not the reusable UI.
// Replace them with tests for your own examples when starting another book.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFile, mkdtemp, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { createRequire } from 'node:module';
const require = createRequire(import.meta.url);
for (const [file, expected] of [
  ['chapter.md', 'สวัสดี, Developer!'],
  ['project.md', 'สวัสดี, Developer!\nสวัสดี, Developer!\nกรุณาระบุชื่อ'],
]) {
  test(`compile and execute the exact final example in ${file}`, async () => {
    const markdown = await readFile(new URL(`../../src/content/docs/example/${file}`, import.meta.url), 'utf8');
    const code = markdown.match(/```ts title="index.ts — ไฟล์ที่พร้อมรัน"\n([\s\S]*?)\n```/)?.[1];
    assert.ok(code, 'The tested final code block must exist.');
    const directory = await mkdtemp(path.join(tmpdir(),'book-code-'));
    await writeFile(path.join(directory,'package.json'), JSON.stringify({ type:'commonjs' }));
    await writeFile(path.join(directory,'index.ts'), code);
    execFileSync(process.execPath, [require.resolve('typescript/bin/tsc'),'index.ts','--target','ES2022','--module','NodeNext','--outDir','dist','--strict'], { cwd:directory, encoding:'utf8' });
    const actual = execFileSync(process.execPath, ['dist/index.js'], { cwd:directory, encoding:'utf8' }).trim().replaceAll('\r\n','\n');
    assert.equal(actual,expected);
    assert.ok(markdown.includes(expected));
  });
}
