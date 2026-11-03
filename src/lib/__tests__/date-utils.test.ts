import { describe, it, expect } from "vitest";
import { calculateAge, formatDateOnly } from "../date-utils";

describe("Date Utilities", () => {
  describe("calculateAge", () => {
    it("should calculate correct age for birthday that has passed this year", () => {
      const birth = new Date(2000, 0, 1); // Jan 1, 2000
      const age = calculateAge(birth);
      expect(age).toBeGreaterThanOrEqual(24);
    });

    it("should calculate correct age for string date", () => {
      const age = calculateAge("1990-05-15");
      expect(age).toBeGreaterThanOrEqual(34);
    });

    it("should return 0 for future or invalid date", () => {
      expect(calculateAge("invalid-date")).toBe(0);
      expect(calculateAge(new Date(2099, 0, 1))).toBe(0);
    });
  });

  describe("formatDateOnly", () => {
    it("should format valid date object to YYYY-MM-DD", () => {
      const d = new Date(Date.UTC(2025, 4, 15));
      expect(formatDateOnly(d)).toBe("2025-05-15");
    });

    it("should handle null and undefined", () => {
      expect(formatDateOnly(null)).toBeNull();
      expect(formatDateOnly(undefined)).toBeNull();
    });
  });
});
