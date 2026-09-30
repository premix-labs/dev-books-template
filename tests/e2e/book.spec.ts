import { test, expect, type Page } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import { readFileSync } from 'node:fs';
import { book } from '../../book.config.mjs';

type Chapter = { id:string; title:string; href:string };
const { chapters } = JSON.parse(readFileSync('dist/book-index.json','utf8')) as { chapters:Chapter[] };
const errors = new WeakMap<Page,string[]>();
async function ready(page:Page, url = './') {
  await page.goto(url);
  await expect(page.locator('main')).toBeVisible();
  // Wait for Pagefind's idle import before leaving the document (especially Firefox).
  await page.locator('.pagefind-ui__search-input').waitFor({ state:'attached' });
  await page.evaluate(() => document.fonts.ready);
}
async function chooseTheme(page:Page, theme:string) {
  let picker = page.locator('[data-book-theme]:visible').first();
  if (!await picker.count()) {
    await page.locator('button[popovertarget]:visible').click();
    picker = page.locator('[data-book-theme]:visible').first();
  }
  await expect(picker).toBeEnabled();
  await picker.selectOption(theme);
  const popover = page.locator('[popover]:popover-open');
  if (await popover.count()) await page.keyboard.press('Escape');
}
async function noOverflow(page:Page) {
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1)).toBe(true);
}
async function accessible(page:Page) {
  const result = await new AxeBuilder({ page }).withTags(['wcag2a','wcag2aa','wcag21aa']).analyze();
  expect(result.violations.map(v => ({ id:v.id, nodes:v.nodes.map(n => n.target) }))).toEqual([]);
}
test.beforeEach(async ({ page }) => {
  errors.set(page,[]);
  page.on('pageerror', error => errors.get(page)!.push(error.message));
  page.on('console', message => { if (message.type() === 'error') errors.get(page)!.push(message.text()); });
});
test.afterEach(async ({ page }) => {
  await expect(page.locator('astro-error-overlay, vite-error-overlay')).toHaveCount(0);
  expect(errors.get(page)).toEqual([]);
});

test('home reflects config, chapters and accessible light/dark cover', async ({ page }) => {
  await ready(page);
  await expect(page).toHaveTitle(new RegExp(book.title.replace(/[.*+?^$\{\}()|[\]\\]/g,'\\$&')));
  await expect(page.locator('h1')).toContainText(book.headline[0]);
  await expect(page.locator('[data-cover-file]')).toContainText(book.cover.fileName);
  await expect(page.locator('[data-cover-lines]')).toContainText(String(book.cover.code.split('\n').length));
  expect(await page.locator('#books ol a').evaluateAll(links => links.map(a => a.getAttribute('href')))).toEqual(chapters.map(c => c.href));
  await noOverflow(page);
  await accessible(page);
  const before = await page.locator('.book-cover-code pre span').first().evaluate(el => getComputedStyle(el).color);
  await chooseTheme(page,'dark');
  await expect(page.locator('html')).toHaveAttribute('data-theme','dark');
  await expect.poll(() => page.locator('.book-cover-code pre span').first().evaluate(el => getComputedStyle(el).color)).not.toBe(before);
  await accessible(page);
});

test('reading flow, previous/next order and keyboard-ready code/tables', async ({ page }) => {
  for (const index of [...new Set([0,Math.floor(chapters.length/2),chapters.length-1])]) {
    const chapter = chapters[index]!;
    await ready(page,chapter.href);
    await expect(page.locator('h1')).toHaveText(chapter.title);
    const next = page.locator('a[rel="next"]');
    const previous = page.locator('a[rel="prev"]');
    if (chapters[index+1]) await expect(next).toHaveAttribute('href',chapters[index+1]!.href);
    else await expect(next).toHaveCount(0);
    if (chapters[index-1]) await expect(previous).toHaveAttribute('href',chapters[index-1]!.href);
    else await expect(previous).toHaveCount(0);
    for (const block of await page.locator('.expressive-code .frame').all()) {
      // Missing code styles otherwise leave an unframed, single-color block.
      await expect(block.locator('pre')).not.toHaveCSS('background-color','rgba(0, 0, 0, 0)');
      const copy = block.locator('.copy button');
      await expect(copy).toHaveCount(1);
      await expect(copy).toBeEnabled();
      await expect(copy).toHaveAccessibleName(/.+/);
      await copy.focus();
      await expect(copy).toBeFocused();
    }
    for (const block of await page.locator('.sl-markdown-content pre, .sl-markdown-content table').all()) {
      // Expressive Code removes unnecessary tab stops when no scrolling is needed.
      if (await block.evaluate(el => el.scrollWidth > el.clientWidth)) {
        await expect(block).toHaveAttribute('tabindex','0');
        await block.focus();
        await expect(block).toBeFocused();
        await block.press('ArrowRight');
        await expect.poll(() => block.evaluate(el => el.scrollLeft)).toBeGreaterThan(0);
      }
    }
    await noOverflow(page);
  }
  await accessible(page);
});

test('copy writes exact code to the clipboard on desktop and touch screens', async ({ page, context, browser, baseURL, browserName, isMobile }) => {
  // Clipboard read permissions are Chromium-only. Keep one native-clipboard test
  // to avoid concurrent projects overwriting the shared operating-system clipboard.
  test.skip(browserName !== 'chromium' || isMobile, 'Native clipboard readback runs once in desktop Chromium with a touch-enabled context.');
  await context.grantPermissions(['clipboard-read','clipboard-write']);
  const chapter = chapters[Math.min(1,chapters.length-1)]!;
  await ready(page,chapter.href);
  await expect(page.locator('h1')).toHaveText(chapter.title);
  const frames = page.locator('.expressive-code .frame');
  expect(await frames.count()).toBeGreaterThan(0);
  for (const frame of await frames.all()) {
    // Empty rendered lines contain a newline placeholder; Windows clipboards use CRLF.
    const expected = (await frame.locator('code .ec-line .code').allTextContents()).map(line => line === '\n' ? '' : line).join('\n');
    const copy = frame.locator('.copy button');
    await copy.focus();
    await copy.press('Enter');
    await expect(frame.locator('.feedback')).toBeVisible();
    expect((await page.evaluate(() => navigator.clipboard.readText())).replace(/\r\n/g,'\n')).toBe(expected);
  }
  await chooseTheme(page,'dark');
  const first = frames.first();
  await first.locator('.copy button').click();
  await expect(first.locator('.feedback')).toBeVisible();
  // Audit the settled page, not the success tooltip's timed opacity transition.
  await expect(page.locator('.expressive-code .feedback')).toHaveCount(0);
  await accessible(page);

  const touchContext = await browser.newContext({ baseURL, viewport:{ width:390,height:844 }, hasTouch:true, isMobile:true, permissions:['clipboard-read','clipboard-write'] });
  try {
    const touchPage = await touchContext.newPage();
    touchPage.on('pageerror', error => errors.get(page)!.push(error.message));
    touchPage.on('console', message => { if (message.type() === 'error') errors.get(page)!.push(message.text()); });
    await ready(touchPage,chapter.href);
    await expect(touchPage.locator('h1')).toHaveText(chapter.title);
    const touchFrame = touchPage.locator('.expressive-code .frame').first();
    for (const theme of ['light','dark']) {
      await chooseTheme(touchPage,theme);
      const touchCopy = touchFrame.locator('.copy button');
      await touchCopy.scrollIntoViewIfNeeded();
      await touchCopy.tap();
      await expect(touchFrame.locator('.feedback')).toBeVisible();
      const expected = (await touchFrame.locator('code .ec-line .code').allTextContents()).map(line => line === '\n' ? '' : line).join('\n');
      expect((await touchPage.evaluate(() => navigator.clipboard.readText())).replace(/\r\n/g,'\n')).toBe(expected);
      await noOverflow(touchPage);
    }
    await expect(touchPage.locator('astro-error-overlay, vite-error-overlay')).toHaveCount(0);
  } finally {
    await touchContext.close();
  }
});

test('copy explains denied permission and recovers on retry', async ({ page }) => {
  await ready(page,chapters[Math.min(1,chapters.length-1)]!.href);
  await page.evaluate(() => Object.defineProperty(navigator,'clipboard',{ configurable:true, value:{
    writeText: async () => { throw new DOMException('Denied','NotAllowedError'); },
  }}));
  const frame = page.locator('.expressive-code .frame').first();
  await frame.locator('.copy button').click();
  await expect(frame.locator('[data-copy-error]')).toContainText('คัดลอกอัตโนมัติไม่ได้');
  await expect(frame.locator('.feedback')).toHaveCount(0);
  await expect(frame.locator('.copy button')).not.toHaveAttribute('aria-busy','true');
  await accessible(page);
  // Contract-level recovery test for every browser; native readback is tested above.
  await page.evaluate(() => Object.defineProperty(navigator,'clipboard',{ configurable:true, value:{
    writeText: async (text:string) => { document.documentElement.dataset.copiedText = text; },
  }}));
  await frame.locator('.copy button').click();
  await expect(frame.locator('[data-copy-error]')).toHaveCount(0);
  await expect(frame.locator('.feedback')).toHaveText('คัดลอกแล้ว');
  const code = (await frame.locator('.ec-line .code').allTextContents()).map(line => line === '\n' ? '' : line).join('\n');
  await expect(page.locator('html')).toHaveAttribute('data-copied-text',code);
});

test('code stays readable with zoom-equivalent reflow and larger text', async ({ page }) => {
  await ready(page,chapters[Math.min(1,chapters.length-1)]!.href);
  expect(await page.locator('.expressive-code .code').first().evaluate(el => parseFloat(getComputedStyle(el).fontSize))).toBeGreaterThanOrEqual(16);
  await expect(page.locator('.expressive-code .copy button').first()).toHaveCSS('opacity','1');
  for (const scale of [2,4]) {
    // Browser zoom reduces the CSS viewport; changing root font-size alone does
    // not update media-query breakpoints and is not an equivalent zoom test.
    await page.setViewportSize({width:1440/scale,height:900});
    await noOverflow(page);
    await expect(page.locator('h1')).toBeVisible();
    const menu = page.locator('button[popovertarget]:visible');
    if (await menu.count()) {
      await menu.click();
      await expect(page.locator('[popover]:popover-open')).toBeVisible();
      await page.keyboard.press('Escape');
    }
  }
  // Separately exercise enlarged text in the single-column reading layout.
  await page.evaluate(() => { document.documentElement.style.fontSize = '200%'; });
  await noOverflow(page);
  await expect(page.locator('h1')).toBeVisible();
});

test('only one mobile menu, Escape restores focus and search closes menu', async ({ page }) => {
  await page.setViewportSize({ width:390,height:844 });
  for (const route of ['./',chapters[0]!.href]) {
    await ready(page,route);
    const toggle = page.locator('button[popovertarget]:visible');
    await expect(toggle).toHaveCount(1);
    // Safari intentionally does not focus buttons on pointer clicks.
    // Use the keyboard path to verify restoration to the invoking control.
    await toggle.focus();
    await toggle.press('Enter');
    await expect(page.locator('[popover]:popover-open')).toHaveCount(1);
    await accessible(page);
    await page.keyboard.press('Escape');
    await expect(page.locator('[popover]:popover-open')).toHaveCount(0);
    await expect(toggle).toBeFocused();
    await toggle.click();
    await page.keyboard.press('Control+k');
    await expect(page.locator('dialog[open]')).toBeVisible();
    await expect(page.locator('[popover]:popover-open')).toHaveCount(0);
    // Prove search is usable and finish its lazy metadata/wasm imports before navigation.
    await page.locator('.pagefind-ui__search-input').fill(chapters[0]!.title);
    await expect(page.locator('.pagefind-ui__result-link').filter({ hasText:chapters[0]!.title }).first()).toBeVisible();
    await page.keyboard.press('Escape');
  }
});

test('search finds current book, handles empty results and opens a result', async ({ page }) => {
  await ready(page);
  await page.locator('[data-open-modal]').click();
  const input = page.locator('.pagefind-ui__search-input');
  await input.fill('zzzznotabookword9999');
  await expect(page.locator('.pagefind-ui__message')).toContainText(/0|ไม่พบ/);
  await input.fill(chapters[0]!.title);
  const result = page.locator('.pagefind-ui__result-link').filter({ hasText:chapters[0]!.title }).first();
  await expect(result).toBeVisible();
  await accessible(page);
  await result.click();
  await expect(page.locator('h1')).toHaveText(chapters[0]!.title);
  await page.locator('.pagefind-ui__search-input').waitFor({ state:'attached' });
});

test('theme persists, respects system changes and survives blocked storage', async ({ page, context }) => {
  await ready(page);
  await chooseTheme(page,'dark');
  await page.reload();
  await expect(page.locator('html')).toHaveAttribute('data-theme','dark');
  await chooseTheme(page,'auto');
  await page.emulateMedia({ colorScheme:'dark' });
  await expect(page.locator('html')).toHaveAttribute('data-theme','dark');
  await page.emulateMedia({ colorScheme:'light' });
  await expect(page.locator('html')).toHaveAttribute('data-theme','light');
  await page.locator('.pagefind-ui__search-input').waitFor({ state:'attached' });
  await context.addInitScript(() => Object.defineProperty(window,'localStorage',{ get() { throw new DOMException('Blocked','SecurityError'); } }));
  await ready(page);
  await chooseTheme(page,'dark');
  await expect(page.locator('html')).toHaveAttribute('data-theme','dark');
});

test('responsive reading and reduced motion without horizontal page overflow', async ({ page }) => {
  await page.emulateMedia({ reducedMotion:'reduce' });
  for (const width of [320,720,1024,1920]) {
    await page.setViewportSize({ width,height:900 });
    await ready(page);
    await noOverflow(page);
    await ready(page,chapters.at(-1)!.href);
    await noOverflow(page);
  }
  expect(await page.evaluate(() => getComputedStyle(document.documentElement).scrollBehavior)).toBe('auto');
});

test('static reading and native mobile navigation work without JavaScript', async ({ browser, baseURL }) => {
  const context = await browser.newContext({ javaScriptEnabled:false, viewport:{ width:390,height:844 } });
  const page = await context.newPage();
  await page.goto(baseURL!);
  await expect(page.locator('#books ol a')).toHaveCount(chapters.length);
  await page.locator('button[popovertarget]:visible').click();
  await expect(page.locator('[popover]:popover-open')).toBeVisible();
  await page.keyboard.press('Escape');
  await page.goto(new URL(chapters[0]!.href,baseURL!).href);
  await expect(page.locator('h1')).toHaveText(chapters[0]!.title);
  for (const block of await page.locator('.sl-markdown-content pre').all()) await expect(block).toHaveAttribute('tabindex','0');
  await page.locator('button[popovertarget]:visible').click();
  await expect(page.locator('#starlight__sidebar')).toBeVisible();
  await context.close();
});

test('metadata, generated social image, author guide and 404 recovery', async ({ page, request, baseURL }) => {
  await ready(page);
  const image = await page.locator('meta[property="og:image"]').getAttribute('content');
  expect(image).toContain('/book-cover.png');
  const png = await request.get(new URL('book-cover.png',baseURL!).href);
  expect(png.ok()).toBe(true);
  expect(png.headers()['content-type']).toContain('image/png');
  const buffer = await png.body();
  expect(buffer.readUInt32BE(16)).toBe(1200);
  expect(buffer.readUInt32BE(20)).toBe(630);
  const guide = await request.get(new URL('about/',baseURL!).href);
  expect(guide.status()).toBe(book.showAuthorGuide ? 200 : 404);
  await ready(page,'404.html');
  await expect(page.locator('meta[name="robots"]')).toHaveAttribute('content',/noindex/);
  await page.locator('main a').filter({ hasText:'สารบัญ' }).first().click();
  await expect(page.locator('#books')).toBeVisible();
  await page.locator('.pagefind-ui__search-input').waitFor({ state:'attached' });
});
