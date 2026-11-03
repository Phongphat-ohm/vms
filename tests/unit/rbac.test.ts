import { describe, it, expect } from "vitest";
import { ForbiddenException } from "@/lib/exceptions";
import { assertPermission } from "@/lib/permissions";
import { AuthenticatedUser } from "@/lib/auth";

describe("VMS Multi-Village & RBAC Guard Unit Tests", () => {
  const adminUser: AuthenticatedUser = {
    id: "admin-1",
    email: "admin@village.local",
    fullName: "System Administrator",
    roles: ["SYSTEM_ADMIN"],
    permissions: ["person.read", "person.create", "person.sensitive.read"],
    allowedVillageIds: ["village-1"],
    activeVillageId: "village-1",
  };

  const staffUser: AuthenticatedUser = {
    id: "staff-1",
    email: "staff@village.local",
    fullName: "Village Staff",
    roles: ["STAFF"],
    permissions: ["person.read", "person.create"],
    allowedVillageIds: ["village-1"],
    activeVillageId: "village-1",
  };

  it("should allow SYSTEM_ADMIN to perform any action across any village", async () => {
    const result = await assertPermission("person.read", "village-999", adminUser);
    expect(result.villageId).toBe("village-999");
    expect(result.user.roles).toContain("SYSTEM_ADMIN");
  });

  it("should allow STAFF to perform action within allowed village with permission", async () => {
    const result = await assertPermission("person.read", "village-1", staffUser);
    expect(result.villageId).toBe("village-1");
  });

  it("should reject STAFF when permission code is missing", async () => {
    await expect(
      assertPermission("person.sensitive.read", "village-1", staffUser)
    ).rejects.toThrow(ForbiddenException);
  });

  it("should enforce multi-village isolation by rejecting cross-village access", async () => {
    await expect(
      assertPermission("person.read", "village-unauthorized", staffUser)
    ).rejects.toThrow(ForbiddenException);
  });
});
