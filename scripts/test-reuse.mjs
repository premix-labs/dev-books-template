import { cp, mkdir, mkdtemp, readFile, writeFile, access } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import assert from 'node:assert/strict';
import { fileURLToPath } from 'node:url';
const source = path.resolve(fileURLToPath(new URL('..',import.meta.url)));
const workspace = await mkdtemp(path.join(tmpdir(),'dev-books-reuse-'));
const npm = process.env.npm_execpath;
if (!npm) throw new Error('Run this check with npm run test:reuse.');
const run = (directory,args,env) => execFileSync(process.execPath,[npm,...args],{ cwd:directory,env,stdio:'inherit' });
const excluded = new Set(['node_modules','.git','.astro','dist','test-results','playwright-report']);
for (const fixture of [
  { id:'csharp-book', title:'C# Fundamentals', fileName:'Program.cs', language:'csharp', code:'Console.WriteLine("Hello, Developer!");', count:1, base:'/' },
  { id:'python-book', title:'Python Fundamentals สำหรับ Developer ที่ต้องการเข้าใจพื้นฐานก่อนใช้งานจริง', fileName:'main.py', language:'python', code:'def greet(name: str) -> str:\n    return f"Hello, {name}!"\n\nprint(greet("Developer"))', count:30, base:'/python-book' },
]) {
  const directory = path.join(workspace,fixture.id);
  console.log(`\nREUSE: ${fixture.title} — ${fixture.count} chapters, ${fixture.base}\n${directory}`);
  await cp(source,directory,{ recursive:true,filter(file) {
    const relative = path.relative(source,file).replaceAll(path.sep,'/');
    return !relative.split('/').some(segment => excluded.has(segment) || segment.startsWith('.env'))
      && !relative.startsWith('src/content/docs') && !relative.startsWith('tests/content');
  } });
  const parts = fixture.count === 1 ? [{ label:'เริ่มต้น',directory:'basics' }] : [
    { label:'เริ่มต้น',directory:'basics' },{ label:'พื้นฐานภาษา',directory:'language' },{ label:'ปิดงาน',directory:'finish' },
  ];
  const book = {
    id:fixture.id,title:fixture.title,headline:[fixture.title],description:'อ่านแนวคิด พิมพ์ทีละขั้น แล้วตรวจผลลัพธ์ด้วยตนเอง',
    author:'ผู้เขียนหนังสือทดสอบ',contentsLabel:'สารบัญ',showAuthorGuide:false,parts,
    cover:{ fileName:fixture.fileName,language:fixture.language,code:fixture.code },
  };
  await writeFile(path.join(directory,'book.config.mjs'),`import { defineBook } from './src/lib/book-config.mjs';\nexport const book=defineBook(${JSON.stringify(book,null,2)});\n`);
  const expected=[];
  for(let i=1;i<=fixture.count;i++) {
    const part=parts[Math.min(Math.floor((i-1)/10),parts.length-1)];
    const slug=`chapter-${String(i).padStart(2,'0')}`;
    const id=`${part.directory}/${slug}`;
    expected.push(`${fixture.base === '/' ? '' : fixture.base}/${id}/`);
    const folder=path.join(directory,'src/content/docs',part.directory);
    await mkdir(folder,{recursive:true});
    // MDX, wide code, tables, deep headings and long Thai titles exercise real authoring cases.
    await writeFile(path.join(folder,`${slug}.mdx`),`---
title: "บท ${i} — ${fixture.count === 1 ? 'เริ่มต้น' : 'ทำความเข้าใจพื้นฐานและตรวจสอบพฤติกรรมของโปรแกรมอย่างเป็นขั้นตอน'}"
description: "คำอธิบายบททดสอบสำหรับตรวจรูปแบบของหนังสือ"
sidebar:
  order: ${i}
---

import { Tabs, TabItem } from '@astrojs/starlight/components';

## แนวคิด

ข้อความทดสอบสำหรับตรวจการแสดงผลและการค้นหา ไม่ใช่เนื้อหาหลักสูตร

### ก่อนลงมือ

<Tabs>
<TabItem label="Windows">เปิด PowerShell</TabItem>
<TabItem label="macOS">เปิด Terminal</TabItem>
</Tabs>

## พิมพ์ทีละขั้น

\`\`\`${fixture.language} title="${fixture.fileName}"
${fixture.code}
// ${'long_code_line_'.repeat(18)}
\`\`\`

| ชื่อรายการ | การตรวจสอบ | ผลลัพธ์ | หมายเหตุ |
| --- | --- | --- | --- |
| ตัวอย่าง | อ่านแล้วพิมพ์ตาม | ทำงานตามที่อธิบาย | ข้อความประกอบตาราง |

## ตรวจผล

ข้อความตรวจผลและวิธีแก้เมื่อผลลัพธ์ไม่ตรง
`);
  }
  const draftPath=path.join(directory,'src/content/docs',parts[0].directory,'unpublished.md');
  await writeFile(draftPath,'---\ntitle: DraftOnlySentinel\ndraft: true\nsidebar:\n  order: 999\n---\nPrivateDraftSentinel\n');
  const env={ ...process.env,GITHUB_REPOSITORY:'',SITE_URL:'https://books.example.test',BASE_PATH:fixture.base };
  run(directory,['ci'],env);
  run(directory,['run','validate'],env);
  const manifest=JSON.parse(await readFile(path.join(directory,'dist/book-index.json'),'utf8'));
  assert.equal(manifest.title,fixture.title);
  assert.deepEqual(manifest.chapters.map(chapter=>chapter.href),expected);
  for(const missing of ['about/index.html',`${parts[0].directory}/unpublished/index.html`]) {
    await assert.rejects(access(path.join(directory,'dist',missing)),`Unexpected published file: ${missing}`);
  }
  const html=await readFile(path.join(directory,'dist/index.html'),'utf8');
  assert.ok(!html.includes('Dev Books Template'));
  assert.ok(!html.includes('DraftOnlySentinel'));
  // Core tests and components must remain unchanged when making a new book.
  for(const file of ['tests/e2e/book.spec.ts','src/components/HomeHero.astro','src/components/Header.astro']) {
    assert.equal(await readFile(path.join(directory,file),'utf8'),await readFile(path.join(source,file),'utf8'));
  }
  run(directory,['run','test:e2e','--','--project=chromium','--project=mobile','--project=webkit'],env);
}
console.log(`Reuse checks passed. Temporary fixtures retained for inspection: ${workspace}`);
