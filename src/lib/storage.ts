import crypto from "crypto";
import fs from "fs/promises";
import path from "path";
import { serverConfig } from "@/lib/config";
import { getSupabaseAdminClient } from "@/lib/supabase";

export interface FileMetadata {
  id: string;
  originalName: string;
  mimeType: string;
  fileSizeBytes: number;
  checksumSha256: string;
  storagePath: string;
}

const STORAGE_ROOT = path.join(process.cwd(), "storage");

/**
 * Validates file MIME types against allowed civic document types.
 * Allowed: PDF, JPEG, PNG, WEBP.
 */
export function validateAllowedMimeType(mimeType: string): boolean {
  const allowed = ["application/pdf", "image/jpeg", "image/png", "image/webp"];
  return allowed.includes(mimeType.toLowerCase());
}

/**
 * Generates an internal UUID-based storage path.
 * Invariant: Never use citizen names or national IDs in storage paths!
 */
export function generateStoragePath(villageId: string, fileId: string, extension: string): string {
  const safeExt = extension.replace(/^\./, "").toLowerCase().replace(/[^a-z0-9]/g, "");
  return `villages/${villageId}/${fileId}.${safeExt || "bin"}`;
}

/**
 * Calculates SHA-256 checksum of file buffer.
 */
export function calculateChecksum(buffer: Buffer): string {
  return crypto.createHash("sha256").update(buffer).digest("hex");
}

/**
 * Saves a binary file buffer to storage.
 * Saves to private storage on disk and synchronizes to Supabase Storage bucket when configured.
 */
export async function saveFileToStorage(
  storagePath: string,
  buffer: Buffer,
  mimeType?: string
): Promise<{ absolutePath: string; checksumSha256: string }> {
  const checksumSha256 = calculateChecksum(buffer);

  // 1. Save to local private storage
  const fullPath = path.join(STORAGE_ROOT, storagePath);
  const dir = path.dirname(fullPath);
  await fs.mkdir(dir, { recursive: true });
  await fs.writeFile(fullPath, buffer);

  // 2. Synchronize to Supabase Storage if configured
  try {
    const supabase = getSupabaseAdminClient();
    if (supabase) {
      await supabase.storage
        .from(serverConfig.storageBucketName)
        .upload(storagePath, buffer, {
          contentType: mimeType || "application/octet-stream",
          upsert: true,
        });
    }
  } catch {
    // If Supabase Storage is offline or uninitialized, local disk retains the file safely
  }

  return { absolutePath: fullPath, checksumSha256 };
}

/**
 * Reads a stored binary file buffer from storage (local disk or Supabase Storage).
 */
export async function readFileFromStorage(storagePath: string): Promise<Buffer | null> {
  // Try local private storage first
  try {
    const fullPath = path.join(STORAGE_ROOT, storagePath);
    return await fs.readFile(fullPath);
  } catch {
    // Fallback: fetch from Supabase Storage bucket
    try {
      const supabase = getSupabaseAdminClient();
      if (supabase) {
        const { data, error } = await supabase.storage
          .from(serverConfig.storageBucketName)
          .download(storagePath);
        if (data && !error) {
          const arrayBuffer = await data.arrayBuffer();
          return Buffer.from(arrayBuffer);
        }
      }
    } catch {
      return null;
    }
    return null;
  }
}

/**
 * Deletes a stored file from storage (both local disk and Supabase Storage).
 */
export async function deleteFileFromStorage(storagePath: string): Promise<boolean> {
  try {
    const fullPath = path.join(STORAGE_ROOT, storagePath);
    await fs.unlink(fullPath);
  } catch {}

  try {
    const supabase = getSupabaseAdminClient();
    if (supabase) {
      await supabase.storage
        .from(serverConfig.storageBucketName)
        .remove([storagePath]);
    }
  } catch {}

  return true;
}

/**
 * Generates a signed download URL token with expiration and HMAC verification.
 */
export function generateShortLivedSignedUrl(
  fileId: string,
  expiresInSeconds = serverConfig.storageSignedUrlExpiry
): string {
  const expiresAt = Math.floor(Date.now() / 1000) + expiresInSeconds;
  const payload = `${fileId}:${expiresAt}`;
  const sig = crypto
    .createHmac("sha256", serverConfig.jwtSecret)
    .update(payload)
    .digest("hex");

  return `/api/documents/${fileId}/download?exp=${expiresAt}&sig=${sig}`;
}

/**
 * Verifies a download URL token signature and expiration.
 */
export function verifySignedDownloadToken(
  fileId: string,
  expiresAtStr: string,
  providedSig: string
): boolean {
  const expiresAt = parseInt(expiresAtStr, 10);
  if (isNaN(expiresAt) || expiresAt < Math.floor(Date.now() / 1000)) {
    return false; // Expired
  }

  const payload = `${fileId}:${expiresAt}`;
  const expectedSig = crypto
    .createHmac("sha256", serverConfig.jwtSecret)
    .update(payload)
    .digest("hex");

  const providedBuf = Buffer.from(providedSig, "hex");
  const expectedBuf = Buffer.from(expectedSig, "hex");

  if (providedBuf.length !== expectedBuf.length) return false;
  return crypto.timingSafeEqual(providedBuf, expectedBuf);
}
