# Dev Books Template

เทมเพลตหนังสือ Programming ภาษาไทยด้วย Astro 7, Starlight และ Tailwind CSS 4
คงหน้าแรกแบบข้อความคู่กับหน้าต่าง IDE และออกแบบบทเรียนให้อ่านแล้วพิมพ์ตามทีละขั้น
มีปุ่มคัดลอกโค้ดและคำสั่งเพื่อความสะดวก โดยยังแนะนำให้พิมพ์ตามเพื่อทำความเข้าใจ
ไม่มีแบบฝึกหัดหรือโปรเจกต์เฉลยที่ผู้อ่านต้องเปิดแยก

## เริ่มใช้งาน

แนะนำ Node.js 24 ตาม `.nvmrc` (ขั้นต่ำ 22.19) และ npm 9.6.5 ขึ้นไป

```sh
npm ci
npm run dev
```

เปิด http://localhost:4321/ การค้นหาใช้ดัชนีจาก production build จึงต้องตรวจผ่าน `npm run build` และ `npm run preview`

ใช้ `npm run dev -- --background` เมื่อต้องการรันเบื้องหลัง และ `npx astro dev stop` เพื่อหยุด
หน้า dev จะแจ้งว่าต้อง build ก่อนใช้การค้นหา; ใช้ preview เมื่อต้องการทดสอบการค้นหาจริง

## สร้างหนังสือเล่มใหม่

1. สร้าง repository จาก template นี้และ clone ลงเครื่อง
2. แก้ `book.config.mjs`: ID, ชื่อหนังสือ, ข้อความหน้าแรก, คำอธิบาย, ผู้เขียน, ตัวอย่างโค้ดหน้าปก และหมวดบทเรียน
3. แทนที่ `src/content/docs/example/` ด้วยเนื้อหาในโฟลเดอร์ที่ระบุใน `book.parts`
4. กำหนด `sidebar.order` ในแต่ละบทเป็นจำนวนเต็มบวกที่ไม่ซ้ำกันทั้งเล่ม
5. เปลี่ยน `showAuthorGuide` เป็น `false` เมื่อไม่ต้องการเผยแพร่หน้าวิธีใช้ template
6. เปลี่ยน metadata ของ repository ใน `package.json` ได้แก่ name, description, author, repository และ homepage แล้วรัน `npm install --package-lock-only`
7. แทนที่ `tests/content/` ด้วยการทดสอบโค้ดของหนังสือใหม่ หรือนำชุดทดสอบตัวอย่างนี้ออก แต่คง `tests/unit/` และ `tests/e2e/` ไว้
8. รัน validation และตรวจหน้าเว็บก่อนเผยแพร่

ชื่อเล่ม สารบัญ เมนู ลำดับก่อนหน้า–ถัดไป และภาพแชร์ `book-cover.png` สร้างจาก config และบทเรียนเดียวกัน
ไม่ต้องแก้ component เพื่อเปลี่ยนหนังสือ และไม่มีข้อความแบรนด์เดิมฝังในภาพแชร์
`book.id` ใช้แยกค่าธีมที่บันทึกใน browser ร่วมกับ base path ให้ใช้ ID ที่ไม่ซ้ำกับเล่มอื่น

ตัวอย่าง `parts`:

```js
parts: [
  { label: 'เริ่มต้น', directory: 'getting-started' },
  { label: 'พื้นฐานภาษา', directory: 'fundamentals' },
],
```

โฟลเดอร์อยู่ภายใต้ `src/content/docs/` ห้ามซ้อนทับกัน และใช้ชื่อ URL-safe เช่น `getting-started`
ลำดับบทต้องเรียงตามลำดับหมวดใน config หากตั้งค่าผิด build จะหยุดพร้อมข้อความระบุปัญหา

## เขียนบทเรียน

ใช้ `templates/chapter.md` เป็นโครงสำหรับผู้เขียน แล้ววางไฟล์ในโฟลเดอร์บทเรียน:

```yaml
---
title: ชื่อบท
description: สิ่งที่ผู้อ่านจะทำได้
sidebar:
  order: 1
draft: true
---
```

เมื่อพร้อมเผยแพร่ให้เปลี่ยน `draft: false` หรือลบบรรทัดนี้ ต้องมีบทเผยแพร่อย่างน้อยหนึ่งบท
บท draft ไม่อยู่ใน production HTML, สารบัญ หรือดัชนีค้นหา แต่ยังต้องใช้ frontmatter ที่ถูกต้อง
ไม่ใช้ `sidebar.hidden` เพื่อซ่อนงานร่าง ให้ใช้ `draft` ซึ่งไม่เผยแพร่เนื้อหาด้วย

แนวทางแต่ละบท:

1. บอกว่าทำอะไรต่อจากบทก่อนและตอนจบจะได้อะไร
2. อธิบายแนวคิดใหม่ก่อนเริ่มใช้
3. ระบุโฟลเดอร์ ชื่อไฟล์ และตำแหน่งที่ต้องพิมพ์
4. อธิบายโค้ดแต่ละส่วนและแสดงสถานะไฟล์ที่พร้อมรัน
5. แสดงคำสั่งรัน ผลลัพธ์จริง และวิธีตรวจเมื่อผลไม่ตรง
6. สรุปการทำงานและสถานะโปรเจกต์ก่อนอ่านบทถัดไป

เขียนได้ทั้ง Markdown และ MDX; MDX ใช้ `Tabs`, `TabItem`, `Aside`, `Steps` จาก Starlight ได้
ตัวอย่าง TypeScript ใน template เป็นเพียงตัวอย่างรูปแบบการสอน ไม่ใช่หลักสูตรฉบับเต็ม

## โครงสร้าง

```text
book.config.mjs                 ข้อมูลหนังสือและหมวด
astro.config.mjs                การประกอบเว็บและ deployment
src/components/                หน้าแรก เมนู ธีม และ navigation
src/content/docs/              บทเรียน Markdown / MDX
src/content/i18n/th.json        ข้อความ UI ภาษาไทย
src/lib/                       ตรวจ config จัดลำดับ และจัดการ path
src/pages/                     หน้าแรก คู่มือ 404 และภาพแชร์
src/styles/global.css          imports, tokens และกฎเชื่อมกับ Starlight
templates/chapter.md           โครงบทสำหรับผู้เขียน
tests/unit/                    config และ helper tests ที่ใช้ได้ทุกเล่ม
tests/e2e/                     ทดสอบ browser โดยอ่านข้อมูลของเล่มนั้น
tests/content/                 ทดสอบเฉพาะโค้ดในบทตัวอย่าง
scripts/                       ตรวจลิงก์และทดลองสร้างเล่มใหม่
```

Custom components ใช้ Tailwind ส่วน global CSS มีเฉพาะ tokens และกฎที่ต้องเชื่อมกับ HTML ที่ Starlight/Shiki สร้าง
ไม่จำเป็นต้องแปลงกฎ integration ทุกบรรทัดเป็น utility class

โค้ดในบทเรียนใช้ขนาด 1rem ส่วน inline code ใช้ 0.9em ของข้อความรอบข้าง
`src/scripts/code-copy.ts` ใช้ปุ่มของ Expressive Code แต่เพิ่มสถานะสำเร็จ/ล้มเหลวภาษาไทย
เมื่อเบราว์เซอร์ปฏิเสธคลิปบอร์ด จะแจ้งวิธีเลือกคัดลอกเอง ไม่แสดงว่าสำเร็จทั้งที่ไม่ได้คัดลอก
การคัดลอกอัตโนมัติควรใช้ผ่าน HTTPS หรือ localhost และขึ้นอยู่กับสิทธิ์ของเบราว์เซอร์

`src/content.config.ts` ใช้ Astro `glob({ deferRender: true })` ร่วมกับ Starlight schema
เพื่อ render Markdown ด้วยการตั้งค่าปัจจุบัน ไม่เก็บ HTML ที่อ้าง asset hash เก่าใน content store
การทดสอบ dev ครอบคลุม config hot reload, warm restart และ build ขณะ dev ยังเปิดอยู่
แลกกับการไม่ใช้ cache ของ HTML ที่ render แล้ว; หน้าเว็บที่เผยแพร่ยังเป็น static HTML เช่นเดิม

ใช้ CSS bundle ร่วมกันเพื่อให้หน้า Astro และเล่มที่มีแต่ MDX โหลด styles ครบ
การ build Markdown/MDX บน Astro/Rolldown รุ่นปัจจุบันอาจแจ้ง `MODULE_LEVEL_DIRECTIVE: use astro:head-inject`
ซึ่งยังเป็น warning ของเครื่องมือ ชุด reuse/E2E ตรวจการแสดงผลจริงร่วมด้วย ไม่ได้อาศัยผล build อย่างเดียว

## คำสั่งตรวจสอบ

| คำสั่ง | ตรวจอะไร |
| --- | --- |
| `npm run check` | Astro และ TypeScript |
| `npm test` | การตั้งค่า ลำดับบท URL และ accessibility helpers |
| `npm run test:content` | compile/run โค้ดที่พิมพ์ตามในหนังสือตัวอย่าง |
| `npm run build` | type-check และสร้าง production ใหม่ใน dist |
| `npm run test:links` | ลิงก์ ไฟล์ และ anchor ภายใน production |
| `npm run validate` | unit tests + build + internal links + asset budget |
| `npm run test:e2e` | Chromium, Firefox, WebKit และจอมือถือจำลอง |
| `npm run test:reuse` | สร้างเล่มจำลอง 1 และ 30 บทใน temporary directories |
| `npm run test:dev` | สำเนาแยก: เปิด dev, เปลี่ยน config, restart และ build โดยตรวจโค้ด/Copy ซ้ำ |
| `npm run test:budget` | ขนาด UI JavaScript/CSS หลัง gzip และไฟล์ฟอนต์ |
| `npm run measure:performance -- <URL>/` | วัดหน้าแรก/บทเรียนบน mobile simulation พร้อมจำกัดเครือข่ายและ CPU |
| `npm audit` | ช่องโหว่ dependency ที่ฐานข้อมูล npm รายงาน |

ก่อนทดสอบ browser ครั้งแรก:

```sh
npx playwright install chromium firefox webkit
npm run validate
npm run test:content
npm run test:e2e
npm run test:dev
npm run test:reuse
```

บน Linux CI ใช้ `npx playwright install --with-deps chromium firefox webkit`
Playwright ใช้ preview port 4325 และไม่ใช้ server เก่าร่วม เพื่อไม่ให้ทดสอบ build คนละชุดโดยไม่รู้ตัว
หากเปิด preview ของโปรเจกต์นี้อยู่ ให้หยุดด้วย `npx astro preview stop` ก่อนรัน E2E
ต้อง build และทดสอบด้วย `SITE_URL` / `BASE_PATH` ชุดเดียวกัน
รัน E2E และ reuse ตามลำดับ ไม่รันพร้อมกัน เพราะใช้ preview port 4325 และคลิปบอร์ดระบบร่วมกัน
Dev regression ใช้ port 4336 และติดตั้ง dependencies ใน temporary fixture ไม่แก้เนื้อหาในโปรเจกต์จริง

E2E ตรวจหน้าแรก ธีม เมนูเดียวบนมือถือ ค้นหา บทก่อนหน้า–ถัดไป คีย์บอร์ด contrast
จอแคบ 320px, reduced motion, ปิด JavaScript, storage ถูกบล็อก, metadata และ 404
ตรวจการโหลดกรอบโค้ดและปุ่ม Copy ทุก browser; อ่านคลิปบอร์ดจริงใน Chromium ทั้งคีย์บอร์ดและ touch context เพื่อไม่ให้หลาย browser เขียนคลิปบอร์ดระบบทับกัน
ทดสอบ permission denied/retry ด้วย clipboard stub ทุก browser; ไม่ใช่หลักฐานว่าคลิปบอร์ดจริงผ่านทุกระบบปฏิบัติการ
ทดสอบ reflow ด้วย CSS viewport เทียบเท่า zoom 200%/400% และตัวอักษรขยายใน mobile layout; ยังต้องตรวจ browser zoom จริงด้วยคน
ผลลัพธ์ screenshot/trace อยู่ใน temporary directory ไม่อยู่ใน repository

Reuse test ใช้ `npm ci` ในโฟลเดอร์ใหม่ แทน config/เนื้อหาเป็น C# หนึ่งบทและ Python 30 บท
ตรวจชื่อยาว เปลี่ยนหมวด MDX, code/table กว้าง, draft และการซ่อนคู่มือ ทั้ง root/subpath
คง component และ core tests เดิมไว้ โดยไม่ใช้ symlink ของ node_modules
โฟลเดอร์ทดลองถูกเก็บไว้ให้ตรวจสอบและลบเองได้ตาม path ที่คำสั่งรายงาน

### Performance budget

UI assets ใน `dist/_astro` จำกัด JavaScript 120 KiB gzip, CSS 50 KiB gzip และ WOFF2 150 KiB
ไม่รวมเนื้อหา รูปในบท และ search index ซึ่งโตตามแต่ละเล่ม; budget นี้ไม่ใช่การรับรองความเร็ว
คำสั่งวัด performance ใช้ Chromium ขนาด 390×844, cold cache, CPU ช้าลง 4 เท่า, 1.6 Mbps และ latency 150ms
รายงานค่ามัธยฐาน 3 รอบของ FCP/LCP และ layout shift ช่วงโหลดแรก ไม่ใช่ Lighthouse score หรือ Core Web Vitals จากผู้ใช้จริง
ควรวัดบน URL ที่ deploy แล้วอีกครั้งเมื่อเพิ่มฟอนต์ รูป หรือบทจำนวนมาก

## GitHub Pages

Workflow ตรวจ PR โดยไม่ deploy และจะ deploy เมื่อ push `main` หรือเรียก workflow เอง
งาน build/deploy ต้องรอ unit, type-check, links, content (ถ้ามี), E2E และ reuse tests ผ่านก่อน
รวมการทดสอบ dev lifecycle และขนาด assets ก่อนส่งขึ้น Pages ด้วย

ตั้งค่า **Settings → Pages → Build and deployment → Source: GitHub Actions**
ค่า site/base อนุมานจาก `GITHUB_REPOSITORY` โดยอัตโนมัติ:

- project repository: `https://owner.github.io/repository/`
- `owner.github.io`: URL ราก ไม่เพิ่มชื่อ repo

สำหรับ custom domain ให้ตั้ง **Actions repository variables** (ไม่ใช่ secrets):

- `SITE_URL`: origin เท่านั้น เช่น `https://books.example.com`
- `BASE_PATH`: `/` หรือ subpath เช่น `/my-book`

ตั้ง custom domain ใน Pages settings และ DNS ให้ตรงกันด้วย
อย่าใส่ path ใน SITE_URL และอย่าเก็บ token/password ใน config หรือเนื้อหา
`.env.*` ถูก ignore ยกเว้น `.env.example`; ชื่อที่ขึ้นต้นด้วย PUBLIC อาจถูกเผยแพร่ไปยัง browser

ทดลอง subpath ใน PowerShell:

```powershell
$env:SITE_URL = 'https://books.example.com'
$env:BASE_PATH = '/my-book'
npm run validate
npm run test:e2e
Remove-Item Env:SITE_URL, Env:BASE_PATH
```

## ก่อนเผยแพร่จริง

- ตรวจชื่อ ผู้เขียน โค้ดหน้าปก หมวด และบททั้งหมด
- ตรวจคำสั่งในเนื้อหาบนเครื่องสะอาดและเครื่องมือเวอร์ชันที่หนังสือระบุ
- ตรวจ desktop/mobile ทั้งสว่างและมืด รวมถึงคีย์บอร์ดและ screen reader ที่ใช้งานจริง
- ตรวจ config production, GitHub Actions และ URL หลัง deploy
- ชุดทดสอบอัตโนมัติช่วยป้องกัน regression แต่ไม่รับรองว่าปราศจากบั๊กหรือผ่าน WCAG ทุกข้อ
- ไม่มี backend, login, analytics หรือระบบขายหนังสือใน template นี้

หาก deploy แล้วพบ regression ให้ revert commit ที่เป็นสาเหตุผ่าน Git/PR แล้วรอ workflow ตรวจและ deploy ใหม่
ไม่ใช้ force-push หรือแก้ไฟล์ใน `dist` เพื่อแก้ production เพราะ build ครั้งถัดไปจะทับไฟล์เหล่านั้น

## License

MIT © Premix Labs สำหรับ source template เดิม ต้องคงข้อความลิขสิทธิ์และใบอนุญาตเดิมไว้
สามารถเพิ่มลิขสิทธิ์ของงานดัดแปลงได้ ส่วนสิทธิ์ของเนื้อหาหนังสือที่เขียนใหม่ให้ระบุแยกตามความเหมาะสม
