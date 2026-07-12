export type UserRole = "dosen" | "siswa";

export interface LoginCredentials {
  identifier: string;
  password: string;
}

export interface ClaimStudentCredentials {
  classCode: string;
  nis: string;
  password: string;
  passwordConfirmation: string;
}

export interface AuthUser {
  id: number;
  name: string;
  role: UserRole;
  anonymousId: string | null;
  permissions: string[];
}
