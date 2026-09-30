import sharp from 'sharp';
import { createRequire } from 'node:module';
import { book } from '../../book.config.mjs';

const fontfile = createRequire(import.meta.url).resolve('@fontsource-variable/noto-sans-thai/files/noto-sans-thai-thai-wght-normal.woff2');
const escapeMarkup = (value: string) => value.replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;').replaceAll('"', '&quot;').replaceAll("'", '&apos;');

async function textLayer(text: string, size: number, height: number, color: string) {
  return sharp({ text: {
    text: `<span foreground="${color}">${escapeMarkup(text)}</span>`,
    font: `Noto Sans Thai ${size}`, fontfile, width: 1040, height, rgba: true, wrap: 'word-char',
  } }).png().toBuffer();
}

export async function GET() {
  const image = await sharp({ create: { width: 1200, height: 630, channels: 4, background: '#111827' } })
    .composite([
      { input: { create: { width: 8, height: 470, channels: 4, background: '#8ba7ff' } }, left: 32, top: 80 },
      { input: await textLayer(book.headline.join('\n'), 76, 250, '#f1f5f9'), left: 80, top: 70 },
      { input: await textLayer(book.description, 36, 110, '#bdccff'), left: 80, top: 360 },
      { input: await textLayer(book.author, 26, 48, '#c6d0df'), left: 80, top: 520 },
    ]).png().toBuffer();
  return new Response(new Uint8Array(image), { headers: { 'Content-Type': 'image/png' } });
}
