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
			title: 'Dev Books Template',
			description: 'เทมเพลตหนังสือ Programming ออนไลน์สำหรับ Developer',
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
});
