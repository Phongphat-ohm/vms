export type AuditAction =
  | "CREATE"
  | "UPDATE"
  | "ARCHIVE"
  | "RESTORE"
  | "DELETE"
  | "SENSITIVE_VIEW"
  | "EXPORT"
  | "TRANSFER"
  | "HEAD_CHANGE"
  | "LOGIN"
  | "LOGOUT"
  | "SWITCH_VILLAGE"
  | "SEED";

export interface CreateAuditLogParams {
  villageId?: string;
  userId?: string;
  module: string;
  action: AuditAction;
  entityType: string;
  entityId?: string;
  details?: Record<string, any>;
  ipAddress?: string;
  userAgent?: string;
  status?: "SUCCESS" | "FAILED";
}

export interface AuditLogDto {
  id: string;
  villageId?: string | null;
  userId?: string | null;
  userName?: string;
  module: string;
  action: string;
  entityType: string;
  entityId?: string | null;
  details?: Record<string, any> | null;
  ipAddress?: string | null;
  status: string;
  createdAt: string;
}

export interface ListAuditLogsQuery {
  villageId?: string;
  module?: string;
  action?: string;
  page?: number;
  pageSize?: number;
}
