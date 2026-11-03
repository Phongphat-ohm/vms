# แผนการพัฒนาและแผนงานตามระยะ (Development Roadmap & Phase Planning)
## Smart Village Management System (VMS) — ระบบบริหารหมู่บ้านอัจฉริยะ

---

## 1. ลำดับระยะการพัฒนา (Development Phases Overview)

การพัฒนา VMS ถูกจัดลำดับตามหลักการ **Security & Infrastructure First** เพื่อให้โครงสร้างความปลอดภัย สิทธิ์ และโมเดลข้อมูลมีความมั่นคง ก่อนเริ่มพัฒนาส่วนจัดการข้อมูลประชากรและส่วนติดต่อผู้ใช้งาน:

```
[Phase 1] โครงสร้างพื้นฐานและฐานข้อมูล (Foundation & Infrastructure)
    ↓
[Phase 2] ระบบยืนยันตัวตนและการควบคุมสิทธิ์ (Authentication & RBAC)
    ↓
[Phase 3] ข้อมูลหมู่บ้านและการจัดการผู้ใช้งาน (Village Settings & Users)
    ↓
[Phase 4] การจัดการบ้าน ครัวเรือน และการย้าย (House & Household Management)
    ↓
[Phase 5] การจัดการข้อมูลประชากรและการเข้ารหัส (Population Management & PDPA)
    ↓
[Phase 6] การจัดการไฟล์และคลังเอกสาร (Document & Storage Management)
    ↓
[Phase 7] การบันทึกประวัติการดำเนินงานและแดชบอร์ด (Audit Logs & Dashboard)
    ↓
[Phase 8] การทดสอบความมั่นคงปลอดภัยและการขึ้นระบบ (Hardening, QA & Deployment)
```

---

## 2. รายละเอียดแต่ละระยะการพัฒนา (Phase Breakdown)

### Phase 1: โครงสร้างพื้นฐานและฐานข้อมูล (Foundation & Infrastructure)
- **วัตถุประสงค์**: ติดตั้งและกำหนดค่าสภาพแวดล้อมการพัฒนา, เชื่อมต่อ PostgreSQL, ติดตั้ง Supabase Docker Stack บน VPS จำลอง และตั้งค่า Prisma ORM
- **ขอบเขตงาน (Scope)**:
  - กำหนดค่า Next.js 16 (App Router, Tailwind CSS, TypeScript Strict Mode)
  - เขียน `prisma/schema.prisma` ครบทุกตารางตาม Data Dictionary
  - ทำการ Seed ข้อมูลสิทธิ์เริ่มต้น (System Roles & Permissions)
  - พัฒนา Crypto Utility (`src/lib/crypto.ts`) สำหรับ AES-256-GCM และ Blind Index
- **Dependencies**: Docker, PostgreSQL 15+, Bun / Node.js
- **Deliverables**: Prisma migrations พร้อม seed script, โครงสร้างโปรเจกต์ `src/modules/*` และ `src/lib/*`
- **Security Considerations**: ตรวจสอบการตั้งค่า Environment Variables (`FIELD_ENCRYPTION_KEY`, `BLIND_INDEX_PEPPER`) และทดสอบการทำงานของ Crypto Engine
- **Definition of Done (DoD)**: รัน Migration และ Seed สำเร็จ, รัน Unit Test ของ Crypto Engine ผ่าน 100%

---

### Phase 2: ระบบยืนยันตัวตนและการควบคุมสิทธิ์ (Authentication & RBAC)
- **วัตถุประสงค์**: พัฒนาระบบ Identity, Session Management และ Dynamic RBAC Guard
- **ขอบเขตงาน (Scope)**:
  - เชื่อมต่อ Supabase GoTrue Auth
  - พัฒนา Server Session Middleware พร้อม HttpOnly Secure Cookies
  - พัฒนา Server-side Permission Guard (`assertPermission`)
  - พัฒนาหน้าจอเข้าสู่ระบบ (`/login`), ลืมรหัสผ่าน และเปลี่ยนรหัสผ่าน
- **Dependencies**: Phase 1
- **Deliverables**: ระบบ Auth ที่สมบูรณ์พร้อม UI, มิดเดิลแวร์ตรวจสอบ Session และ Guard ตรวจสอบสิทธิ์
- **Acceptance Criteria**: ผู้ใช้สามารถเข้าสู่ระบบและได้รับ Session Cookie ที่ถูกต้อง, บัญชีที่ถูก Deactivate ไม่สามารถเข้าสู่ระบบได้
- **Definition of Done (DoD)**: ผ่านการทดสอบ Integration Test กรณี Login ถูก/ผิด และการปฏิเสธคำขอเมื่อไม่มี Permission

---

### Phase 3: ข้อมูลหมู่บ้านและการจัดการผู้ใช้งาน (Village Settings & Users)
- **วัตถุประสงค์**: จัดการข้อมูลประจำหมู่บ้าน และระบบบริหารจัดการบัญชีเจ้าหน้าที่
- **ขอบเขตงาน (Scope)**:
  - โมดูล `villages` และ `village_settings`
  - โมดูล `users`, `roles` และ `village_user_access`
  - หน้าจอจัดการผู้ใช้, กำหนดบทบาท, มอบหมายสิทธิ์เข้าถึงหมู่บ้าน
  - หน้าจอตั้งค่าข้อมูลหมู่บ้านและตราสัญลักษณ์
- **Dependencies**: Phase 2
- **Security Considerations**: ป้องกัน Privilege Escalation ในขั้นตอนมอบหมาย Role และตรวจสอบ Village Scope
- **Definition of Done (DoD)**: Admin สามารถสร้างผู้ใช้ใหม่, ผูก Role, และเข้าถึงหน้า Settings ได้ตามสิทธิ์

---

### Phase 4: การจัดการบ้าน ครัวเรือน และการย้าย (House & Household Management)
- **วัตถุประสงค์**: จัดการข้อมูลสิ่งปลูกสร้าง, หน่วยครัวเรือน, ความเป็นสมาชิก และการย้ายที่อยู่อาศัย
- **ขอบเขตงาน (Scope)**:
  - โมดูล `households` (Houses, Households, Memberships, Events)
  - หน้าจอรายการบ้าน, รายละเอียดบ้าน, ผังครัวเรือน, และสมาชิก
  - Household Transfer Wizard (กระบวนการย้ายบุคคลเข้า/ออก/สลับบ้าน)
  - บันทึกประวัติศาสตร์การย้ายลง `household_events` ภายใต้ ACID Transaction
- **Dependencies**: Phase 3
- **Acceptance Criteria**: รองรับการแยกแยะสถานะการอยู่อาศัย (ทร.14 vs ผู้อยู่อาศัยจริง), การย้ายบุคคลต้องไม่ทำลายประวัติเดิม และไม่เกิดข้อผิดพลาดของข้อมูล
- **Definition of Done (DoD)**: ผ่าน Integration Tests การย้ายสมาชิกและการแต่งตั้งหัวหน้าครัวเรือน

---

### Phase 5: การจัดการข้อมูลประชากรและการเข้ารหัส (Population Management & PDPA)
- **วัตถุประสงค์**: พัฒนาระบบทะเบียนประชากรรายบุคคล พร้อมมาตรการคุ้มครองข้อมูลอ่อนไหวระดับสูงสุด
- **ขอบเขตงาน (Scope)**:
  - โมดูล `population` (Persons, Blind Index, Sensitive Shield)
  - ฟังก์ชันค้นหาประชากรด้วยชื่อ และค้นหาด้วยเลขบัตรประชาชนผ่าน Blind Index
  - การ Mask เลขบัตรประชาชน (`1-XXXX-XXXXX-XX-X`) ในมุมมองทั่วไป
  - ปุ่มปลดล็อกดูเลขบัตรตัวเต็มสำหรับผู้มีสิทธิ์ พร้อมบันทึก Audit Log อัตโนมัติ
  - หน้าจอรายการประชากร, ฟอร์มเพิ่ม/แก้ไขประชากร, หน้าแสดงประวัติบุคคล
- **Dependencies**: Phase 4
- **Security Considerations**: ตรวจสอบว่าไม่มี Plaintext เลขบัตรประชาชนบันทึกใน Database หรือ Console Logs
- **Definition of Done (DoD)**: เพิ่ม ลบ ค้นหา และแก้ไขข้อมูลประชากรได้ถูกต้อง, ทดสอบ Blind Index Search ทำงานแม่นยำ

---

### Phase 6: การจัดการไฟล์และคลังเอกสาร (Document & Storage Management)
- **วัตถุประสงค์**: จัดเก็บและเรียกดูเอกสารทะเบียนบ้านและเอกสารประจำตัวอย่างปลอดภัย
- **ขอบเขตงาน (Scope)**:
  - เชื่อมต่อ Supabase Private Storage Bucket
  - ฟังก์ชันสร้าง Pre-signed URL สำหรับอัปโหลดและดาวน์โหลด (อายุ 60 วินาที)
  - การตรวจสอบ Magic Bytes ของไฟล์เอกสาร
  - หน้าระบบคลังเอกสารและหน้าแนบเอกสารประจำบุคคล/บ้าน
- **Dependencies**: Phase 5
- **Security Considerations**: ห้าม Public Access, ไฟล์ทั้งหมดต้องผ่านการตรวจสอบสิทธิ์ก่อนออก Signed URL
- **Definition of Done (DoD)**: อัปโหลดและดาวน์โหลดไฟล์เอกสารได้สมบูรณ์, ตรวจสอบว่าไม่สามารถเปิดดูไฟล์โดยตรงจาก Storage URL โดยไม่มีสิทธิ์

---

### Phase 7: การบันทึกประวัติการดำเนินงานและแดชบอร์ด (Audit Logs & Dashboard)
- **วัตถุประสงค์**: บันทึกกิจกรรมทั้งหมดลง Audit Trail และแสดงผลแดชบอร์ดสถิติ
- **ขอบเขตงาน (Scope)**:
  - โมดูล `audit` (Append-only Logger, Safe Delta Sanitization)
  - หน้าจอตรวจสอบ Audit Log และประวัติความปลอดภัย (Security Events)
  - หน้า Dashboard สรุปสถิติประชากร (พีระมิดอายุ, ประชากรจริง vs ทร.14, สถิติครัวเรือน)
- **Dependencies**: Phase 6
- **Acceptance Criteria**: ทุก Action สำคัญมี Log บันทึกครบถ้วน และไม่สามารถลบ Log ได้จาก UI หรือ API
- **Definition of Done (DoD)**: ข้อมูลบน Dashboard แสดงสถิติตรงตามฐานข้อมูลจริง, ตรวจสอบ Audit Log รายการต่างๆ ได้ละเอียด

---

### Phase 8: การทดสอบความมั่นคงปลอดภัยและการขึ้นระบบ (Hardening, QA & Deployment)
- **วัตถุประสงค์**: ทดสอบระบบแบบครบวงจร ปรับปรุงความมั่นคงปลอดภัย และนำระบบขึ้นรันบน Ubuntu VPS
- **ขอบเขตงาน (Scope)**:
  - รัน E2E Testing ด้วย Playwright ครบทุก User Flow
  - ทำ Security Hardening (OWASP Top 10 Audit, Penetration Test Simulation)
  - ตั้งค่า Reverse Proxy (Nginx / Caddy) พร้อม HTTPS และ Security Headers
  - ติดตั้ง Docker Compose บน Ubuntu VPS และทดสอบระบบสำรองข้อมูลอัตโนมัติ (Automated Backup & Restore Drill)
- **Dependencies**: Phase 7
- **Deliverables**: รายงานผลการทดสอบความปลอดภัย, Production Deployment Configuration, คู่มือการปฏิบัติงานของผู้ดูแล
- **Definition of Done (DoD)**: ระบบผ่านเกณฑ์ Acceptance Criteria ทั้งหมด, รันบน VPS ได้อย่างมีเสถียรภาพ และผ่านการซ้อมกู้คืนข้อมูล
