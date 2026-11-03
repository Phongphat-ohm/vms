export interface UserItemDto {
  id: string;
  fullName: string;
  email: string;
  phoneNumber?: string | null;
  role: string;
  roleDisplayName: string;
  villageName: string;
  isActive: boolean;
  lastLogin: string;
  createdAt: string;
}

export interface CreateUserInput {
  fullName: string;
  email: string;
  phoneNumber?: string;
  role: string;
  villageId?: string;
}
