// @ts-check
import { defineConfig } from 'astro/config';
import starlight from '@astrojs/starlight';

// https://astro.build/config
export default defineConfig({
	site: 'https://premix-labs.github.io',
	base: '/dev-books-template',
	devToolbar: { enabled: false },
	integrations: [
		starlight({
			title: 'Dev Books',
			description: 'หนังสือ Programming ออนไลน์สำหรับ Developer',
			favicon: '/favicon.svg',
			locales: {
				root: {
					label: 'ไทย',
					lang: 'th',
				},
			},
			customCss: ['./src/styles/custom.css'],
			components: {
				Header: './src/components/Header.astro',
				Hero: './src/components/HomeHero.astro',
			},
			sidebar: [
				{
					label: 'หนังสือ',
					items: [
						{ label: 'C# สำหรับ Developer', slug: 'csharp' },
						{ label: 'TypeScript สำหรับ Developer', slug: 'typescript' },
						{ label: 'Python สำหรับ Developer', slug: 'python' },
					],
				},
				{
					label: 'โครงการ',
					items: [{ label: 'เกี่ยวกับ', slug: 'about' }],
				},
			],
		}),
	],
});
