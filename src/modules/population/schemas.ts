import { z } from "zod";
import { validateThaiNationalIdCheckDigit } from "@/lib/crypto";

export const createPersonSchema = z.object({
  nationalId: z
    .string()
    .min(13, "เลขประจำตัวประชาชนต้องมี 13 หลัก")
    .max(17, "เลขประจำตัวประชาชนไม่เกิน 17 ตัวอักษร")
    .refine((val) => validateThaiNationalIdCheckDigit(val), {
      message: "เลขประจำตัวประชาชนไม่ถูกต้องตามหลักการคำนวณ Check Digit (Mod 11)",
    }),
  title: z.string().min(1, "กรุณาระบุคำนำหน้าชื่อ"),
  firstName: z.string().min(2, "ชื่อต้องมีความยาวอย่างน้อย 2 ตัวอักษร").max(100),
  lastName: z.string().min(2, "นามสกุลต้องมีความยาวอย่างน้อย 2 ตัวอักษร").max(100),
  gender: z.enum(["MALE", "FEMALE", "OTHER"], {
    message: "กรุณาเลือกเพศ",
  }),
  birthDate: z.string().refine((val) => !isNaN(Date.parse(val)), {
    message: "รูปแบบวันที่ไม่ถูกต้อง",
  }),
  nationality: z.string().default("ไทย"),
  religion: z.string().optional(),
  phoneNumber: z.string().max(30).optional(),
  occupation: z.string().max(100).optional(),
  education: z.string().max(100).optional(),
});

export const revealNationalIdSchema = z.object({
  personId: z.string().uuid("รหัสบุคคลไม่ถูกต้อง"),
  reason: z.string().min(5, "กรุณาระบุเหตุผลในการขอเปิดดูเลขประจำตัวประชาชนอย่างน้อย 5 ตัวอักษร"),
});

export const updatePersonSchema = z.object({
  personId: z.string().uuid("รหัสบุคคลไม่ถูกต้อง"),
  title: z.string().min(1, "กรุณาระบุคำนำหน้าชื่อ"),
  firstName: z.string().min(2, "ชื่อต้องมีความยาวอย่างน้อย 2 ตัวอักษร").max(100),
  lastName: z.string().min(2, "นามสกุลต้องมีความยาวอย่างน้อย 2 ตัวอักษร").max(100),
  gender: z.enum(["MALE", "FEMALE", "OTHER"], {
    message: "กรุณาเลือกเพศ",
  }),
  birthDate: z.string().refine((val) => !isNaN(Date.parse(val)), {
    message: "รูปแบบวันที่ไม่ถูกต้อง",
  }),
  nationality: z.string().default("ไทย"),
  religion: z.string().optional().nullable(),
  phoneNumber: z.string().max(30).optional().nullable(),
  occupation: z.string().max(100).optional().nullable(),
  education: z.string().max(100).optional().nullable(),
  isAlive: z.boolean().default(true),
  deathDate: z.string().optional().nullable(),
});

export type UpdatePersonInput = z.infer<typeof updatePersonSchema>;
