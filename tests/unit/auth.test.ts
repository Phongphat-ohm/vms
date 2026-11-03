import { describe, it, expect } from "vitest";
import { signSessionToken, verifySessionToken, AuthenticatedUser } from "@/lib/auth";

describe("VMS Signed Session Cryptographic Engine Unit Tests", () => {
  const mockUser: AuthenticatedUser = {
    id: "user-123",
    email: "test@village.local",
    fullName: "เจ้าหน้าที่ ทดสอบ",
    roles: ["STAFF"],
    permissions: ["person.read"],
    allowedVillageIds: ["vil-01"],
    activeVillageId: "vil-01",
    activeVillageName: "บ้านทดสอบ",
  };

  it("should generate a valid signed token in <payload>.<signature> format", () => {
    const token = signSessionToken(mockUser);
    expect(token).toBeDefined();
    expect(token.includes(".")).toBe(true);

    const parts = token.split(".");
    expect(parts.length).toBe(2);
    expect(parts[0].length).toBeGreaterThan(10);
    expect(parts[1].length).toBe(64); // SHA-256 Hex
  });

  it("should successfully verify and decode authentic signed token", () => {
    const token = signSessionToken(mockUser);
    const decoded = verifySessionToken(token);

    expect(decoded).not.toBeNull();
    expect(decoded?.id).toBe(mockUser.id);
    expect(decoded?.email).toBe(mockUser.email);
    expect(decoded?.roles).toEqual(mockUser.roles);
    expect(decoded?.activeVillageId).toBe(mockUser.activeVillageId);
  });

  it("should reject tampered payload attempting privilege escalation", () => {
    const token = signSessionToken(mockUser);
    const [payloadBase64, signature] = token.split(".");

    // Attacker tampers with payload to grant themselves SYSTEM_ADMIN
    const rawJson = Buffer.from(payloadBase64, "base64url").toString("utf-8");
    const tamperedObj = JSON.parse(rawJson);
    tamperedObj.roles = ["SYSTEM_ADMIN"];
    const tamperedPayload = Buffer.from(JSON.stringify(tamperedObj), "utf-8").toString("base64url");

    const forgedToken = `${tamperedPayload}.${signature}`;
    const result = verifySessionToken(forgedToken);

    expect(result).toBeNull();
  });

  it("should reject token with forged signature", () => {
    const token = signSessionToken(mockUser);
    const [payloadBase64] = token.split(".");
    const invalidSignature = "0000000000000000000000000000000000000000000000000000000000000000";

    const forgedToken = `${payloadBase64}.${invalidSignature}`;
    const result = verifySessionToken(forgedToken);

    expect(result).toBeNull();
  });

  it("should reject malformed or empty tokens", () => {
    expect(verifySessionToken("")).toBeNull();
    expect(verifySessionToken("random-string-without-dot")).toBeNull();
    expect(verifySessionToken("part1.part2.part3")).toBeNull();
  });
});
