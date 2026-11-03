import prisma from "../src/lib/prisma";
import { encryptNationalId, createNationalIdBlindIndex, maskNationalId } from "../src/lib/crypto";

const PERMISSIONS = [
  // Population
  { code: "person.read", module: "population", description: "ค้นหาและดูข้อมูลประชากรทั่วไป (Masked ID)" },
  { code: "person.create", module: "population", description: "เพิ่มข้อมูลประชากรใหม่" },
  { code: "person.update", module: "population", description: "แก้ไขข้อมูลประชากร" },
  { code: "person.archive", module: "population", description: "เก็บถาวรหรือกู้คืนข้อมูลประชากร" },
  { code: "person.sensitive.read", module: "population", description: "เปิดดูเลขประจำตัวประชาชน 13 หลักตัวเต็ม" },
  { code: "person.export", module: "population", description: "ส่งออกข้อมูลประชากรเป็นไฟล์ Excel/CSV" },

  // Household & Houses
  { code: "household.read", module: "household", description: "ดูข้อมูลบ้าน ครัวเรือน และสมาชิก" },
  { code: "household.create", module: "household", description: "เพิ่มบ้านและจัดตั้งครัวเรือนใหม่" },
  { code: "household.update", module: "household", description: "แก้ไขข้อมูลบ้านและครัวเรือน" },
  { code: "household.transfer", module: "household", description: "ย้ายบุคคลเข้า/ออก/สลับบ้าน และเปลี่ยนหัวหน้าครัวเรือน" },

  // Documents
  { code: "document.read", module: "document", description: "ดูและดาวน์โหลดเอกสารแนบ" },
  { code: "document.upload", module: "document", description: "อัปโหลดเอกสารแนบใหม่" },
  { code: "document.delete", module: "document", description: "ลบเอกสารแนบออกจากระบบ" },

  // User Management
  { code: "user.read", module: "user", description: "ดูรายชื่อและโปรไฟล์ผู้ใช้งาน" },
  { code: "user.create", module: "user", description: "สร้างบัญชีผู้ใช้งานใหม่" },
  { code: "user.update", module: "user", description: "แก้ไขข้อมูลผู้ใช้และรีเซ็ตรหัสผ่าน" },
  { code: "user.disable", module: "user", description: "ระงับหรือเปิดใช้งานบัญชีผู้ใช้" },

  // Roles & Permissions
  { code: "role.read", module: "role", description: "ดูบทบาทและสิทธิ์การใช้งาน" },
  { code: "role.create", module: "role", description: "สร้างบทบาทใหม่ (Custom Role)" },
  { code: "role.update", module: "role", description: "แก้ไขการผูกสิทธิ์ในบทบาท" },
  { code: "role.assign", module: "role", description: "กำหนดบทบาทให้แก่ผู้ใช้งาน" },

  // Settings
  { code: "settings.read", module: "settings", description: "ดูการตั้งค่าหมู่บ้านและการตั้งค่าระบบ" },
  { code: "settings.update", module: "settings", description: "แก้ไขข้อมูลหมู่บ้านและการตั้งค่าระบบ" },

  // Audit
  { code: "audit.read", module: "audit", description: "ตรวจดูประวัติการดำเนินงานและ Security Events" },
];

const ROLES = [
  {
    name: "SYSTEM_ADMIN",
    displayName: "ผู้ดูแลระบบสูงสุด",
    description: "มีสิทธิ์ทุกอย่างในระบบ ควบคุมโครงสร้างพื้นฐานและทุกหมู่บ้าน",
    isSystem: true,
    permissions: PERMISSIONS.map((p) => p.code),
  },
  {
    name: "VILLAGE_ADMIN",
    displayName: "ผู้ดูแลระบบระดับหมู่บ้าน",
    description: "ผู้ใหญ่บ้าน หรือประธานชุมชน จัดการข้อมูลและเจ้าหน้าที่ภายในหมู่บ้าน",
    isSystem: true,
    permissions: [
      "person.read",
      "person.create",
      "person.update",
      "person.archive",
      "person.sensitive.read",
      "person.export",
      "household.read",
      "household.create",
      "household.update",
      "household.transfer",
      "document.read",
      "document.upload",
      "document.delete",
      "user.read",
      "user.create",
      "user.update",
      "user.disable",
      "role.read",
      "role.assign",
      "settings.read",
      "settings.update",
      "audit.read",
    ],
  },
  {
    name: "STAFF",
    displayName: "เจ้าหน้าที่ปฏิบัติการ",
    description: "ผู้ช่วยผู้ใหญ่บ้าน หรือ อสม. บันทึกและแก้ไขข้อมูลประชากรและบ้าน",
    isSystem: true,
    permissions: [
      "person.read",
      "person.create",
      "person.update",
      "household.read",
      "household.create",
      "household.update",
      "household.transfer",
      "document.read",
      "document.upload",
      "settings.read",
    ],
  },
  {
    name: "VIEWER",
    displayName: "ผู้ตรวจสอบข้อมูล (Read-Only)",
    description: "กรรมการชุมชน ตรวจดูข้อมูลและสถิติต่าง ๆ โดยไม่สามารถแก้ไขได้",
    isSystem: true,
    permissions: ["person.read", "household.read", "document.read"],
  },
];

async function main() {
  console.log("1. Seeding Permissions...");
  for (const p of PERMISSIONS) {
    await prisma.permission.upsert({
      where: { code: p.code },
      update: { description: p.description, module: p.module },
      create: p,
    });
  }

  console.log("2. Seeding Roles and Role-Permissions...");
  for (const r of ROLES) {
    const role = await prisma.role.upsert({
      where: { name: r.name },
      update: { displayName: r.displayName, description: r.description },
      create: {
        name: r.name,
        displayName: r.displayName,
        description: r.description,
        isSystem: r.isSystem,
      },
    });

    for (const code of r.permissions) {
      const permission = await prisma.permission.findUnique({ where: { code } });
      if (permission) {
        await prisma.rolePermission.upsert({
          where: {
            roleId_permissionId: {
              roleId: role.id,
              permissionId: permission.id,
            },
          },
          update: {},
          create: {
            roleId: role.id,
            permissionId: permission.id,
          },
        });
      }
    }
  }

  console.log("3. Seeding Default Village...");
  const villageId = "11111111-1111-1111-1111-111111111111";
  const village = await prisma.village.upsert({
    where: { id: villageId },
    update: {
      name: "บ้านหนองหญ้าขาว",
      moo: 3,
      subdistrict: "ดอนทราย",
      district: "ปากท่อ",
      province: "ราชบุรี",
      postalCode: "70140",
      phoneNumber: "032-123456",
    },
    create: {
      id: villageId,
      code: "VIL-7006-03",
      name: "บ้านหนองหญ้าขาว",
      moo: 3,
      subdistrict: "ดอนทราย",
      district: "ปากท่อ",
      province: "ราชบุรี",
      postalCode: "70140",
      phoneNumber: "032-123456",
      isActive: true,
    },
  });

  console.log("4. Seeding Admin User...");
  const adminId = "00000000-0000-0000-0000-000000000001";
  const user = await prisma.user.upsert({
    where: { id: adminId },
    update: {
      fullName: "นายสมศักดิ์ พัฒนาชุมชน (ผู้ดูแลระบบ)",
      email: "admin@village.local",
      phoneNumber: "081-2345678",
      isActive: true,
    },
    create: {
      id: adminId,
      email: "admin@village.local",
      fullName: "นายสมศักดิ์ พัฒนาชุมชน (ผู้ดูแลระบบ)",
      phoneNumber: "081-2345678",
      isActive: true,
    },
  });

  const sysAdminRole = await prisma.role.findUnique({ where: { name: "SYSTEM_ADMIN" } });
  const vilAdminRole = await prisma.role.findUnique({ where: { name: "VILLAGE_ADMIN" } });
  if (sysAdminRole) {
    await prisma.userRole.upsert({
      where: { userId_roleId: { userId: user.id, roleId: sysAdminRole.id } },
      update: {},
      create: { userId: user.id, roleId: sysAdminRole.id },
    });
  }
  if (vilAdminRole) {
    await prisma.userRole.upsert({
      where: { userId_roleId: { userId: user.id, roleId: vilAdminRole.id } },
      update: {},
      create: { userId: user.id, roleId: vilAdminRole.id },
    });
  }

  await prisma.villageUserAccess.upsert({
    where: { userId_villageId: { userId: user.id, villageId: village.id } },
    update: { isDefault: true },
    create: { userId: user.id, villageId: village.id, isDefault: true },
  });

  console.log("5. Seeding Sample Houses & Households...");
  const sampleHousesData = [
    {
      houseNumber: "123",
      subHouseNumber: "",
      buildingType: "DETACHED",
      latitude: 13.7563,
      longitude: 100.5018,
    },
    {
      houseNumber: "124",
      subHouseNumber: "1",
      buildingType: "DETACHED",
      latitude: 13.7567,
      longitude: 100.5022,
    },
    {
      houseNumber: "125",
      subHouseNumber: "",
      buildingType: "ROWHOUSE",
      latitude: 13.7571,
      longitude: 100.5028,
    },
    {
      houseNumber: "126",
      subHouseNumber: "",
      buildingType: "DETACHED",
      latitude: 13.7575,
      longitude: 100.5031,
    },
  ];

  const createdHouses: any[] = [];
  for (const h of sampleHousesData) {
    let house = await prisma.house.findFirst({
      where: { villageId, houseNumber: h.houseNumber, subHouseNumber: h.subHouseNumber },
    });
    if (!house) {
      house = await prisma.house.create({
        data: {
          villageId,
          houseNumber: h.houseNumber,
          subHouseNumber: h.subHouseNumber,
          buildingType: h.buildingType,
          latitude: h.latitude,
          longitude: h.longitude,
        },
      });
    }
    createdHouses.push(house);

    let household = await prisma.household.findFirst({
      where: { houseId: house.id },
    });
    if (!household) {
      const hhCount = (await prisma.household.count({ where: { villageId } })) + 1;
      household = await prisma.household.create({
        data: {
          villageId,
          houseId: house.id,
          householdCode: `HH-2026-${String(hhCount).padStart(4, "0")}`,
        },
      });
    }
  }

  console.log("6. Seeding Sample Population...");
  const samplePersons = [
    {
      nationalId: "1709900123451",
      title: "นาย",
      firstName: "ประสิทธิ์",
      lastName: "สุขสมบูรณ์",
      gender: "MALE",
      birthDate: new Date("1980-05-14"),
      phoneNumber: "081-1112233",
      occupation: "เกษตรกร",
      houseIdx: 0,
      relationship: "HEAD",
      residenceType: "OFFICIAL",
      isHead: true,
    },
    {
      nationalId: "3709900123452",
      title: "นาง",
      firstName: "สมพร",
      lastName: "สุขสมบูรณ์",
      gender: "FEMALE",
      birthDate: new Date("1983-09-22"),
      phoneNumber: "081-1112234",
      occupation: "ค้าขาย",
      houseIdx: 0,
      relationship: "SPOUSE",
      residenceType: "OFFICIAL",
      isHead: false,
    },
    {
      nationalId: "1709900123453",
      title: "นาย",
      firstName: "ธนกฤต",
      lastName: "สุขสมบูรณ์",
      gender: "MALE",
      birthDate: new Date("2008-01-10"),
      phoneNumber: "081-1112235",
      occupation: "นักเรียน/นักศึกษา",
      houseIdx: 0,
      relationship: "CHILD",
      residenceType: "OFFICIAL",
      isHead: false,
    },
    {
      nationalId: "3709900123454",
      title: "นาย",
      firstName: "ชูชัย",
      lastName: "มงคล",
      gender: "MALE",
      birthDate: new Date("1975-11-03"),
      phoneNumber: "089-5556677",
      occupation: "รับจ้างทั่วไป",
      houseIdx: 1,
      relationship: "HEAD",
      residenceType: "OFFICIAL",
      isHead: true,
    },
    {
      nationalId: "5709900123455",
      title: "นาย",
      firstName: "สมชาย",
      lastName: "แซ่ลี้",
      gender: "MALE",
      birthDate: new Date("1991-03-18"),
      phoneNumber: "084-3334455",
      occupation: "พนักงานบริษัท",
      houseIdx: 2,
      relationship: "TENANT",
      residenceType: "ACTUAL_RESIDENT",
      isHead: true,
    },
    {
      nationalId: "3709900123456",
      title: "นางสาว",
      firstName: "กาญจนา",
      lastName: "มงคล",
      gender: "FEMALE",
      birthDate: new Date("1997-07-25"),
      phoneNumber: "082-9998877",
      occupation: "พนักงานออฟฟิศ",
      houseIdx: 1,
      relationship: "CHILD",
      residenceType: "OFFICIAL_ABSENT",
      isHead: false,
    },
  ];

  for (let i = 0; i < samplePersons.length; i++) {
    const sp = samplePersons[i];
    const bindex = createNationalIdBlindIndex(sp.nationalId);
    let person = await prisma.person.findUnique({ where: { nationalIdBindex: bindex } });
    if (!person) {
      const pCount = (await prisma.person.count({ where: { villageId } })) + 1;
      person = await prisma.person.create({
        data: {
          villageId,
          personCode: `P-2026-${String(pCount).padStart(5, "0")}`,
          nationalIdEncrypted: encryptNationalId(sp.nationalId),
          nationalIdBindex: bindex,
          nationalIdMasked: maskNationalId(sp.nationalId),
          title: sp.title,
          firstName: sp.firstName,
          lastName: sp.lastName,
          gender: sp.gender,
          birthDate: sp.birthDate,
          phoneNumber: sp.phoneNumber,
          occupation: sp.occupation,
          createdBy: adminId,
        },
      });

      // Link to Household
      const targetHouse = createdHouses[sp.houseIdx];
      const household = await prisma.household.findFirst({ where: { houseId: targetHouse.id } });
      if (household) {
        await prisma.householdMembership.create({
          data: {
            householdId: household.id,
            personId: person.id,
            relationshipToHead: sp.relationship,
            residenceType: sp.residenceType,
            isHead: sp.isHead,
            isCurrent: true,
          },
        });

        if (sp.isHead) {
          await prisma.household.update({
            where: { id: household.id },
            data: { headPersonId: person.id },
          });
        }
      }
    }
  }

  console.log("7. Seeding Initial Audit Log...");
  await prisma.auditLog.create({
    data: {
      villageId,
      userId: adminId,
      module: "system",
      action: "SEED",
      entityType: "System",
      details: { message: "Initial database seed completed for Village Management System (VMS)" },
    },
  });

  console.log("All seed data created successfully!");
}

main()
  .catch((e) => {
    console.error("Seed error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
