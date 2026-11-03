import { describe, it, expect } from "vitest";
import { hashPin, comparePin } from "../security-pin";

describe("Security PIN Cryptographic Engine", () => {
  it("should successfully hash a valid 6-digit PIN", () => {
    const { hash, salt } = hashPin("128945");
    expect(hash).toBeDefined();
    expect(hash.length).toBe(128); // 64 bytes in hex = 128 characters (SHA-512)
    expect(salt).toBeDefined();
    expect(salt.length).toBe(64); // 32 bytes in hex = 64 characters
  });

  it("should reject PINs that are not exactly 6 digits", () => {
    expect(() => hashPin("12345")).toThrow();
    expect(() => hashPin("1234567")).toThrow();
    expect(() => hashPin("abcdef")).toThrow();
    expect(() => hashPin("123a56")).toThrow();
  });

  it("should verify correct PIN using comparePin", () => {
    const pin = "739201";
    const { hash, salt } = hashPin(pin);

    expect(comparePin(pin, hash, salt)).toBe(true);
  });

  it("should reject incorrect PIN using comparePin", () => {
    const pin = "739201";
    const { hash, salt } = hashPin(pin);

    expect(comparePin("000000", hash, salt)).toBe(false);
    expect(comparePin("739202", hash, salt)).toBe(false);
    expect(comparePin("12345", hash, salt)).toBe(false);
    expect(comparePin("invalid", hash, salt)).toBe(false);
  });

  it("should produce unique salts for identical PINs", () => {
    const pin = "456789";
    const hash1 = hashPin(pin);
    const hash2 = hashPin(pin);

    expect(hash1.salt).not.toBe(hash2.salt);
    expect(hash1.hash).not.toBe(hash2.hash);
  });
});
