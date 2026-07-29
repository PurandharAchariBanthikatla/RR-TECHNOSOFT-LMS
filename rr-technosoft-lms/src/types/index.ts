import { Role, AccountStatus } from "@/lib/constants";

/** Internal, UI-friendly user shape used throughout the app. Built by mapping
 *  the backend's flat AuthResponse / UserSummaryResponse via lib/api/mappers.ts. */
export interface User {
  id: string;
  name: string;
  email?: string;
  studentId?: string;
  role: Role;
  avatarUrl?: string;
  status?: AccountStatus;
  phone?: string;
  lastLoginAt?: string;
  createdAt: string;
}

/** Raw shape of POST /auth/login, /auth/refresh — com.rrtechnosoft.lms.dto.response.AuthResponse */
export interface AuthApiResponse {
  accessToken: string;
  refreshToken: string;
  userId: string;
  role: Role;
  fullName: string;
  email: string | null;
  studentId: string | null;
}

/** Raw shape returned by /students/manage, /admins — com.rrtechnosoft.lms.dto.response.UserSummaryResponse */
export interface UserSummaryApiResponse {
  id: string;
  role: Role;
  email: string | null;
  studentId: string | null;
  fullName: string;
  phone: string | null;
  status: AccountStatus;
  lastLoginAt: string | null;
  createdAt: string;
}

/** Matches Spring Data's default Page<T> JSON serialization (note: `number`, not `page`). */
export interface Paginated<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  number: number;
  size: number;
  first: boolean;
  last: boolean;
  empty: boolean;
}

export type CourseLevel = "BEGINNER" | "INTERMEDIATE" | "ADVANCED";
export type CourseStatus = "DRAFT" | "PUBLISHED" | "ARCHIVED";

export interface Course {
  id: string;
  title: string;
  slug: string;
  description: string;
  thumbnailUrl?: string;
  category: string;
  level: CourseLevel;
  status: CourseStatus;
  durationWeeks: number;
  instructorName: string;
  price: number;
  studentsEnrolled: number;
  rating?: number;
  moduleCount: number;
  createdAt: string;
}

export interface CourseModule {
  id: string;
  courseId: string;
  title: string;
  order: number;
  lessonCount: number;
}

export type LessonType = "VIDEO" | "ARTICLE" | "RESOURCE";

export interface Lesson {
  id: string;
  moduleId: string;
  title: string;
  type: LessonType;
  durationMinutes: number;
  order: number;
  completed?: boolean;
  contentUrl?: string;
}

export type EnrollmentStatus = "ACTIVE" | "COMPLETED" | "DROPPED" | "PENDING";

export interface Enrollment {
  id: string;
  courseId: string;
  courseTitle: string;
  studentId: string;
  studentName: string;
  status: EnrollmentStatus;
  progress: number;
  enrolledAt: string;
}

export type SubmissionStatus = "NOT_SUBMITTED" | "SUBMITTED" | "GRADED" | "LATE";

export interface Assignment {
  id: string;
  courseId: string;
  courseTitle: string;
  title: string;
  description: string;
  dueDate: string;
  maxScore: number;
  status: SubmissionStatus;
  score?: number;
  submittedCount?: number;
  totalStudents?: number;
}

export interface DailyTask {
  id: string;
  title: string;
  description: string;
  date: string;
  completed: boolean;
  courseTitle?: string;
}

export interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  correctOptionIndex?: number;
}

export interface Quiz {
  id: string;
  courseId: string;
  courseTitle: string;
  title: string;
  durationMinutes: number;
  totalQuestions: number;
  totalMarks: number;
  attempted: boolean;
  score?: number;
  availableFrom: string;
  availableTo: string;
}

export type LiveClassStatus = "SCHEDULED" | "LIVE" | "ENDED" | "CANCELLED";

export interface LiveClass {
  id: string;
  courseId: string;
  courseTitle: string;
  title: string;
  instructorName: string;
  startTime: string;
  endTime: string;
  status: LiveClassStatus;
  meetingUrl?: string;
  recordingUrl?: string;
}

export type AttendanceStatus = "PRESENT" | "ABSENT" | "LATE" | "EXCUSED";

export interface AttendanceRecord {
  id: string;
  date: string;
  courseTitle: string;
  status: AttendanceStatus;
  studentId?: string;
  studentName?: string;
}

export interface AttendanceSummary {
  totalClasses: number;
  present: number;
  absent: number;
  late: number;
  percentage: number;
}

export interface Certificate {
  id: string;
  courseTitle: string;
  studentName: string;
  issuedAt: string;
  certificateUrl: string;
  verificationCode: string;
}

export type PlacementStatus = "OPEN" | "CLOSED" | "APPLIED" | "SHORTLISTED" | "SELECTED" | "REJECTED";

export interface PlacementDrive {
  id: string;
  companyName: string;
  companyLogoUrl?: string;
  role: string;
  location: string;
  packageLpa: string;
  eligibility: string;
  driveDate: string;
  status: PlacementStatus;
  applicantsCount?: number;
}

export type ProblemDifficulty = "EASY" | "MEDIUM" | "HARD";

export interface PracticeProblem {
  id: string;
  title: string;
  difficulty: ProblemDifficulty;
  topic: string;
  solvedByMe: boolean;
  successRate: number;
  description: string;
}

export interface AdminDashboardStats {
  totalStudents: number;
  totalCourses: number;
  activeEnrollments: number;
  totalRevenue: number;
  upcomingLiveClasses: number;
  pendingAssignments: number;
  studentGrowth: { month: string; students: number }[];
}

export interface StudentDashboardStats {
  enrolledCourses: number;
  completedCourses: number;
  overallProgress: number;
  attendancePercentage: number;
  pendingAssignments: number;
  upcomingClasses: LiveClass[];
  certificatesEarned: number;
}
