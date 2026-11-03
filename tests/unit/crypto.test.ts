import { describe, it, expect } from "vitest";
import {
  encryptNationalId,
  decryptNationalId,
  createNationalIdBlindIndex,
  maskNationalId,
  formatNationalId,
  validateThaiNationalIdCheckDigit,
} from "@/lib/crypto";

describe("VMS Cryptographic Engine Unit Tests", () => {
  const validNationalId = "1100200123456"; // Check digit test

  it("should encrypt and decrypt national ID back to exact original value", () => {
    const ciphertext = encryptNationalId(validNationalId);
    expect(ciphertext).toBeDefined();
    expect(typeof ciphertext).toBe("string");
    expect(ciphertext).not.toBe(validNationalId);

    const decrypted = decryptNationalId(ciphertext);
    expect(decrypted).toBe(validNationalId);
  });

  it("should produce different ciphertexts for the same plaintext due to random IV", () => {
    const cipher1 = encryptNationalId(validNationalId);
    const cipher2 = encryptNationalId(validNationalId);

    expect(cipher1).not.toBe(cipher2);
    expect(decryptNationalId(cipher1)).toBe(validNationalId);
    expect(decryptNationalId(cipher2)).toBe(validNationalId);
  });

  it("should produce a consistent deterministic HMAC blind index for the same ID", () => {
    const index1 = createNationalIdBlindIndex(validNationalId);
    const index2 = createNationalIdBlindIndex(validNationalId);

    expect(index1).toBe(index2);
    expect(index1.length).toBe(64); // SHA-256 hex length
  });

  it("should produce different blind indexes for different IDs", () => {
    const index1 = createNationalIdBlindIndex("1100200123456");
    const index2 = createNationalIdBlindIndex("1100200123457");

    expect(index1).not.toBe(index2);
  });

  it("should mask national ID properly to protect PDPA data", () => {
    const masked = maskNationalId(validNationalId);
    expect(masked).toBe("1-XXXX-XXXXX-45-6");
  });

  it("should format full 13-digit national ID in standard pattern", () => {
    const formatted = formatNationalId(validNationalId);
    expect(formatted).toBe("1-1002-00123-45-6");
  });

  it("should validate valid Thai National ID check digit correctly", () => {
    // Known valid test National IDs
    // Example: 1100200123456 -> Check digit calculation
    expect(validateThaiNationalIdCheckDigit("1100200123456")).toBe(true);
    // Invalid IDs
    expect(validateThaiNationalIdCheckDigit("1100200123457")).toBe(false);
    expect(validateThaiNationalIdCheckDigit("1111111111111")).toBe(false);
    expect(validateThaiNationalIdCheckDigit("12345")).toBe(false);
  });
});
