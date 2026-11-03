"use server";

import { cookies } from "next/headers";
import prisma from "@/lib/prisma";
import { serverConfig } from "@/lib/config";
import { getSession, signSessionToken, AuthenticatedUser } from "@/lib/auth";
import { recordAuditLog } from "@/modules/audit/service";
import { ActionResponse } from "@/types/common";
import { LoginInput, LoginResult } from "./types";

export async function loginAction(
  input: LoginInput
): Promise<ActionResponse<LoginResult>> {
  try {
    const cleanEmail = input.email.trim().toLowerCase();

    if (!input.password || input.password.trim().length === 0) {
      return {
        success: false,
        error: {
          code: "INVALID_CREDENTIALS",
          message: "กรุณาระบุรหัสผ่านเพื่อเข้าสู่ระบบ",
        },
      };
    }

    const user = await prisma.user.findFirst({
      where: {
        email: cleanEmail,
        isActive: true,
      },
      include: {
        userRoles: {
          include: {
            role: {
              include: {
                rolePermissions: {
                  include: {
                    permission: true,
                  },
                },
              },
            },
          },
        },
        villageAccesses: {
          include: {
            village: true,
          },
        },
      },
    });

    if (!user) {
      return {
        success: false,
        error: {
          code: "INVALID_CREDENTIALS",
          message: "อีเมลหรือรหัสผ่านไม่ถูกต้อง หรือบัญชีถูกระงับการใช้งาน",
        },
      };
    }

    // Collect all granular permissions across assigned roles
    const permissionSet = new Set<string>();
    const roles: string[] = [];

    for (const ur of user.userRoles) {
      roles.push(ur.role.name);
      for (const rp of ur.role.rolePermissions) {
        permissionSet.add(rp.permission.code);
      }
    }

    const defaultVillageAccess =
      user.villageAccesses.find((va: any) => va.isDefault) || user.villageAccesses[0];
    const activeVillageId = defaultVillageAccess?.villageId || serverConfig.defaultVillageId;
    const activeVillageName = defaultVillageAccess?.village?.name
      ? `${defaultVillageAccess.village.name} หมู่ ${defaultVillageAccess.village.moo}`
      : "บ้านหนองหญ้าขาว หมู่ 3";

    const sessionPayload: AuthenticatedUser = {
      id: user.id,
      email: user.email,
      fullName: user.fullName,
      roles,
      permissions: Array.from(permissionSet),
      allowedVillageIds: user.villageAccesses.map((va: any) => va.villageId),
      activeVillageId,
      activeVillageName,
    };

    // Store in secure cryptographically signed HttpOnly cookie
    const token = signSessionToken(sessionPayload);
    const cookieStore = await cookies();
    cookieStore.set(serverConfig.sessionCookieName, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: serverConfig.sessionMaxAgeSeconds,
      path: "/",
    });

    await recordAuditLog({
      villageId: activeVillageId,
      userId: user.id,
      module: "auth",
      action: "LOGIN",
      entityType: "User",
      entityId: user.id,
      details: {
        email: user.email,
        roles,
      },
    });

    return {
      success: true,
      data: {
        userId: user.id,
        email: user.email,
        fullName: user.fullName,
        role: roles[0] || "STAFF",
      },
      message: `ยินดีต้อนรับคุณ ${user.fullName}`,
    };
  } catch (error: any) {
    return {
      success: false,
      error: {
        code: "LOGIN_FAILED",
        message: error.message || "เกิดข้อผิดพลาดในการเข้าสู่ระบบ",
      },
    };
  }
}

export async function logoutAction(): Promise<ActionResponse<void>> {
  try {
    const cookieStore = await cookies();
    cookieStore.delete(serverConfig.sessionCookieName);
    return {
      success: true,
      message: "ออกจากระบบสำเร็จ",
    };
  } catch (error: any) {
    return {
      success: false,
      error: {
        code: "LOGOUT_FAILED",
        message: error.message || "เกิดข้อผิดพลาดในการออกจากระบบ",
      },
    };
  }
}

export async function getActiveSessionAction(): Promise<ActionResponse<AuthenticatedUser | null>> {
  try {
    const session = await getSession();
    return {
      success: true,
      data: session,
    };
  } catch (error: any) {
    return {
      success: false,
      error: {
        code: "SESSION_ERROR",
        message: error.message || "ไม่สามารถอ่านข้อมูลเซสชันได้",
      },
    };
  }
}

export async function switchActiveVillageAction(
  targetVillageId: string
): Promise<ActionResponse<{ villageId: string; villageName: string }>> {
  try {
    const currentSession = await getSession();
    if (!currentSession) {
      return {
        success: false,
        error: { code: "UNAUTHORIZED", message: "กรุณาเข้าสู่ระบบก่อนดำเนินการ" },
      };
    }

    const isSystemAdmin = currentSession.roles.includes("SYSTEM_ADMIN");
    if (!isSystemAdmin && !currentSession.allowedVillageIds.includes(targetVillageId)) {
      return {
        success: false,
        error: { code: "FORBIDDEN", message: "คุณไม่มีสิทธิ์เข้าถึงหมู่บ้านที่เลือก" },
      };
    }

    const village = await prisma.village.findUnique({
      where: { id: targetVillageId },
      select: { id: true, name: true, moo: true },
    });

    if (!village) {
      return {
        success: false,
        error: { code: "NOT_FOUND", message: "ไม่พบข้อมูลหมู่บ้านที่ระบุ" },
      };
    }

    const newVillageName = `${village.name} หมู่ ${village.moo}`;
    const updatedSession: AuthenticatedUser = {
      ...currentSession,
      activeVillageId: village.id,
      activeVillageName: newVillageName,
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

    await recordAuditLog({
      villageId: village.id,
      userId: currentSession.id,
      module: "auth",
      action: "SWITCH_VILLAGE",
      entityType: "Village",
      entityId: village.id,
      details: { villageName: newVillageName },
    });

    return {
      success: true,
      data: { villageId: village.id, villageName: newVillageName },
      message: `สลับบริบทการทำงานเป็น ${newVillageName} เรียบร้อยแล้ว`,
    };
  } catch (error: any) {
    return {
      success: false,
      error: {
        code: "SWITCH_FAILED",
        message: error.message || "ไม่สามารถสลับหมู่บ้านได้",
      },
    };
  }
}
