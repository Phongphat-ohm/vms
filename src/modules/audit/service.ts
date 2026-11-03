import prisma from "@/lib/prisma";
import { CreateAuditLogParams, AuditLogDto, ListAuditLogsQuery } from "./types";
import { PaginatedResult } from "@/types/common";

/**
 * Sanitizes audit details payload to prevent secret or raw national ID leaks.
 */
function sanitizeAuditDetails(details?: Record<string, any>): Record<string, any> | undefined {
  if (!details) return undefined;
  const sanitized = { ...details };

  const forbiddenKeys = ["password", "token", "secret", "nationalId", "rawId"];
  for (const key of Object.keys(sanitized)) {
    if (forbiddenKeys.some((f) => key.toLowerCase().includes(f.toLowerCase()))) {
      sanitized[key] = "[REDACTED_SECURE]";
    }
  }

  return sanitized;
}

/**
 * Records an immutable audit log entry.
 */
export async function recordAuditLog(params: CreateAuditLogParams): Promise<void> {
  try {
    const cleanDetails = sanitizeAuditDetails(params.details);

    await prisma.auditLog.create({
      data: {
        villageId: params.villageId,
        userId: params.userId,
        module: params.module,
        action: params.action,
        entityType: params.entityType,
        entityId: params.entityId,
        details: cleanDetails ?? undefined,
        ipAddress: params.ipAddress,
        userAgent: params.userAgent,
        status: params.status || "SUCCESS",
      },
    });
  } catch (error) {
    // Audit log write failure should be logged to stderr without crashing operation
    console.error("Failed to write audit log:", error);
  }
}

/**
 * Fetches recent audit logs for a village.
 */
export async function listAuditLogs(villageId?: string, limit = 50): Promise<AuditLogDto[]> {
  const logs = await prisma.auditLog.findMany({
    where: villageId ? { villageId } : undefined,
    orderBy: { createdAt: "desc" },
    take: limit,
    include: {
      user: { select: { fullName: true } },
    },
  });

  return logs.map((l: any) => ({
    id: l.id,
    villageId: l.villageId,
    userId: l.userId,
    userName: l.user?.fullName || "ระบบอัตโนมัติ",
    module: l.module,
    action: l.action,
    entityType: l.entityType,
    entityId: l.entityId,
    details: l.details as Record<string, any> | null,
    ipAddress: l.ipAddress,
    status: l.status,
    createdAt: l.createdAt.toISOString(),
  }));
}

/**
 * Fetches audit logs with pagination and optional filters (module, action).
 */
export async function listAuditLogsPaged(
  query: ListAuditLogsQuery
): Promise<PaginatedResult<AuditLogDto>> {
  const page = Math.max(1, query.page || 1);
  const pageSize = Math.max(1, Math.min(100, query.pageSize || 20));
  const skip = (page - 1) * pageSize;

  const whereClause: any = {};
  if (query.villageId) {
    whereClause.villageId = query.villageId;
  }
  if (query.module) {
    whereClause.module = query.module;
  }
  if (query.action) {
    whereClause.action = query.action;
  }

  const [total, logs] = await Promise.all([
    prisma.auditLog.count({ where: whereClause }),
    prisma.auditLog.findMany({
      where: whereClause,
      orderBy: { createdAt: "desc" },
      skip,
      take: pageSize,
      include: {
        user: { select: { fullName: true } },
      },
    }),
  ]);

  const items: AuditLogDto[] = logs.map((l: any) => ({
    id: l.id,
    villageId: l.villageId,
    userId: l.userId,
    userName: l.user?.fullName || "ระบบอัตโนมัติ",
    module: l.module,
    action: l.action,
    entityType: l.entityType,
    entityId: l.entityId,
    details: l.details as Record<string, any> | null,
    ipAddress: l.ipAddress,
    status: l.status,
    createdAt: l.createdAt.toISOString(),
  }));

  return {
    items,
    total,
    page,
    pageSize,
    totalPages: Math.ceil(total / pageSize) || 1,
  };
}
