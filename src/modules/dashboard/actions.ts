"use server";

import { assertPermission } from "@/lib/permissions";
import { ActionResponse } from "@/types/common";
import * as dashboardService from "./service";
import { DashboardStatsDto } from "./types";

export async function getDashboardStatsAction(
  targetVillageId?: string
): Promise<ActionResponse<DashboardStatsDto>> {
  try {
    const { villageId } = await assertPermission("person.read", targetVillageId);
    const stats = await dashboardService.getDashboardStats(villageId);
    return {
      success: true,
      data: stats,
    };
  } catch (error: any) {
    return {
      success: false,
      error: {
        code: error.code || "INTERNAL_ERROR",
        message: error.message || "ไม่สามารถดึงข้อมูลสถิติภาพรวมได้",
      },
    };
  }
}
