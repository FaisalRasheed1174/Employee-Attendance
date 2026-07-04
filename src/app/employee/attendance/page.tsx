import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { StatusBadge } from "@/components/StatusBadge";
import { MonthlyCalendar } from "@/components/MonthlyCalendar";
import { formatTime, formatDate, formatMinutes, formatMonthLabel } from "@/lib/format";

type CalendarEntry = {
  employeeId: string; date: string; status: string;
  checkInAt: string | null; checkOutAt: string | null;
  totalMinutes: number | null; isLate: boolean; lateMinutes: number;
};

export default async function EmployeeAttendancePage({
  searchParams,
}: {
  searchParams: Promise<{ month?: string }>;
}) {
  const session = await getSession();
  if (!session) redirect("/login");
  const sp = await searchParams;

  const now = new Date();
  const rawMonth = sp.month ?? `${now.getUTCFullYear()}-${String(now.getUTCMonth() + 1).padStart(2, "0")}`;
  const [calYear, calMonth] = rawMonth.split("-").map(Number);
  const monthStart = new Date(Date.UTC(calYear, calMonth - 1, 1));
  const monthEnd = new Date(Date.UTC(calYear, calMonth, 1));

  let records: CalendarEntry[] = [];
  let summary = { presentDays: 0, lateDays: 0, absentDays: 0, halfDays: 0, leaveDays: 0, totalWorkedMinutes: 0 };
  let dbError = false;
  let employeeId = "";

  try {
    const employee = await prisma.employee.findUnique({ where: { userId: session.userId } });
    if (!employee) {
      return (
        <div className="p-8">
          <div className="bg-red-50 border border-red-200 rounded-xl px-6 py-5 text-sm text-red-700">
            Employee profile not found. Contact your administrator.
          </div>
        </div>
      );
    }
    employeeId = employee.id;

    const recs = await prisma.attendanceRecord.findMany({
      where: { employeeId: employee.id, date: { gte: monthStart, lt: monthEnd } },
      orderBy: { date: "desc" },
    });

    records = recs.map((r) => ({
      employeeId: employee.id,
      date: new Intl.DateTimeFormat("en-CA").format(new Date(r.date)),
      status: r.status,
      checkInAt: r.checkInAt?.toISOString() ?? null,
      checkOutAt: r.checkOutAt?.toISOString() ?? null,
      totalMinutes: r.totalMinutes,
      isLate: r.isLate,
      lateMinutes: r.lateMinutes,
    }));

    summary = {
      presentDays: recs.filter((r) => r.status === "PRESENT" || r.status === "LATE").length,
      lateDays: recs.filter((r) => r.isLate).length,
      absentDays: recs.filter((r) => r.status === "ABSENT").length,
      halfDays: recs.filter((r) => r.status === "HALF_DAY").length,
      leaveDays: recs.filter((r) => r.status === "ON_LEAVE").length,
      totalWorkedMinutes: recs.reduce((s, r) => s + (r.totalMinutes ?? 0), 0),
    };
  } catch {
    dbError = true;
  }

  const prevMonth = new Date(Date.UTC(calYear, calMonth - 2, 1));
  const nextMonth = new Date(Date.UTC(calYear, calMonth, 1));
  const prevMonthStr = `${prevMonth.getUTCFullYear()}-${String(prevMonth.getUTCMonth() + 1).padStart(2, "0")}`;
  const nextMonthStr = `${nextMonth.getUTCFullYear()}-${String(nextMonth.getUTCMonth() + 1).padStart(2, "0")}`;

  return (
    <div className="p-8 max-w-screen-lg">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">My Attendance</h1>
        <p className="text-sm text-gray-500 mt-1">Personal attendance history and monthly calendar.</p>
      </div>

      {dbError && (
        <div className="mb-6 rounded-xl bg-amber-50 border border-amber-200 px-5 py-4 text-sm text-amber-800">
          Database not connected. Configure <code className="font-mono">DATABASE_URL</code> and run migrations.
        </div>
      )}

      {/* Monthly summary */}
      <div className="grid grid-cols-4 lg:grid-cols-6 gap-3 mb-6">
        {[
          { label: "Present",     value: summary.presentDays,       color: "text-green-700",  bg: "bg-green-50" },
          { label: "Late",        value: summary.lateDays,           color: "text-amber-700",  bg: "bg-amber-50" },
          { label: "Absent",      value: summary.absentDays,         color: "text-red-700",    bg: "bg-red-50" },
          { label: "Half Day",    value: summary.halfDays,           color: "text-blue-700",   bg: "bg-blue-50" },
          { label: "On Leave",    value: summary.leaveDays,          color: "text-purple-700", bg: "bg-purple-50" },
          { label: "Total Hours", value: formatMinutes(summary.totalWorkedMinutes), color: "text-indigo-700", bg: "bg-indigo-50" },
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
            <a href={`?month=${prevMonthStr}`} className="text-xs text-gray-500 hover:text-gray-700 px-2 py-1 rounded border border-gray-200 hover:border-gray-300">
              ← Prev
            </a>
            <a href={`?month=${nextMonthStr}`} className="text-xs text-gray-500 hover:text-gray-700 px-2 py-1 rounded border border-gray-200 hover:border-gray-300">
              Next →
            </a>
          </div>
        </div>
        {records.length > 0 ? (
          <MonthlyCalendar year={calYear} month={calMonth} entries={records} />
        ) : (
          <div className="py-8 text-center text-sm text-gray-400">
            No attendance records found for {formatMonthLabel(rawMonth)}.
          </div>
        )}
      </div>

      {/* Records table */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100">
          <h2 className="text-sm font-semibold text-gray-900">Attendance History</h2>
          <p className="text-xs text-gray-400 mt-0.5">{records.length} records · {formatMonthLabel(rawMonth)}</p>
        </div>
        {records.length === 0 ? (
          <p className="px-6 py-10 text-sm text-gray-400 text-center">
            No attendance records found for {formatMonthLabel(rawMonth)}.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100">
                  {["Date", "Check In", "Check Out", "Worked", "Status", "Late", "Distance"].map((h) => (
                    <th key={h} className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider bg-gray-50">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {records.map((rec) => (
                  <tr key={rec.date} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-5 py-3.5 text-gray-900 font-medium">{formatDate(rec.date)}</td>
                    <td className="px-5 py-3.5 text-gray-600 tabular-nums">{formatTime(rec.checkInAt)}</td>
                    <td className="px-5 py-3.5 text-gray-600 tabular-nums">{formatTime(rec.checkOutAt)}</td>
                    <td className="px-5 py-3.5 text-gray-600 tabular-nums">{formatMinutes(rec.totalMinutes)}</td>
                    <td className="px-5 py-3.5"><StatusBadge status={rec.status} /></td>
                    <td className="px-5 py-3.5 text-gray-500 tabular-nums">{rec.lateMinutes > 0 ? `${rec.lateMinutes}m` : "—"}</td>
                    <td className="px-5 py-3.5 text-gray-400 tabular-nums text-xs">—</td>
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
