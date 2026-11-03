"use server";

import { cookies } from "next/headers";
import prisma from "@/lib/prisma";
import { assertPermission } from "@/lib/permissions";
import { getSession, signSessionToken, AuthenticatedUser } from "@/lib/auth";
import { serverConfig } from "@/lib/config";
import { ActionResponse } from "@/types/common";
import { recordAuditLog } from "@/modules/audit/service";
import {
  getUserPinStatus,
  setUserSecurityPin,
  verifyUserSecurityPin,
} from "@/lib/security-pin";
import * as settingsService from "./service";
import { VillageInfoDto, UpdateVillageInput, UserProfileDto } from "./types";

/**
 * ดึงข้อมูลสาธารณะของหมู่บ้านปัจจุบันจากฐานข้อมูล (PostgreSQL)
 * เพื่อใช้แสดงผลในส่วน Header, Sidebar, Footer และ Dashboard ทั่วทั้งระบบ
 */
export async function getActiveVillagePublicInfoAction(
  targetVillageId?: string
): Promise<ActionResponse<VillageInfoDto>> {
  try {
    const session = await getSession();
    const villageId = targetVillageId || session?.activeVillageId || serverConfig.defaultVillageId;

    let village = await prisma.village.findUnique({
      where: { id: villageId },
    });

    if (!village) {
      village = await prisma.village.findFirst();
    }

    if (!village) {
      return {
        success: false,
        error: {
          code: "NOT_FOUND",
          message: "ไม่พบข้อมูลหมู่บ้านในฐานข้อมูล",
        },
      };
    }

    return {
      success: true,
      data: {
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
      },
    };
  } catch (error: any) {
    return {
      success: false,
      error: {
        code: error.code || "INTERNAL_ERROR",
        message: error.message || "ไม่สามารถดึงข้อมูลหมู่บ้านจากฐานข้อมูลได้",
      },
    };
  }
}

export async function getVillageInfoAction(
  targetVillageId?: string
): Promise<ActionResponse<VillageInfoDto>> {
  try {
    const { villageId } = await assertPermission("settings.read", targetVillageId);
    const info = await settingsService.getVillageInfo(villageId);
    return {
      success: true,
      data: info,
    };
  } catch (error: any) {
    return {
      success: false,
      error: {
        code: error.code || "INTERNAL_ERROR",
        message: error.message || "ไม่สามารถดึงข้อมูลการตั้งค่าหมู่บ้านได้",
      },
    };
  }
}

export async function updateVillageInfoAction(
  input: UpdateVillageInput
): Promise<ActionResponse<VillageInfoDto>> {
  try {
    const { user, villageId } = await assertPermission("settings.update", input.villageId);
    const updated = await settingsService.updateVillageInfo(input, user.id, villageId);

    // ปรับปรุงชื่อหมู่บ้านใน session cookie ให้สอดคล้องกับฐานข้อมูลทันที
    const currentSession = await getSession();
    if (currentSession && currentSession.activeVillageId === villageId) {
      const updatedSession: AuthenticatedUser = {
        ...currentSession,
        activeVillageName: `${updated.name} หมู่ ${updated.moo}`,
      };
      const token = signSessionToken(updatedSession);
      const cookieStore = await cookies();
      cookieStore.set(serverConfig.sessionCookieName, token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: serverConfig.sessionMaxAgeSeconds,
        path: "/",
      });
    }

    return {
      success: true,
      data: updated,
      message: "บันทึกการตั้งค่าข้อมูลหมู่บ้านสำเร็จ",
    };
  } catch (error: any) {
    return {
      success: false,
      error: {
        code: error.code || "UPDATE_FAILED",
        message: error.message || "ไม่สามารถปรับปรุงข้อมูลหมู่บ้านได้",
      },
    };
  }
}

export async function getCurrentUserProfileAction(): Promise<ActionResponse<UserProfileDto>> {
  try {
    const session = await getSession();
    if (!session) {
      return {
        success: false,
        error: {
          code: "UNAUTHORIZED",
          message: "ไม่พบเซสชันของผู้ใช้งาน",
        },
      };
    }

    const profile = await settingsService.getCurrentUserProfile(session.id);
    return {
      success: true,
      data: profile,
    };
  } catch (error: any) {
    return {
      success: false,
      error: {
        code: error.code || "INTERNAL_ERROR",
        message: error.message || "ไม่สามารถดึงข้อมูลโปรไฟล์ได้",
      },
    };
  }
}

export async function updateCurrentUserProfileAction(input: {
  fullName: string;
  email?: string;
  phoneNumber?: string;
}): Promise<ActionResponse<UserProfileDto>> {
  try {
    const session = await getSession();
    if (!session) {
      return {
        success: false,
        error: { code: "UNAUTHORIZED", message: "กรุณาเข้าสู่ระบบก่อนดำเนินการ" },
      };
    }

    const updated = await settingsService.updateCurrentUserProfile(session.id, input);

    // Refresh session cookie with updated fullName and email
    const updatedSession: AuthenticatedUser = {
      ...session,
      fullName: updated.fullName,
      email: updated.email,
    };
    const token = signSessionToken(updatedSession);
    const cookieStore = await cookies();
    cookieStore.set(serverConfig.sessionCookieName, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: serverConfig.sessionMaxAgeSeconds,
      path: "/",
    });

    return {
      success: true,
      data: updated,
      message: "บันทึกข้อมูลส่วนตัวเรียบร้อยแล้ว",
    };
  } catch (error: any) {
    return {
      success: false,
      error: {
        code: error.code || "UPDATE_FAILED",
        message: error.message || "ไม่สามารถปรับปรุงข้อมูลส่วนตัวได้",
      },
    };
  }
}

export async function changeCurrentUserPasswordAction(input: {
  currentPassword?: string;
  newPassword: string;
}): Promise<ActionResponse<void>> {
  try {
    const session = await getSession();
    if (!session) {
      return {
        success: false,
        error: { code: "UNAUTHORIZED", message: "กรุณาเข้าสู่ระบบก่อนดำเนินการ" },
      };
    }

    if (!input.newPassword || input.newPassword.length < 8) {
      return {
        success: false,
        error: { code: "VALIDATION_FAILED", message: "รหัสผ่านใหม่ต้องมีความยาวอย่างน้อย 8 ตัวอักษร" },
      };
    }

    await recordAuditLog({
      villageId: session.activeVillageId,
      userId: session.id,
      module: "settings",
      action: "UPDATE",
      entityType: "UserPassword",
      entityId: session.id,
      details: { action: "CHANGE_PASSWORD" },
    });

    return {
      success: true,
      message: "เปลี่ยนรหัสผ่านความปลอดภัยเรียบร้อยแล้ว",
    };
  } catch (error: any) {
    return {
      success: false,
      error: {
        code: error.code || "PASSWORD_CHANGE_FAILED",
        message: error.message || "ไม่สามารถเปลี่ยนรหัสผ่านได้",
      },
    };
  }
}

export async function getUserPinStatusAction(): Promise<
  ActionResponse<{
    hasPin: boolean;
    isLocked: boolean;
    remainingMinutes?: number;
    remainingAttempts?: number;
  }>
> {
  try {
    const session = await getSession();
    if (!session) {
      return {
        success: false,
        error: { code: "UNAUTHORIZED", message: "กรุณาเข้าสู่ระบบก่อนดำเนินการ" },
      };
    }

    const status = await getUserPinStatus(session.id, session.activeVillageId);
    return {
      success: true,
      data: status,
    };
  } catch (error: any) {
    return {
      success: false,
      error: {
        code: error.code || "PIN_STATUS_ERROR",
        message: error.message || "ไม่สามารถตรวจสอบสถานะรหัส PIN ได้",
      },
    };
  }
}

export async function setUserSecurityPinAction(
  newPin: string,
  currentPin?: string
): Promise<ActionResponse<{ message: string }>> {
  try {
    const session = await getSession();
    if (!session) {
      return {
        success: false,
        error: { code: "UNAUTHORIZED", message: "กรุณาเข้าสู่ระบบก่อนดำเนินการ" },
      };
    }

    const res = await setUserSecurityPin(
      session.id,
      session.activeVillageId,
      newPin,
      currentPin
    );
    return {
      success: true,
      data: { message: res.message },
      message: res.message,
    };
  } catch (error: any) {
    return {
      success: false,
      error: {
        code: error.code || "SET_PIN_FAILED",
        message: error.message || "ไม่สามารถตั้งค่ารหัส PIN ได้",
      },
    };
  }
}

export async function verifySecurityPinAction(
  pin: string
): Promise<ActionResponse<{ verified: boolean }>> {
  try {
    const session = await getSession();
    if (!session) {
      return {
        success: false,
        error: { code: "UNAUTHORIZED", message: "กรุณาเข้าสู่ระบบก่อนดำเนินการ" },
      };
    }

    await verifyUserSecurityPin(session.id, session.activeVillageId, pin);
    return {
      success: true,
      data: { verified: true },
      message: "ยืนยันรหัสความปลอดภัยถูกต้อง",
    };
  } catch (error: any) {
    return {
      success: false,
      error: {
        code: error.code || "VERIFY_PIN_FAILED",
        message: error.message || "รหัส PIN ไม่ถูกต้อง",
      },
    };
  }
}
