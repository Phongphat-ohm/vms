import crypto from "crypto";
import prisma from "@/lib/prisma";
import { recordAuditLog } from "@/modules/audit/service";
import {
  generateShortLivedSignedUrl,
  generateStoragePath,
  validateAllowedMimeType,
  saveFileToStorage,
  deleteFileFromStorage,
} from "@/lib/storage";
import { NotFoundException, ValidationException } from "@/lib/exceptions";
import { formatBytes } from "@/lib/formatters";
import { DocumentItemDto, RegisterFileInput } from "./types";

export async function listFiles(villageId: string): Promise<DocumentItemDto[]> {
  const files = await prisma.file.findMany({
    where: { villageId },
    include: {
      uploader: { select: { fullName: true } },
      householdDocs: { include: { house: true } },
      personDocs: { include: { person: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  return files.map((f: any) => {
    let category = "เอกสารทั่วไป";
    let relatedEntity = "-";

    if (f.householdDocs && f.householdDocs.length > 0) {
      const doc = f.householdDocs[0];
      category = doc.documentType === "HOUSE_REG_TR14" ? "ทะเบียนบ้าน (ท.ร.14)" : "เอกสารบ้าน";
      relatedEntity = doc.house ? `บ้านเลขที่ ${doc.house.houseNumber}` : "ครัวเรือน";
    } else if (f.personDocs && f.personDocs.length > 0) {
      const pDoc = f.personDocs[0];
      category = "เอกสารประจำตัว";
      relatedEntity = pDoc.person ? `${pDoc.person.title}${pDoc.person.firstName} ${pDoc.person.lastName}` : "ประชากร";
    }

    return {
      id: f.id,
      name: f.originalName,
      category,
      relatedEntity,
      size: formatBytes(Number(f.fileSizeBytes)),
      fileSizeBytes: Number(f.fileSizeBytes),
      mimeType: f.mimeType,
      uploadedAt: f.createdAt.toISOString().split("T")[0],
      uploader: f.uploader?.fullName || "เจ้าหน้าที่",
      storagePath: f.storagePath,
    };
  });
}

export async function saveAndRegisterFile(
  input: {
    originalName: string;
    mimeType: string;
    buffer: Buffer;
    category?: string;
    houseId?: string;
    personId?: string;
    notes?: string;
  },
  userId: string,
  villageId: string
): Promise<DocumentItemDto> {
  if (!validateAllowedMimeType(input.mimeType)) {
    throw new ValidationException("ประเภทไฟล์ไม่ถูกต้อง อนุญาตเฉพาะ PDF, JPEG, PNG, WEBP เท่านั้น");
  }

  const fileId = crypto.randomUUID();
  const ext = input.originalName.split(".").pop() || "bin";
  const storagePath = generateStoragePath(villageId, fileId, ext);

  // Save binary buffer to private storage disk
  const { checksumSha256 } = await saveFileToStorage(storagePath, input.buffer);

  const file = await prisma.file.create({
    data: {
      id: fileId,
      villageId,
      storagePath,
      originalName: input.originalName,
      mimeType: input.mimeType,
      fileSizeBytes: BigInt(input.buffer.length),
      checksumSha256,
      uploadedBy: userId,
    },
    include: {
      uploader: { select: { fullName: true } },
    },
  });

  let relatedEntity = "-";

  // Link to Person or House if provided
  if (input.personId) {
    const personDoc = await prisma.personDocument.create({
      data: {
        personId: input.personId,
        fileId: file.id,
        documentType: input.category || "OTHER",
        notes: input.notes,
      },
      include: { person: true },
    });
    relatedEntity = `${personDoc.person.title}${personDoc.person.firstName} ${personDoc.person.lastName}`;
  } else if (input.houseId) {
    const houseDoc = await prisma.householdDocument.create({
      data: {
        houseId: input.houseId,
        fileId: file.id,
        documentType: input.category || "HOUSE_REG_TR14",
      },
      include: { house: true },
    });
    relatedEntity = houseDoc.house ? `บ้านเลขที่ ${houseDoc.house.houseNumber}` : "ครัวเรือน";
  }

  await recordAuditLog({
    villageId,
    userId,
    module: "document",
    action: "CREATE",
    entityType: "File",
    entityId: file.id,
    details: {
      name: file.originalName,
      category: input.category,
      fileSizeBytes: Number(file.fileSizeBytes),
      checksumSha256,
    },
  });

  return {
    id: file.id,
    name: file.originalName,
    category: input.category || "เอกสารทั่วไป",
    relatedEntity,
    size: formatBytes(Number(file.fileSizeBytes)),
    fileSizeBytes: Number(file.fileSizeBytes),
    mimeType: file.mimeType,
    uploadedAt: file.createdAt.toISOString().split("T")[0],
    uploader: file.uploader?.fullName || "เจ้าหน้าที่",
    storagePath: file.storagePath,
  };
}

export async function deleteFile(
  fileId: string,
  userId: string,
  villageId: string
): Promise<void> {
  const file = await prisma.file.findFirst({
    where: { id: fileId, villageId },
  });

  if (!file) {
    throw new NotFoundException("ไม่พบไฟล์เอกสารที่ต้องการลบ");
  }

  // Delete from storage disk
  await deleteFileFromStorage(file.storagePath);

  // Delete from database cascade
  await prisma.personDocument.deleteMany({ where: { fileId } });
  await prisma.householdDocument.deleteMany({ where: { fileId } });
  await prisma.file.delete({ where: { id: fileId } });

  await recordAuditLog({
    villageId,
    userId,
    module: "document",
    action: "ARCHIVE",
    entityType: "File",
    entityId: fileId,
    details: { originalName: file.originalName },
  });
}

export async function getFileSignedUrl(
  fileId: string,
  userId: string,
  villageId: string
): Promise<{ signedUrl: string; expiresIn: number }> {
  const file = await prisma.file.findFirst({
    where: { id: fileId, villageId },
  });

  if (!file) {
    throw new NotFoundException(`ไม่พบไฟล์เอกสารรหัส ${fileId}`);
  }

  const expiresIn = 300; // 5 minutes
  const signedUrl = generateShortLivedSignedUrl(file.id, expiresIn);

  await recordAuditLog({
    villageId,
    userId,
    module: "document",
    action: "SENSITIVE_VIEW",
    entityType: "File",
    entityId: fileId,
    details: {
      signedUrlGenerated: true,
      originalName: file.originalName,
    },
  });

  return { signedUrl, expiresIn };
}

export async function getDocumentLinkOptions(villageId: string): Promise<{
  houses: { id: string; label: string }[];
  persons: { id: string; label: string }[];
}> {
  const [houses, persons] = await Promise.all([
    prisma.house.findMany({
      where: { villageId, isActive: true },
      select: { id: true, houseNumber: true, subHouseNumber: true },
      orderBy: { houseNumber: "asc" },
      take: 200,
    }),
    prisma.person.findMany({
      where: { villageId, isArchived: false },
      select: { id: true, title: true, firstName: true, lastName: true, personCode: true },
      orderBy: { firstName: "asc" },
      take: 200,
    }),
  ]);

  return {
    houses: houses.map((h) => ({
      id: h.id,
      label: `บ้านเลขที่ ${h.houseNumber}${h.subHouseNumber ? `/${h.subHouseNumber}` : ""}`,
    })),
    persons: persons.map((p) => ({
      id: p.id,
      label: `${p.title}${p.firstName} ${p.lastName} (${p.personCode})`,
    })),
  };
}
