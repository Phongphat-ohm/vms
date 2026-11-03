# กลยุทธ์และข้อกำหนดการทดสอบระบบ (Testing Strategy & Quality Assurance Specification)
## Smart Village Management System (VMS) — ระบบบริหารหมู่บ้านอัจฉริยะ

---

## 1. ปิรามิดการทดสอบ (Test Pyramid Strategy)

ระบบ VMS ใช้กลยุทธ์การทดสอบหลายระดับเพื่อรับประกันความถูกต้อง ปลอดภัย และความน่าเชื่อถือของข้อมูลประชากร:

```
        / \
       /   \      E2E Tests (Playwright) ~ 15%
      / E2E \     - Critical User Flows, Authentication, Household Transfer
     /-------\
    /         \   Integration & Security Tests (Vitest + Test DB) ~ 35%
   /  Integr.  \  - Multi-Village Isolation, RBAC Guard, ACID Transactions
  /-------------\
 /               \ Unit Tests (Vitest) ~ 50%
/   Unit Tests    \ - AES-256 Crypto, Blind Index, Check Digit, Zod Schemas
-------------------
```

---

## 2. การทดสอบระดับหน่วย (Unit Testing with Vitest)

### ขอบเขตการทดสอบ:
1. **Crypto & Blind Index Functions (`src/lib/crypto.ts`)**:
   - ทดสอบการเข้ารหัส AES-256-GCM และถอดรหัสคืนรูปได้ถูกต้อง 100%
   - ทดสอบว่าการเข้ารหัสข้อความเดียวกันสองครั้ง ต้องได้ Ciphertext ต่างกันเสมอ (Random IV verification)
   - ทดสอบว่า Blind Index (HMAC-SHA256) ได้ค่าแฮชคงที่สำหรับค่าตั้งต้นเดียวกัน
   - ทดสอบฟังก์ชัน Masking เลขบัตรประชาชน (`1-XXXX-XXXXX-XX-X`)
2. **Validation Schemas (`src/modules/*/schemas.ts`)**:
   - ทดสอบการตรวจสอบ Check Digit Mod 11 ของเลขประจำตัวประชาชนไทย 13 หลัก
   - ทดสอบการปฏิเสธวันเกิดที่เป็นอนาคต
   - ทดสอบรูปแบบเบอร์โทรศัพท์และรหัสไปรษณีย์
3. **Domain Business Logic**:
   - ทดสอบการคำนวณอายุจากวันเดือนปีเกิด
   - ตรวจสอบกฎการอยู่อาศัย (ทร.14 vs ผู้อยู่อาศัยจริง)

### คำสั่งสำหรับรัน Unit Test:
```bash
bun test tests/unit
# หรือ
npm run test:unit
```

---

## 3. การทดสอบระดับบูรณาการ (Integration Testing with Vitest & Test DB)

ใช้ Test Database (PostgreSQL Test Instance ใน Docker) เพื่อทดสอบตรรกะที่เกี่ยวข้องกับฐานข้อมูลจริง:

1. **Transaction Atomicity & Rollback Testing**:
   - จำลองการย้ายบุคคลระหว่างบ้าน (`transferPersonAction`) หากขั้นตอนบันทึก `household_events` ล้มเหลว ตาราง `household_memberships` ต้อง Rollback สู่สถานะเดิม ไม่เกิดข้อมูลค้าง
2. **Dynamic RBAC & Permission Enforcement**:
   - ทดสอบจำลองผู้ใช้แต่ละบทบาท (`SYSTEM_ADMIN`, `VILLAGE_ADMIN`, `STAFF`, `VIEWER`) เรียกใช้ฟังก์ชันต่าง ๆ
   - ยืนยันว่าเมื่อขาด Permission ที่กำหนด ระบบต้อง Throw `ForbiddenException` ทันที
3. **Tenant & Multi-Village Isolation Testing**:
   - ผู้ใช้หมู่บ้าน A ต้องไม่สามารถ Query หรือ Update ข้อมูลของหมู่บ้าน B ได้ แม้จะระบุ ID ของหมู่บ้าน B ตรง ๆ ในคำขอ
   - ตรวจสอบว่า Prisma Tenant Extension กรองข้อมูลได้ถูกต้อง
4. **Append-Only Audit Verification**:
   - ตรวจสอบว่าทุกคำขอที่เป็น Mutation จะทำให้เกิดเรคคอร์ดใหม่ใน `audit_logs` พร้อมข้อมูล Safe Delta

---

## 4. การทดสอบแบบครบวงจร (End-to-End Testing with Playwright)

ทดสอบการทำงานบนเบราว์เซอร์จริง (Chromium, Firefox, WebKit) ครอบคลุมเส้นทางสำคัญของผู้ใช้:

1. **E2E-AUTH**:
   - กรอกรหัสผ่านผิดซ้ำ 5 ครั้ง -> ระบบต้องล็อกการเข้าใช้งานและแสดงข้อความเตือน
   - เข้าสู่ระบบสำเร็จ -> Redirect สู่หน้า Dashboard ได้ถูกต้อง
2. **E2E-POPULATION**:
   - เจ้าหน้าที่เพิ่มข้อมูลประชากรใหม่ -> ตรวจสอบว่าเลขบัตรในหน้ารายการแสดงผลเป็น Masked
   - เจ้าหน้าที่ที่มีสิทธิ์กดปุ่ม "แสดงเลขเต็ม" -> มีกล่องยืนยันเหตุผล -> ป้อนเหตุผล -> แสดงเลขเต็ม -> ตรวจสอบว่ามีบันทึกใน Audit Log
   - ค้นหาประชากรด้วยเลขบัตร 13 หลัก -> ค้นหาพบอย่างถูกต้องผ่าน Blind Index
3. **E2E-HOUSEHOLD-TRANSFER**:
   - เปิดหน้ารายละเอียดบ้าน -> เลือกสมาชิก -> เรียกใช้ Household Transfer Wizard -> ทำการย้ายไปบ้านใหม่ -> ยืนยันว่าผังครัวเรือนต้นทางลดลง และปลายทางเพิ่มขึ้น

### คำสั่งสำหรับรัน E2E Test:
```bash
npx playwright test
```

---

## 5. การทดสอบความมั่นคงปลอดภัย (Security & Penetration Testing)

| รายการทดสอบ | วิธีการทดสอบ | ผลลัพธ์ที่คาดหวัง |
|:---|:---|:---|
| **SQL Injection (SQLi)** | ทดสอบส่ง Payload SQL แปลกปลอมผ่านช่องค้นหาและตัวกรอง | Prisma ORM ป้องกันผ่าน Parameterized Queries ได้ 100% |
| **Cross-Site Scripting (XSS)** | ป้อน `<script>alert('xss')</script>` ลงในชื่อหรือหมายเหตุ | React และ Zod Escape อักขระอันตราย ไม่มีการประมวลผลโค้ดสคริปต์ |
| **Cross-Village IDOR** | ใช้สิทธิ์ Staff หมู่บ้าน 1 ยิง API แก้ไขข้อมูลประชากร ID ของหมู่บ้าน 2 | ระบบปฏิเสธคำขอและคืนค่า 403 Forbidden |
| **Storage Traversal Attack** | พยายามดาวน์โหลดไฟล์โดยเปลี่ยน Path เป็น `../../etc/passwd` | Supabase Storage ปฏิเสธ และระบบอนุญาตเฉพาะ UUID path |
| **Tamper Audit Trail** | พยายามยิงคำสั่ง UPDATE/DELETE ไปยังตาราง `audit_logs` | ฐานข้อมูลปฏิเสธคำขอผ่าน Trigger/Permission |

---

## 6. กระบวนการ CI/CD Automated Testing Pipeline

เมื่อมีการผลักดันโค้ด (Push) หรือเปิด Pull Request:
1. **Linter & Type Check**: ตรวจสอบ TypeScript Strict Mode และ ESLint
2. **Unit Tests**: รัน Vitest ทุกชุด ต้องผ่าน 100%
3. **Build Check**: ทดสอบคำสั่ง `next build` ให้คอมไพล์ผ่านสมบูรณ์
4. **Security Scan**: ตรวจสอบช่องโหว่ของ Dependencies ด้วย `npm audit` / `bun audit`
