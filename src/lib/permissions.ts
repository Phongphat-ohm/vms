import { requireSession, AuthenticatedUser } from "./auth";
import { ForbiddenException } from "./exceptions";

/**
 * Asserts that the current user has the required permission code
 * and has access to the target village (Multi-Village Isolation).
 */
export async function assertPermission(
  permissionCode: string,
  targetVillageId?: string,
  overrideUser?: AuthenticatedUser
): Promise<{ user: AuthenticatedUser; villageId: string }> {
  const user = overrideUser || (await requireSession());

  // SYSTEM_ADMIN has bypass access to all operations across all villages
  if (user.roles.includes("SYSTEM_ADMIN")) {
    return {
      user,
      villageId: targetVillageId || user.activeVillageId,
    };
  }

  // Multi-Village Scope Verification
  const villageId = targetVillageId || user.activeVillageId;
  if (!user.allowedVillageIds.includes(villageId)) {
    throw new ForbiddenException("ท่านไม่มีสิทธิ์เข้าถึงหรือแก้ไขข้อมูลในหมู่บ้านนี้");
  }

  // Permission Registry Code Verification
  if (!user.permissions.includes(permissionCode)) {
    throw new ForbiddenException(`ขาดสิทธิ์ในการดำเนินการ: [${permissionCode}]`);
  }

  return { user, villageId };
}
