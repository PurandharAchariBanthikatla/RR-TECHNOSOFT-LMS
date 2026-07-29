export const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:8080/api/v1";

export const ACCESS_TOKEN_KEY = "rr_lms_access_token";
export const REFRESH_TOKEN_KEY = "rr_lms_refresh_token";

// Matches com.rrtechnosoft.lms.entity.enums.UserRole exactly — do not rename.
export enum Role {
  SUPER_ADMIN = "SUPER_ADMIN",
  ADMIN = "ADMIN",
  STUDENT = "STUDENT",
}

export const ROLE_HOME: Record<Role, string> = {
  [Role.SUPER_ADMIN]: "/admin/dashboard",
  [Role.ADMIN]: "/admin/dashboard",
  [Role.STUDENT]: "/student/dashboard",
};

// Matches com.rrtechnosoft.lms.entity.enums.AccountStatus exactly.
export enum AccountStatus {
  ACTIVE = "ACTIVE",
  INACTIVE = "INACTIVE",
  SUSPENDED = "SUSPENDED",
  PENDING = "PENDING",
}

// Backend phase 1 only implements auth + admin/student management. Every other
// route below (courses, quizzes, etc.) is the contract the frontend expects for
// later phases — it isn't live on the backend yet, so those calls will 404 until
// the matching controllers ship.
export const API_ROUTES = {
  auth: {
    login: "/auth/login",
    refresh: "/auth/refresh",
    logout: "/auth/logout",
  },
  admins: "/admins", // SUPER_ADMIN only
  studentsManage: "/students/manage", // ADMIN + SUPER_ADMIN — create/list/update students
  courses: "/courses",
  modules: (courseId: string) => `/courses/${courseId}/modules`,
  lessons: (moduleId: string) => `/modules/${moduleId}/lessons`,
  enrollments: "/enrollments",
  assignments: "/assignments",
  dailyTasks: "/daily-tasks",
  quizzes: "/quizzes",
  liveClasses: "/live-classes",
  attendance: "/attendance",
  certificates: "/certificates",
  placements: "/placements",
  practiceProblems: "/practice/problems",
  practiceSubmissions: "/practice/submissions",
  dashboardAdmin: "/dashboard/admin",
  dashboardStudent: "/dashboard/student",
};
