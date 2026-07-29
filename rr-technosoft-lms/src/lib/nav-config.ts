import {
  LayoutDashboard,
  BookOpen,
  Layers,
  Users,
  ClipboardList,
  FileCheck2,
  HelpCircle,
  Video,
  CalendarCheck,
  Award,
  Briefcase,
  Code2,
  ListTodo,
  ShieldCheck,
  type LucideIcon,
} from "lucide-react";
import { Role } from "@/lib/constants";

export interface NavItem {
  label: string;
  href: string;
  icon: LucideIcon;
}

export const adminNav: NavItem[] = [
  { label: "Dashboard", href: "/admin/dashboard", icon: LayoutDashboard },
  { label: "Courses", href: "/admin/courses", icon: BookOpen },
  { label: "Students", href: "/admin/students", icon: Users },
  { label: "Enrollments", href: "/admin/enrollments", icon: Layers },
  { label: "Assignments", href: "/admin/assignments", icon: ClipboardList },
  { label: "Quizzes", href: "/admin/quizzes", icon: HelpCircle },
  { label: "Live Classes", href: "/admin/live-classes", icon: Video },
  { label: "Attendance", href: "/admin/attendance", icon: CalendarCheck },
  { label: "Certificates", href: "/admin/certificates", icon: Award },
  { label: "Placements", href: "/admin/placements", icon: Briefcase },
];

/** SUPER_ADMIN-only items, matching /admins being locked down on the backend. */
const superAdminOnlyNav: NavItem[] = [
  { label: "Admins", href: "/admin/admins", icon: ShieldCheck },
];

export function getAdminNav(role?: Role): NavItem[] {
  return role === Role.SUPER_ADMIN ? [...adminNav, ...superAdminOnlyNav] : adminNav;
}

export const studentNav: NavItem[] = [
  { label: "Dashboard", href: "/student/dashboard", icon: LayoutDashboard },
  { label: "My Courses", href: "/student/courses", icon: BookOpen },
  { label: "Daily Tasks", href: "/student/daily-tasks", icon: ListTodo },
  { label: "Assignments", href: "/student/assignments", icon: ClipboardList },
  { label: "Quizzes", href: "/student/quizzes", icon: HelpCircle },
  { label: "Live Classes", href: "/student/live-classes", icon: Video },
  { label: "Attendance", href: "/student/attendance", icon: CalendarCheck },
  { label: "Practice Portal", href: "/student/practice", icon: Code2 },
  { label: "Certificates", href: "/student/certificates", icon: Award },
  { label: "Placements", href: "/student/placements", icon: Briefcase },
  { label: "Submissions", href: "/student/assignments?tab=submitted", icon: FileCheck2 },
];
