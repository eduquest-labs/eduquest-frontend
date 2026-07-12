export const API_ENDPOINTS = {
  AUTH: {
    LOGIN: "/login",
    CLAIM_STUDENT: "/claim-student",
    REFRESH: "/refresh",
    LOGOUT: "/logout",
    ME: "/me",
  },
  KELAS: {
    LIST: "/classes",
    CREATE: "/classes",
    DETAIL: (id: number) => `/classes/${id}`,
    STUDENTS: (id: number) => `/classes/${id}/students`,
    IMPORT_STUDENTS: (id: number) => `/classes/${id}/students/import`,
  },
};
