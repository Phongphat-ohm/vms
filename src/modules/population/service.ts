import prisma from "@/lib/prisma";
import {
  encryptNationalId,
  decryptNationalId,
  createNationalIdBlindIndex,
  maskNationalId,
  formatNationalId,
} from "@/lib/crypto";
import { recordAuditLog } from "@/modules/audit/service";
import { ConflictException, NotFoundException } from "@/lib/exceptions";
import { calculateAge } from "@/lib/date-utils";
import { cleanDigits, formatThaiPhoneNumber } from "@/lib/formatters";
import { CreatePersonInput, UpdatePersonInput, PersonDto, PersonDetailDto, SearchPopulationQuery } from "./types";

/**
 * Creates a new Person record with encrypted national ID and blind indexing.
 */
export async function createPerson(input: CreatePersonInput, userId: string, villageId: string): Promise<PersonDto> {
  const cleanId = input.nationalId.replace(/\D/g, "");
  const bindex = createNationalIdBlindIndex(cleanId);

  // Check duplicate national ID using blind index
  const existing = await prisma.person.findUnique({
    where: { nationalIdBindex: bindex },
  });

  if (existing) {
    throw new ConflictException("เลขประจำตัวประชาชนนี้มีอยู่ในระบบแล้ว");
  }

  const encryptedId = encryptNationalId(cleanId);
  const maskedId = maskNationalId(cleanId);
  const birthDateObj = new Date(input.birthDate);

  const year = new Date().getFullYear();
  const count = (await prisma.person.count({ where: { villageId } })) + 1;
  const personCode = `P-${year}-${String(count).padStart(5, "0")}`;

  const person = await prisma.person.create({
    data: {
      villageId,
      personCode,
      nationalIdEncrypted: encryptedId,
      nationalIdBindex: bindex,
      nationalIdMasked: maskedId,
      title: input.title,
      firstName: input.firstName,
      lastName: input.lastName,
      gender: input.gender,
      birthDate: birthDateObj,
      nationality: input.nationality || "ไทย",
      religion: input.religion,
      phoneNumber: input.phoneNumber ? cleanDigits(input.phoneNumber) : null,
      occupation: input.occupation,
      education: input.education,
      createdBy: userId,
    },
  });

  await recordAuditLog({
    villageId,
    userId,
    module: "population",
    action: "CREATE",
    entityType: "Person",
    entityId: person.id,
    details: {
      personCode: person.personCode,
      name: `${person.title}${person.firstName} ${person.lastName}`,
    },
  });

  return {
    id: person.id,
    villageId: person.villageId,
    personCode: person.personCode,
    nationalIdMasked: person.nationalIdMasked,
    title: person.title,
    firstName: person.firstName,
    lastName: person.lastName,
    fullName: `${person.title}${person.firstName} ${person.lastName}`,
    gender: person.gender as any,
    birthDate: person.birthDate.toISOString().split("T")[0],
    age: calculateAge(person.birthDate),
    nationality: person.nationality,
    religion: person.religion,
    phoneNumber: person.phoneNumber ? formatThaiPhoneNumber(person.phoneNumber) : null,
    occupation: person.occupation,
    education: person.education,
    isAlive: person.isAlive,
    deathDate: person.deathDate ? person.deathDate.toISOString().split("T")[0] : null,
    isArchived: person.isArchived,
    createdAt: person.createdAt.toISOString(),
  };
}

/**
 * Updates an existing Person record in the village.
 */
export async function updatePerson(
  input: UpdatePersonInput,
  userId: string,
  villageId: string
): Promise<PersonDetailDto> {
  const existing = await prisma.person.findFirst({
    where: {
      id: input.personId,
      villageId,
    },
  });

  if (!existing) {
    throw new NotFoundException(`ไม่พบข้อมูลประชากรรหัส ${input.personId} ในหมู่บ้านนี้`);
  }

  const rawPhone = input.phoneNumber ? cleanDigits(input.phoneNumber) : null;
  const birthDateObj = new Date(input.birthDate);
  const deathDateObj = input.deathDate ? new Date(input.deathDate) : null;

  const updated = await prisma.person.update({
    where: { id: input.personId },
    data: {
      title: input.title,
      firstName: input.firstName,
      lastName: input.lastName,
      gender: input.gender,
      birthDate: birthDateObj,
      nationality: input.nationality || "ไทย",
      religion: input.religion || null,
      phoneNumber: rawPhone && rawPhone.length > 0 ? rawPhone : null,
      occupation: input.occupation || null,
      education: input.education || null,
      isAlive: input.isAlive ?? true,
      deathDate: input.isAlive ? null : deathDateObj,
      updatedBy: userId,
    },
  });

  await recordAuditLog({
    villageId,
    userId,
    module: "population",
    action: "UPDATE",
    entityType: "Person",
    entityId: updated.id,
    details: {
      action: "UPDATE_PERSON",
      fullName: `${updated.title}${updated.firstName} ${updated.lastName}`,
    },
  });

  return getPersonById(updated.id, villageId);
}

/**
 * Searches and filters population records in the village.
 */
export async function searchPopulation(
  params: SearchPopulationQuery,
  villageId: string
): Promise<PersonDto[]> {
  const { query, gender, isAlive, villageId: requestedVillageId } = params;
  const targetVillageId = requestedVillageId || villageId;

  const whereClause: any = {
    villageId: targetVillageId,
    isArchived: false,
  };

  if (gender && gender !== "ALL") {
    whereClause.gender = gender;
  }

  if (typeof isAlive === "boolean") {
    whereClause.isAlive = isAlive;
  }

  // Handle search by name, code, or National ID via Blind Index
  if (query && query.trim() !== "") {
    const cleanQuery = query.trim();
    const digitsOnly = cleanQuery.replace(/\D/g, "");

    if (digitsOnly.length === 13) {
      // Exact match search by National ID blind index
      const bindex = createNationalIdBlindIndex(digitsOnly);
      whereClause.nationalIdBindex = bindex;
    } else {
      whereClause.OR = [
        { firstName: { contains: cleanQuery, mode: "insensitive" } },
        { lastName: { contains: cleanQuery, mode: "insensitive" } },
        { personCode: { contains: cleanQuery, mode: "insensitive" } },
      ];
    }
  }

  const persons = await prisma.person.findMany({
    where: whereClause,
    orderBy: { createdAt: "desc" },
    take: 100,
    include: {
      householdMemberships: {
        where: { isCurrent: true },
        include: {
          household: {
            include: {
              house: true,
            },
          },
        },
      },
    },
  });

  return persons.map((p: any) => {
    const membership = p.householdMemberships?.[0];
    const house = membership?.household?.house;

    return {
      id: p.id,
      villageId: p.villageId,
      personCode: p.personCode,
      nationalIdMasked: p.nationalIdMasked,
      title: p.title,
      firstName: p.firstName,
      lastName: p.lastName,
      fullName: `${p.title}${p.firstName} ${p.lastName}`,
      gender: p.gender as any,
      birthDate: p.birthDate.toISOString().split("T")[0],
      age: calculateAge(p.birthDate),
      nationality: p.nationality,
      religion: p.religion,
      phoneNumber: p.phoneNumber,
      occupation: p.occupation,
      education: p.education,
      isAlive: p.isAlive,
      deathDate: p.deathDate ? p.deathDate.toISOString().split("T")[0] : null,
      isArchived: p.isArchived,
      createdAt: p.createdAt.toISOString(),
      houseId: house?.id,
      houseNumber: house ? `${house.houseNumber}${house.subHouseNumber ? ` (${house.subHouseNumber})` : ""}` : "-",
      householdId: membership?.household?.id,
      householdCode: membership?.household?.householdCode,
      relationshipToHead: membership?.relationshipToHead || "สมาชิก",
      residenceType: membership?.residenceType || "OFFICIAL",
    };
  });
}

/**
 * Retrieves full person profile with household details, events timeline, and files.
 */
export async function getPersonById(personId: string, targetVillageId: string): Promise<PersonDetailDto> {
  const person = await prisma.person.findFirst({
    where: {
      id: personId,
      villageId: targetVillageId,
    },
    include: {
      householdMemberships: {
        where: { isCurrent: true },
        include: {
          household: {
            include: {
              house: true,
            },
          },
        },
      },
      householdEvents: {
        orderBy: { eventDate: "desc" },
        take: 10,
        include: {
          fromHousehold: { include: { house: true } },
          toHousehold: { include: { house: true } },
          recorder: { select: { fullName: true } },
        },
      },
      documents: {
        include: {
          file: true,
        },
      },
    },
  });

  if (!person) {
    throw new NotFoundException(`ไม่พบข้อมูลประชากรรหัส ${personId}`);
  }

  const currentMembership = person.householdMemberships?.[0];
  const currentHouse = currentMembership?.household?.house;

  const timeline = person.householdEvents.map((e: any) => ({
    id: e.id,
    eventType: e.eventType,
    eventDate: e.eventDate.toISOString().split("T")[0],
    reason: e.reason,
    fromHousehold: e.fromHousehold?.house?.houseNumber || null,
    toHousehold: e.toHousehold?.house?.houseNumber || null,
    recordedBy: e.recorder?.fullName || "เจ้าหน้าที่",
  }));

  const documents = person.documents.map((d: any) => ({
    id: d.id,
    documentType: d.documentType,
    fileName: d.file.originalName,
    fileSizeBytes: Number(d.file.fileSizeBytes),
    uploadedAt: d.file.createdAt.toISOString().split("T")[0],
    notes: d.notes,
  }));

  return {
    id: person.id,
    villageId: person.villageId,
    personCode: person.personCode,
    nationalIdMasked: person.nationalIdMasked,
    title: person.title,
    firstName: person.firstName,
    lastName: person.lastName,
    fullName: `${person.title}${person.firstName} ${person.lastName}`,
    gender: person.gender as any,
    birthDate: person.birthDate.toISOString().split("T")[0],
    age: calculateAge(person.birthDate),
    nationality: person.nationality,
    religion: person.religion,
    phoneNumber: person.phoneNumber ? formatThaiPhoneNumber(person.phoneNumber) : null,
    occupation: person.occupation,
    education: person.education,
    isAlive: person.isAlive,
    deathDate: person.deathDate ? person.deathDate.toISOString().split("T")[0] : null,
    isArchived: person.isArchived,
    createdAt: person.createdAt.toISOString(),
    houseId: currentHouse?.id,
    houseNumber: currentHouse ? `${currentHouse.houseNumber}${currentHouse.subHouseNumber ? ` (${currentHouse.subHouseNumber})` : ""}` : "-",
    householdId: currentMembership?.household?.id,
    householdCode: currentMembership?.household?.householdCode || "-",
    relationshipToHead: currentMembership?.relationshipToHead || "สมาชิก",
    residenceType: currentMembership?.residenceType || "OFFICIAL",
    timeline,
    documents,
  };
}

/**
 * Reveals full 13-digit National ID under strict permission and records Audit Log.
 */
export async function revealNationalId(
  personId: string,
  reason: string,
  userId: string,
  villageId: string
): Promise<string> {
  const person = await prisma.person.findFirst({
    where: { id: personId, villageId },
  });

  if (!person) {
    throw new NotFoundException("ไม่พบข้อมูลประชากรที่ระบุในหมู่บ้านนี้");
  }

  const decrypted = decryptNationalId(person.nationalIdEncrypted);

  // Mandatory Audit Log for PDPA tracking
  await recordAuditLog({
    villageId,
    userId,
    module: "population",
    action: "SENSITIVE_VIEW",
    entityType: "Person",
    entityId: person.id,
    details: {
      personCode: person.personCode,
      reason,
      accessTimestamp: new Date().toISOString(),
    },
  });

  return formatNationalId(decrypted);
}

/**
 * Exports population records in CSV format with PDPA Masking (FR-POP-09).
 */
export async function exportPopulationCsv(villageId: string, userId: string): Promise<string> {
  const list = await searchPopulation({}, villageId);

  await recordAuditLog({
    villageId,
    userId,
    module: "population",
    action: "EXPORT",
    entityType: "Person",
    details: { count: list.length, format: "CSV" },
  });

  const header = "รหัสประชากร,ชื่อ-นามสกุล,เลขประจำตัวประชาชน,เพศ,อายุ,บ้านเลขที่,สถานะการอยู่อาศัย,อาชีพ,เบอร์โทรศัพท์\n";
  const rows = list.map((p) => {
    return `"${p.personCode}","${p.fullName}","${p.nationalIdMasked}","${p.gender === 'MALE' ? 'ชาย' : 'หญิง'}","${p.age}","${p.houseNumber || '-'}","${p.residenceType}","${p.occupation || '-'}","${p.phoneNumber || '-'}"`;
  }).join("\n");

  return header + rows;
}

/**
 * Soft deletes/archives a person record (FR-POP-08).
 */
export async function archivePerson(personId: string, villageId: string, userId: string): Promise<void> {
  const person = await prisma.person.findFirst({
    where: { id: personId, villageId },
  });

  if (!person) {
    throw new NotFoundException("ไม่พบข้อมูลประชากร");
  }

  await prisma.person.update({
    where: { id: personId },
    data: { isArchived: true },
  });

  await recordAuditLog({
    villageId,
    userId,
    module: "population",
    action: "ARCHIVE",
    entityType: "Person",
    entityId: personId,
    details: { personCode: person.personCode },
  });
}
