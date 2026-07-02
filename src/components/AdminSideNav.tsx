"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { currentUser } from "@/lib/mockdata";

const navItems = [
  { href: "/admin/dashboard",  label: "Dashboard" },
  { href: "/admin/employees",  label: "Employees" },
  { href: "/admin/attendance", label: "Attendance" },
  { href: "/admin/settings",   label: "Settings" },
  { href: "/admin/audit-logs", label: "Audit Logs" },
];

export function AdminSideNav() {
  const pathname = usePathname();

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
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-indigo-500 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
            {currentUser.name.charAt(0)}
          </div>
          <div className="min-w-0">
            <p className="text-sm font-medium text-white truncate">{currentUser.name}</p>
            <p className="text-xs text-slate-400">{currentUser.role}</p>
          </div>
        </div>
        <Link
          href="/employee/dashboard"
          className="mt-3 block text-xs text-slate-400 hover:text-slate-200 transition-colors"
        >
          Switch to Employee View →
        </Link>
      </div>
    </aside>
  );
}
