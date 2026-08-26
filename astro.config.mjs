// @ts-check
import { defineConfig } from 'astro/config';
import starlight from '@astrojs/starlight';
import tailwindcss from '@tailwindcss/vite';

const [githubOwner, githubRepo] = process.env.GITHUB_REPOSITORY?.split('/') ?? [];
const isUserSite = githubOwner && githubRepo === `${githubOwner}.github.io`;
const site =
	process.env.SITE_URL ??
	(githubOwner ? `https://${githubOwner}.github.io` : 'http://localhost:4321');
const base =
	process.env.BASE_PATH ??
	(githubRepo ? (isUserSite ? '/' : `/${githubRepo}`) : '/');
const socialImage = new URL(`${base.replace(/\/$/, '')}/social-card.png`, site).href;

// https://astro.build/config
export default defineConfig({
	site,
	base,
	devToolbar: { enabled: false },
	integrations: [
		starlight({
			title: 'Dev Books Template',
			description: 'เทมเพลตหนังสือ Programming ออนไลน์สำหรับ Developer',
			favicon: '/favicon.svg',
			head: [
				{ tag: 'meta', attrs: { property: 'og:image', content: socialImage } },
				{ tag: 'meta', attrs: { property: 'og:image:type', content: 'image/png' } },
				{ tag: 'meta', attrs: { property: 'og:image:width', content: '1200' } },
				{ tag: 'meta', attrs: { property: 'og:image:height', content: '630' } },
				{
					tag: 'meta',
					attrs: {
						property: 'og:image:alt',
						content: 'Dev Books Template — Programming books for developers',
					},
				},
				{ tag: 'meta', attrs: { name: 'twitter:image', content: socialImage } },
				{
					tag: 'meta',
					attrs: {
						name: 'twitter:image:alt',
						content: 'Dev Books Template — Programming books for developers',
					},
				},
			],
			disable404Route: true,
			locales: {
				root: {
					label: 'ไทย',
					lang: 'th',
				},
			},
			customCss: ['./src/styles/global.css'],
			components: {
				Header: './src/components/Header.astro',
				Hero: './src/components/HomeHero.astro',
				MobileMenuToggle: './src/components/MobileMenuToggle.astro',
			},
			sidebar: [
				{
					label: 'หนังสือตัวอย่าง',
					items: [
						{ label: 'ภาพรวม', slug: 'example' },
						{ label: 'บทที่ 1: บทเรียนตัวอย่าง', slug: 'example/chapter' },
						{ label: 'โปรเจกต์ตัวอย่าง', slug: 'example/project' },
					],
				},
				{
					label: 'Template',
					items: [{ label: 'เกี่ยวกับ Template', slug: 'about' }],
				},
			],
		}),
	],
	vite: {
		plugins: [tailwindcss()],
	},
});
