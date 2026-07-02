import {
  currentUser,
  currentEmployeeAttendance,
  currentEmployeeMonthlySummary,
  employeeMonthlyCalendar,
} from "@/lib/mockdata";
import { StatusBadge } from "@/components/StatusBadge";
import { MonthlyCalendar } from "@/components/MonthlyCalendar";
import { formatTime, formatDate, formatMinutes, formatMonthLabel } from "@/lib/format";

// Show June 2026 calendar (the month with full data)
const CAL_YEAR  = 2026;
const CAL_MONTH = 6;

export default function EmployeeAttendancePage() {
  const records  = currentEmployeeAttendance;
  const summary  = currentEmployeeMonthlySummary;
  const calendar = employeeMonthlyCalendar.filter((c) => c.employeeId === currentUser.employeeId);

  // For currentUser (emp-001), calendar is empty — show emp-002 calendar as fallback demo
  const calendarEntries =
    calendar.length > 0
      ? calendar
      : employeeMonthlyCalendar; // demo fallback

  const sorted = [...records].sort((a, b) => b.date.localeCompare(a.date));

  return (
    <div className="p-8 max-w-screen-lg">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">My Attendance</h1>
        <p className="text-sm text-gray-500 mt-1">Personal attendance history and monthly calendar.</p>
      </div>

      {/* Monthly summary */}
      <div className="grid grid-cols-4 lg:grid-cols-6 gap-3 mb-6">
        {[
          { label: "Present",       value: summary.presentDays,        color: "text-green-700",  bg: "bg-green-50" },
          { label: "Late",          value: summary.lateDays,            color: "text-amber-700",  bg: "bg-amber-50" },
          { label: "Absent",        value: summary.absentDays,          color: "text-red-700",    bg: "bg-red-50" },
          { label: "Half Day",      value: summary.halfDays,            color: "text-blue-700",   bg: "bg-blue-50" },
          { label: "On Leave",      value: summary.leaveDays,           color: "text-purple-700", bg: "bg-purple-50" },
          { label: "Total Hours",   value: formatMinutes(summary.totalWorkedMinutes), color: "text-indigo-700", bg: "bg-indigo-50" },
        ].map(({ label, value, color, bg }) => (
          <div key={label} className={`rounded-xl border border-gray-100 p-4 ${bg}`}>
            <p className="text-xs text-gray-500">{label}</p>
            <p className={`text-xl font-bold mt-1 ${color}`}>{value}</p>
          </div>
        ))}
      </div>

      {/* Monthly calendar */}
      <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
        <div className="flex items-center justify-between mb-5">
          <div>
            <h2 className="text-sm font-semibold text-gray-900">Monthly Calendar</h2>
            <p className="text-xs text-gray-400 mt-0.5">{formatMonthLabel(`${CAL_YEAR}-${String(CAL_MONTH).padStart(2, "0")}`)}</p>
          </div>
          {calendarEntries.length === 0 && (
            <span className="text-xs text-gray-400">No calendar data available.</span>
          )}
        </div>
        {calendarEntries.length > 0 ? (
          <MonthlyCalendar year={CAL_YEAR} month={CAL_MONTH} entries={calendarEntries} />
        ) : (
          <div className="py-8 text-center text-sm text-gray-400">
            No attendance records found for this month.
          </div>
        )}
      </div>

      {/* Records table */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100">
          <h2 className="text-sm font-semibold text-gray-900">Attendance History</h2>
          <p className="text-xs text-gray-400 mt-0.5">{sorted.length} records · {formatMonthLabel(summary.month)}</p>
        </div>

        {sorted.length === 0 ? (
          <p className="px-6 py-10 text-sm text-gray-400 text-center">
            No attendance records found for {formatMonthLabel(summary.month)}.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100">
                  {["Date", "Check In", "Check Out", "Worked", "Status", "Late", "Distance"].map((h) => (
                    <th key={h} className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider bg-gray-50">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {sorted.map((rec) => (
                  <tr key={rec.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-5 py-3.5 text-gray-900 font-medium">{formatDate(rec.date)}</td>
                    <td className="px-5 py-3.5 text-gray-600 tabular-nums">{formatTime(rec.checkInAt)}</td>
                    <td className="px-5 py-3.5 text-gray-600 tabular-nums">{formatTime(rec.checkOutAt)}</td>
                    <td className="px-5 py-3.5 text-gray-600 tabular-nums">{formatMinutes(rec.totalMinutes)}</td>
                    <td className="px-5 py-3.5"><StatusBadge status={rec.status} /></td>
                    <td className="px-5 py-3.5 text-gray-500 tabular-nums">
                      {rec.lateMinutes > 0 ? `${rec.lateMinutes}m` : "—"}
                    </td>
                    <td className="px-5 py-3.5 text-gray-400 tabular-nums text-xs">
                      {rec.checkInDistanceMeters != null ? `${rec.checkInDistanceMeters}m` : "—"}
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
