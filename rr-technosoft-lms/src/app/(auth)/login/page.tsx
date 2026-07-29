import { Metadata } from "next";
import { LoginForm } from "@/components/auth/login-form";

export const metadata: Metadata = { title: "Sign in | RR TECHNOSOFT LMS" };

export default function LoginPage() {
  return <LoginForm />;
}
