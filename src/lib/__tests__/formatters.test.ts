import { describe, it, expect } from "vitest";
import {
  formatThaiNationalId,
  formatThaiPhoneNumber,
  maskThaiNationalId,
  cleanDigits,
  formatBytes,
} from "../formatters";

describe("Thai Formatting Utilities", () => {
  describe("cleanDigits", () => {
    it("should remove non-digits", () => {
      expect(cleanDigits("1-2345-67890-12-3")).toBe("1234567890123");
      expect(cleanDigits("081-234-5678")).toBe("0812345678");
      expect(cleanDigits("")).toBe("");
      expect(cleanDigits(null)).toBe("");
    });
  });

  describe("formatThaiNationalId", () => {
    it("should format 13 digits into standard Thai pattern X-XXXX-XXXXX-XX-X", () => {
      expect(formatThaiNationalId("1234567890123")).toBe("1-2345-67890-12-3");
    });

    it("should format partially typed national ID", () => {
      expect(formatThaiNationalId("1")).toBe("1");
      expect(formatThaiNationalId("12")).toBe("1-2");
      expect(formatThaiNationalId("12345")).toBe("1-2345");
      expect(formatThaiNationalId("123456")).toBe("1-2345-6");
      expect(formatThaiNationalId("1234567890")).toBe("1-2345-67890");
      expect(formatThaiNationalId("12345678901")).toBe("1-2345-67890-1");
      expect(formatThaiNationalId("123456789012")).toBe("1-2345-67890-12");
      expect(formatThaiNationalId("1234567890123")).toBe("1-2345-67890-12-3");
    });

    it("should truncate digits beyond 13", () => {
      expect(formatThaiNationalId("1234567890123456")).toBe("1-2345-67890-12-3");
    });
  });

  describe("formatThaiPhoneNumber", () => {
    it("should format 10-digit mobile phone into 0XX-XXX-XXXX", () => {
      expect(formatThaiPhoneNumber("0812345678")).toBe("081-234-5678");
      expect(formatThaiPhoneNumber("0987654321")).toBe("098-765-4321");
    });

    it("should format partially typed mobile phone", () => {
      expect(formatThaiPhoneNumber("08")).toBe("08");
      expect(formatThaiPhoneNumber("081")).toBe("081");
      expect(formatThaiPhoneNumber("0812")).toBe("081-2");
      expect(formatThaiPhoneNumber("081234")).toBe("081-234");
      expect(formatThaiPhoneNumber("0812345")).toBe("081-234-5");
      expect(formatThaiPhoneNumber("0812345678")).toBe("081-234-5678");
    });

    it("should format 02 Bangkok landline into 02-XXX-XXXX", () => {
      expect(formatThaiPhoneNumber("021234567")).toBe("02-123-4567");
      expect(formatThaiPhoneNumber("029")).toBe("02-9");
      expect(formatThaiPhoneNumber("02987")).toBe("02-987");
      expect(formatThaiPhoneNumber("029876543")).toBe("02-987-6543");
    });

    it("should format 9-digit provincial landline into 0XX-XXX-XXX", () => {
      expect(formatThaiPhoneNumber("053123456")).toBe("053-123-456");
    });
  });

  describe("maskThaiNationalId", () => {
    it("should mask middle digits according to Thai PDPA 1-4-5-2-1", () => {
      expect(maskThaiNationalId("1234567890123")).toBe("1-XXXX-XXXXX-12-3");
    });
  });

  describe("formatBytes", () => {
    it("should format bytes into B, KB, MB", () => {
      expect(formatBytes(500)).toBe("500 B");
      expect(formatBytes(1024)).toBe("1.0 KB");
      expect(formatBytes(2048)).toBe("2.0 KB");
      expect(formatBytes(1048576)).toBe("1.0 MB");
      expect(formatBytes(5242880)).toBe("5.0 MB");
    });
  });
});
