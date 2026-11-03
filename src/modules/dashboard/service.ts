import prisma from "@/lib/prisma";
import { listAuditLogs } from "@/modules/audit/service";
import { calculateAge } from "@/lib/date-utils";
import { DashboardStatsDto } from "./types";

export async function getDashboardStats(villageId: string): Promise<DashboardStatsDto> {
  const [
    totalPopulation,
    officialTR14Count,
    actualResidentCount,
    officialAbsentCount,
    houses,
    households,
    persons,
    logs,
  ] = await Promise.all([
    prisma.person.count({ where: { villageId, isArchived: false } }),
    prisma.householdMembership.count({
      where: {
        household: { villageId },
        residenceType: "OFFICIAL",
        isCurrent: true,
      },
    }),
    prisma.householdMembership.count({
      where: {
        household: { villageId },
        residenceType: "ACTUAL_RESIDENT",
        isCurrent: true,
      },
    }),
    prisma.householdMembership.count({
      where: {
        household: { villageId },
        residenceType: "OFFICIAL_ABSENT",
        isCurrent: true,
      },
    }),
    prisma.house.count({ where: { villageId, isActive: true } }),
    prisma.household.count({ where: { villageId } }),
    prisma.person.findMany({
      where: { villageId, isArchived: false },
      select: { birthDate: true },
    }),
    listAuditLogs(villageId, 5),
  ]);

  let youthCount = 0; // 0-14
  let workingAgeCount = 0; // 15-59
  let elderlyCount = 0; // 60+

  for (const p of persons) {
    const age = calculateAge(p.birthDate);

    if (age < 15) {
      youthCount++;
    } else if (age < 60) {
      workingAgeCount++;
    } else {
      elderlyCount++;
    }
  }

  const popDenominator = totalPopulation > 0 ? totalPopulation : 1;
  const avgResidents = households > 0 ? Number((totalPopulation / households).toFixed(1)) : 0;

  return {
    totalPopulation,
    officialTR14Count,
    officialTR14Percent: totalPopulation > 0 ? Math.round((officialTR14Count / popDenominator) * 100) : 0,
    actualResidentCount,
    actualResidentPercent: totalPopulation > 0 ? Math.round((actualResidentCount / popDenominator) * 100) : 0,
    officialAbsentCount,
    officialAbsentPercent: totalPopulation > 0 ? Math.round((officialAbsentCount / popDenominator) * 100) : 0,
    totalHouses: houses,
    totalHouseholds: households,
    avgResidentsPerHousehold: avgResidents,
    quarterPopulationDelta: totalPopulation,
    ageDistribution: {
      youthCount,
      youthPercent: totalPopulation > 0 ? Math.round((youthCount / popDenominator) * 100) : 0,
      workingAgeCount,
      workingAgePercent: totalPopulation > 0 ? Math.round((workingAgeCount / popDenominator) * 100) : 0,
      elderlyCount,
      elderlyPercent: totalPopulation > 0 ? Math.round((elderlyCount / popDenominator) * 100) : 0,
    },
    residencyDistribution: {
      official: officialTR14Count,
      actualResident: actualResidentCount,
      officialAbsent: officialAbsentCount,
    },
    recentLogs: logs,
  };
}
