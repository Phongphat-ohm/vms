export interface PermissionItemDto {
  id?: string;
  code: string;
  desc?: string;
  description?: string;
  module: string;
  isGranted?: boolean;
}

export interface PermissionCategoryDto {
  category: string;
  module: string;
  permissions: PermissionItemDto[];
}

export interface RoleDto {
  id: string;
  name: string;
  displayName: string;
  description?: string | null;
  badge: string;
  color: string;
  isSystem: boolean;
  permissionCodes: string[];
}

export const DEFAULT_PERMISSION_CATEGORIES: PermissionCategoryDto[] = [
  {
    category: "งานทะเบียนประชากร (Population)",
    module: "population",
    permissions: [
      { code: "person.read", desc: "ค้นหาและดูข้อมูลประชากรทั่วไป (Masked ID)", module: "population" },
      { code: "person.create", desc: "เพิ่มข้อมูลประชากรใหม่", module: "population" },
      { code: "person.update", desc: "แก้ไขข้อมูลประชากร", module: "population" },
      { code: "person.archive", desc: "เก็บถาวรหรือกู้คืนข้อมูลประชากร", module: "population" },
      { code: "person.sensitive.read", desc: "เปิดดูเลขประจำตัวประชาชน 13 หลักตัวเต็ม", module: "population" },
      { code: "person.export", desc: "ส่งออกข้อมูลประชากรเป็นไฟล์ Excel/CSV", module: "population" },
    ],
  },
  {
    category: "บ้านและครัวเรือน (Households)",
    module: "household",
    permissions: [
      { code: "household.read", desc: "ดูข้อมูลบ้าน ครัวเรือน และสมาชิก", module: "household" },
      { code: "household.create", desc: "เพิ่มบ้านและจัดตั้งครัวเรือนใหม่", module: "household" },
      { code: "household.update", desc: "แก้ไขข้อมูลบ้านและครัวเรือน", module: "household" },
      { code: "household.transfer", desc: "ย้ายบุคคลเข้า/ออก/สลับบ้าน และเปลี่ยนหัวหน้าครัวเรือน", module: "household" },
    ],
  },
  {
    category: "คลังเอกสาร (Documents)",
    module: "document",
    permissions: [
      { code: "document.read", desc: "ดูและดาวน์โหลดเอกสารแนบ", module: "document" },
      { code: "document.upload", desc: "อัปโหลดเอกสารแนบใหม่", module: "document" },
      { code: "document.delete", desc: "ลบเอกสารแนบออกจากระบบ", module: "document" },
    ],
  },
  {
    category: "การจัดการผู้ใช้ (User Management)",
    module: "user",
    permissions: [
      { code: "user.read", desc: "ดูรายชื่อและโปรไฟล์ผู้ใช้งาน", module: "user" },
      { code: "user.create", desc: "สร้างบัญชีผู้ใช้งานใหม่", module: "user" },
      { code: "user.update", desc: "แก้ไขข้อมูลผู้ใช้และรีเซ็ตรหัสผ่าน", module: "user" },
      { code: "user.disable", desc: "ระงับหรือเปิดใช้งานบัญชีผู้ใช้", module: "user" },
    ],
  },
  {
    category: "บทบาทและสิทธิ์ (Roles & RBAC)",
    module: "role",
    permissions: [
      { code: "role.read", desc: "ดูบทบาทและสิทธิ์การใช้งาน", module: "role" },
      { code: "role.create", desc: "สร้างบทบาทใหม่ (Custom Role)", module: "role" },
      { code: "role.update", desc: "แก้ไขการผูกสิทธิ์ในบทบาท", module: "role" },
      { code: "role.assign", desc: "กำหนดบทบาทให้แก่ผู้ใช้งาน", module: "role" },
    ],
  },
  {
    category: "การตั้งค่าและประวัติ (Settings & Audit)",
    module: "settings",
    permissions: [
      { code: "settings.read", desc: "ดูการตั้งค่าหมู่บ้านและการตั้งค่าระบบ", module: "settings" },
      { code: "settings.update", desc: "แก้ไขข้อมูลหมู่บ้านและการตั้งค่าระบบ", module: "settings" },
      { code: "audit.read", desc: "ตรวจดูประวัติการดำเนินงานและ Security Events", module: "audit" },
    ],
  },
];
