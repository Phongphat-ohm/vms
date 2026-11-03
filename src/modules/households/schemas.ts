import { z } from "zod";

export const createHouseSchema = z.object({
  houseNumber: z.string().min(1, "กรุณาระบุเลขที่บ้าน"),
  subHouseNumber: z.string().optional(),
  buildingType: z.string().default("DETACHED"),
  latitude: z.number().optional(),
  longitude: z.number().optional(),
});

export const transferPersonSchema = z.object({
  personId: z.string().uuid("รหัสบุคคลไม่ถูกต้อง"),
  sourceHouseholdId: z.string().uuid("รหัสครัวเรือนต้นทางไม่ถูกต้อง"),
  targetHouseholdId: z.string().uuid("รหัสครัวเรือนปลายทางไม่ถูกต้อง"),
  relationshipToHead: z.string().min(1, "กรุณาระบุความสัมพันธ์กับหัวหน้าครัวเรือน"),
  residenceType: z.enum(["OFFICIAL", "ACTUAL_RESIDENT", "OFFICIAL_ABSENT"], {
    message: "กรุณาระบุประเภทการอยู่อาศัยที่ถูกต้อง",
  }),
  effectiveDate: z.string().refine((val) => !isNaN(Date.parse(val)), {
    message: "รูปแบบวันที่ไม่ถูกต้อง",
  }),
  reason: z.string().optional(),
});

export const updateHouseSchema = z.object({
  houseId: z.string().uuid("รหัสบ้านไม่ถูกต้อง"),
  houseNumber: z.string().min(1, "กรุณาระบุเลขที่บ้าน"),
  subHouseNumber: z.string().optional().nullable(),
  buildingType: z.string().min(1, "กรุณาระบุประเภทสิ่งปลูกสร้าง"),
  latitude: z.number().optional().nullable(),
  longitude: z.number().optional().nullable(),
  isActive: z.boolean().default(true),
});

export type UpdateHouseInput = z.infer<typeof updateHouseSchema>;
