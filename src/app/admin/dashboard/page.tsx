import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { StatusBadge } from "@/components/StatusBadge";
import { formatTime, formatDate, formatMinutes } from "@/lib/format";
import { getTodayDate } from "@/lib/attendance";

type KpiProps = { label: string; value: string | number; sub?: string; accent: string; bg: string };

function KpiCard({ label, value, sub, accent, bg }: KpiProps) {
  return (
    <div className={`rounded-xl border border-gray-200 p-5 ${bg}`}>
      <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">{label}</p>
      <p className={`text-3xl font-bold mt-2 ${accent}`}>{value}</p>
      {sub && <p className="text-xs text-gray-400 mt-1">{sub}</p>}
    </div>
  );
}

async function getDashboardData() {
  const policy = await prisma.attendancePolicy.findFirst({ where: { active: true } });
  const tz = policy?.timezone ?? "UTC";
  const todayDate = getTodayDate(tz);
  const tomorrow = new Date(todayDate.getTime() + 86_400_000);
  const now = new Date();
  const firstOfMonth = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1));

  const [totalActiveEmployees, todayRecords, recentCheckIns, monthAggregate, lateToday, missingCheckout] =
    await Promise.all([
      prisma.employee.count({ where: { status: "ACTIVE" } }),
      prisma.attendanceRecord.findMany({
        where: { date: { gte: todayDate, lt: tomorrow } },
        include: {
          employee: {
            include: {
              user: { select: { name: true } },
              department: { select: { name: true } },
            },
          },
        },
        orderBy: { checkInAt: "desc" },
      }),
      prisma.attendanceRecord.findMany({
        where: { date: { gte: todayDate, lt: tomorrow }, checkInAt: { not: null } },
        include: {
          employee: {
            include: {
              user: { select: { name: true } },
              department: { select: { name: true } },
            },
          },
        },
        orderBy: { checkInAt: "desc" },
        take: 10,
      }),
      prisma.attendanceRecord.aggregate({
        where: { date: { gte: firstOfMonth }, totalMinutes: { not: null } },
        _avg: { totalMinutes: true },
      }),
      prisma.attendanceRecord.findMany({
        where: { date: { gte: todayDate, lt: tomorrow }, isLate: true },
        include: {
          employee: {
            include: {
              user: { select: { name: true } },
              department: { select: { name: true } },
            },
          },
        },
        orderBy: { checkInAt: "asc" },
      }),
      prisma.attendanceRecord.findMany({
        where: { date: { gte: todayDate, lt: tomorrow }, checkInAt: { not: null }, checkOutAt: null },
        include: {
          employee: {
            include: {
              user: { select: { name: true } },
              department: { select: { name: true } },
            },
          },
        },
      }),
    ]);

  const presentToday = todayRecords.filter((r) => r.checkInAt).length;
  const absentToday = Math.max(0, totalActiveEmployees - presentToday);
  const avgHours = monthAggregate._avg.totalMinutes
    ? Math.round((monthAggregate._avg.totalMinutes / 60) * 10) / 10
    : 0;

  return {
    summary: {
      totalActiveEmployees,
      presentToday,
      lateToday: lateToday.length,
      absentToday,
      missingCheckoutToday: missingCheckout.length,
      averageWorkingHours: avgHours,
    },
    todayDate,
    todayRecords,
    recentCheckIns,
    lateToday,
    missingCheckout,
    policy,
  };
}

export default async function AdminDashboardPage() {
  let data: Awaited<ReturnType<typeof getDashboardData>> | null = null;
  let dbError = false;

  try {
    data = await getDashboardData();
  } catch {
    dbError = true;
  }

  const todayLabel = data ? formatDate(data.todayDate.toISOString().slice(0, 10)) : "Today";

  return (
    <div className="p-8 max-w-screen-xl">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-sm text-gray-500 mt-1">{todayLabel} · Attendance overview</p>
      </div>

      {dbError && (
        <div className="mb-6 rounded-xl bg-amber-50 border border-amber-200 px-5 py-4 text-sm text-amber-800">
          Database not connected. Configure <code className="font-mono">DATABASE_URL</code> in your{" "}
          <code className="font-mono">.env</code> file and run{" "}
          <code className="font-mono">npx prisma migrate dev</code>.
        </div>
      )}

      {/* KPI cards */}
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
        <KpiCard label="Total Active Employees" value={data?.summary.totalActiveEmployees ?? "—"} accent="text-gray-900" bg="bg-white" />
        <KpiCard label="Present Today" value={data?.summary.presentToday ?? "—"} accent="text-green-700" bg="bg-green-50" />
        <KpiCard label="Late Today" value={data?.summary.lateToday ?? "—"} accent="text-amber-700" bg="bg-amber-50" />
        <KpiCard label="Absent Today" value={data?.summary.absentToday ?? "—"} accent="text-red-700" bg="bg-red-50" />
        <KpiCard label="Missing Checkout" value={data?.summary.missingCheckoutToday ?? "—"} accent="text-orange-700" bg="bg-orange-50" />
        <KpiCard label="Avg Working Hours" value={data ? `${data.summary.averageWorkingHours}h` : "—"} sub="This month" accent="text-indigo-700" bg="bg-indigo-50" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {/* Recent check-ins */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
            <h2 className="text-sm font-semibold text-gray-900">Recent Check-ins Today</h2>
            <span className="text-xs text-gray-400">{data?.recentCheckIns.length ?? 0} events</span>
          </div>
          {!data || data.recentCheckIns.length === 0 ? (
            <p className="px-6 py-8 text-sm text-gray-400 text-center">No check-ins recorded yet today.</p>
          ) : (
            <div className="divide-y divide-gray-50">
              {data.recentCheckIns.map((rec) => (
                <div key={rec.id} className="px-6 py-3 flex items-center justify-between gap-4 hover:bg-gray-50/50">
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">{rec.employee.user.name}</p>
                    <p className="text-xs text-gray-500">{rec.employee.department.name}</p>
                  </div>
                  <div className="flex items-center gap-3 flex-shrink-0">
                    <span className="text-xs text-gray-500 tabular-nums">{formatTime(rec.checkInAt?.toISOString() ?? null)}</span>
                    <StatusBadge status={rec.status} />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right column */}
        <div className="space-y-6">
          {/* Late arrivals */}
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            <div className="px-5 py-4 border-b border-gray-100">
              <h2 className="text-sm font-semibold text-gray-900">Late Arrivals Today</h2>
            </div>
            {!data || data.lateToday.length === 0 ? (
              <p className="px-5 py-5 text-sm text-gray-400">No late arrivals today.</p>
            ) : (
              <div className="divide-y divide-gray-50">
                {data.lateToday.map((rec) => (
                  <div key={rec.id} className="px-5 py-3">
                    <p className="text-sm font-medium text-gray-900">{rec.employee.user.name}</p>
                    <p className="text-xs text-gray-500">{rec.employee.department.name}</p>
                    <p className="text-xs text-amber-600 mt-0.5 font-medium">
                      {rec.lateMinutes}m late · {formatTime(rec.checkInAt?.toISOString() ?? null)}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Missing checkout */}
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            <div className="px-5 py-4 border-b border-gray-100">
              <h2 className="text-sm font-semibold text-gray-900">Missing Checkout</h2>
            </div>
            {!data || data.missingCheckout.length === 0 ? (
              <p className="px-5 py-5 text-sm text-gray-400">No missing checkouts.</p>
            ) : (
              <div className="divide-y divide-gray-50">
                {data.missingCheckout.map((rec) => (
                  <div key={rec.id} className="px-5 py-3">
                    <p className="text-sm font-medium text-gray-900">{rec.employee.user.name}</p>
                    <p className="text-xs text-gray-500">{rec.employee.department.name}</p>
                    <p className="text-xs text-orange-600 mt-0.5 font-medium">
                      Checked in at {formatTime(rec.checkInAt?.toISOString() ?? null)}, no checkout
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Today's attendance table */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
          <div>
            <h2 className="text-sm font-semibold text-gray-900">Today's Attendance</h2>
            <p className="text-xs text-gray-400 mt-0.5">{data?.todayRecords.length ?? 0} records for {todayLabel}</p>
          </div>
          <Link href="/admin/attendance" className="text-xs text-indigo-600 hover:text-indigo-800 font-medium">
            View all records →
          </Link>
        </div>

        {!data || data.todayRecords.length === 0 ? (
          <p className="px-6 py-10 text-sm text-gray-400 text-center">No attendance records found for today.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100">
                  {["Employee", "Dept", "Check In", "Check Out", "Worked", "Status", "Late", "Actions"].map((h) => (
                    <th key={h} className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider bg-gray-50">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {data.todayRecords.map((rec) => (
                  <tr key={rec.id} className="hover:bg-gray-50/60 transition-colors">
                    <td className="px-6 py-3.5 font-medium text-gray-900">{rec.employee.user.name}</td>
                    <td className="px-6 py-3.5 text-gray-500">{rec.employee.department.name}</td>
                    <td className="px-6 py-3.5 text-gray-600 tabular-nums">{formatTime(rec.checkInAt?.toISOString() ?? null)}</td>
                    <td className="px-6 py-3.5 text-gray-600 tabular-nums">{formatTime(rec.checkOutAt?.toISOString() ?? null)}</td>
                    <td className="px-6 py-3.5 text-gray-600 tabular-nums">{formatMinutes(rec.totalMinutes)}</td>
                    <td className="px-6 py-3.5"><StatusBadge status={rec.status} /></td>
                    <td className="px-6 py-3.5 text-gray-500 tabular-nums">
                      {rec.lateMinutes > 0 ? `${rec.lateMinutes}m` : "—"}
                    </td>
                    <td className="px-6 py-3.5 text-right space-x-3">
                      <Link href={`/admin/employees/${rec.employeeId}`} className="text-xs text-indigo-600 hover:text-indigo-800 font-medium">
                        View
                      </Link>
                      <Link href={`/admin/attendance/${rec.id}/correct`} className="text-xs text-gray-500 hover:text-gray-700 font-medium">
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
