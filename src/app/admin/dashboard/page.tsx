import Link from "next/link";
import {
  dashboardSummary,
  recentAttendanceEvents,
  lateArrivals,
  missingCheckoutRecords,
  attendanceRecords,
  employees,
} from "@/lib/mockdata";
import { StatusBadge } from "@/components/StatusBadge";
import { formatTime, formatDate, formatTimestamp, formatMinutes } from "@/lib/format";

const TODAY = "2026-07-02";

type KpiProps = {
  label: string;
  value: string | number;
  sub?: string;
  accent: string;
  bg: string;
};

function KpiCard({ label, value, sub, accent, bg }: KpiProps) {
  return (
    <div className={`rounded-xl border border-gray-200 p-5 ${bg}`}>
      <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">{label}</p>
      <p className={`text-3xl font-bold mt-2 ${accent}`}>{value}</p>
      {sub && <p className="text-xs text-gray-400 mt-1">{sub}</p>}
    </div>
  );
}

const todayRecords = attendanceRecords.filter((r) => r.date === TODAY);
const todayLate    = lateArrivals.filter((l) => l.date === TODAY);

function getEmployeeName(employeeId: string) {
  return employees.find((e) => e.id === employeeId)?.name ?? employeeId;
}

export default function AdminDashboardPage() {
  return (
    <div className="p-8 max-w-screen-xl">
      {/* Page header */}
      <div className="mb-8 flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-sm text-gray-500 mt-1">Wednesday, July 2, 2026 · Attendance overview</p>
        </div>
      </div>

      {/* KPI cards */}
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
        <KpiCard label="Total Active Employees" value={dashboardSummary.totalActiveEmployees} accent="text-gray-900"   bg="bg-white" />
        <KpiCard label="Present Today"           value={dashboardSummary.presentToday}         accent="text-green-700"  bg="bg-green-50" />
        <KpiCard label="Late Today"              value={dashboardSummary.lateToday}             accent="text-amber-700"  bg="bg-amber-50" />
        <KpiCard label="Absent Today"            value={dashboardSummary.absentToday}           accent="text-red-700"    bg="bg-red-50" />
        <KpiCard label="Missing Checkout"        value={dashboardSummary.missingCheckoutToday}  accent="text-orange-700" bg="bg-orange-50" />
        <KpiCard label="Avg Working Hours"       value={`${dashboardSummary.averageWorkingHours}h`} sub="This month" accent="text-indigo-700" bg="bg-indigo-50" />
      </div>

      {/* Two-column section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {/* Recent events — 2/3 */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
            <h2 className="text-sm font-semibold text-gray-900">Recent Attendance Events</h2>
            <span className="text-xs text-gray-400">{recentAttendanceEvents.length} events</span>
          </div>
          {recentAttendanceEvents.length === 0 ? (
            <p className="px-6 py-8 text-sm text-gray-400 text-center">No attendance events recorded.</p>
          ) : (
            <div className="divide-y divide-gray-50">
              {recentAttendanceEvents.map((evt) => (
                <div key={evt.id} className="px-6 py-3 flex items-start justify-between gap-4 hover:bg-gray-50/50">
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">{evt.employeeName}</p>
                    <p className="text-xs text-gray-500">{evt.department} · {formatTimestamp(evt.timestamp)}</p>
                    <p className="text-xs text-gray-400 mt-0.5">{evt.message}</p>
                  </div>
                  <div className="flex-shrink-0">
                    <StatusBadge status={evt.status} />
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
            {todayLate.length === 0 ? (
              <p className="px-5 py-5 text-sm text-gray-400">No late arrivals today.</p>
            ) : (
              <div className="divide-y divide-gray-50">
                {todayLate.map((arrival) => (
                  <div key={arrival.id} className="px-5 py-3">
                    <p className="text-sm font-medium text-gray-900">{arrival.employeeName}</p>
                    <p className="text-xs text-gray-500">{arrival.department}</p>
                    <p className="text-xs text-amber-600 mt-0.5 font-medium">
                      {arrival.lateMinutes}m late · {formatTime(arrival.checkInAt)}
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
            {missingCheckoutRecords.length === 0 ? (
              <p className="px-5 py-5 text-sm text-gray-400">No missing checkouts.</p>
            ) : (
              <div className="divide-y divide-gray-50">
                {missingCheckoutRecords.map((rec) => (
                  <div key={rec.id} className="px-5 py-3">
                    <p className="text-sm font-medium text-gray-900">{rec.employeeName}</p>
                    <p className="text-xs text-gray-500">{rec.department}</p>
                    <p className="text-xs text-orange-600 mt-0.5 font-medium">
                      {formatDate(rec.date)} · {rec.checkInAt ? formatTime(rec.checkInAt) : "No check-in recorded"}
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
            <p className="text-xs text-gray-400 mt-0.5">{todayRecords.length} records for {formatDate(TODAY)}</p>
          </div>
          <Link href="/admin/attendance" className="text-xs text-indigo-600 hover:text-indigo-800 font-medium">
            View all records →
          </Link>
        </div>

        {/* Filters — visual only */}
        <div className="px-6 py-3 border-b border-gray-100 bg-gray-50/50 flex flex-wrap gap-2">
          <select className="text-xs border border-gray-200 rounded-md px-2.5 py-1.5 text-gray-600 bg-white" disabled>
            <option>All Employees</option>
          </select>
          <select className="text-xs border border-gray-200 rounded-md px-2.5 py-1.5 text-gray-600 bg-white" disabled>
            <option>All Departments</option>
          </select>
          <select className="text-xs border border-gray-200 rounded-md px-2.5 py-1.5 text-gray-600 bg-white" disabled>
            <option>All Statuses</option>
          </select>
          <input type="date" defaultValue={TODAY} className="text-xs border border-gray-200 rounded-md px-2.5 py-1.5 text-gray-600 bg-white" disabled />
          <span className="text-xs text-gray-400 self-center ml-1">Filters available after backend integration.</span>
        </div>

        {todayRecords.length === 0 ? (
          <p className="px-6 py-10 text-sm text-gray-400 text-center">No attendance records found for today.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100">
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider bg-gray-50">Employee</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider bg-gray-50">Dept</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider bg-gray-50">Check In</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider bg-gray-50">Check Out</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider bg-gray-50">Worked</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider bg-gray-50">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider bg-gray-50">Late</th>
                  <th className="px-6 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider bg-gray-50">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {todayRecords.map((rec) => (
                  <tr key={rec.id} className="hover:bg-gray-50/60 transition-colors">
                    <td className="px-6 py-3.5 font-medium text-gray-900">{rec.employeeName}</td>
                    <td className="px-6 py-3.5 text-gray-500">{rec.department}</td>
                    <td className="px-6 py-3.5 text-gray-600 tabular-nums">{formatTime(rec.checkInAt)}</td>
                    <td className="px-6 py-3.5 text-gray-600 tabular-nums">{formatTime(rec.checkOutAt)}</td>
                    <td className="px-6 py-3.5 text-gray-600 tabular-nums">{formatMinutes(rec.totalMinutes)}</td>
                    <td className="px-6 py-3.5"><StatusBadge status={rec.status} /></td>
                    <td className="px-6 py-3.5 text-gray-500 tabular-nums">
                      {rec.lateMinutes > 0 ? `${rec.lateMinutes}m` : "—"}
                    </td>
                    <td className="px-6 py-3.5 text-right space-x-3">
                      <Link href={`/admin/employees/${rec.employeeId}`} className="text-xs text-indigo-600 hover:text-indigo-800 font-medium">
                        View
                      </Link>
                      <button disabled className="text-xs text-gray-300 cursor-not-allowed" title="Admin correction coming in next iteration">
                        Correct
                      </button>
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
