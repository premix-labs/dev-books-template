import { cp, mkdtemp, readFile, writeFile, realpath } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { execFileSync } from 'node:child_process';
import { chromium, expect } from '@playwright/test';

const source = fileURLToPath(new URL('..',import.meta.url));
// Windows TMP may use an 8.3 alias; Vite's filesystem allow-list needs the real path.
const directory = await realpath(await mkdtemp(path.join(tmpdir(),'dev-books-dev-')));
const npm = process.env.npm_execpath;
if (!npm) throw new Error('Run this check with npm run test:dev.');
const env = { ...process.env, GITHUB_REPOSITORY:'', SITE_URL:'https://books.example.test', BASE_PATH:'/' };
const run = args => execFileSync(process.execPath,[npm,...args],{ cwd:directory,env,stdio:'inherit' });
const excluded = new Set(['node_modules','.git','.astro','dist','test-results','playwright-report']);
await cp(source,directory,{recursive:true,filter(file) {
  return !path.relative(source,file).split(path.sep).some(segment => excluded.has(segment) || segment.startsWith('.env'));
}});
console.log(`Dev regression fixture: ${directory}`);
run(['ci']);
const configPath = path.join(directory,'astro.config.mjs');
let config = await readFile(configPath,'utf8');
// Keep this test independent of whichever size the author chooses for their book.
config = config.replace(/codeFontSize: '[^']*'/,"codeFontSize: '1rem'");
await writeFile(configPath,config);
const url = 'http://127.0.0.1:4336';
const browser = await chromium.launch();
const context = await browser.newContext({permissions:['clipboard-read','clipboard-write']});
const page = await context.newPage();
const failures = [];
page.on('pageerror', error => failures.push(error.message));
let chapterUrl;
async function verify(label,size) {
  let lastFailure;
  await expect(async () => {
    try {
      // A request caught by Vite's restart can remain pending. Bound each attempt
      // so the assertion can retry against the restarted server, not hang once.
      await page.goto(chapterUrl,{timeout:5000});
      await expect(page.locator('h1')).not.toBeEmpty();
      const frame = page.locator('.expressive-code .frame').first();
      await expect(frame.locator('pre')).not.toHaveCSS('background-color','rgba(0, 0, 0, 0)');
      await expect(frame.locator('.code span').first()).toHaveCSS('font-size',size);
    } catch (error) {
      lastFailure = error;
      throw error;
    }
  }).toPass({timeout:30000,intervals:[1000,2000]}).catch(error => {
    console.error(`Failed dev lifecycle stage: ${label}`,lastFailure);
    throw error;
  });
  await expect(page.locator('astro-error-overlay, vite-error-overlay')).toHaveCount(0);
  for (const asset of await page.locator('.expressive-code link[href], .expressive-code script[src]').evaluateAll(nodes => nodes.map(node => node.getAttribute('href') || node.getAttribute('src')))) {
    const response = await context.request.get(new URL(asset,url).href);
    expect(response.ok(),`${label}: ${asset} must load`).toBe(true);
  }
  const frame = page.locator('.expressive-code .frame').first();
  await frame.locator('.copy button').click();
  await expect(frame.locator('.feedback')).toBeVisible();
  const expected = (await frame.locator('.ec-line .code').allTextContents()).map(line => line === '\n' ? '' : line).join('\n');
  expect((await page.evaluate(() => navigator.clipboard.readText())).replace(/\r\n/g,'\n')).toBe(expected);
  expect(failures).toEqual([]);
  console.log(`PASS: ${label}`);
}
try {
  run(['run','dev','--','--host','127.0.0.1','--port','4336','--background']);
  await expect(async () => {
    await page.goto(url);
    await expect(page.locator('#books ol a').first()).toBeVisible();
    const links = await page.locator('#books ol a').evaluateAll(nodes => nodes.map(node => node.href));
    chapterUrl = links[Math.min(1,links.length-1)];
    expect(chapterUrl,'The dev fixture needs at least one chapter').toBeTruthy();
  }).toPass({timeout:30000});
  await verify('cold dev start','16px');
  await writeFile(configPath,config.replace("codeFontSize: '1rem'", "codeFontSize: '1.0625rem'"));
  await verify('config hot reload without editing Markdown','17px');
  run(['run','astro','--','dev','stop']);
  run(['run','dev','--','--host','127.0.0.1','--port','4336','--background']);
  await verify('warm dev restart','17px');
  run(['run','build']);
  await verify('dev still works after a production build','17px');
} finally {
  await browser.close();
  run(['run','astro','--','dev','stop']);
}
console.log(`Dev lifecycle checks passed. Fixture retained: ${directory}`);
