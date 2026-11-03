import prisma from "@/lib/prisma";
import { recordAuditLog } from "@/modules/audit/service";
import { NotFoundException } from "@/lib/exceptions";
import { RoleDto, PermissionItemDto } from "./types";

export async function listAllPermissions(): Promise<PermissionItemDto[]> {
  const permissions = await prisma.permission.findMany({
    orderBy: [{ module: "asc" }, { code: "asc" }],
  });

  return permissions.map((p: any) => ({
    id: p.id,
    code: p.code,
    module: p.module,
    description: p.description,
  }));
}

export async function listRoles(): Promise<RoleDto[]> {
  const roles = await prisma.role.findMany({
    include: {
      rolePermissions: {
        include: { permission: true },
      },
    },
    orderBy: { createdAt: "asc" },
  });

  return roles.map((r: any) => {
    const permissionCodes = r.rolePermissions.map((rp: any) => rp.permission.code);
    return {
      id: r.id,
      name: r.name,
      displayName: r.displayName,
      description: r.description,
      badge: `${permissionCodes.length} สิทธิ์`,
      color: getColorForRole(r.name),
      isSystem: r.isSystem,
      permissionCodes,
    };
  });
}

export async function updateRolePermissions(
  roleId: string,
  permissionCodes: string[],
  userId: string,
  villageId: string
): Promise<{ success: boolean; count: number }> {
  const role = await prisma.role.findUnique({
    where: { id: roleId },
  });

  if (!role) {
    throw new NotFoundException("ไม่พบบทบาทที่ระบุ");
  }

  // Delete existing and re-insert in transaction
  await prisma.$transaction(async (tx: any) => {
    await tx.rolePermission.deleteMany({
      where: { roleId },
    });

    // Find permission IDs for given codes
    const perms = await tx.permission.findMany({
      where: { code: { in: permissionCodes } },
    });

    if (perms.length > 0) {
      await tx.rolePermission.createMany({
        data: perms.map((p: any) => ({
          roleId,
          permissionId: p.id,
        })),
      });
    }
  });

  await recordAuditLog({
    villageId,
    userId,
    module: "role",
    action: "UPDATE",
    entityType: "RolePermission",
    entityId: roleId,
    details: {
      roleName: role.name,
      updatedPermissionsCount: permissionCodes.length,
    },
  });

  return { success: true, count: permissionCodes.length };
}

function getColorForRole(name: string): string {
  switch (name) {
    case "SYSTEM_ADMIN":
      return "bg-purple-50 text-purple-700 border-purple-200";
    case "VILLAGE_ADMIN":
      return "bg-blue-50 text-blue-700 border-blue-200";
    case "STAFF":
      return "bg-emerald-50 text-emerald-700 border-emerald-200";
    default:
      return "bg-slate-100 text-slate-700 border-slate-200";
  }
}
