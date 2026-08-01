export type UserRole = "dosen" | "siswa";

export interface LoginCredentials {
  identifier: string;
  password: string;
}

export interface ClaimStudentCredentials {
  classCode: string;
  nisn: string;
  email: string;
  password: string;
  passwordConfirmation: string;
}

export interface AuthUser {
  id: number;
  name: string;
  role: UserRole;
  nisn: string | null;
  email: string | null;
  emailVerified: boolean;
  permissions: string[];
}
