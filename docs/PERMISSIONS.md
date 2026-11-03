# สิทธิ์การเข้าถึงและเมทริกซ์การควบคุมสิทธิ์ (Role-Based Access Control Specification)
## Smart Village Management System (VMS) — ระบบบริหารหมู่บ้านอัจฉริยะ

---

## 1. บทบาทเริ่มต้นของระบบ (Default System Roles)

ระบบ VMS มาพร้อมกับ 4 บทบาทหลักเริ่มต้น และสามารถสร้างบทบาทเพิ่มเติม (Custom Roles) ได้อย่างยืดหยุ่น:

1. **SYSTEM_ADMIN (ผู้ดูแลระบบสูงสุด)**:
   - ผู้ดูแลเซิร์ฟเวอร์และโครงสร้างพื้นฐาน
   - จัดการหมู่บ้านทั้งหมดในระบบ, จัดการผู้ใช้งานทุกระดับ, จัดการบทบาทและสิทธิ์
   - ดูแลการสำรองข้อมูลและความปลอดภัยระดับระบบ
2. **VILLAGE_ADMIN (ผู้ดูแลระบบระดับหมู่บ้าน / ผู้ใหญ่บ้าน / ประธานชุมชน)**:
   - บริหารจัดการข้อมูลภายในหมู่บ้านที่ตนได้รับมอบหมาย
   - จัดการบัญชีผู้ใช้ระดับ Staff และ Viewer ประจำหมู่บ้าน
   - ตั้งค่าข้อมูลจำเพาะของหมู่บ้าน และตรวจสอบ Audit Logs ภายในหมู่บ้าน
   - มีสิทธิ์เข้าถึงและอนุมัติการดูข้อมูลอ่อนไหว (Sensitive Data)
3. **STAFF (เจ้าหน้าที่ปฏิบัติงาน / ผู้ช่วยผู้ใหญ่บ้าน / อสม.)**:
   - บันทึกและแก้ไขข้อมูลประชากร บ้าน ครัวเรือน
   - ดำเนินการย้ายบุคคลเข้า/ออก/ย้ายระหว่างบ้าน
   - อัปโหลดและดูเอกสารแนบที่ได้รับมอบหมาย
   - มองเห็นข้อมูลเลขบัตรประชาชนแบบ Masked
4. **VIEWER (ผู้ตรวจดูข้อมูล / คณะกรรมการชุมชน)**:
   - ดูข้อมูลประชากรและสถิติต่าง ๆ ได้แบบ Read-Only
   - ไม่สามารถแก้ไขข้อมูล, ไม่สามารถอัปโหลดไฟล์ และไม่สามารถดูเลขบัตรประชาชนตัวเต็มได้

---

## 2. ทะเบียนรหัสสิทธิ์ของระบบ (Permission Registry)

| หมวดหมู่ | รหัสสิทธิ์ (Permission Code) | คำอธิบายสิทธิ์ |
|:---|:---|:---|
| **Population** | `person.read` | ค้นหาและดูข้อมูลประชากรทั่วไป (เลขบัตรแบบ Masked) |
| | `person.create` | เพิ่มข้อมูลประชากรใหม่ |
| | `person.update` | แก้ไขข้อมูลประชากร |
| | `person.archive` | เก็บถาวร (Archive) หรือกู้คืน (Restore) ข้อมูลประชากร |
| | `person.sensitive.read` | เปิดดูเลขประจำตัวประชาชน 13 หลักตัวเต็ม (พร้อมบันทึก Audit) |
| | `person.export` | ส่งออกข้อมูลประชากรเป็นไฟล์ Excel/CSV |
| **Household** | `household.read` | ดูข้อมูลบ้าน ครัวเรือน และรายชื่อสมาชิก |
| | `household.create` | เพิ่มบ้านและจัดตั้งครัวเรือนใหม่ |
| | `household.update` | แก้ไขข้อมูลบ้านและครัวเรือน |
| | `household.transfer` | ดำเนินการย้ายบุคคลเข้า/ออก/สลับบ้าน และเปลี่ยนหัวหน้าครัวเรือน |
| **Document** | `document.read` | ดูและดาวน์โหลดเอกสารแนบผ่าน Signed URL |
| | `document.upload` | อัปโหลดเอกสารแนบใหม่เข้าสู่คลังเอกสาร |
| | `document.delete` | ลบเอกสารแนบออกจากระบบ |
| **User & Access** | `user.read` | ดูรายชื่อและโปรไฟล์ผู้ใช้งาน |
| | `user.create` | สร้างบัญชีผู้ใช้งานใหม่ |
| | `user.update` | แก้ไขข้อมูลผู้ใช้และรีเซ็ตรหัสผ่าน |
| | `user.disable` | ระงับการใช้งานบัญชีหรือเปิดใช้งาน |
| **Role & Permission**| `role.read` | ดูบทบาทและสิทธิ์การใช้งาน |
| | `role.create` | สร้างบทบาทใหม่ (Custom Role) |
| | `role.update` | แก้ไขการผูกสิทธิ์ในบทบาท |
| | `role.assign` | กำหนดบทบาทให้แก่ผู้ใช้งาน |
| **Settings** | `settings.read` | ดูการตั้งค่าหมู่บ้านและการตั้งค่าระบบ |
| | `settings.update` | แก้ไขข้อมูลหมู่บ้านและการตั้งค่าระบบ |
| **Audit & Security** | `audit.read` | ตรวจดูประวัติการดำเนินงานและ Security Events |

---

## 3. ตารางเมทริกซ์สิทธิ์ตามบทบาท (Role-Permission Matrix)

| รหัสสิทธิ์ (Permission Code) | SYSTEM_ADMIN | VILLAGE_ADMIN | STAFF | VIEWER |
|:---|:---:|:---:|:---:|:---:|
| `person.read` | ✅ | ✅ | ✅ | ✅ |
| `person.create` | ✅ | ✅ | ✅ | ❌ |
| `person.update` | ✅ | ✅ | ✅ | ❌ |
| `person.archive` | ✅ | ✅ | ❌ | ❌ |
| `person.sensitive.read` | ✅ | ✅ | ❌ (ขอสิทธิ์พิเศษ) | ❌ |
| `person.export` | ✅ | ✅ | ❌ | ❌ |
| `household.read` | ✅ | ✅ | ✅ | ✅ |
| `household.create` | ✅ | ✅ | ✅ | ❌ |
| `household.update` | ✅ | ✅ | ✅ | ❌ |
| `household.transfer` | ✅ | ✅ | ✅ | ❌ |
| `document.read` | ✅ | ✅ | ✅ | ✅ |
| `document.upload` | ✅ | ✅ | ✅ | ❌ |
| `document.delete` | ✅ | ✅ | ❌ | ❌ |
| `user.read` | ✅ | ✅ (เฉพาะในหมู่บ้าน) | ❌ | ❌ |
| `user.create` | ✅ | ✅ (เฉพาะในหมู่บ้าน) | ❌ | ❌ |
| `user.update` | ✅ | ✅ (เฉพาะในหมู่บ้าน) | ❌ | ❌ |
| `user.disable` | ✅ | ✅ (เฉพาะในหมู่บ้าน) | ❌ | ❌ |
| `role.read` | ✅ | ✅ | ❌ | ❌ |
| `role.create` | ✅ | ❌ | ❌ | ❌ |
| `role.update` | ✅ | ❌ | ❌ | ❌ |
| `role.assign` | ✅ | ✅ (จำกัดเฉพาะ Staff/Viewer) | ❌ | ❌ |
| `settings.read` | ✅ | ✅ | ✅ | ❌ |
| `settings.update` | ✅ | ✅ (เฉพาะของหมู่บ้านตน) | ❌ | ❌ |
| `audit.read` | ✅ | ✅ (เฉพาะของหมู่บ้านตน) | ❌ | ❌ |

---

## 4. กลไกการตรวจสอบสิทธิ์ในระดับเซิร์ฟเวอร์ (Server-Side Authorization Pattern)

```typescript
// ตัวอย่างรูปแบบการตรวจสอบสิทธิ์ใน Server Action (src/lib/permissions.ts)
export async function assertPermission(permissionCode: string, villageId?: string) {
  const session = await getAuthenticatedSession();
  
  if (!session) {
    throw new UnauthorizedException("กรุณาเข้าสู่ระบบก่อนดำเนินการ");
  }

  // SYSTEM_ADMIN มีสิทธิ์ผ่านได้ทุกคำขอ
  if (session.roles.includes("SYSTEM_ADMIN")) {
    return { user: session.user, isSuperAdmin: true };
  }

  // ตรวจสอบสิทธิ์ใน Village Scope
  if (villageId && !session.allowedVillageIds.includes(villageId)) {
    throw new ForbiddenException("ท่านไม่มีสิทธิ์เข้าถึงข้อมูลของหมู่บ้านนี้");
  }

  // ตรวจสอบว่าผู้ใช้มีรหัสสิทธิ์ที่ต้องการหรือไม่
  const hasPermission = session.permissions.includes(permissionCode);
  if (!hasPermission) {
    throw new ForbiddenException(`ขาดสิทธิ์การใช้งาน: ${permissionCode}`);
  }

  return { user: session.user, villageId: villageId || session.defaultVillageId };
}
```

### กฎความปลอดภัยที่ห้ามละเมิด:
1. **ห้ามพึ่งพาการซ่อนปุ่มบน UI เพียงอย่างเดียว**: UI แค่ช่วยปรับประสบการณ์ผู้ใช้ แต่ Server ต้องตรวจสอบ Permission ซ้ำทุกครั้ง
2. **ห้ามทำ Privilege Escalation**: ผู้ใช้ไม่สามารถมอบหมาย Role ที่มีสิทธิ์สูงกว่าตนเองได้ (เช่น VILLAGE_ADMIN ไม่สามารถแต่งตั้ง SYSTEM_ADMIN ได้)
3. **ห้ามละเลย Village Scope Check**: ทุกคำขอแก้ไขหรือดูข้อมูล ต้องตรวจสอบว่า `entity.village_id` ตรงกับ `allowedVillageIds` ของผู้ใช้เสมอ
