/**
 * Custom Application Exceptions for Village Management System (VMS)
 * Standardized error handling as specified in docs/ARCHITECTURE.md and docs/API.md
 */

export class AppError extends Error {
  public readonly code: string;
  public readonly statusCode: number;
  public readonly details?: any[];

  constructor(message: string, code = "INTERNAL_SERVER_ERROR", statusCode = 500, details?: any[]) {
    super(message);
    this.name = this.constructor.name;
    this.code = code;
    this.statusCode = statusCode;
    this.details = details;
    Object.setPrototypeOf(this, new.target.prototype);
  }
}

export class UnauthorizedException extends AppError {
  constructor(message = "กรุณาเข้าสู่ระบบก่อนดำเนินการ", details?: any[]) {
    super(message, "UNAUTHORIZED", 401, details);
  }
}

export class ForbiddenException extends AppError {
  constructor(message = "ท่านไม่มีสิทธิ์ในการดำเนินการนี้ หรือไม่มีสิทธิ์เข้าถึงหมู่บ้านเป้าหมาย", details?: any[]) {
    super(message, "FORBIDDEN", 403, details);
  }
}

export class ValidationException extends AppError {
  constructor(message = "ข้อมูลที่ส่งมาไม่ถูกต้องตามเงื่อนไข", details?: any[]) {
    super(message, "VALIDATION_FAILED", 422, details);
  }
}

export class NotFoundException extends AppError {
  constructor(message = "ไม่พบข้อมูลที่ระบุในระบบ", details?: any[]) {
    super(message, "NOT_FOUND", 404, details);
  }
}

export class ConflictException extends AppError {
  constructor(message = "ข้อมูลซ้ำซ้อนหรือมีสถานะขัดแย้งในระบบ", details?: any[]) {
    super(message, "CONFLICT_STATE", 409, details);
  }
}
