# Dev Books Template

เทมเพลตหนังสือ Programming ออนไลน์สำหรับ Developer สร้างด้วย Astro, Starlight และ Tailwind CSS 4 พร้อมตัวอย่างบทเรียน โค้ด แบบฝึกหัด และโปรเจกต์ที่แทนด้วยเนื้อหาจริงได้ทันที

## สิ่งที่เตรียมไว้แล้ว

- โครงหนังสือและเมนูบทด้วย Starlight
- หน้าแรก responsive พร้อม light/dark theme
- ค้นหาเนื้อหาแบบ static ด้วย Pagefind
- ตัวอย่างบทเรียน โค้ด แบบฝึกหัด และโปรเจกต์
- Tailwind CSS 4 สำหรับ custom components
- GitHub Actions สำหรับ deploy ไป GitHub Pages
- หน้า 404, sitemap และ metadata พื้นฐาน

Custom components ใช้ Tailwind utility classes โดยไม่มี `<style>` block ส่วน `src/styles/global.css` มี Tailwind imports, design tokens และ base style เล็กน้อยสำหรับ smooth scrolling ที่เคารพการตั้งค่า reduced motion

## ความต้องการของระบบ

- Node.js 22.12.0 ขึ้นไป
- npm 9.6.5 ขึ้นไป

## เริ่มใช้งาน

```bash
npm install
npm run dev
```

เว็บไซต์สำหรับพัฒนาจะแสดงที่ `http://localhost:4321/dev-books-template/` สำหรับชื่อ repo เริ่มต้นนี้

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

ไฟล์ใน `example/` เป็นเนื้อหาตัวอย่าง เมื่อต้องการเริ่มหนังสือจริงให้เปลี่ยนชื่อโฟลเดอร์และแทนที่เนื้อหาภายในด้วยไฟล์ `.md` หรือ `.mdx`

## ปรับเป็นหนังสือของคุณ

1. เปลี่ยน `name` ใน `package.json`
2. เปลี่ยนชื่อ คำอธิบาย และรายการ `sidebar` ใน `astro.config.mjs`
3. เปลี่ยนโฟลเดอร์ `src/content/docs/example/` เป็น slug ของหนังสือ
4. แก้หน้าแรกใน `src/content/docs/index.mdx` และ `src/components/BookIndex.astro`
5. ปรับข้อความและตัวอย่างโค้ดใน `src/components/HomeHero.astro`

หากทำหนังสือ C#, TypeScript และ Python แยกเป็น 3 เล่ม แนะนำให้สร้าง repository จาก template นี้ 3 ครั้ง เพื่อให้แต่ละเล่มมี URL, version และรอบ deploy เป็นอิสระจากกัน

## คำสั่ง

| คำสั่ง | การทำงาน |
| --- | --- |
| `npm run dev` | เปิด development server |
| `npm run check` | ตรวจ type และปัญหาในไฟล์ Astro |
| `npm run build` | ตรวจโค้ดและสร้าง production build ใน `dist/` |
| `npm run preview` | เปิดดู production build |

## GitHub Pages

เมื่อ push ไป branch `main` workflow จะ build และ deploy เว็บไซต์โดยอัตโนมัติ ค่า `site` และ `base` จะอ่านจากตัวแปร `GITHUB_REPOSITORY` ที่ GitHub Actions เตรียมไว้ จึงรองรับชื่อ repository ใหม่ที่สร้างจาก template โดยไม่ต้องแก้ path ด้วยตนเอง

สำหรับการ build นอก GitHub สามารถกำหนดค่าเองได้ด้วย environment variables:

- `SITE_URL` เช่น `https://example.com`
- `BASE_PATH` เช่น `/my-book` หรือ `/` สำหรับ custom domain

ใน repository settings ให้ตั้งค่า **Pages > Build and deployment > Source** เป็น **GitHub Actions**

## License

MIT © Premix Labs
