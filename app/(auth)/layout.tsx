import { redirect } from "next/navigation";
import { getToken } from "@/lib/api";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // This is a server component, so we need to check auth on the server side
  // We can't use the useAuth hook here
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