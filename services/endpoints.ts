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
    STUDENT: (classId: number, studentId: number) => `/classes/${classId}/students/${studentId}`,
    IMPORT_STUDENTS: (id: number) => `/classes/${id}/students/import`,
  },
  AUTHORING: {
    TOPICS: (classId: number) => `/classes/${classId}/topics`,
    TOPIC: (topicId: number) => `/topics/${topicId}`,
    CHALLENGES: (topicId: number) => `/topics/${topicId}/challenges`,
    CHALLENGE: (challengeId: number) => `/challenges/${challengeId}`,
    PUBLISH_CHALLENGE: (challengeId: number) => `/challenges/${challengeId}/publish`,
    UNPUBLISH_CHALLENGE: (challengeId: number) => `/challenges/${challengeId}/unpublish`,
    DUPLICATE_CHALLENGE: (challengeId: number) => `/challenges/${challengeId}/duplicate`,
    QUESTIONS: (challengeId: number) => `/challenges/${challengeId}/questions`,
    QUESTION: (questionId: number) => `/questions/${questionId}`,
  },
};
