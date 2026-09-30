// @ts-check
import { defineConfig } from 'astro/config';
import starlight from '@astrojs/starlight';
import tailwindcss from '@tailwindcss/vite';
import { satteri } from '@astrojs/markdown-satteri';
import { book } from './book.config.mjs';
import { deployment } from './src/lib/deployment.mjs';
import { makeCodeFocusable, focusableTables } from './src/lib/code-accessibility.mjs';

const { site, base } = deployment(process.env);
const socialImage = new URL(`${base === '/' ? '' : base}/book-cover.png`, site).href;

export default defineConfig({
	site, base, trailingSlash: 'always',
	devToolbar: { enabled: false },
	markdown: { processor: satteri({ hastPlugins: [focusableTables] }) },
	integrations: [starlight({
		title: book.title,
		description: book.description,
		favicon: '/favicon.svg',
		head: [
			{ tag: 'meta', attrs: { name: 'author', content: book.author } },
			{ tag: 'meta', attrs: { property: 'og:image', content: socialImage } },
			{ tag: 'meta', attrs: { property: 'og:image:type', content: 'image/png' } },
			{ tag: 'meta', attrs: { property: 'og:image:width', content: '1200' } },
			{ tag: 'meta', attrs: { property: 'og:image:height', content: '630' } },
			{ tag: 'meta', attrs: { property: 'og:image:alt', content: `${book.title} — ${book.author}` } },
			{ tag: 'meta', attrs: { name: 'twitter:image', content: socialImage } },
			{ tag: 'meta', attrs: { name: 'twitter:image:alt', content: `${book.title} — ${book.author}` } },
		],
		disable404Route: true,
		credits: false,
		locales: { root: { label: 'ไทย', lang: 'th' } },
		customCss: ['./src/styles/global.css'],
		expressiveCode: {
			frames: { showCopyToClipboardButton: true },
			styleOverrides: { codeFontSize: '1rem', codeLineHeight: '1.7', borderRadius: '0.5rem' },
			plugins: [{ name: 'Keyboard-readable code', hooks: { postprocessRenderedBlock: ({ renderData }) => makeCodeFocusable(renderData.blockAst) } }],
		},
		components: {
			PageTitle: './src/components/PageTitle.astro',
			Header: './src/components/Header.astro',
			Hero: './src/components/HomeHero.astro',
			Sidebar: './src/components/Sidebar.astro',
			Footer: './src/components/Footer.astro',
			ThemeProvider: './src/components/ThemeProvider.astro',
			ThemeSelect: './src/components/ThemeSelect.astro',
		},
		sidebar: [
			...book.parts.map(({ label, directory }) => ({ label, items: [{ autogenerate: { directory } }] })),
			...(book.showAuthorGuide ? [{ label: 'สำหรับผู้เขียน', items: [{ label: 'วิธีใช้ Template', link: '/about/' }] }] : []),
		],
	})],
	// A shared stylesheet also reaches custom .astro pages in MDX-only books.
	// This avoids Astro's propagated-asset CSS splitting edge case.
	vite: { plugins: [tailwindcss()], build: { cssCodeSplit: false } },
});
