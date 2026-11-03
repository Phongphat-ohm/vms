import crypto from "crypto";
import { cookies } from "next/headers";
import { UnauthorizedException } from "./exceptions";
import { serverConfig, publicConfig } from "./config";

export interface AuthenticatedUser {
  id: string;
  email: string;
  fullName: string;
  roles: string[];
  permissions: string[];
  allowedVillageIds: string[];
  activeVillageId: string;
  activeVillageName?: string;
}

const DEFAULT_DEV_USER: AuthenticatedUser = {
  id: "00000000-0000-0000-0000-000000000001",
  email: serverConfig.initialAdminEmail,
  fullName: "ผู้ดูแลระบบกลาง",
  roles: ["SYSTEM_ADMIN", "VILLAGE_ADMIN"],
  permissions: [
    "person.read",
    "person.create",
    "person.update",
    "person.archive",
    "person.sensitive.read",
    "person.export",
    "household.read",
    "household.create",
    "household.update",
    "household.transfer",
    "document.read",
    "document.upload",
    "document.delete",
    "user.read",
    "user.create",
    "user.update",
    "user.disable",
    "role.read",
    "role.create",
    "role.update",
    "role.assign",
    "settings.read",
    "settings.update",
    "audit.read",
  ],
  allowedVillageIds: [serverConfig.defaultVillageId],
  activeVillageId: serverConfig.defaultVillageId,
  activeVillageName: `${publicConfig.defaultVillage.name} หมู่ ${publicConfig.defaultVillage.moo}`,
};

/**
 * Creates a cryptographically signed session token using HMAC-SHA256.
 * Format: <Base64Payload>.<HexHMACSignature>
 */
export function signSessionToken(payload: AuthenticatedUser): string {
  const payloadBase64 = Buffer.from(JSON.stringify(payload), "utf-8").toString("base64url");
  const signature = crypto
    .createHmac("sha256", serverConfig.jwtSecret)
    .update(payloadBase64)
    .digest("hex");
  return `${payloadBase64}.${signature}`;
}

/**
 * Verifies the integrity of a signed session token.
 * Prevents token tampering and role forgery.
 */
export function verifySessionToken(token: string): AuthenticatedUser | null {
  if (!token || typeof token !== "string") return null;

  const parts = token.split(".");
  if (parts.length !== 2) return null;

  const [payloadBase64, providedSignature] = parts;
  const expectedSignature = crypto
    .createHmac("sha256", serverConfig.jwtSecret)
    .update(payloadBase64)
    .digest("hex");

  // Constant-time comparison to prevent timing attacks
  const providedBuf = Buffer.from(providedSignature, "hex");
  const expectedBuf = Buffer.from(expectedSignature, "hex");

  if (providedBuf.length !== expectedBuf.length) return null;
  if (!crypto.timingSafeEqual(providedBuf, expectedBuf)) return null;

  try {
    const rawJson = Buffer.from(payloadBase64, "base64url").toString("utf-8");
    const parsed = JSON.parse(rawJson);
    if (parsed && parsed.id && parsed.email && Array.isArray(parsed.permissions)) {
      return parsed as AuthenticatedUser;
    }
    return null;
  } catch {
    return null;
  }
}

/**
 * Retrieves the current authenticated session from cookies / auth state.
 */
export async function getSession(): Promise<AuthenticatedUser | null> {
  const cookieStore = await cookies();
  const sessionToken = cookieStore.get(serverConfig.sessionCookieName)?.value;

  if (sessionToken) {
    const user = verifySessionToken(sessionToken);
    if (user) {
      return user;
    }
  }

  // Development environment fallback only when explicitly allowed
  if (process.env.NODE_ENV !== "production" && !process.env.SESSION_STRICT && !sessionToken) {
    return DEFAULT_DEV_USER;
  }

  return null;
}

/**
 * Asserts that a valid session exists, throwing UnauthorizedException if missing.
 */
export async function requireSession(): Promise<AuthenticatedUser> {
  const session = await getSession();
  if (!session) {
    throw new UnauthorizedException("กรุณาเข้าสู่ระบบก่อนดำเนินการ");
  }
  return session;
}
