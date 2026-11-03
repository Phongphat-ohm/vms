import prisma from "@/lib/prisma";
import { recordAuditLog } from "@/modules/audit/service";
import { publicConfig } from "@/lib/config";
import { NotFoundException, ConflictException } from "@/lib/exceptions";
import { cleanDigits, formatThaiPhoneNumber } from "@/lib/formatters";
import { UserItemDto, CreateUserInput } from "./types";

export async function listUsers(villageId: string): Promise<UserItemDto[]> {
  const users = await prisma.user.findMany({
    where: {
      villageAccesses: {
        some: { villageId },
      },
    },
    include: {
      userRoles: {
        include: { role: true },
      },
      villageAccesses: {
        include: { village: true },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  return users.map((u: any) => {
    const primaryRole = u.userRoles?.[0]?.role;
    const primaryVillage = u.villageAccesses?.[0]?.village;

    return {
      id: u.id,
      fullName: u.fullName,
      email: u.email,
      phoneNumber: u.phoneNumber ? formatThaiPhoneNumber(u.phoneNumber) : "-",
      role: primaryRole?.name || "STAFF",
      roleDisplayName: primaryRole?.displayName || "เจ้าหน้าที่ปฏิบัติการ",
      villageName: primaryVillage?.name ? `${primaryVillage.name} ม.${primaryVillage.moo}` : publicConfig.defaultVillage.shortBadge,
      isActive: u.isActive,
      lastLogin: "เข้าใช้งานตามปกติ",
      createdAt: u.createdAt.toISOString(),
    };
  });
}

export async function createUser(
  input: CreateUserInput,
  recorderId: string,
  villageId: string
): Promise<UserItemDto> {
  const existing = await prisma.user.findUnique({
    where: { email: input.email },
  });

  if (existing) {
    throw new ConflictException("อีเมลนี้ถูกใช้งานแล้วในระบบ");
  }

  const userId = crypto.randomUUID();

  // Find Role
  const role = await prisma.role.findFirst({
    where: {
      OR: [{ name: input.role }, { displayName: input.role }],
    },
  });

  const user = await prisma.user.create({
    data: {
      id: userId,
      email: input.email,
      fullName: input.fullName,
      phoneNumber: input.phoneNumber ? cleanDigits(input.phoneNumber) : null,
      isActive: true,
      userRoles: role
        ? {
            create: { roleId: role.id },
          }
        : undefined,
      villageAccesses: {
        create: { villageId, isDefault: true },
      },
    },
    include: {
      userRoles: { include: { role: true } },
      villageAccesses: { include: { village: true } },
    },
  });

  await recordAuditLog({
    villageId,
    userId: recorderId,
    module: "user",
    action: "CREATE",
    entityType: "User",
    entityId: user.id,
    details: {
      fullName: user.fullName,
      email: user.email,
      role: role?.name || input.role,
    },
  });

  const primaryRole = user.userRoles?.[0]?.role;
  const primaryVillage = user.villageAccesses?.[0]?.village;
  return {
    id: user.id,
    fullName: user.fullName,
    email: user.email,
    phoneNumber: user.phoneNumber || "-",
    role: primaryRole?.name || input.role,
    roleDisplayName: primaryRole?.displayName || input.role,
    villageName: primaryVillage?.name ? `${primaryVillage.name} ม.${primaryVillage.moo}` : publicConfig.defaultVillage.shortBadge,
    isActive: user.isActive,
    lastLogin: "เพิ่งสร้างบัญชี",
    createdAt: user.createdAt.toISOString(),
  };
}

export async function toggleUserStatus(
  targetUserId: string,
  recorderId: string,
  villageId: string
): Promise<{ success: boolean; newStatus: boolean }> {
  if (targetUserId === recorderId) {
    throw new ConflictException("ไม่สามารถระงับการใช้งานบัญชีของตนเองได้");
  }

  const existing = await prisma.user.findUnique({
    where: { id: targetUserId },
  });

  if (!existing) {
    throw new NotFoundException("ไม่พบผู้ใช้งานที่ระบุ");
  }

  const newStatus = !existing.isActive;

  await prisma.user.update({
    where: { id: targetUserId },
    data: { isActive: newStatus },
  });

  await recordAuditLog({
    villageId,
    userId: recorderId,
    module: "user",
    action: "UPDATE",
    entityType: "User",
    entityId: targetUserId,
    details: {
      action: newStatus ? "ENABLE_USER" : "DISABLE_USER",
      targetUserId,
    },
  });

  return { success: true, newStatus };
}
