"use server";

import { assertPermission } from "@/lib/permissions";
import { createHouseSchema, transferPersonSchema, updateHouseSchema } from "./schemas";
import * as householdService from "./service";
import { CreateHouseInput, UpdateHouseInput, HouseDto, HouseDetailDto, TransferPersonInput } from "./types";
import { ActionResponse } from "@/types/common";

export async function createHouseAction(
  rawInput: CreateHouseInput
): Promise<ActionResponse<HouseDto>> {
  try {
    const { user, villageId } = await assertPermission("household.create", rawInput.villageId);
    const validated = createHouseSchema.parse(rawInput);

    const house = await householdService.createHouse(
      { ...validated, villageId } as CreateHouseInput,
      user.id,
      villageId
    );

    return {
      success: true,
      data: house,
      message: `เพิ่มบ้านเลขที่ ${house.houseNumber} สำเร็จ`,
    };
  } catch (error: any) {
    return {
      success: false,
      error: {
        code: error.code || "VALIDATION_FAILED",
        message: error.message || "เกิดข้อผิดพลาดในการบันทึกข้อมูลบ้าน",
      },
    };
  }
}

export async function updateHouseAction(
  rawInput: UpdateHouseInput,
  targetVillageId?: string
): Promise<ActionResponse<HouseDetailDto>> {
  try {
    const { user, villageId } = await assertPermission("household.update", targetVillageId);
    const validated = updateHouseSchema.parse(rawInput);

    const updated = await householdService.updateHouse(
      validated as UpdateHouseInput,
      user.id,
      villageId
    );

    return {
      success: true,
      data: updated,
      message: `ปรับปรุงข้อมูลบ้านเลขที่ ${updated.houseNumber} สำเร็จ`,
    };
  } catch (error: any) {
    return {
      success: false,
      error: {
        code: error.code || "UPDATE_FAILED",
        message: error.message || "ไม่สามารถแก้ไขข้อมูลบ้านได้",
      },
    };
  }
}

export async function listHousesAction(targetVillageId?: string): Promise<ActionResponse<HouseDto[]>> {
  try {
    const { villageId } = await assertPermission("household.read", targetVillageId);
    const list = await householdService.listHouses(villageId);
    return { success: true, data: list };
  } catch (error: any) {
    return {
      success: false,
      error: {
        code: error.code || "INTERNAL_ERROR",
        message: error.message || "ไม่สามารถดึงข้อมูลบ้านได้",
      },
    };
  }
}

export async function getHouseByIdAction(
  houseId: string,
  targetVillageId?: string
): Promise<ActionResponse<HouseDetailDto>> {
  try {
    const { villageId } = await assertPermission("household.read", targetVillageId);
    const detail = await householdService.getHouseById(houseId, villageId);
    return { success: true, data: detail };
  } catch (error: any) {
    return {
      success: false,
      error: {
        code: error.code || "NOT_FOUND",
        message: error.message || "ไม่พบข้อมูลบ้านที่ระบุ",
      },
    };
  }
}

export async function transferPersonAction(
  rawInput: TransferPersonInput
): Promise<ActionResponse<{ eventId: string }>> {
  try {
    const { user, villageId } = await assertPermission("household.transfer");
    const validated = transferPersonSchema.parse(rawInput);

    const result = await householdService.transferPerson(
      validated as TransferPersonInput,
      user.id,
      villageId
    );

    return {
      success: true,
      data: result,
      message: "ดำเนินการย้ายประชากรสำเร็จและบันทึกประวัติเหตุการณ์เรียบร้อยแล้ว",
    };
  } catch (error: any) {
    return {
      success: false,
      error: {
        code: error.code || "TRANSFER_FAILED",
        message: error.message || "ไม่สามารถดำเนินการย้ายประชากรได้",
      },
    };
  }
}

export async function listTargetHouseholdsAction(
  excludeHouseId?: string
): Promise<ActionResponse<{ householdId: string; houseNumber: string; headName: string }[]>> {
  try {
    const { villageId } = await assertPermission("household.read");
    const targets = await householdService.listTargetHouseholds(villageId, excludeHouseId);
    return {
      success: true,
      data: targets,
    };
  } catch (error: any) {
    return {
      success: false,
      error: {
        code: error.code || "FETCH_FAILED",
        message: error.message || "ไม่สามารถดึงข้อมูลครัวเรือนเป้าหมายได้",
      },
    };
  }
}
