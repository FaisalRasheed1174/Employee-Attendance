import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { AdminSideNav } from "@/components/AdminSideNav";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await getSession();
  if (!session) redirect("/login");
  if (session.role === "EMPLOYEE") redirect("/employee/dashboard");

  let userName = session.name;
  try {
    const user = await prisma.user.findUnique({
      where: { id: session.userId },
      select: { name: true },
    });
    if (user) userName = user.name;
  } catch {
    // DB not yet connected — use session data
  }

  return (
    <div className="flex min-h-screen bg-gray-50">
      <AdminSideNav userName={userName} userRole={session.role} />
      <main className="ml-60 flex-1 min-h-screen">{children}</main>
    </div>
  );
}
