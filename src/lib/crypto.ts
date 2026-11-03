import crypto from "crypto";
import { serverConfig } from "@/lib/config";

/**
 * Village Management System (VMS) - Cryptographic Engine
 * Implements Field-Level Encryption (AES-256-GCM) and Blind Indexing (HMAC-SHA256)
 * Strict PDPA compliance: No plaintext National IDs stored in database.
 */

// Key derivation / retrieval
function getEncryptionKey(): Buffer {
  const envKey = serverConfig.fieldEncryptionKey;
  if (envKey.length === 64) {
    return Buffer.from(envKey, "hex");
  }
  return crypto.createHash("sha256").update(envKey).digest();
}

function getBlindIndexPepper(): string {
  return serverConfig.blindIndexPepper;
}

/**
 * Encrypts a 13-digit Thai National ID using AES-256-GCM authenticated encryption.
 * Output format: base64(iv:authTag:ciphertext)
 */
export function encryptNationalId(nationalId: string): string {
  const cleanId = nationalId.replace(/\D/g, "");
  if (cleanId.length !== 13) {
    throw new Error("เลขประจำตัวประชาชนต้องมี 13 หลัก");
  }

  const key = getEncryptionKey();
  const iv = crypto.randomBytes(12); // Standard 96-bit IV for GCM
  const cipher = crypto.createCipheriv("aes-256-gcm", key, iv);

  let ciphertext = cipher.update(cleanId, "utf8", "hex");
  ciphertext += cipher.final("hex");

  const authTag = cipher.getAuthTag();

  // Serialized as iv:authTag:ciphertext in Base64
  const payload = `${iv.toString("hex")}:${authTag.toString("hex")}:${ciphertext}`;
  return Buffer.from(payload, "utf8").toString("base64");
}

/**
 * Decrypts a previously encrypted National ID string.
 * Verifies authenticity with GCM Auth Tag.
 */
export function decryptNationalId(encryptedData: string): string {
  try {
    const rawPayload = Buffer.from(encryptedData, "base64").toString("utf8");
    const [ivHex, authTagHex, ciphertextHex] = rawPayload.split(":");

    if (!ivHex || !authTagHex || !ciphertextHex) {
      throw new Error("Invalid ciphertext structure");
    }

    const key = getEncryptionKey();
    const iv = Buffer.from(ivHex, "hex");
    const authTag = Buffer.from(authTagHex, "hex");

    const decipher = crypto.createDecipheriv("aes-256-gcm", key, iv);
    decipher.setAuthTag(authTag);

    let decrypted = decipher.update(ciphertextHex, "hex", "utf8");
    decrypted += decipher.final("utf8");

    return decrypted;
  } catch (error) {
    throw new Error("ไม่สามารถถอดรหัสเลขประจำตัวประชาชนได้ หรือข้อมูลถูกแก้ไขโดยมิชอบ");
  }
}

/**
 * Generates an HMAC-SHA256 Blind Index for Exact Match Search.
 * Allows $O(1)$ search queries via unique index without decrypting table.
 */
export function createNationalIdBlindIndex(nationalId: string): string {
  const cleanId = nationalId.replace(/\D/g, "");
  if (cleanId.length !== 13) {
    throw new Error("เลขประจำตัวประชาชนต้องมี 13 หลักสำหรับทำ Blind Index");
  }

  const pepper = getBlindIndexPepper();
  return crypto.createHmac("sha256", pepper).update(cleanId).digest("hex");
}

/**
 * Formats a 13-digit Thai National ID with masking according to PDPA:
 * Format: 1-XXXX-XXXXX-23-4 (Masks middle digits, preserves first and last check digits)
 */
export function maskNationalId(nationalId: string): string {
  const cleanId = nationalId.replace(/\D/g, "");
  if (cleanId.length !== 13) {
    return "X-XXXX-XXXXX-XX-X";
  }

  const part1 = cleanId[0]; // First digit
  const part4 = cleanId.slice(10, 12); // Digits 11-12
  const part5 = cleanId[12]; // Last check digit

  return `${part1}-XXXX-XXXXX-${part4}-${part5}`;
}

/**
 * Formats full 13-digit National ID into standard hyphenated pattern:
 * Format: X-XXXX-XXXXX-XX-X
 */
export function formatNationalId(nationalId: string): string {
  const cleanId = nationalId.replace(/\D/g, "");
  if (cleanId.length !== 13) {
    return nationalId;
  }
  return `${cleanId[0]}-${cleanId.slice(1, 5)}-${cleanId.slice(5, 10)}-${cleanId.slice(10, 12)}-${cleanId[12]}`;
}

/**
 * Validates a 13-digit Thai National ID using Mod 11 Check Digit algorithm.
 */
export function validateThaiNationalIdCheckDigit(nationalId: string): boolean {
  const cleanId = nationalId.replace(/\D/g, "");
  if (cleanId.length !== 13) return false;

  // Reject repeating identical numbers e.g. 0000000000000 or 1111111111111
  if (/^(\d)\1{12}$/.test(cleanId)) return false;

  let sum = 0;
  for (let i = 0; i < 12; i++) {
    sum += parseInt(cleanId[i], 10) * (13 - i);
  }

  const checkDigit = (11 - (sum % 11)) % 10;
  return checkDigit === parseInt(cleanId[12], 10);
}
