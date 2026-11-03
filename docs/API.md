# ข้อกำหนดสัญญาต่อประสานโปรแกรม (API & Server Action Contracts Specification)
## Smart Village Management System (VMS) — ระบบบริหารหมู่บ้านอัจฉริยะ

---

## 1. แนวทางการออกแบบ API (API Design Philosophy)

ระบบ VMS ใช้ **Next.js 16 Server Actions** เป็นช่องทางหลักสำหรับการจัดการคำขอประเภท Mutation (สร้าง, แก้ไข, ลบ, ย้าย) ร่วมกับ Form Validation และใช้ **Route Handlers (`src/app/api/*`)** สำหรับการทำงานที่ต้องการ Streaming, File Download, Data Export หรือ Third-party Webhook

### มาตรฐานโครงสร้างผลลัพธ์ (Unified Response Envelope):

#### กรณีสำเร็จ (Success Response):
```json
{
  "success": true,
  "data": { ... },
  "message": "ข้อความแสดงผลภาษาไทยสำหรับ UI (ถ้ามี)",
  "metadata": {
    "page": 1,
    "limit": 20,
    "total": 150
  }
}
```

#### กรณีผิดพลาด (Error Response):
```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_FAILED",
    "message": "ข้อมูลที่ส่งมาไม่ถูกต้องตามเงื่อนไข",
    "details": [
      { "field": "nationalId", "issue": "เลขประจำตัวประชาชน 13 หลักไม่ถูกต้องตามหลักการคำนวณ Check Digit" }
    ]
  }
}
```

---

## 2. รหัสข้อผิดพลาดมาตรฐาน (Standard Error Codes)

| รหัสข้อผิดพลาด (Error Code) | HTTP Status | คำอธิบาย |
|:---|:---:|:---|
| `UNAUTHORIZED` | 401 | ผู้ใช้ยังไม่ได้เข้าสู่ระบบ หรือ Session หมดอายุ |
| `FORBIDDEN` | 403 | ผู้ใช้ไม่มี Permission หรือพยายามเข้าถึงหมู่บ้านอื่น (Cross-Village) |
| `VALIDATION_FAILED` | 422 | ข้อมูลไม่ผ่านการตรวจสอบ Zod Schema |
| `NOT_FOUND` | 404 | ไม่พบข้อมูล Entity ที่ระบุ |
| `DUPLICATE_RESOURCE` | 409 | ข้อมูลซ้ำในระบบ (เช่น เลขบัตรประชาชน หรือเลขที่บ้านซ้ำ) |
| `CONFLICT_STATE` | 409 | สถานะข้อมูลขัดแย้ง (เช่น ครัวเรือนมีหัวหน้าอยู่แล้ว หรือบุคคลถึงแก่กรรมแล้ว) |
| `RATE_LIMIT_EXCEEDED` | 429 | ส่งคำขอเกินอัตราที่กำหนด (Brute force protection) |
| `INTERNAL_SERVER_ERROR` | 500 | เกิดข้อผิดพลาดที่ไม่คาดคิดในระบบ |

---

## 3. สัญญารายละเอียดของ Server Actions ตามโมดูล

### 3.1 Module: Population (`src/modules/population/actions.ts`)

#### 1. `createPersonAction(input: CreatePersonInput): Promise<ApiResponse<PersonDto>>`
- **สิทธิ์ที่ต้องการ**: `person.create`
- **คำอธิบาย**: บันทึกข้อมูลประชากรใหม่ พร้อมเข้ารหัสเลขบัตรและสร้าง Blind Index
- **Zod Validation**:
  - `nationalId`: string ความยาว 13 ตัวอักษร ตรวจสอบ Check Digit Mod 11
  - `firstName`, `lastName`: string ความยาว 2-100 ตัวอักษร ไม่เป็นอักขระพิเศษ
  - `birthDate`: Date ต้องไม่เกินวันปัจจุบัน
  - `gender`: Enum (`MALE`, `FEMALE`, `OTHER`)
  - `nationality`: string (ค่าเริ่มต้น 'ไทย')
- **ผลลัพธ์**: คืนค่า Person DTO พร้อมเลขบัตรแบบ Masked (`1-XXXX-XXXXX-XX-X`)

#### 2. `revealNationalIdAction(personId: string, reason: string): Promise<ApiResponse<{ nationalId: string }>>`
- **สิทธิ์ที่ต้องการ**: `person.sensitive.read`
- **คำอธิบาย**: ถอดรหัส AES-256-GCM เพื่อแสดงเลขบัตรประชาชนตัวเต็มสำหรับงานจำเป็น
- **Audit**: บันทึกลง `audit_logs` หมวด `SENSITIVE_VIEW` พร้อมบันทึกเหตุผล `reason`

#### 3. `searchPersonsAction(params: SearchParams): Promise<ApiResponse<PaginatedResult<PersonListItemDto>>>`
- **สิทธิ์ที่ต้องการ**: `person.read`
- **พารามิเตอร์**: `query` (ชื่อ/สกุล/เลขบัตร 13 หลัก), `villageId`, `gender`, `isAlive`, `page`, `limit`
- **Logic**: หาก query เป็นตัวเลข 13 หลัก จะคำนวณ HMAC-SHA256 Blind Index แล้วค้นหาแบบ Exact Match หากเป็นข้อความจะค้นหาจาก `first_name` หรือ `last_name`

---

### 3.2 Module: Household & House (`src/modules/households/actions.ts`)

#### 1. `createHouseAction(input: CreateHouseInput): Promise<ApiResponse<HouseDto>>`
- **สิทธิ์ที่ต้องการ**: `household.create`
- **Zod Validation**: `houseNumber`, `moo`, `villageId`, `buildingType`
- **Constraint**: ตรวจสอบความไม่ซ้ำซ้อนของ `(village_id, house_number, sub_house_number)`

#### 2. `transferPersonAction(input: TransferPersonInput): Promise<ApiResponse<TransferResultDto>>`
- **สิทธิ์ที่ต้องการ**: `household.transfer`
- **Zod Validation**:
  - `personId`: UUID
  - `sourceHouseholdId`: UUID
  - `targetHouseholdId`: UUID
  - `relationshipToHead`: Enum (`SPOUSE`, `CHILD`, `RELATIVE`, `TENANT`, `OTHER`)
  - `residenceType`: Enum (`OFFICIAL`, `ACTUAL_RESIDENT`, `OFFICIAL_ABSENT`)
  - `effectiveDate`: Date
  - `reason`: string
- **Database Transaction Flow**:
  1. ตรวจสอบว่าบุคคลมีชีวิตอยู่ และอยู่ใน `sourceHouseholdId` จริง
  2. อัปเดต `household_memberships` เก่า: `is_current = false, left_date = effectiveDate`
  3. เพิ่ม `household_memberships` ใหม่: `household_id = targetHouseholdId, is_current = true, joined_date = effectiveDate`
  4. เพิ่มเรคคอร์ดใน `household_events` ประเภท `TRANSFER`
  5. บันทึก `audit_logs`

---

### 3.3 Module: Documents & Files (`src/modules/documents/actions.ts` & Route Handlers)

#### 1. `getUploadPresignedUrlAction(input: FileUploadInitInput): Promise<ApiResponse<{ uploadUrl: string, fileId: string }>>`
- **สิทธิ์ที่ต้องการ**: `document.upload`
- **การทำงาน**: สร้าง Object Path บน Supabase Storage (`/villages/{villageId}/{uuid}`) และสร้าง Upload URL สำหรับ Client ส่งตรงเข้า S3

#### 2. `confirmFileUploadAction(input: ConfirmUploadInput): Promise<ApiResponse<FileDto>>`
- **สิทธิ์ที่ต้องการ**: `document.upload`
- **การทำงาน**: ตรวจสอบความมีอยู่ของไฟล์บน Storage, คำนวณ Checksum, บันทึกลงตาราง `files` และผูกโยงกับ `person_documents` หรือ `household_documents`

#### 3. `GET /api/documents/[fileId]/download` (Route Handler)
- **สิทธิ์ที่ต้องการ**: `document.read`
- **การทำงาน**: ตรวจสอบ Session และ Village Scope -> สร้าง Short-lived Signed URL (อายุ 60 วินาที) -> Redirect แบบ 307 ไปยัง S3 หรือ Stream เนื้อหาไฟล์พร้อม Header `Content-Disposition`

---

### 3.4 Module: User & Permission (`src/modules/users/actions.ts`)

#### 1. `createUserAction(input: CreateUserInput): Promise<ApiResponse<UserDto>>`
- **สิทธิ์ที่ต้องการ**: `user.create`
- **การทำงาน**: สั่งสร้าง User ใน Supabase Auth ผ่าน Admin Client -> บันทึก Profile ในตาราง `users` -> กำหนด Role และ Village Access ใน Transaction

#### 2. `updateUserRolesAction(userId: string, roleIds: string[]): Promise<ApiResponse<void>>`
- **สิทธิ์ที่ต้องการ**: `role.assign`
- **การทำงาน**: ตรวจสอบระดับสิทธิ์ของผู้มอบหมาย ป้องกัน Privilege Escalation -> อัปเดต `user_roles` -> บันทึก `audit_logs`
