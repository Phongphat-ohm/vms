import { AuditLogDto } from "@/modules/audit/types";

export interface DashboardStatsDto {
  totalPopulation: number;
  officialTR14Count: number;
  officialTR14Percent: number;
  actualResidentCount: number;
  actualResidentPercent: number;
  officialAbsentCount: number;
  officialAbsentPercent: number;
  totalHouses: number;
  totalHouseholds: number;
  avgResidentsPerHousehold: number;
  quarterPopulationDelta: number;
  ageDistribution: {
    youthCount: number;
    youthPercent: number;
    workingAgeCount: number;
    workingAgePercent: number;
    elderlyCount: number;
    elderlyPercent: number;
  };
  residencyDistribution: {
    official: number;
    actualResident: number;
    officialAbsent: number;
  };
  recentLogs: AuditLogDto[];
}
