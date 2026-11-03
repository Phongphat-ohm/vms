import prisma from "@/lib/prisma";
import { recordAuditLog } from "@/modules/audit/service";
import { NotFoundException, ConflictException, ValidationException } from "@/lib/exceptions";
import { cleanDigits } from "@/lib/formatters";
import { VillageInfoDto, UpdateVillageInput, UserProfileDto } from "./types";

export async function getVillageInfo(villageId: string): Promise<VillageInfoDto> {
  const village = await prisma.village.findUnique({
    where: { id: villageId },
  });

  if (!village) {
    throw new NotFoundException(`ไม่พบข้อมูลหมู่บ้านรหัส ${villageId}`);
  }

  return {
    id: village.id,
    name: village.name,
    code: village.code,
    moo: village.moo,
    subdistrict: village.subdistrict,
    district: village.district,
    province: village.province,
    postalCode: village.postalCode,
    phoneNumber: village.phoneNumber,
    logoUrl: village.logoUrl,
  };
}

export async function updateVillageInfo(
  input: UpdateVillageInput,
  userId: string,
  villageId: string
): Promise<VillageInfoDto> {
  const rawVillagePhone = input.phoneNumber ? cleanDigits(input.phoneNumber) : null;
  const updated = await prisma.village.update({
    where: { id: villageId },
    data: {
      name: input.name,
      moo: Number(input.moo),
      subdistrict: input.subdistrict,
      district: input.district,
      province: input.province,
      postalCode: input.postalCode,
      phoneNumber: rawVillagePhone && rawVillagePhone.length > 0 ? rawVillagePhone : null,
    },
  });

  await recordAuditLog({
    villageId,
    userId,
    module: "settings",
    action: "UPDATE",
    entityType: "Village",
    entityId: villageId,
    details: {
      name: updated.name,
      moo: updated.moo,
    },
  });

  return {
    id: updated.id,
    name: updated.name,
    code: updated.code,
    moo: updated.moo,
    subdistrict: updated.subdistrict,
    district: updated.district,
    province: updated.province,
    postalCode: updated.postalCode,
    phoneNumber: updated.phoneNumber,
    logoUrl: updated.logoUrl,
  };
}

export async function getCurrentUserProfile(userId: string): Promise<UserProfileDto> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: {
      userRoles: { include: { role: { include: { rolePermissions: { include: { permission: true } } } } } },
      villageAccesses: { include: { village: true } },
    },
  });

  if (!user) {
    throw new NotFoundException("ไม่พบข้อมูลผู้ใช้งาน");
  }

  const roles = user.userRoles.map((ur: any) => ur.role.displayName || ur.role.name);
  const permissions = user.userRoles.flatMap((ur: any) => ur.role.rolePermissions.map((rp: any) => rp.permission.code));
  const primaryVillage = user.villageAccesses?.[0]?.village;

  return {
    id: user.id,
    fullName: user.fullName,
    email: user.email,
    phoneNumber: user.phoneNumber || null,
    roles,
    permissions,
    activeVillageName: primaryVillage ? `${primaryVillage.name} หมู่ ${primaryVillage.moo}` : "หมู่บ้านเริ่มต้น",
  };
}

export async function updateCurrentUserProfile(
  userId: string,
  input: { fullName: string; email?: string; phoneNumber?: string }
): Promise<UserProfileDto> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: { villageAccesses: true },
  });

  if (!user) {
    throw new NotFoundException("ไม่พบข้อมูลผู้ใช้งาน");
  }

  const rawPhoneDigits = input.phoneNumber ? cleanDigits(input.phoneNumber) : null;
  const updateData: any = {
    fullName: input.fullName.trim(),
    phoneNumber: rawPhoneDigits && rawPhoneDigits.length > 0 ? rawPhoneDigits : null,
  };

  if (input.email) {
    const cleanEmail = input.email.trim().toLowerCase();
    if (!cleanEmail.includes("@") || !cleanEmail.includes(".")) {
      throw new ValidationException("รูปแบบอีเมลไม่ถูกต้อง");
    }

    if (cleanEmail !== user.email) {
      const duplicate = await prisma.user.findFirst({
        where: {
          email: cleanEmail,
          id: { not: userId },
        },
      });

      if (duplicate) {
        throw new ConflictException("อีเมลนี้ถูกใช้งานแล้วในระบบโดยผู้ใช้อื่น");
      }

      updateData.email = cleanEmail;
    }
  }

  const updatedUser = await prisma.user.update({
    where: { id: userId },
    data: updateData,
  });

  const villageId = user.villageAccesses?.[0]?.villageId;
  if (villageId) {
    await recordAuditLog({
      villageId,
      userId,
      module: "settings",
      action: "UPDATE",
      entityType: "User",
      entityId: userId,
      details: {
        action: "UPDATE_PROFILE",
        fullName: updatedUser.fullName,
        email: updatedUser.email,
      },
    });
  }

  return getCurrentUserProfile(userId);
}
