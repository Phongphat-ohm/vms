export interface LoginInput {
  email: string;
  password?: string;
}

export interface LoginResult {
  userId: string;
  email: string;
  fullName: string;
  role: string;
}
