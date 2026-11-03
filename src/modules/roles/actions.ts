"use server";

import { assertPermission } from "@/lib/permissions";
import { ActionResponse } from "@/types/common";
import * as roleService from "./service";
import { RoleDto } from "./types";

export async function listRolesAction(): Promise<ActionResponse<RoleDto[]>> {
  try {
    await assertPermission("role.read");
    const roles = await roleService.listRoles();
    return {
      success: true,
      data: roles,
    };
  } catch (error: any) {
    return {
      success: false,
      error: {
        code: error.code || "INTERNAL_ERROR",
        message: error.message || "ไม่สามารถดึงข้อมูลบทบาทและสิทธิ์ได้",
      },
    };
  }
}

export async function updateRolePermissionsAction(
  roleId: string,
  permissionCodes: string[]
): Promise<ActionResponse<{ success: boolean; count: number }>> {
  try {
    const { user, villageId } = await assertPermission("role.assign");
    const result = await roleService.updateRolePermissions(roleId, permissionCodes, user.id, villageId);
    return {
      success: true,
      data: result,
      message: `ปรับปรุงสิทธิ์บทบาทสำเร็จ (${result.count} สิทธิ์)`,
    };
  } catch (error: any) {
    return {
      success: false,
      error: {
        code: error.code || "UPDATE_FAILED",
        message: error.message || "ไม่สามารถปรับปรุงสิทธิ์บทบาทได้",
      },
    };
  }
}
