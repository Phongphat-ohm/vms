<!-- BEGIN:nextjs-agent-rules -->

## This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

# กฎและแนวทางการทำงานสำหรับ AI Agents (AI Agent Engineering Guidelines)
## Smart Village Management System (VMS) — ระบบบริหารหมู่บ้านอัจฉริยะ

---

## 1. กฎเหล็กด้านความปลอดภัยและสถาปัตยกรรม (Core Architectural Invariants)

AI Agents ทุกตัวที่เข้ามามีส่วนร่วมในการพัฒนาหรือแก้ไขระบบ VMS **ต้องปฏิบัติตามกฎต่อไปนี้อย่างเคร่งครัดโดยไม่มีข้อยกเว้น**:

1. **ห้ามเริ่มเขียน Application Code, API หรือ Database Migration โดยไม่ได้รับคำสั่งอนุมัติอย่างชัดเจนจากผู้ใช้**
2. **รักษาความลับของเลขประจำตัวประชาชน (National ID)**:
   - ห้ามเก็บเลขบัตรประชาชนแบบ Plaintext ในฐานข้อมูลเด็ดขาด
   - บันทึกเฉพาะ `national_id_encrypted` (AES-256-GCM) และ `national_id_bindex` (HMAC-SHA256) พร้อม `national_id_masked`
   - ห้ามบันทึกเลขบัตรประชาชนตัวเต็มลงใน Console Log, Error Stack Trace หรือ Audit Log
3. **Multi-Village Scoping**:
   - ทุกคำสั่ง Query ใน Business Domain ต้องมี `village_id` กำกับเสมอ
   - ห้ามปล่อยให้เกิดช่องโหว่ Cross-Village Data Leakage หรือ IDOR
4. **Server-Side Authorization (Deny by Default)**:
   - ห้ามพึ่งพาเพียงการซ่อนปุ่มบน UI ทุก Server Action และ Route Handler ต้องเรียก `assertPermission(...)` เสมอ
5. **Data Integrity via Transactions**:
   - การย้ายบุคคล, การเปลี่ยนหัวหน้าครัวเรือน หรือการเปลี่ยนแปลงสมาชิกในครัวเรือน ต้องทำงานภายใน Prisma Transaction (`prisma.$transaction`) เสมอ
   - ห้ามลบข้อมูลประวัติการย้ายใน `household_events`
6. **Next.js 16 Standards**:
   - ปฏิบัติตามแนวทางของ Next.js 16 (App Router, Server Actions, Server Components) อย่างถูกต้อง ตรวจสอบเอกสารใน `node_modules/next/dist/docs/` เสมอเมื่อไม่มั่นใจ

---

## 2. มาตรฐานการจัดระเบียบไฟล์และโค้ด (Code & File Conventions)

### 2.1 โครงสร้างของแต่ละ Business Module (`src/modules/<name>/`)
เมื่อได้รับคำสั่งให้สร้างหรือแก้ไขโมดูล ให้รักษาโครงสร้างมาตรฐานดังนี้:
- `types.ts`: Interface และ Type definitions ของโดเมน
- `schemas.ts`: Zod Schemas สำหรับ Input Validation และ Check Digit
- `service.ts`: Business Logic, กฎทางธุรกิจ (เช่น การเข้ารหัส, คำนวณอายุ), จัดการ Prisma Queries และ Audit Log
- `actions.ts`: Next.js Server Actions ที่ตรวจสอบ Session & Permission ก่อนส่งต่อไปยัง Service
- `repository.ts` *(ทางเลือก / Optional)*: แยกใช้เฉพาะเมื่อมี Database Query ซับซ้อนสูง เช่น Raw SQL, Multi-table Reporting หรือ Complex Aggregations เพื่อไม่ให้เกิด Shallow Pass-through ตาม Deletion Test
- `__tests__/`: ชุดทดสอบ Unit/Integration ประจำโมดูล

### 2.2 กฎการนำเข้าโมดูล (Import & Dependency Rules)
- ห้ามเกิด Circular Dependencies
- หากโมดูลภายนอกต้องการข้อมูล ให้เรียกผ่าน `service.ts` หรือ `actions.ts` ห้ามเรียกข้ามไปยัง `repository.ts` ของโมดูลอื่นโดยตรง
- ใช้ Absolute Import ผ่าน Alias `@/` เช่น `@/modules/population/service`

---

## 3. มาตรฐานการจัดการข้อผิดพลาดและผลลัพธ์ (Error Handling & Responses)

- ส่งค่ากลับจาก Server Actions ในรูปแบบ Unified Envelope เสมอ:
  - สำเร็จ: `{ success: true, data: ..., message?: string }`
  - ผิดพลาด: `{ success: false, error: { code: string, message: string, details?: any[] } }`
- ใช้ Custom Exceptions ที่กำหนดไว้ใน `src/lib/exceptions.ts`:
  - `UnauthorizedException`
  - `ForbiddenException`
  - `ValidationException`
  - `NotFoundException`
  - `ConflictException`

---

## 4. ข้อกำหนดการทดสอบ (Testing Requirements)

- ก่อนส่งมอบงานในแต่ละ Phase ตัวแทน AI ต้องรันและผ่านชุดทดสอบ:
  - Unit Tests สำหรับ Crypto และ Validation Schemas
  - Integration Tests สำหรับ RBAC Permission Guards และ Multi-Village Isolation
- ห้ามลบหรือข้าม (Skip) Test Case เดิมที่มีอยู่โดยไม่มีเหตุผลทางสถาปัตยกรรมที่ชัดเจน

---

## 5. กฎการปรับปรุงเอกสาร (Documentation Sync Rules)

- หากมีการแก้ไข Schema, API, สิทธิ์ (Permission Registry) หรือข้อกำหนดทางธุรกิจ ให้ปรับปรุงเอกสารที่เกี่ยวข้องในไดเรกทอรี `docs/` ให้ตรงกันทันที
- เอกสารอ้างอิงหลักทั้ง 12 ฉบับใน `docs/`:
  1. `docs/REQUIREMENTS.md`
  2. `docs/ARCHITECTURE.md`
  3. `docs/DATABASE.md`
  4. `docs/SECURITY.md`
  5. `docs/PERMISSIONS.md`
  6. `docs/API.md`
  7. `docs/UI-UX.md`
  8. `docs/MODULES.md`
  9. `docs/DEVELOPMENT_PLAN.md`
  10. `docs/TESTING.md`
  11. `docs/DEPLOYMENT.md`
  12. `AGENTS.md`

---

## 6. รายงานวิเคราะห์สถาปัตยกรรมระดับลึก (Codebase Architecture Deepen Report)

> *ผลจากการใช้ทักษะ `codebase-architecture` ในโหมด Deepen เพื่อวิเคราะห์โครงสร้าง โมดูล ความซ้ำซ้อน และการแยกหน้าที่ความรับผิดชอบ (Separation of Concerns)*

### 6.1 พจนานุกรมโดเมน (Domain Glossary)
- **`Person` (ประชากร)**: เอนทิตีบุคคลผู้อยู่อาศัยในหมู่บ้าน (`src/modules/population/`) ซึ่งมีข้อมูลคุ้มครอง PDPA ได้แก่ `national_id_encrypted` (AES-256-GCM), `national_id_bindex` (HMAC-SHA256 Blind Index) และ `national_id_masked` (`1-xxxx-xxxxx-12-3`) พร้อมสถานะชีวิต (`ALIVE` / `DECEASED`)
- **`House` (ทะเบียนบ้าน / หลังคาเรือน)**: สิ่งปลูกสร้างและที่ตั้งตามทะเบียนราษฎร (`src/modules/households/`) ระบุด้วย `houseNumber` (เช่น 12 หรือ 45/1) ร่วมกับ `subHouseNumber` และพิกัด GPS (`latitude`, `longitude`)
- **`HouseholdMember` (สมาชิกในครัวเรือน)**: ความสัมพันธ์ระหว่าง `Person` กับ `House` กำกับด้วยสถานะหัวหน้าครัวเรือน (`isHead`), ความสัมพันธ์ (`relationship`) และประเภทการอยู่อาศัย (`residenceType`: `OFFICIAL` ตาม ท.ร.14, `ACTUAL_RESIDENT` อาศัยจริงแต่ไม่มีชื่อ, `OFFICIAL_ABSENT` มีชื่อแต่ตัวไม่อยู่)
- **`HouseholdEvent` (ประวัติการย้าย)**: บัญชีประวัติแบบบันทึกต่อเนื่องห้ามลบ (Append-only Ledger) บันทึกทุกเหตุการณ์ย้ายเข้า, ย้ายออก, โอนย้าย หรือเปลี่ยนสถานะ
- **`Village` (หมู่บ้าน / Tenant)**: ขอบเขต Multi-tenancy สูงสุด ข้อมูลเชิงธุรกิจทุกคำสั่งต้องถูกจำกัดขอบเขตด้วย `village_id` เสมอ
- **`Security PIN` (รหัสพินความปลอดภัย)**: รหัสยืนยันตัวตน 6 หลักประจำตัวผู้ใช้แต่ละคน เข้ารหัสด้วย PBKDF2/SHA-512 พร้อม Salt สุ่ม 16 bytes ใช้ยืนยันการทำธุรกรรมความปลอดภัยสูง (เปิดดูเลขบัตรประชาชนตัวเต็ม, เปลี่ยนรหัสผ่าน)
- **`AuditLog` (บันทึกประวัติการใช้งาน)**: ตารางประวัติการทำงานส่วนกลาง (`src/modules/audit/`) บันทึกผู้ใช้, เวลา, IP Address, Entity, Action และการเปลี่ยนแปลง ป้องกันการปฏิเสธความรับผิดชอบ
- **`Document / File` (เอกสารแนบ)**: เอกสารราชการและหลักฐานแนบ (`src/modules/documents/`) จัดเก็บผ่าน Storage Provider พร้อมระบบ Signed URL ป้องกันการเข้าถึงโดยตรง

---

### 6.2 ขอบเขตโมดูลและสัญญาของแต่ละชั้น (Module Boundaries & Layer Contracts)

ระบบจัดโครงสร้างตามหลัก Layered Architecture แบ่งเป็น 4 ระดับอย่างชัดเจน:

1. **Presentation Layer (`src/app/`, `src/components/`)**:
   - หน้าจอ UI (App Router Pages) และ Components โต้ตอบกับผู้ใช้
   - **กฎเหล็ก**: นำเข้าเฉพาะ `@/modules/<name>/actions` และ `@/modules/<name>/types` เท่านั้น
   - **ข้อห้าม**: ห้ามนำเข้า `prisma` หรือเรียกฟังก์ชันใน `service.ts` หรือ `repository.ts` โดยตรงจาก Component หรือ Page
2. **Transport Layer (`src/modules/<name>/actions.ts` และ `src/app/api/`)**:
   - ทำหน้าที่รับ Payload จาก Client, ตรวจสอบ HTTP Headers/Cookies
   - เรียกใช้ `assertPermission(permissionCode, villageId)` เสมอเพื่อตรวจสอบสิทธิ์แบบ Server-Side
   - ทำ Input Validation ผ่าน Zod Schema จาก `schemas.ts`
   - ส่งต่อข้อมูลที่ผ่านการตรวจสอบแล้วไปยัง `service.ts` และห่อหุ้มผลลัพธ์ในรูปแบบ `ActionResponse<T>`
3. **Domain Service Layer (`src/modules/<name>/service.ts`)**:
   - บรรจุ Business Logic, Invariants, การคำนวณ, การเข้ารหัส และการบันทึก Audit Log
   - จัดการ Prisma Database Queries และ Transactions (`prisma.$transaction`)
   - ไม่รับผิดชอบเรื่อง HTTP Request/Response, Cookie หรือ Header โดยตรง
4. **Core Infrastructure & Security (`src/lib/`)**:
   - รวบรวม Utilities และ Engines พื้นฐาน เช่น `crypto.ts`, `permissions.ts`, `security-pin.ts`, `formatters.ts`, `date-utils.ts`, `storage.ts`, `prisma.ts`

---

### 6.3 ทิศทาง Dependencies และกฎป้องกัน Coupling

- **Unidirectional Dependency Flow**:
  - `UI` &rarr; `actions.ts` &rarr; `service.ts` &rarr; `prisma` / `lib`
  - ทุกโมดูลธุรกิจสามารถเรียกใช้งาน `recordAuditLog` จาก `@/modules/audit/service` ได้ในทิศทางเดียว (Unidirectional)
- **ห้าม Circular Dependency ข้ามโมดูล**:
  - หากโมดูล A ต้องการข้อมูลของโมดูล B ต้องเรียกผ่าน `service.ts` ของโมดูล B ห้ามเรียกข้ามไปยังตารางฐานข้อมูลโดยตรง
- **API Route Handlers (`src/app/api/`)**:
  - ต้องทำหน้าที่เป็นเพียง Transport Adapter เช่นเดียวกับ Server Actions โดยต้องส่งต่อ Business Logic, การตรวจสิทธิ์ และการบันทึก Audit ให้กับ `service.ts` ของโมดูลที่เกี่ยวข้อง ห้ามรันคำสั่ง Prisma Query หรือเช็ค Logic เองโดยตรงใน Route Handler

---

### 6.4 การขจัด Code Duplication และ Canonical Helper Registry

เพื่อไม่ให้เกิดการกระจายตัวของ Business Logic และกฎทางธุรกิจ ระบบกำหนด Canonical Helpers กลางที่ทุกคนต้องใช้ร่วมกัน:

| หน้าที่การทำงาน | ฟังก์ชันกลาง (Canonical Helper) | ตำแหน่งไฟล์ | ข้อกำหนด |
|---|---|---|---|
| **ทำความสะอาดเบอร์โทร** | `cleanDigits(value)` | `src/lib/formatters.ts` | แปลงเบอร์เป็นตัวเลขล้วน (เช่น `0812345678`) ก่อนจัดเก็บใน Database เสมอ |
| **แสดงผลเบอร์โทรศัพท์** | `formatThaiPhoneNumber(value)` | `src/lib/formatters.ts` | แสดงผลในรูปแบบ `08X-XXX-XXXX` หรือ `02-XXX-XXXX` บน UI |
| **คำนวณอายุจากวันเกิด** | `calculateAge(birthDate)` | `src/lib/date-utils.ts` | คำนวณอายุเต็มปีอย่างแม่นยำ ไม่เขียน logic คำนวณปีซ้ำใน UI หรือ Service |
| **การปิดบังเลขบัตร (Masking)** | `maskNationalId(id)` | `src/lib/crypto.ts` | ปิดบังเป็น `1-xxxx-xxxxx-12-3` ตามมาตรฐาน PDPA |
| **การเข้ารหัสและสร้างดัชนี** | `encryptNationalId`, `computeBlindIndex` | `src/lib/crypto.ts` | ใช้ AES-256-GCM สำหรับ Ciphertext และ HMAC-SHA256 สำหรับ Blind Index |
| **การตรวจสิทธิ์และขอบเขตหมู่บ้าน** | `assertPermission(code, villageId)` | `src/lib/permissions.ts` | ตรวจสอบ Role, Granular Permission และ Tenant Village พร้อมกัน |
| **เครื่องยนต์ตรวจสอบ Security PIN** | `verifyUserSecurityPin`, `setUserSecurityPin` | `src/lib/security-pin.ts` | ตรวจสอบรหัส PIN 6 หลักแยกรายผู้ใช้ด้วย PBKDF2/SHA-512 |

---

### 6.5 โอกาสการปรับปรุงสถาปัตยกรรมระดับลึก (Ranked Deepening Opportunities)

จากการตรวจค้นโครงสร้างโปรเจกต์ทั้งหมด พบโอกาสในการทำ Deepening ที่จัดลำดับตามผลตอบแทน (Leverage) ดังนี้:

#### 1. [Misplaced Logic / Leaking Seam] สกัด Auth Service ออกจาก Transport Actions
- **ข้อตรวจพบ**: ใน `src/modules/auth/actions.ts` มีการรันคำสั่ง `prisma.user.findFirst`, ประกอบ Token JWT, และประมวลผลสิทธิ์โดยตรงใน Action โดยที่โมดูล `auth` ไม่มีไฟล์ `service.ts`
- **ผลกระทบทางโดเมน**: Logic การพิสูจน์ตัวตนผูกติดกับ Next.js Cookies ทำให้ไม่สามารถทำ Unit Test แยกส่วนได้ง่าย
- **ระดับ Leverage**: **สูง (High)** — ช่วยให้การทดสอบ Auth เป็น In-process Unit Test ได้ทันที และรักษา Seam ความสม่ำเสมอกับโมดูลอื่น
- **แนวทางแก้ไข**: สร้าง `src/modules/auth/service.ts` เพื่อย้ายฟังก์ชัน `authenticateUserCredentials` และ `switchVillageContext` ไปไว้ใน Service แล้วให้ `actions.ts` ทำหน้าที่เฉพาะอ่าน/เขียน Cookies

#### 2. [Leaking Seam] ย้าย Logic ใน Download Route Handler ไปยัง `documents/service.ts`
- **ข้อตรวจพบ**: ไฟล์ `src/app/api/documents/[id]/download/route.ts` มีการนำเข้า `prisma` โดยตรง และรันคำสั่งค้นหาไฟล์ ตรวจ Village Tenant ตลอดจนบันทึก Audit Log ภายในไฟล์ Route
- **ผลกระทบทางโดเมน**: หากระบบมี Background Worker หรือ Batch Export ในอนาคตที่ต้องการเข้าถึงไฟล์ จะไม่สามารถใช้ Logic การตรวจสอบความปลอดภัยนี้ร่วมกันได้
- **ระดับ Leverage**: **สูง (High)** — ป้องกันการรั่วไหลของ Seam ฐานข้อมูลเข้าไปใน HTTP Route Handlers
- **แนวทางแก้ไข**: เพิ่มเมธอด `getAuthorizedDocumentFile(fileId, session, token)` ใน `src/modules/documents/service.ts` แล้วให้ Route Handler เรียกใช้งานแทน

#### 3. [Duplicated Concept] ตัวจัดการข้อผิดพลาดมาตรฐาน `formatActionError`
- **ข้อตรวจพบ**: ทุกไฟล์ `actions.ts` มีโค้ดบล็อก `try { ... } catch (error: any) { return { success: false, error: ... }; }` ที่คัดลอกซ้ำกันกว่า 15 ครั้ง
- **ผลกระทบทางโดเมน**: การแม็พ Error Code และ Details มีความเสี่ยงต่อการหลุดหรือไม่สม่ำเสมอ
- **ระดับ Leverage**: **ปานกลาง (Medium)** — ลด Boilerplate โค้ดได้กว่า 150 บรรทัด และรับประกันว่า Error Structure จะเป็นไปตาม Unified Envelope 100%
- **แนวทางแก้ไข**: สร้างฟังก์ชันกลาง `formatActionError(error: unknown): ActionResponse<never>` ใน `src/lib/exceptions.ts` หรือ `src/lib/actions.ts`

#### 4. [Architecture Alignment] ปรับความชัดเจนของ `repository.ts` ตามเกณฑ์ Deletion Test
- **ข้อตรวจพบ**: ในระเบียบข้อ 2.1 เดิมระบุว่าต้องมี `repository.ts` ทุกโมดูล แต่โค้ดจริงใช้ Prisma Query ใน `service.ts` ทั้งหมด
- **ผลกระทบทางโดเมน**: การสร้าง `repository.ts` ที่เป็นเพียง Pass-through 1:1 ครอบ `prisma.person.findUnique` จะไม่ผ่าน Deletion Test (เพิ่มความลึกจอมปลอมและเพิ่มไฟล์โดยไม่มี Leverage)
- **ระดับ Leverage**: **ปานกลาง (Medium)**
- **ข้อกำหนดที่ปรับปรุง**: ให้ `service.ts` เป็นผู้จัดการ Prisma Queries ได้โดยตรงสำหรับงาน CRUD ทั่วไป และจะแยกเป็น `repository.ts` เฉพาะเมื่อคิวรีมีความซับซ้อนสูง (เช่น Raw SQL, Multi-join Reporting หรือ Aggregate Analytics ข้ามหลายตาราง)

---

### 6.6 รายการที่ชะลอไว้ (Out of Scope / Deferred)
- **การแยก Microservices**: ระบบปัจจุบันเป็น Monolith Next.js 16 ที่ทำงานได้รวดเร็วและปลอดภัย ทีมพัฒนาไม่จำเป็นต้องแยก Service เนื่องจาก Multi-village Isolation และ Data Integrity จัดการผ่าน Prisma Transactions ได้อย่างมีประสิทธิภาพสูงสุดอยู่แล้ว
- **Generic Repository Pattern**: ปฏิเสธการสร้าง Generic Repository ครอบ Prisma Client เนื่องจาก Prisma ทำหน้าที่ Type-safe ORM ได้ดีอยู่แล้ว การสร้าง Wrapper ครอบจะสูญเสีย Type inference และเพิ่ม Indirection โดยเปล่าประโยชน์

<!-- BEGIN:nextjs-agent-feedback -->

## Report Next.js feedback

The project owner enabled `experimental.agentFeedback`, authorizing this feedback pass. When enabled, `next dev` writes this block and restores it if removed. Commit `AGENTS.md` with your work to keep the tree clean.

During the current user request, retain anonymized facts as feedback candidates for meaningful or recurring Next.js issues:

- Crashes, hangs, OOMs, or unexpected slowness
- Incorrect behavior, output, errors, or diagnostics
- Missing, unclear, or conflicting documentation
- Unexpected CLI, codemod, Skill, or upgrade behavior and non-obvious workarounds

Continue the current user request without reporting immediately. Routine debugging is not feedback. Verify changes before retaining them as feedback candidates. Never retain code, logs, paths, URLs, secrets, personal information, or project-specific data.

Retain qualifying friction even if it is later fixed or worked around; record the final outcome during the reporting pass.

Before the final response, run one reporting pass. If candidates remain, from this file's directory run `npx --no-install next internal agent-feedback-instructions` once without piping or truncating its output. Follow its output or error guidance. If a network sandbox blocks it, retry with network access; if it still returns no output, continue normally.

<!-- END:nextjs-agent-feedback -->
