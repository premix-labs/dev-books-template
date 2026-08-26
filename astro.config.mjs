// @ts-check
import { defineConfig } from 'astro/config';
import starlight from '@astrojs/starlight';
import tailwindcss from '@tailwindcss/vite';

const [githubOwner, githubRepo] = process.env.GITHUB_REPOSITORY?.split('/') ?? [];
const isUserSite = githubOwner && githubRepo === `${githubOwner}.github.io`;
const site =
	process.env.SITE_URL ??
	(githubOwner ? `https://${githubOwner}.github.io` : 'https://premix-labs.github.io');
const base =
	process.env.BASE_PATH ??
	(githubRepo ? (isUserSite ? '/' : `/${githubRepo}`) : '/dev-books-template');

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
