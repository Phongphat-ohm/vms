"use server";

import { assertPermission } from "@/lib/permissions";
import { ActionResponse } from "@/types/common";
import * as documentService from "./service";
import { DocumentItemDto } from "./types";

export async function listFilesAction(
  targetVillageId?: string
): Promise<ActionResponse<DocumentItemDto[]>> {
  try {
    const { villageId } = await assertPermission("document.read", targetVillageId);
    const files = await documentService.listFiles(villageId);
    return {
      success: true,
      data: files,
    };
  } catch (error: any) {
    return {
      success: false,
      error: {
        code: error.code || "INTERNAL_ERROR",
        message: error.message || "ไม่สามารถดึงข้อมูลคลังเอกสารได้",
      },
    };
  }
}

export async function uploadFileAction(
  formData: FormData
): Promise<ActionResponse<DocumentItemDto>> {
  try {
    const file = formData.get("file") as File | null;
    const category = (formData.get("category") as string) || "เอกสารทั่วไป";
    const houseId = (formData.get("houseId") as string) || undefined;
    const personId = (formData.get("personId") as string) || undefined;
    const notes = (formData.get("notes") as string) || undefined;

    if (!file || !(file instanceof File) || file.size === 0) {
      return {
        success: false,
        error: {
          code: "VALIDATION_FAILED",
          message: "กรุณาเลือกไฟล์เอกสารที่ต้องการอัปโหลด",
        },
      };
    }

    if (file.size > 20 * 1024 * 1024) {
      return {
        success: false,
        error: {
          code: "FILE_TOO_LARGE",
          message: "ขนาดไฟล์ต้องไม่เกิน 20 MB",
        },
      };
    }

    const { user, villageId } = await assertPermission("document.upload");
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const savedDoc = await documentService.saveAndRegisterFile(
      {
        originalName: file.name,
        mimeType: file.type || "application/octet-stream",
        buffer,
        category,
        houseId,
        personId,
        notes,
      },
      user.id,
      villageId
    );

    return {
      success: true,
      data: savedDoc,
      message: `อัปโหลดเอกสาร "${savedDoc.name}" เข้าสู่พื้นที่จัดเก็บปลอดภัยเรียบร้อยแล้ว`,
    };
  } catch (error: any) {
    return {
      success: false,
      error: {
        code: error.code || "UPLOAD_FAILED",
        message: error.message || "ไม่สามารถอัปโหลดเอกสารได้",
      },
    };
  }
}

export async function deleteFileAction(fileId: string): Promise<ActionResponse<void>> {
  try {
    const { user, villageId } = await assertPermission("document.delete");
    await documentService.deleteFile(fileId, user.id, villageId);
    return {
      success: true,
      message: "ลบเอกสารออกจากระบบเรียบร้อยแล้ว",
    };
  } catch (error: any) {
    return {
      success: false,
      error: {
        code: error.code || "DELETE_FAILED",
        message: error.message || "ไม่สามารถลบเอกสารได้",
      },
    };
  }
}

export async function getFileSignedUrlAction(
  fileId: string
): Promise<ActionResponse<{ signedUrl: string; expiresIn: number }>> {
  try {
    const { user, villageId } = await assertPermission("document.read");
    const result = await documentService.getFileSignedUrl(fileId, user.id, villageId);
    return {
      success: true,
      data: result,
      message: "สร้าง Signed URL สำเร็จ (มีอายุใช้งาน 5 นาที)",
    };
  } catch (error: any) {
    return {
      success: false,
      error: {
        code: error.code || "PERMISSION_DENIED",
        message: error.message || "ไม่สามารถออก Signed URL ได้",
      },
    };
  }
}

export async function getDocumentLinkOptionsAction(): Promise<
  ActionResponse<{
    houses: { id: string; label: string }[];
    persons: { id: string; label: string }[];
  }>
> {
  try {
    const { villageId } = await assertPermission("document.read");
    const options = await documentService.getDocumentLinkOptions(villageId);
    return {
      success: true,
      data: options,
    };
  } catch (error: any) {
    return {
      success: false,
      error: {
        code: error.code || "FETCH_FAILED",
        message: error.message || "ไม่สามารถดึงข้อมูลตัวเลือกเชื่อมโยงได้",
      },
    };
  }
}
