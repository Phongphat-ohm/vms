"use server";

import { ActionResponse } from "@/types/common";
import { assertPermission } from "@/lib/permissions";
import { verifyUserSecurityPin } from "@/lib/security-pin";
import { createPersonSchema, revealNationalIdSchema, updatePersonSchema } from "./schemas";
import * as populationService from "./service";
import { CreatePersonInput, UpdatePersonInput, PersonDto, PersonDetailDto } from "./types";

export type { ActionResponse };

export async function createPersonAction(
  rawInput: CreatePersonInput
): Promise<ActionResponse<PersonDto>> {
  try {
    const { user, villageId } = await assertPermission("person.create", rawInput.villageId);
    const validated = createPersonSchema.parse(rawInput);

    const person = await populationService.createPerson(
      { ...validated, villageId } as CreatePersonInput,
      user.id,
      villageId
    );

    return {
      success: true,
      data: person,
      message: `เพิ่มข้อมูลประชากร ${person.firstName} ${person.lastName} สำเร็จ`,
    };
  } catch (error: any) {
    return {
      success: false,
      error: {
        code: error.code || "VALIDATION_FAILED",
        message: error.message || "เกิดข้อผิดพลาดในการบันทึกข้อมูล",
        details: error.issues || error.details,
      },
    };
  }
}

export async function updatePersonAction(
  rawInput: UpdatePersonInput,
  targetVillageId?: string
): Promise<ActionResponse<PersonDetailDto>> {
  try {
    const { user, villageId } = await assertPermission("person.update", targetVillageId);
    const validated = updatePersonSchema.parse(rawInput);

    const updated = await populationService.updatePerson(
      validated as UpdatePersonInput,
      user.id,
      villageId
    );

    return {
      success: true,
      data: updated,
      message: `ปรับปรุงข้อมูลประชากร ${updated.firstName} ${updated.lastName} สำเร็จ`,
    };
  } catch (error: any) {
    return {
      success: false,
      error: {
        code: error.code || "UPDATE_FAILED",
        message: error.message || "ไม่สามารถแก้ไขข้อมูลประชากรได้",
        details: error.issues || error.details,
      },
    };
  }
}

export async function searchPopulationAction(params: any = {}): Promise<ActionResponse<PersonDto[]>> {
  try {
    const { villageId } = await assertPermission("person.read", params.villageId);
    const list = await populationService.searchPopulation(params, villageId);
    return { success: true, data: list };
  } catch (error: any) {
    return {
      success: false,
      error: {
        code: error.code || "INTERNAL_ERROR",
        message: error.message || "ไม่สามารถดึงข้อมูลประชากรได้",
      },
    };
  }
}

export async function getPersonByIdAction(
  personId: string,
  targetVillageId?: string
): Promise<ActionResponse<PersonDetailDto>> {
  try {
    const { villageId } = await assertPermission("person.read", targetVillageId);
    const detail = await populationService.getPersonById(personId, villageId);
    return { success: true, data: detail };
  } catch (error: any) {
    return {
      success: false,
      error: {
        code: error.code || "NOT_FOUND",
        message: error.message || "ไม่พบข้อมูลประชากรที่ระบุ",
      },
    };
  }
}

export async function revealNationalIdAction(
  personId: string,
  reason: string,
  pin: string
): Promise<ActionResponse<{ fullNationalId: string }>> {
  try {
    const { user, villageId } = await assertPermission("person.sensitive.read");

    if (!pin || !/^\d{6}$/.test(pin)) {
      return {
        success: false,
        error: { code: "INVALID_PIN", message: "กรุณาระบุรหัสความปลอดภัย PIN 6 หลักให้ถูกต้อง" },
      };
    }

    // Verify 6-digit PIN with brute-force lockout protection
    await verifyUserSecurityPin(user.id, villageId, pin);

    const validated = revealNationalIdSchema.parse({ personId, reason });

    const fullNationalId = await populationService.revealNationalId(
      validated.personId,
      validated.reason,
      user.id,
      villageId
    );

    return {
      success: true,
      data: { fullNationalId },
      message: "ถอดรหัสเลขประจำตัวประชาชนสำเร็จและบันทึกประวัติการเข้าถึงแล้ว",
    };
  } catch (error: any) {
    return {
      success: false,
      error: {
        code: error.code || "FORBIDDEN",
        message: error.message || "ไม่สามารถเปิดดูเลขประจำตัวประชาชนได้",
      },
    };
  }
}

export async function exportPopulationAction(targetVillageId?: string): Promise<ActionResponse<{ csvContent: string }>> {
  try {
    const { user, villageId } = await assertPermission("person.export", targetVillageId);
    const csvContent = await populationService.exportPopulationCsv(villageId, user.id);
    return {
      success: true,
      data: { csvContent },
      message: "ส่งออกข้อมูลประชากรสำเร็จ",
    };
  } catch (error: any) {
    return {
      success: false,
      error: {
        code: error.code || "EXPORT_FAILED",
        message: error.message || "ไม่สามารถส่งออกข้อมูลประชากรได้",
      },
    };
  }
}

export async function archivePersonAction(personId: string): Promise<ActionResponse<void>> {
  try {
    const { user, villageId } = await assertPermission("person.archive");
    await populationService.archivePerson(personId, villageId, user.id);
    return {
      success: true,
      message: "เก็บถาวรข้อมูลประชากรสำเร็จ",
    };
  } catch (error: any) {
    return {
      success: false,
      error: {
        code: error.code || "ARCHIVE_FAILED",
        message: error.message || "ไม่สามารถเก็บถาวรข้อมูลประชากรได้",
      },
    };
  }
}
