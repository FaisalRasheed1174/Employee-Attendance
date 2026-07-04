import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { StatusBadge, EmployeeStatusBadge } from "@/components/StatusBadge";
import { MonthlyCalendar } from "@/components/MonthlyCalendar";
import { formatTime, formatDate, formatMinutes, formatMonthLabel } from "@/lib/format";

type CalendarEntry = {
  employeeId: string;
  date: string;
  status: string;
  checkInAt: string | null;
  checkOutAt: string | null;
  totalMinutes: number | null;
  isLate: boolean;
  lateMinutes: number;
};

export default async function EmployeeProfilePage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ month?: string }>;
}) {
  const { id } = await params;
  const sp = await searchParams;

  type EmployeeDetail = {
    id: string; employeeCode: string; phone: string | null; jobTitle: string;
    hiredAt: Date; status: string;
    user: { name: string; email: string; role: string; status: string };
    department: { name: string };
    attendanceRecords: Array<{
      id: string; date: Date; checkInAt: Date | null; checkOutAt: Date | null;
      totalMinutes: number | null; status: string; isLate: boolean;
      lateMinutes: number; source: string;
    }>;
  };
  let employee: EmployeeDetail | null = null;
  let dbError = false;

  try {
    const result = await prisma.employee.findUnique({
      where: { id },
      include: {
        user: { select: { name: true, email: true, role: true, status: true } },
        department: { select: { name: true } },
        attendanceRecords: {
          orderBy: { date: "desc" },
          take: 50,
        },
      },
    });
    if (!result) notFound();
    employee = result as EmployeeDetail;
  } catch {
    dbError = true;
  }

  if (dbError) {
    return (
      <div className="p-8">
        <div className="bg-amber-50 border border-amber-200 rounded-xl px-6 py-5 text-sm text-amber-800">
          Database not connected. Configure <code className="font-mono">DATABASE_URL</code> and run migrations.
        </div>
      </div>
    );
  }

  if (!employee) notFound();

  // Determine calendar month
  const now = new Date();
  const rawMonth = sp.month ?? `${now.getUTCFullYear()}-${String(now.getUTCMonth() + 1).padStart(2, "0")}`;
  const [calYear, calMonth] = rawMonth.split("-").map(Number);

  const monthStart = new Date(Date.UTC(calYear, calMonth - 1, 1));
  const monthEnd = new Date(Date.UTC(calYear, calMonth, 1));

  const monthRecords = employee.attendanceRecords.filter((r) => {
    const d = new Date(r.date);
    return d >= monthStart && d < monthEnd;
  });

  const calendarEntries: CalendarEntry[] = monthRecords.map((r) => ({
    employeeId: employee!.id,
    date: new Intl.DateTimeFormat("en-CA").format(new Date(r.date)),
    status: r.status,
    checkInAt: r.checkInAt?.toISOString() ?? null,
    checkOutAt: r.checkOutAt?.toISOString() ?? null,
    totalMinutes: r.totalMinutes,
    isLate: r.isLate,
    lateMinutes: r.lateMinutes,
  }));

  // Monthly summary
  const presentDays = monthRecords.filter((r) => r.status === "PRESENT" || r.status === "LATE").length;
  const lateDays = monthRecords.filter((r) => r.isLate).length;
  const absentDays = monthRecords.filter((r) => r.status === "ABSENT").length;
  const halfDays = monthRecords.filter((r) => r.status === "HALF_DAY").length;
  const leaveDays = monthRecords.filter((r) => r.status === "ON_LEAVE").length;
  const missingCheckoutDays = monthRecords.filter((r) => r.status === "MISSING_CHECKOUT").length;
  const totalWorkedMinutes = monthRecords.reduce((sum, r) => sum + (r.totalMinutes ?? 0), 0);

  // Prev / next month links
  const prevMonth = new Date(Date.UTC(calYear, calMonth - 2, 1));
  const nextMonth = new Date(Date.UTC(calYear, calMonth, 1));
  const prevMonthStr = `${prevMonth.getUTCFullYear()}-${String(prevMonth.getUTCMonth() + 1).padStart(2, "0")}`;
  const nextMonthStr = `${nextMonth.getUTCFullYear()}-${String(nextMonth.getUTCMonth() + 1).padStart(2, "0")}`;

  return (
    <div className="p-8 max-w-screen-xl">
      <div className="mb-6 text-xs text-gray-400 flex items-center gap-1.5">
        <Link href="/admin/employees" className="hover:text-gray-700">Employees</Link>
        <span>/</span>
        <span className="text-gray-600">{employee.user.name}</span>
      </div>

      {/* Profile card */}
      <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6 flex items-start justify-between gap-6">
        <div className="flex items-center gap-5">
          <div className="w-14 h-14 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 text-xl font-bold flex-shrink-0">
            {employee.user.name.charAt(0)}
          </div>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-xl font-bold text-gray-900">{employee.user.name}</h1>
              <EmployeeStatusBadge status={employee.status} />
            </div>
            <p className="text-sm text-gray-500 mt-0.5">{employee.jobTitle} · {employee.department.name}</p>
            <p className="text-xs text-gray-400 mt-1">{employee.user.email} · {employee.phone ?? "No phone"}</p>
          </div>
        </div>
        <div className="flex items-center gap-3 flex-shrink-0">
          <Link
            href={`/admin/employees/${id}/edit`}
            className="px-4 py-2 text-sm font-medium text-gray-700 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Edit
          </Link>
          <span className="text-xs text-gray-400">Code: {employee.employeeCode}</span>
        </div>
      </div>

      {/* Monthly summary stats */}
      <div className="grid grid-cols-4 lg:grid-cols-7 gap-3 mb-6">
        {[
          { label: "Present",        value: presentDays,          color: "text-green-700",  bg: "bg-green-50" },
          { label: "Late",           value: lateDays,              color: "text-amber-700",  bg: "bg-amber-50" },
          { label: "Absent",         value: absentDays,            color: "text-red-700",    bg: "bg-red-50" },
          { label: "Half Day",       value: halfDays,              color: "text-blue-700",   bg: "bg-blue-50" },
          { label: "On Leave",       value: leaveDays,             color: "text-purple-700", bg: "bg-purple-50" },
          { label: "Mssng Checkout", value: missingCheckoutDays,   color: "text-orange-700", bg: "bg-orange-50" },
          { label: "Total Hours",    value: formatMinutes(totalWorkedMinutes), color: "text-indigo-700", bg: "bg-indigo-50" },
        ].map(({ label, value, color, bg }) => (
          <div key={label} className={`rounded-xl border border-gray-100 p-4 ${bg}`}>
            <p className="text-xs text-gray-500">{label}</p>
            <p className={`text-xl font-bold mt-1 ${color}`}>{value}</p>
          </div>
        ))}
      </div>

      {/* Calendar */}
      <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
        <div className="flex items-center justify-between mb-5">
          <div>
            <h2 className="text-sm font-semibold text-gray-900">Monthly Calendar</h2>
            <p className="text-xs text-gray-400 mt-0.5">{formatMonthLabel(rawMonth)}</p>
          </div>
          <div className="flex items-center gap-2">
            <Link href={`?month=${prevMonthStr}`} className="text-xs text-gray-500 hover:text-gray-700 px-2 py-1 rounded border border-gray-200 hover:border-gray-300">
              ← Prev
            </Link>
            <Link href={`?month=${nextMonthStr}`} className="text-xs text-gray-500 hover:text-gray-700 px-2 py-1 rounded border border-gray-200 hover:border-gray-300">
              Next →
            </Link>
          </div>
        </div>
        {calendarEntries.length > 0 ? (
          <MonthlyCalendar year={calYear} month={calMonth} entries={calendarEntries} />
        ) : (
          <div className="py-8 text-center text-sm text-gray-400">
            No attendance records found for {formatMonthLabel(rawMonth)}.
          </div>
        )}
      </div>

      {/* Attendance records */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100">
          <h2 className="text-sm font-semibold text-gray-900">Attendance Records</h2>
          <p className="text-xs text-gray-400 mt-0.5">
            {employee.attendanceRecords.length} records (latest 50)
          </p>
        </div>
        {employee.attendanceRecords.length === 0 ? (
          <p className="px-6 py-10 text-sm text-gray-400 text-center">No attendance records found.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100">
                  {["Date", "Check In", "Check Out", "Worked", "Status", "Late", "Source", "Actions"].map((h) => (
                    <th key={h} className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider bg-gray-50">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {employee.attendanceRecords.map((rec) => (
                  <tr key={rec.id} className="hover:bg-gray-50/60 transition-colors">
                    <td className="px-5 py-3.5 text-gray-900 font-medium tabular-nums">
                      {formatDate(new Intl.DateTimeFormat("en-CA").format(new Date(rec.date)))}
                    </td>
                    <td className="px-5 py-3.5 text-gray-600 tabular-nums">{formatTime(rec.checkInAt?.toISOString() ?? null)}</td>
                    <td className="px-5 py-3.5 text-gray-600 tabular-nums">{formatTime(rec.checkOutAt?.toISOString() ?? null)}</td>
                    <td className="px-5 py-3.5 text-gray-600 tabular-nums">{formatMinutes(rec.totalMinutes)}</td>
                    <td className="px-5 py-3.5"><StatusBadge status={rec.status} /></td>
                    <td className="px-5 py-3.5 text-gray-500 tabular-nums">{rec.lateMinutes > 0 ? `${rec.lateMinutes}m` : "—"}</td>
                    <td className="px-5 py-3.5 text-xs text-gray-400 font-mono">{rec.source}</td>
                    <td className="px-5 py-3.5">
                      <Link
                        href={`/admin/attendance/${rec.id}/correct`}
                        className="text-xs text-gray-500 hover:text-gray-700 font-medium"
                      >
                        Correct
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
