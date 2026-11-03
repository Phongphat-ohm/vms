import prisma from "@/lib/prisma";
import { recordAuditLog } from "@/modules/audit/service";
import { ConflictException, NotFoundException } from "@/lib/exceptions";
import { calculateAge } from "@/lib/date-utils";
import { CreateHouseInput, UpdateHouseInput, HouseDto, HouseDetailDto, TransferPersonInput } from "./types";

/**
 * Creates a new House.
 */
export async function createHouse(input: CreateHouseInput, userId: string, villageId: string): Promise<HouseDto> {
  const existing = await prisma.house.findUnique({
    where: {
      villageId_houseNumber_subHouseNumber: {
        villageId,
        houseNumber: input.houseNumber,
        subHouseNumber: input.subHouseNumber || "",
      },
    },
  });

  if (existing) {
    throw new ConflictException("เลขที่บ้านนี้มีอยู่ในหมู่บ้านแล้ว");
  }

  const house = await prisma.house.create({
    data: {
      villageId,
      houseNumber: input.houseNumber,
      subHouseNumber: input.subHouseNumber,
      buildingType: input.buildingType || "DETACHED",
      latitude: input.latitude,
      longitude: input.longitude,
    },
  });

  // Automatically create initial default Household for this house
  const count = (await prisma.household.count({ where: { villageId } })) + 1;
  const householdCode = `HH-${new Date().getFullYear()}-${String(count).padStart(4, "0")}`;

  await prisma.household.create({
    data: {
      villageId,
      houseId: house.id,
      householdCode,
    },
  });

  await recordAuditLog({
    villageId,
    userId,
    module: "household",
    action: "CREATE",
    entityType: "House",
    entityId: house.id,
    details: { houseNumber: house.houseNumber },
  });

  return {
    id: house.id,
    villageId: house.villageId,
    houseNumber: house.houseNumber,
    subHouseNumber: house.subHouseNumber,
    buildingType: house.buildingType,
    latitude: house.latitude ? Number(house.latitude) : null,
    longitude: house.longitude ? Number(house.longitude) : null,
    isActive: house.isActive,
    totalHouseholds: 1,
    totalResidents: 0,
    createdAt: house.createdAt.toISOString(),
  };
}

/**
 * Updates an existing House record.
 */
export async function updateHouse(
  input: UpdateHouseInput,
  userId: string,
  villageId: string
): Promise<HouseDetailDto> {
  const existing = await prisma.house.findFirst({
    where: { id: input.houseId, villageId },
  });

  if (!existing) {
    throw new NotFoundException(`ไม่พบข้อมูลบ้านรหัส ${input.houseId} ในหมู่บ้านนี้`);
  }

  const updated = await prisma.house.update({
    where: { id: input.houseId },
    data: {
      houseNumber: input.houseNumber.trim(),
      subHouseNumber: input.subHouseNumber?.trim() || null,
      buildingType: input.buildingType,
      latitude: input.latitude !== undefined ? input.latitude : existing.latitude,
      longitude: input.longitude !== undefined ? input.longitude : existing.longitude,
      isActive: input.isActive ?? existing.isActive,
    },
  });

  await recordAuditLog({
    villageId,
    userId,
    module: "household",
    action: "UPDATE",
    entityType: "House",
    entityId: updated.id,
    details: {
      action: "UPDATE_HOUSE",
      houseNumber: updated.houseNumber,
    },
  });

  return getHouseById(updated.id, villageId);
}

/**
 * Lists all houses in the village from database.
 */
export async function listHouses(villageId: string): Promise<HouseDto[]> {
  const houses = await prisma.house.findMany({
    where: { villageId, isActive: true },
    include: {
      households: {
        include: {
          headPerson: true,
          memberships: {
            where: { isCurrent: true },
            include: { person: true },
          },
        },
      },
    },
    orderBy: { houseNumber: "asc" },
  });

  return houses.map((h: any) => {
    const defaultHh = h.households?.[0];
    const allMembers = h.households.flatMap((hh: any) => hh.memberships);
    const totalResidents = allMembers.length;
    const officialCount = allMembers.filter((m: any) => m.residenceType === "OFFICIAL").length;
    const tenantCount = allMembers.filter((m: any) => m.residenceType === "ACTUAL_RESIDENT").length;
    
    const headPerson = defaultHh?.headPerson || allMembers.find((m: any) => m.isHead)?.person;
    const headName = headPerson
      ? `${headPerson.title}${headPerson.firstName} ${headPerson.lastName}`
      : "ยังไม่ได้ระบุหัวหน้า";

    return {
      id: h.id,
      villageId: h.villageId,
      houseNumber: h.houseNumber,
      subHouseNumber: h.subHouseNumber,
      buildingType: h.buildingType,
      latitude: h.latitude ? Number(h.latitude) : null,
      longitude: h.longitude ? Number(h.longitude) : null,
      isActive: h.isActive,
      totalHouseholds: h.households.length,
      totalResidents,
      officialCount,
      tenantCount,
      headName,
      householdCode: defaultHh?.householdCode || "HH-2026-0001",
      coordinates: h.latitude && h.longitude ? `${h.latitude}, ${h.longitude}` : "-",
      createdAt: h.createdAt.toISOString(),
    };
  });
}

/**
 * Gets a House by ID with full household members detail from database.
 */
export async function getHouseById(houseId: string, villageId: string): Promise<HouseDetailDto> {
  const house = await prisma.house.findFirst({
    where: {
      id: houseId,
      villageId,
    },
    include: {
      households: {
        include: {
          headPerson: true,
          memberships: {
            where: { isCurrent: true },
            include: { person: true },
          },
        },
      },
    },
  });

  if (!house) {
    throw new NotFoundException(`ไม่พบบ้านรหัส ${houseId}`);
  }

  const defaultHh = house.households?.[0];
  const allMembers = house.households.flatMap((hh: any) => hh.memberships);
  const totalResidents = allMembers.length;
  const officialCount = allMembers.filter((m: any) => m.residenceType === "OFFICIAL").length;
  const tenantCount = allMembers.filter((m: any) => m.residenceType === "ACTUAL_RESIDENT").length;
  
  const headPerson = defaultHh?.headPerson || allMembers.find((m: any) => m.isHead)?.person;
  const headName = headPerson
    ? `${headPerson.title}${headPerson.firstName} ${headPerson.lastName}`
    : "ยังไม่ได้ระบุหัวหน้า";

  const residents = allMembers.map((m: any) => ({
    id: m.id,
    personId: m.person.id,
    fullName: `${m.person.title}${m.person.firstName} ${m.person.lastName}`,
    age: calculateAge(m.person.birthDate),
    gender: m.person.gender === "MALE" ? "ชาย" : m.person.gender === "FEMALE" ? "หญิง" : "อื่นๆ",
    occupation: m.person.occupation || "ไม่ได้ระบุ",
    nationality: m.person.nationality || "ไทย",
    isHead: m.isHead,
    relationshipToHead: m.relationshipToHead || (m.isHead ? "หัวหน้าครัวเรือน" : "สมาชิก"),
    residenceType: m.residenceType as any,
  }));

  return {
    id: house.id,
    villageId: house.villageId,
    houseNumber: house.houseNumber,
    subHouseNumber: house.subHouseNumber,
    buildingType: house.buildingType,
    latitude: house.latitude ? Number(house.latitude) : null,
    longitude: house.longitude ? Number(house.longitude) : null,
    isActive: house.isActive,
    totalHouseholds: house.households.length,
    totalResidents,
    officialCount,
    tenantCount,
    headName,
    householdId: defaultHh?.id,
    householdCode: defaultHh?.householdCode || "HH-2026-0001",
    coordinates: house.latitude && house.longitude ? `${house.latitude}, ${house.longitude}` : "-",
    residents,
    createdAt: house.createdAt.toISOString(),
  };
}

/**
 * Transfers a person from one household to another under an ACID Transaction.
 */
export async function transferPerson(
  input: TransferPersonInput,
  userId: string,
  villageId: string
): Promise<{ success: boolean; eventId: string }> {
  return await prisma.$transaction(async (tx: any) => {
    // 1. Verify source membership
    const activeMembership = await tx.householdMembership.findFirst({
      where: {
        householdId: input.sourceHouseholdId,
        personId: input.personId,
        isCurrent: true,
      },
    });

    if (!activeMembership) {
      throw new NotFoundException("ไม่พบข้อมูลบุคคลที่กำลังอยู่อาศัยในครัวเรือนต้นทาง");
    }

    // 2. Mark old membership as moved out
    const effectiveDateObj = new Date(input.effectiveDate);
    await tx.householdMembership.update({
      where: { id: activeMembership.id },
      data: {
        isCurrent: false,
        leftDate: effectiveDateObj,
      },
    });

    // Verify if moving person was the head of the source household
    const sourceHousehold = await tx.household.findUnique({
      where: { id: input.sourceHouseholdId },
    });

    if (sourceHousehold && sourceHousehold.headPersonId === input.personId) {
      await tx.household.update({
        where: { id: input.sourceHouseholdId },
        data: { headPersonId: null },
      });

      await tx.householdEvent.create({
        data: {
          villageId,
          personId: input.personId,
          eventType: "HEAD_CHANGE",
          fromHouseholdId: input.sourceHouseholdId,
          eventDate: effectiveDateObj,
          reason: "หัวหน้าครัวเรือนเดิมย้ายออกจากครัวเรือน",
          recordedBy: userId,
        },
      });
    }

    // 3. Create new membership in target household
    const isTargetHead =
      input.relationshipToHead === "HEAD" || input.relationshipToHead === "หัวหน้าครัวเรือน";

    await tx.householdMembership.create({
      data: {
        householdId: input.targetHouseholdId,
        personId: input.personId,
        relationshipToHead: input.relationshipToHead,
        residenceType: input.residenceType,
        isHead: isTargetHead,
        joinedDate: effectiveDateObj,
        isCurrent: true,
      },
    });

    if (isTargetHead) {
      await tx.household.update({
        where: { id: input.targetHouseholdId },
        data: { headPersonId: input.personId },
      });
    }

    // 4. Record append-only Household Event
    const event = await tx.householdEvent.create({
      data: {
        villageId,
        personId: input.personId,
        eventType: "TRANSFER",
        fromHouseholdId: input.sourceHouseholdId,
        toHouseholdId: input.targetHouseholdId,
        eventDate: effectiveDateObj,
        reason: input.reason,
        recordedBy: userId,
      },
    });

    // 5. Write audit log
    await recordAuditLog({
      villageId,
      userId,
      module: "household",
      action: "TRANSFER",
      entityType: "HouseholdMembership",
      entityId: event.id,
      details: {
        personId: input.personId,
        from: input.sourceHouseholdId,
        to: input.targetHouseholdId,
        reason: input.reason,
      },
    });

    return { success: true, eventId: event.id };
  });
}

/**
 * Lists available target households in the village for transfer destination.
 */
export async function listTargetHouseholds(
  villageId: string,
  excludeHouseId?: string
): Promise<{ householdId: string; houseNumber: string; headName: string }[]> {
  const houses = await prisma.house.findMany({
    where: {
      villageId,
      isActive: true,
      id: excludeHouseId ? { not: excludeHouseId } : undefined,
    },
    include: {
      households: {
        where: { status: "ACTIVE" },
        include: { headPerson: true },
      },
    },
    orderBy: { houseNumber: "asc" },
  });

  const list: { householdId: string; houseNumber: string; headName: string }[] = [];
  for (const h of houses) {
    for (const hh of h.households) {
      const headName = hh.headPerson
        ? `${hh.headPerson.title}${hh.headPerson.firstName} ${hh.headPerson.lastName}`
        : "ยังไม่มีหัวหน้าครัวเรือน";
      list.push({
        householdId: hh.id,
        houseNumber: `บ้านเลขที่ ${h.houseNumber}${h.subHouseNumber ? `/${h.subHouseNumber}` : ""}`,
        headName,
      });
    }
  }
  return list;
}
