"use server";

import { assertPermission } from "@/lib/permissions";
import { ActionResponse } from "@/types/common";
import * as userService from "./service";
import { UserItemDto, CreateUserInput } from "./types";

export async function listUsersAction(
  targetVillageId?: string
): Promise<ActionResponse<UserItemDto[]>> {
  try {
    const { villageId } = await assertPermission("user.read", targetVillageId);
    const users = await userService.listUsers(villageId);
    return {
      success: true,
      data: users,
    };
  } catch (error: any) {
    return {
      success: false,
      error: {
        code: error.code || "INTERNAL_ERROR",
        message: error.message || "ไม่สามารถดึงข้อมูลรายชื่อผู้ใช้งานได้",
      },
    };
  }
}

export async function createUserAction(
  input: CreateUserInput
): Promise<ActionResponse<UserItemDto>> {
  try {
    const { user, villageId } = await assertPermission("user.create", input.villageId);
    const created = await userService.createUser(input, user.id, villageId);
    return {
      success: true,
      data: created,
      message: `สร้างบัญชีผู้ใช้งานสำหรับ ${created.fullName} เรียบร้อยแล้ว`,
    };
  } catch (error: any) {
    return {
      success: false,
      error: {
        code: error.code || "CREATE_USER_FAILED",
        message: error.message || "ไม่สามารถสร้างบัญชีผู้ใช้ได้",
      },
    };
  }
}

export async function toggleUserStatusAction(
  targetUserId: string
): Promise<ActionResponse<{ success: boolean; newStatus: boolean }>> {
  try {
    const { user, villageId } = await assertPermission("user.disable");
    const result = await userService.toggleUserStatus(targetUserId, user.id, villageId);
    return {
      success: true,
      data: result,
      message: result.newStatus ? "เปิดการใช้งานบัญชีสำเร็จ" : "ระงับการใช้งานบัญชีสำเร็จ",
    };
  } catch (error: any) {
    return {
      success: false,
      error: {
        code: error.code || "UPDATE_FAILED",
        message: error.message || "ไม่สามารถปรับปรุงสถานะผู้ใช้ได้",
      },
    };
  }
}
