import crypto from "crypto";
import prisma from "@/lib/prisma";
import { serverConfig } from "@/lib/config";
import { ValidationException, ForbiddenException, NotFoundException } from "@/lib/exceptions";
import { recordAuditLog } from "@/modules/audit/service";

/**
 * High-Security 6-digit Personal Identification Number (PIN) Engine
 * Designed for sensitive data access protection (e.g. PDPA National ID Reveal).
 *
 * Security Invariants:
 * 1. PBKDF2-HMAC-SHA512 with 100,000 iterations
 * 2. Cryptographically secure random 32-byte salt per user
 * 3. Server-side Pepper binding
 * 4. Constant-time comparison to prevent timing attacks
 * 5. Online Brute-force Throttling: Locks account PIN verification for 15 minutes after 5 consecutive failures
 * 6. Strongly typed User-entity relational storage in PostgreSQL (users table)
 */

const PIN_ROUNDS = 100000;
const PIN_KEY_LENGTH = 64; // 512 bits
const PIN_DIGEST = "sha512";
const MAX_FAILED_ATTEMPTS = 5;
const LOCKOUT_MINUTES = 15;

function getPepper(): string {
  return serverConfig.blindIndexPepper || serverConfig.fieldEncryptionKey;
}

export interface StoredPinData {
  pinHash: string;
  salt: string;
  failedAttempts: number;
  lockedUntil?: string | null;
  updatedAt: string;
}

/**
 * Hashes a 6-digit PIN using PBKDF2-HMAC-SHA512 with random salt and pepper.
 */
export function hashPin(
  pin: string,
  providedSalt?: string
): { hash: string; salt: string } {
  if (!/^\d{6}$/.test(pin)) {
    throw new ValidationException("รหัส PIN ต้องเป็นตัวเลข 6 หลัก (0-9)");
  }

  const salt = providedSalt || crypto.randomBytes(32).toString("hex");
  const pepper = getPepper();

  const derivedKey = crypto.pbkdf2Sync(
    pin,
    salt + pepper,
    PIN_ROUNDS,
    PIN_KEY_LENGTH,
    PIN_DIGEST
  );

  return {
    hash: derivedKey.toString("hex"),
    salt,
  };
}

/**
 * Timing-safe PIN verification.
 */
export function comparePin(
  pin: string,
  storedHash: string,
  salt: string
): boolean {
  if (!/^\d{6}$/.test(pin)) return false;

  const { hash: computedHash } = hashPin(pin, salt);

  const computedBuf = Buffer.from(computedHash, "hex");
  const storedBuf = Buffer.from(storedHash, "hex");

  if (computedBuf.length !== storedBuf.length) return false;
  return crypto.timingSafeEqual(computedBuf, storedBuf);
}

/**
 * Retrieves the current security PIN status for a specific user.
 * Each user maintains their own individual PIN independently.
 */
export async function getUserPinStatus(
  userId: string,
  _villageId?: string
): Promise<{
  hasPin: boolean;
  isLocked: boolean;
  remainingMinutes?: number;
  remainingAttempts?: number;
}> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      securityPinHash: true,
      securityPinSalt: true,
      pinFailedAttempts: true,
      pinLockedUntil: true,
    },
  });

  if (!user) {
    return { hasPin: false, isLocked: false };
  }

  if (user.pinLockedUntil) {
    const lockTime = new Date(user.pinLockedUntil).getTime();
    const now = Date.now();
    if (lockTime > now) {
      const remainingMinutes = Math.ceil((lockTime - now) / (60 * 1000));
      return {
        hasPin: true,
        isLocked: true,
        remainingMinutes,
        remainingAttempts: 0,
      };
    }
  }

  const remainingAttempts = Math.max(0, MAX_FAILED_ATTEMPTS - (user.pinFailedAttempts || 0));

  return {
    hasPin: Boolean(user.securityPinHash && user.securityPinSalt),
    isLocked: false,
    remainingAttempts,
  };
}

/**
 * Sets or updates a user's personal 6-digit Security PIN in the users table.
 * If user already has a PIN, currentPin must be provided and valid.
 */
export async function setUserSecurityPin(
  userId: string,
  villageId: string,
  newPin: string,
  currentPin?: string
): Promise<{ success: boolean; message: string }> {
  if (!/^\d{6}$/.test(newPin)) {
    throw new ValidationException("รหัส PIN ใหม่ต้องเป็นตัวเลข 6 หลักเท่านั้น");
  }

  // Prevent simple sequence or repeating identical numbers e.g. 123456, 111111
  if (/^(\d)\1{5}$/.test(newPin)) {
    throw new ValidationException("รหัส PIN ห้ามใช้ตัวเลขซ้ำกันทั้งหมด (เช่น 111111)");
  }
  if (newPin === "123456" || newPin === "654321") {
    throw new ValidationException("รหัส PIN ห้ามใช้ตัวเลขเรียงลำดับง่ายเกินไป");
  }

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      securityPinHash: true,
      securityPinSalt: true,
    },
  });

  if (!user) {
    throw new NotFoundException("ไม่พบข้อมูลผู้ใช้งานในระบบ");
  }

  if (user.securityPinHash && user.securityPinSalt) {
    if (!currentPin) {
      throw new ValidationException("กรุณาระบุรหัส PIN ปัจจุบันเพื่อยืนยันการเปลี่ยนรหัส");
    }
    const isValid = comparePin(currentPin, user.securityPinHash, user.securityPinSalt);
    if (!isValid) {
      throw new ForbiddenException("รหัส PIN ปัจจุบันไม่ถูกต้อง");
    }
  }

  const { hash: newHash, salt: newSalt } = hashPin(newPin);

  await prisma.user.update({
    where: { id: userId },
    data: {
      securityPinHash: newHash,
      securityPinSalt: newSalt,
      pinFailedAttempts: 0,
      pinLockedUntil: null,
    },
  });

  await recordAuditLog({
    villageId,
    userId,
    module: "settings",
    action: "UPDATE",
    entityType: "UserSecurityPin",
    entityId: userId,
    details: {
      action: "SET_SECURITY_PIN",
      timestamp: new Date().toISOString(),
    },
  });

  return {
    success: true,
    message: "ตั้งค่ารหัสความปลอดภัย 6 หลักเฉพาะบุคคลเรียบร้อยแล้ว",
  };
}

/**
 * Verifies the user's personal 6-digit Security PIN with Brute-force throttling.
 * Throws ForbiddenException if invalid or locked.
 */
export async function verifyUserSecurityPin(
  userId: string,
  villageId: string,
  pin: string
): Promise<{ success: boolean }> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      securityPinHash: true,
      securityPinSalt: true,
      pinFailedAttempts: true,
      pinLockedUntil: true,
    },
  });

  if (!user || !user.securityPinHash || !user.securityPinSalt) {
    throw new ForbiddenException(
      "คุณยังไม่ได้ตั้งค่ารหัสความปลอดภัย 6 หลัก กรุณาตั้งค่ารหัส PIN ในเมนูข้อมูลส่วนตัวก่อนเข้าถึงข้อมูลสำคัญ"
    );
  }

  // Check lockout
  if (user.pinLockedUntil) {
    const lockTime = new Date(user.pinLockedUntil).getTime();
    const now = Date.now();
    if (lockTime > now) {
      const remainingMinutes = Math.ceil((lockTime - now) / (60 * 1000));
      throw new ForbiddenException(
        `บัญชีถูกระงับการตรวจสอบรหัส PIN ชั่วคราวเนื่องจากกรอกผิดเกินกำหนด กรุณารออีก ${remainingMinutes} นาที`
      );
    }
  }

  const isMatch = comparePin(pin, user.securityPinHash, user.securityPinSalt);

  if (!isMatch) {
    const newFailCount = (user.pinFailedAttempts || 0) + 1;
    let lockedUntilDate: Date | null = null;

    if (newFailCount >= MAX_FAILED_ATTEMPTS) {
      lockedUntilDate = new Date(Date.now() + LOCKOUT_MINUTES * 60 * 1000);

      await recordAuditLog({
        villageId,
        userId,
        module: "settings",
        action: "UPDATE",
        entityType: "UserSecurityPin",
        entityId: userId,
        status: "FAILED",
        details: {
          reason: "SECURITY_PIN_LOCKED_MAX_ATTEMPTS",
          lockedMinutes: LOCKOUT_MINUTES,
        },
      });
    }

    await prisma.user.update({
      where: { id: userId },
      data: {
        pinFailedAttempts: newFailCount,
        pinLockedUntil: lockedUntilDate,
      },
    });

    if (lockedUntilDate) {
      throw new ForbiddenException(
        `กรอกรหัส PIN ผิดครบ ${MAX_FAILED_ATTEMPTS} ครั้ง ระบบได้ล็อคการเข้าถึงชั่วคราว ${LOCKOUT_MINUTES} นาที เพื่อความปลอดภัย`
      );
    }

    const remaining = MAX_FAILED_ATTEMPTS - newFailCount;
    throw new ForbiddenException(
      `รหัส PIN 6 หลักไม่ถูกต้อง (เหลือโอกาสลองอีก ${remaining} ครั้ง)`
    );
  }

  // Reset failed attempts upon successful verification
  if (user.pinFailedAttempts > 0 || user.pinLockedUntil) {
    await prisma.user.update({
      where: { id: userId },
      data: {
        pinFailedAttempts: 0,
        pinLockedUntil: null,
      },
    });
  }

  return { success: true };
}
