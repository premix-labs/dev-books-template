import { defineBook } from './src/lib/book-config.mjs';

// Change book identity here; chapter titles and order come from Markdown frontmatter.
export const book = defineBook({
	id: 'dev-books-template',
	title: 'Dev Books Template',
	headline: ['เทมเพลตหนังสือออนไลน์', 'สำหรับ Developer'],
	description: 'โครงเริ่มต้นพร้อมบทเรียน โค้ด และผลลัพธ์ อ่านแล้วพิมพ์ตามได้ทีละขั้น',
	author: 'ชื่อผู้เขียน',
	contentsLabel: 'เนื้อหาตัวอย่าง',
	showAuthorGuide: true,
	parts: [{ label: 'หนังสือตัวอย่าง', directory: 'example' }],
	cover: {
		fileName: 'index.ts',
		language: 'ts',
		code: "export function greet(name: string): string {\n  const message = `สวัสดี, ${name}!`;\n  return message;\n}\n\nconsole.log(greet('Developer'));\n\n// แนวคิดสำคัญ\n// เขียนโค้ดที่อ่านง่าย ทดสอบได้ และนำไปใช้ได้จริง",
	},
});
