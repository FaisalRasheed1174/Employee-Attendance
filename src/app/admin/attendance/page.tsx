import { attendanceRecords, employees } from "@/lib/mockdata";
import { StatusBadge } from "@/components/StatusBadge";
import { formatTime, formatDate, formatMinutes } from "@/lib/format";
import Link from "next/link";

const DEPARTMENTS  = ["Engineering", "HR", "Finance", "Operations", "Sales", "Support"];
const STATUSES     = ["PRESENT", "LATE", "HALF_DAY", "ABSENT", "ON_LEAVE", "MISSING_CHECKOUT"];
const STATUS_LABELS: Record<string, string> = {
  PRESENT: "Present", LATE: "Late", HALF_DAY: "Half Day",
  ABSENT: "Absent", ON_LEAVE: "On Leave", MISSING_CHECKOUT: "Missing Checkout",
};

const employeeNames = new Map(employees.map((e) => [e.id, e.name]));

export default function AdminAttendancePage() {
  const sorted = [...attendanceRecords].sort((a, b) => b.date.localeCompare(a.date));

  return (
    <div className="p-8 max-w-screen-xl">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Attendance Records</h1>
        <p className="text-sm text-gray-500 mt-1">{attendanceRecords.length} records · July 2026</p>
      </div>

      {/* Filter panel */}
      <div className="bg-white rounded-xl border border-gray-200 p-5 mb-6">
        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Filters</p>
        <div className="flex flex-wrap gap-3">
          <div className="flex flex-col gap-1">
            <label className="text-xs text-gray-500">Employee</label>
            <select className="text-sm border border-gray-200 rounded-md px-3 py-1.5 text-gray-600 bg-white min-w-40" disabled>
              <option>All Employees</option>
              {employees.filter((e) => e.status === "ACTIVE").map((e) => (
                <option key={e.id}>{e.name}</option>
              ))}
            </select>
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-xs text-gray-500">Department</label>
            <select className="text-sm border border-gray-200 rounded-md px-3 py-1.5 text-gray-600 bg-white" disabled>
              <option>All Departments</option>
              {DEPARTMENTS.map((d) => <option key={d}>{d}</option>)}
            </select>
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-xs text-gray-500">Status</label>
            <select className="text-sm border border-gray-200 rounded-md px-3 py-1.5 text-gray-600 bg-white" disabled>
              <option>All Statuses</option>
              {STATUSES.map((s) => <option key={s}>{STATUS_LABELS[s]}</option>)}
            </select>
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-xs text-gray-500">Date</label>
            <input type="date" defaultValue="2026-07-02" className="text-sm border border-gray-200 rounded-md px-3 py-1.5 text-gray-600" disabled />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-xs text-gray-500">Month</label>
            <input type="month" defaultValue="2026-07" className="text-sm border border-gray-200 rounded-md px-3 py-1.5 text-gray-600" disabled />
          </div>
          <div className="flex items-end gap-3">
            <label className="flex items-center gap-2 text-sm text-gray-600 cursor-not-allowed opacity-50 pb-1.5">
              <input type="checkbox" disabled className="rounded" />
              Late only
            </label>
            <label className="flex items-center gap-2 text-sm text-gray-600 cursor-not-allowed opacity-50 pb-1.5">
              <input type="checkbox" disabled className="rounded" />
              Missing checkout only
            </label>
          </div>
        </div>
        <p className="text-xs text-gray-400 mt-3">Filters active after backend integration.</p>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
          <p className="text-sm font-semibold text-gray-900">All Records</p>
          <span className="text-xs text-gray-400">Showing {sorted.length} records</span>
        </div>

        {sorted.length === 0 ? (
          <p className="px-6 py-12 text-sm text-gray-400 text-center">No attendance records match the selected filters.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100">
                  {["Employee", "Dept", "Date", "Check In", "Check Out", "Worked", "Status", "Late", "Source", "Actions"].map((h) => (
                    <th key={h} className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider bg-gray-50">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {sorted.map((rec) => (
                  <tr key={rec.id} className="hover:bg-gray-50/60 transition-colors">
                    <td className="px-5 py-3.5 font-medium text-gray-900">{rec.employeeName}</td>
                    <td className="px-5 py-3.5 text-gray-500">{rec.department}</td>
                    <td className="px-5 py-3.5 text-gray-600 tabular-nums whitespace-nowrap">{formatDate(rec.date)}</td>
                    <td className="px-5 py-3.5 text-gray-600 tabular-nums">{formatTime(rec.checkInAt)}</td>
                    <td className="px-5 py-3.5 text-gray-600 tabular-nums">{formatTime(rec.checkOutAt)}</td>
                    <td className="px-5 py-3.5 text-gray-600 tabular-nums">{formatMinutes(rec.totalMinutes)}</td>
                    <td className="px-5 py-3.5"><StatusBadge status={rec.status} /></td>
                    <td className="px-5 py-3.5 text-gray-500 tabular-nums">{rec.lateMinutes > 0 ? `${rec.lateMinutes}m` : "—"}</td>
                    <td className="px-5 py-3.5 text-xs text-gray-400 font-mono">{rec.source}</td>
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-3">
                        <Link href={`/admin/employees/${rec.employeeId}`} className="text-xs text-indigo-600 hover:text-indigo-800 font-medium">
                          View
                        </Link>
                        <button disabled className="text-xs text-gray-300 cursor-not-allowed" title="Admin correction in next iteration">
                          Correct
                        </button>
                      </div>
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
