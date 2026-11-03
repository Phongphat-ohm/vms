# ระบบบริหารหมู่บ้านอัจฉริยะ (Smart Village Management System - VMS)

แพลตฟอร์มศูนย์กลางการบริหารจัดการหมู่บ้านและชุมชนอัจฉริยะ (Unified Smart Village Management Hub) ที่รวบรวมหลากหลายระบบงานของชุมชนเข้าไว้ด้วยกันในจุดเดียว พัฒนาด้วยเทคโนโลยีเว็บสมัยใหม่ ภายใต้มาตรฐานความมั่นคงปลอดภัยสารสนเทศและการคุ้มครองข้อมูลส่วนบุคคล (PDPA)

---

## 🏛️ ภาพรวมและเป้าหมายระบบ (System Vision)

ระบบบริหารหมู่บ้านอัจฉริยะ (Smart Village Management System - VMS) ถูกออกแบบมาเพื่อเป็นศูนย์รวมระบบงานของหมู่บ้านดิจิทัล โดยมีระบบงานแกนหลัก (Foundational Core Systems):

1. **ระบบทะเบียนประชากรดิจิทัล (Digital Population Registry)**: จัดการข้อมูลประชากรรายบุคคล เข้ารหัสข้อมูลอ่อนไหวตามกฎหมาย PDPA (AES-256-GCM + HMAC-SHA256 Blind Index)
2. **ระบบบ้านและผังครัวเรือน (Households & Residence Mapping)**: บริหารจัดการสำมะโนทะเบียนบ้าน ผังครัวเรือน หัวหน้าครัวเรือน และประวัติการย้ายถิ่นฐาน (ACID Transactions)
3. **ระบบคลังเอกสารและหลักฐานชุมชน (Community Document Storage)**: จัดเก็บเอกสารราชการชุมชนและไฟล์หลักฐานอย่างปลอดภัย ผ่าน Signed URL Engine
4. **ระบบความปลอดภัยและการควบคุมสิทธิ์ (Security & Granular RBAC)**: ควบคุมสิทธิ์การเข้าถึงแบบละเอียดรายฟังก์ชัน พร้อมยืนยันตัวตนด้วย Security PIN 6 หลักสำหรับธุรกรรมสำคัญ
5. **ระบบบันทึกประวัติการตรวจสอบ (Append-only Audit Trail)**: บันทึกทุกความเคลื่อนไหวและการเข้าถึงข้อมูล ป้องกันการแก้ไขหรือลบประวัติ

> 💡 **ความยืดหยุ่นในการขยายระบบ (Extensible Architecture)**: โครงสร้างของระบบรองรับการเชื่อมต่อกับระบบย่อยของชุมชนในอนาคต เช่น ระบบกองทุนหมู่บ้านและสัจจะออมทรัพย์, ระบบประปาชุมชน, และระบบกระจายข่าวสารแจ้งเตือนภัย

---

## 🚀 เทคโนโลยีหลักที่ใช้ (Technology Stack)

- **Framework**: [Next.js 16](https://nextjs.org/) (App Router, Turbopack, Server Actions, Server Components)
- **Language**: TypeScript (Strict Mode)
- **Database & ORM**: PostgreSQL 15+ บน [Prisma ORM](https://www.prisma.io/)
- **Backend & Storage**: [Supabase Suite (Self-hosted)](https://supabase.com/) (GoTrue Auth, Storage Engine)
- **Styling & UI**: Tailwind CSS, Lucide React, SweetAlert2 (Customized "Modern Civic Workspace")
- **Testing**: [Vitest](https://vitest.dev/) Unit & Integration Testing

---

## 🛠️ การติดตั้งและเริ่มต้นใช้งาน (Getting Started)

### 1. ติดตั้ง Dependencies
```bash
npm install
```

### 2. ตั้งค่า Environment Variables
สำเนาไฟล์ `.env.example` เป็น `.env` และกำหนดค่าการเชื่อมต่อฐานข้อมูล
```bash
cp .env.example .env
```

### 3. รัน Database Migration
```bash
npx prisma migrate deploy
```

### 4. รันระบบสำหรับการพัฒนา (Development Server)
```bash
npm run dev
```
เปิดบราวเซอร์ที่ [http://localhost:3000](http://localhost:3000)

### 5. การทดสอบและการตรวจสอบโค้ด (Testing & Quality)
```bash
npm test        # รัน Vitest Unit & Integration Tests (39 tests)
npm run build   # คอมไพล์ Production Build
```

---

## 📚 เอกสารสถาปัตยกรรมระบบ (Documentation)

รายละเอียดข้อกำหนดและสถาปัตยกรรมระบบทั้งหมดถูกจัดเก็บในไดเรกทอรี `docs/`:
- [`docs/REQUIREMENTS.md`](docs/REQUIREMENTS.md) — ข้อกำหนดเชิงฟังก์ชันและความต้องการของระบบ
- [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md) — ภาพรวมสถาปัตยกรรม Modular Monolith
- [`docs/MODULES.md`](docs/MODULES.md) — ขอบเขตความรับผิดชอบของแต่ละโมดูล
- [`docs/DATABASE.md`](docs/DATABASE.md) — แบบจำลองข้อมูลและพจนานุกรมข้อมูล (Data Dictionary)
- [`docs/SECURITY.md`](docs/SECURITY.md) — สถาปัตยกรรมความมั่นคงปลอดภัยและการเข้ารหัสตามมาตรฐาน PDPA
- [`docs/PERMISSIONS.md`](docs/PERMISSIONS.md) — เมทริกซ์สิทธิ์และการควบคุมการเข้าถึง (RBAC)
- [`docs/API.md`](docs/API.md) — สัญญาและโครงสร้างผลลัพธ์ของ Server Actions และ APIs
- [`docs/UI-UX.md`](docs/UI-UX.md) — ข้อกำหนดการออกแบบประสบการณ์และส่วนต่อประสานผู้ใช้
- [`docs/TESTING.md`](docs/TESTING.md) — กลยุทธ์และชุดการทดสอบระบบ
- [`docs/DEPLOYMENT.md`](docs/DEPLOYMENT.md) — คู่มือการติดตั้งบนเซิร์ฟเวอร์ VPS ด้วย Docker
- [`DESIGN.md`](DESIGN.md) — ดีไซน์ซิสเต็มและ Token สี Modern Civic Workspace
