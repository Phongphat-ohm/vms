export interface VillageInfoDto {
  id: string;
  name: string;
  code: string;
  moo: number;
  subdistrict: string;
  district: string;
  province: string;
  postalCode: string;
  phoneNumber?: string | null;
  logoUrl?: string | null;
}

export interface UpdateVillageInput {
  villageId?: string;
  name: string;
  moo: number;
  subdistrict: string;
  district: string;
  province: string;
  postalCode: string;
  phoneNumber?: string;
}

export interface UserProfileDto {
  id: string;
  email: string;
  fullName: string;
  phoneNumber?: string | null;
  roles: string[];
  permissions: string[];
  activeVillageName?: string;
}
