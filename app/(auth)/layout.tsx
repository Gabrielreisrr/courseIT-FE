import { redirect } from "next/navigation";
import { getToken } from "@/lib/api";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const token = getToken();

  if (token) {
    redirect("/dashboard");
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-blue-100 dark:from-gray-900 dark:to-indigo-950">
      {children}
    </div>
  );
}
