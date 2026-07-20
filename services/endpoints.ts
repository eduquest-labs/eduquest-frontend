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
  ATTEMPTS: {
    DISCOVERY: "/student/challenges",
    START: (challengeId: number) => `/challenges/${challengeId}/attempts`,
    CURRENT: (challengeId: number) => `/challenges/${challengeId}/attempts/current`,
    LATEST: (challengeId: number) => `/challenges/${challengeId}/attempts/latest`,
    DETAIL: (attemptId: number) => `/attempts/${attemptId}`,
    SUBMIT_ANSWER: (attemptId: number) => `/attempts/${attemptId}/answers`,
    FINISH: (attemptId: number) => `/attempts/${attemptId}/finish`,
    ATTACHMENT: (answerId: number) => `/answers/${answerId}/attachment`,
    PENDING_GRADING: (classId: number) => `/classes/${classId}/attempts/pending-grading`,
    GRADE_ESSAY: (answerId: number) => `/answers/${answerId}/grade`,
  },
  POINTS_BADGES: {
    STUDENT_POINTS: (classId: number, classStudentId: number) =>
      `/classes/${classId}/students/${classStudentId}/points`,
    ADJUSTMENTS: (classId: number, classStudentId: number) =>
      `/classes/${classId}/students/${classStudentId}/point-adjustments`,
    AWARD_BADGE: (classId: number, classStudentId: number, badgeId: number) =>
      `/classes/${classId}/students/${classStudentId}/badges/${badgeId}`,
    MY_POINTS: "/students/me/points",
    BADGES: "/badges",
    MY_BADGES: "/students/me/badges",
  },
  LEADERBOARD: {
    RANKING: (classId: number) => `/classes/${classId}/leaderboard`,
    PROGRESS: (classId: number, classStudentId: number) =>
      `/classes/${classId}/students/${classStudentId}/progress`,
  },
};
