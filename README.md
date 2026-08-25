# Dev Books Template

โครงเริ่มต้นสำหรับหนังสือ Programming ออนไลน์ สร้างด้วย Astro และ Starlight พร้อมเนื้อหาตัวอย่างที่สามารถแทนที่ด้วยหนังสือจริงได้

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
├── example/
│   ├── index.md
│   ├── chapter.md
│   └── project.md
└── about.md
```

ไฟล์ใน `example/` เป็นเพียงตัวอย่าง เมื่อต้องการเริ่มหนังสือจริงให้เปลี่ยนชื่อโฟลเดอร์และแทนที่เนื้อหาภายในด้วยไฟล์ `.md` หรือ `.mdx` ของคุณ

## ปรับเป็นหนังสือของคุณ

1. เปลี่ยนชื่อและคำอธิบายใน `astro.config.mjs`
2. เปลี่ยนโฟลเดอร์ `src/content/docs/example/` เป็น slug ของหนังสือ
3. แก้รายการหน้าแรกใน `src/components/BookIndex.astro`
4. จัดลำดับบทใน `sidebar` ของ `astro.config.mjs`
5. หากสร้าง GitHub repository ใหม่ ให้แก้ค่า `site` และ `base` ใน `astro.config.mjs`

## คำสั่ง

| คำสั่ง | การทำงาน |
| --- | --- |
| `npm run dev` | เปิด development server |
| `npm run build` | สร้างเว็บไซต์ production ใน `dist/` |
| `npm run preview` | เปิดดู production build |

## Deployment

ทุกครั้งที่ push ไปยัง branch `main` ระบบ GitHub Actions จะ build และ deploy เว็บไซต์ไปยัง
`https://premix-labs.github.io/dev-books-template/` โดยอัตโนมัติ
