export interface PersonDto {
  id: string;
  villageId: string;
  personCode: string;
  nationalIdMasked: string;
  title: string;
  firstName: string;
  lastName: string;
  fullName?: string;
  gender: "MALE" | "FEMALE" | "OTHER";
  birthDate: string;
  age: number;
  nationality: string;
  religion?: string | null;
  phoneNumber?: string | null;
  occupation?: string | null;
  education?: string | null;
  isAlive: boolean;
  deathDate?: string | null;
  isArchived: boolean;
  createdAt: string;
  houseId?: string;
  houseNumber?: string;
  subHouseNumber?: string;
  householdId?: string;
  householdCode?: string;
  relationshipToHead?: string;
  residenceType?: string;
}

export interface HouseholdEventTimelineItem {
  id: string;
  eventType: string;
  eventDate: string;
  reason?: string | null;
  fromHousehold?: string | null;
  toHousehold?: string | null;
  recordedBy?: string | null;
}

export interface PersonDocumentItem {
  id: string;
  documentType: string;
  fileName: string;
  fileSizeBytes: number;
  uploadedAt: string;
  notes?: string | null;
}

export interface PersonDetailDto extends PersonDto {
  timeline: HouseholdEventTimelineItem[];
  documents: PersonDocumentItem[];
}

export interface CreatePersonInput {
  villageId?: string;
  nationalId: string;
  title: string;
  firstName: string;
  lastName: string;
  gender: "MALE" | "FEMALE" | "OTHER";
  birthDate: string;
  nationality?: string;
  religion?: string;
  phoneNumber?: string;
  occupation?: string;
  education?: string;
}

export interface SearchPopulationQuery {
  query?: string;
  gender?: string;
  isAlive?: boolean;
  villageId?: string;
  page?: number;
  limit?: number;
}

export interface UpdatePersonInput {
  personId: string;
  title: string;
  firstName: string;
  lastName: string;
  gender: "MALE" | "FEMALE" | "OTHER";
  birthDate: string;
  nationality?: string;
  religion?: string | null;
  phoneNumber?: string | null;
  occupation?: string | null;
  education?: string | null;
  isAlive?: boolean;
  deathDate?: string | null;
}
