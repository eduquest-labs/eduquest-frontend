export const API_ENDPOINTS = {
  AUTH: {
    LOGIN: "/login",
    CLAIM_STUDENT: "/claim-student",
    REGISTER_GURU: "/register-guru",
    REFRESH: "/refresh",
    LOGOUT: "/logout",
    ME: "/me",
    STUDENT_PROFILE: "/students/me/profile",
    RESEND_VERIFICATION: "/email/verification-notification",
  },
  KELAS: {
    LIST: "/classes",
    CREATE: "/classes",
    DETAIL: (id: number) => `/classes/${id}`,
    STUDENTS: (id: number) => `/classes/${id}/students`,
    STUDENT: (classId: number, studentId: number) => `/classes/${classId}/students/${studentId}`,
    IMPORT_STUDENTS: (id: number) => `/classes/${id}/students/import`,
    IMPORT_TEMPLATE: "/students/import-template",
    EXPORT_GRADES: (id: number) => `/classes/${id}/export`,
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
    HISTORY: "/students/me/attempts",
    DETAIL: (attemptId: number) => `/attempts/${attemptId}`,
    SUBMIT_ANSWER: (attemptId: number) => `/attempts/${attemptId}/answers`,
    FINISH: (attemptId: number) => `/attempts/${attemptId}/finish`,
    ATTACHMENT: (answerId: number) => `/answers/${answerId}/attachment`,
    PENDING_GRADING: (classId: number) => `/classes/${classId}/attempts/pending-grading`,
    GRADE_ESSAY: (answerId: number) => `/answers/${answerId}/grade`,
  },
  PHYSICAL_ACTIVITIES: {
    START: "/physical-activities",
    DETAIL: (activityId: number) => `/physical-activities/${activityId}`,
    POINTS: (activityId: number) => `/physical-activities/${activityId}/points`,
    FINISH: (activityId: number) => `/physical-activities/${activityId}/finish`,
    ROUTE: (activityId: number) => `/physical-activities/${activityId}/route`,
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
  DASHBOARD: {
    DOSEN: "/dosen/dashboard",
  },
  MONITORING: {
    DOSEN: "/dosen/monitoring",
  },
  ANALYTICS: {
    CLASS_COMPARISON: "/dosen/class-comparison",
    PROGRESS_CHART: (classId: number) =>
      `/classes/${classId}/progress-chart`,
  },
  SCHOOLS: {
    LIST: "/schools",
    CREATE: "/schools",
    UPDATE: (id: number) => `/schools/${id}`,
    DELETE: (id: number) => `/schools/${id}`,
  },
  SUPERADMIN: {
    SCHOOLS_ANALYTICS: "/superadmin/analytics/schools",
    GURU_LIST: "/guru",
    GURU_ANALYTICS: "/superadmin/analytics/guru",
    GURU_UPDATE: (id: number) => `/guru/${id}`,
    GURU_DEACTIVATE: (id: number) => `/guru/${id}`,
    GURU_REACTIVATE: (id: number) => `/guru/${id}/reactivate`,
  },
};
