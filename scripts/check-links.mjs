import { readdir, readFile, stat } from 'node:fs/promises';
import path from 'node:path';
import { deployment } from '../src/lib/deployment.mjs';

const root = path.resolve('dist');
const { site, base } = deployment(process.env);
const prefix = base === '/' ? '' : base;
const origin = new URL(site).origin;
const files = await readdir(root, { recursive: true });
const pages = files.filter(file => file.endsWith('.html'));
if (!pages.length) throw new Error('No HTML pages found. Run npm run build first.');
const failures = [];
const cache = new Map();
const load = async file => {
  if (!cache.has(file)) cache.set(file, await readFile(file, 'utf8'));
  return cache.get(file);
};
let checked = 0;
for (const file of pages) {
  const html = await load(path.join(root, file));
  const route = file.replaceAll(path.sep, '/').replace(/index\.html$/, '');
  const current = new URL(`${prefix}/${route}`, origin);
  for (const match of html.matchAll(/<(?:a|img|script|link)\b[^>]*?\b(?:href|src)="([^"]+)"/g)) {
    const raw = match[1].replaceAll('&amp;', '&');
    const url = new URL(raw, current);
    if (!['http:', 'https:'].includes(url.protocol) || url.origin !== origin) continue;
    if (prefix && url.pathname !== prefix && !url.pathname.startsWith(`${prefix}/`)) {
      failures.push(`${file}: outside BASE_PATH → ${raw}`);
      continue;
    }
    let target = path.resolve(root, `.${decodeURIComponent(url.pathname.slice(prefix.length))}`);
    if (path.relative(root, target).startsWith('..')) { failures.push(`${file}: outside dist → ${raw}`); continue; }
    try {
      if ((await stat(target)).isDirectory()) target = path.join(target, 'index.html');
      await stat(target);
      if (url.hash && target.endsWith('.html')) {
        const targetHtml = await load(target);
        const fragment = decodeURIComponent(url.hash.slice(1));
        if (fragment && !targetHtml.includes(`id="${fragment}"`)) throw new Error(`missing anchor ${fragment}`);
      }
      checked++;
    } catch (error) {
      failures.push(`${file}: ${raw} (${error.message})`);
    }
  }
}
if (failures.length) {
  console.error(failures.join('\n'));
  process.exitCode = 1;
} else console.log(`Checked ${checked} internal links/assets across ${pages.length} pages (base: ${base}).`);
