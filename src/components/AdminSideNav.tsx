"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";

const navItems = [
  { href: "/admin/dashboard",  label: "Dashboard" },
  { href: "/admin/employees",  label: "Employees" },
  { href: "/admin/attendance", label: "Attendance" },
  { href: "/admin/settings",   label: "Settings" },
  { href: "/admin/audit-logs", label: "Audit Logs" },
];

type Props = {
  userName: string;
  userRole: string;
};

export function AdminSideNav({ userName, userRole }: Props) {
  const pathname = usePathname();
  const router = useRouter();

  async function handleLogout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
  }

  return (
    <aside className="fixed top-0 left-0 h-screen w-60 bg-slate-900 flex flex-col z-10">
      {/* Brand */}
      <div className="px-6 py-5 border-b border-slate-700/60">
        <p className="text-xs font-semibold text-slate-400 uppercase tracking-widest">Attendance</p>
        <p className="text-sm font-bold text-white mt-0.5">Management System</p>
      </div>

      {/* Nav */}
      <nav className="flex-1 py-4 px-3 space-y-0.5 overflow-y-auto">
        {navItems.map((item) => {
          const isActive = pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium transition-colors ${
                isActive
                  ? "bg-indigo-600 text-white"
                  : "text-slate-300 hover:bg-slate-800 hover:text-white"
              }`}
            >
              {item.label}
            </Link>
          );
        })}
      </nav>

      {/* User footer */}
      <div className="px-4 py-4 border-t border-slate-700/60">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-8 h-8 rounded-full bg-indigo-500 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
            {userName.charAt(0).toUpperCase()}
          </div>
          <div className="min-w-0">
            <p className="text-sm font-medium text-white truncate">{userName}</p>
            <p className="text-xs text-slate-400">{userRole}</p>
          </div>
        </div>
        <button
          onClick={handleLogout}
          className="block w-full text-left text-xs text-slate-400 hover:text-slate-200 transition-colors"
        >
          Sign out →
        </button>
      </div>
    </aside>
  );
}
