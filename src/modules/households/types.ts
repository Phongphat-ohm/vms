export interface HouseDto {
  id: string;
  villageId: string;
  houseNumber: string;
  subHouseNumber?: string | null;
  buildingType: string;
  latitude?: number | null;
  longitude?: number | null;
  isActive: boolean;
  totalHouseholds: number;
  totalResidents: number;
  officialCount?: number;
  tenantCount?: number;
  headName?: string;
  householdCode?: string;
  coordinates?: string;
  createdAt: string;
}

export interface HouseResidentDetailDto {
  id: string;
  personId: string;
  fullName: string;
  age: number;
  gender: string;
  occupation?: string | null;
  nationality: string;
  isHead: boolean;
  relationshipToHead: string;
  residenceType: "OFFICIAL" | "ACTUAL_RESIDENT" | "OFFICIAL_ABSENT";
}

export interface HouseDetailDto extends HouseDto {
  householdId?: string;
  residents: HouseResidentDetailDto[];
}

export interface HouseholdDto {
  id: string;
  villageId: string;
  houseId: string;
  householdCode: string;
  headPersonId?: string | null;
  headPersonName?: string;
  status: string;
  members: HouseholdMemberDto[];
  createdAt: string;
}

export interface HouseholdMemberDto {
  id: string;
  personId: string;
  personCode: string;
  personName: string;
  relationshipToHead: string;
  residenceType: "OFFICIAL" | "ACTUAL_RESIDENT" | "OFFICIAL_ABSENT";
  isHead: boolean;
  joinedDate: string;
  leftDate?: string | null;
  isCurrent: boolean;
}

export interface CreateHouseInput {
  villageId?: string;
  houseNumber: string;
  subHouseNumber?: string;
  buildingType?: string;
  latitude?: number;
  longitude?: number;
}

export interface TransferPersonInput {
  personId: string;
  sourceHouseholdId: string;
  targetHouseholdId: string;
  relationshipToHead: string;
  residenceType: "OFFICIAL" | "ACTUAL_RESIDENT" | "OFFICIAL_ABSENT";
  effectiveDate: string;
  reason?: string;
}

export interface UpdateHouseInput {
  houseId: string;
  houseNumber: string;
  subHouseNumber?: string | null;
  buildingType: string;
  latitude?: number | null;
  longitude?: number | null;
  isActive?: boolean;
}
