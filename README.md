# Dev Books Template

โครงเริ่มต้นสำหรับหนังสือ Programming ออนไลน์ สร้างด้วย Astro และ Starlight

## เริ่มใช้งาน

```bash
npm install
npm run dev
```

เว็บไซต์สำหรับพัฒนาจะแสดงที่ `http://localhost:4321/dev-books-template/`

## โครงสร้างเนื้อหา

```text
src/content/docs/
├── index.mdx
├── csharp/
├── typescript/
├── python/
└── about.md
```

เมื่อตัดสินใจว่าจะเริ่มหนังสือเล่มใด ให้เพิ่มไฟล์ `.md` หรือ `.mdx` ในโฟลเดอร์ของหนังสือเล่มนั้น แล้วเพิ่มบทใหม่เข้า sidebar ใน `astro.config.mjs`

## คำสั่ง

| คำสั่ง | การทำงาน |
| --- | --- |
| `npm run dev` | เปิด development server |
| `npm run build` | สร้างเว็บไซต์ production ใน `dist/` |
| `npm run preview` | เปิดดู production build |

## Deployment

ทุกครั้งที่ push ไปยัง branch `main` ระบบ GitHub Actions จะ build และ deploy เว็บไซต์ไปยัง
`https://premix-labs.github.io/dev-books-template/` โดยอัตโนมัติ
