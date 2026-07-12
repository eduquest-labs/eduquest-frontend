export interface TokenPairContract {
  token_type: string;
  expires_in: number;
  access_token: string;
  refresh_token: string;
}

export interface MeResponseContract {
  id: number;
  name: string;
  role: "dosen" | "siswa";
  anonymous_id: string | null;
  permissions: string[];
}

export interface LoginErrorContract {
  message: string;
  errors: {
    identifier?: string[];
    password?: string[];
  };
}

export interface ClaimStudentErrorContract {
  message: string;
  errors: {
    class_code?: string[];
    nis?: string[];
    password?: string[];
  };
}
