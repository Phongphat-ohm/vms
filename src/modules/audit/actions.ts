"use server";

import { assertPermission } from "@/lib/permissions";
import { ActionResponse } from "@/types/common";
import * as auditService from "./service";
import { AuditLogDto } from "./types";

export async function listAuditLogsAction(
  targetVillageId?: string,
  module?: string,
  limit = 200
): Promise<ActionResponse<AuditLogDto[]>> {
  try {
    const { villageId } = await assertPermission("audit.read", targetVillageId);
    let logs = await auditService.listAuditLogs(villageId, limit);
    if (module && module !== "ALL") {
      logs = logs.filter((log) => log.module.toLowerCase() === module.toLowerCase());
    }
    return {
      success: true,
      data: logs,
    };
  } catch (error: any) {
    return {
      success: false,
      error: {
        code: error.code || "INTERNAL_ERROR",
        message: error.message || "ไม่สามารถดึงข้อมูลบันทึกประวัติ (Audit Logs) ได้",
      },
    };
  }
}
