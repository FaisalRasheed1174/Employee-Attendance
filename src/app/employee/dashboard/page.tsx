import {
  currentUser,
  currentEmployeeAttendance,
  currentEmployeeMonthlySummary,
  attendancePolicy,
  employees,
} from "@/lib/mockdata";
import { StatusBadge } from "@/components/StatusBadge";
import { CheckInOutPanel } from "@/components/CheckInOutPanel";
import { formatTime, formatDate, formatMinutes, formatMonthLabel } from "@/lib/format";

const TODAY = "2026-07-02";

export default function EmployeeDashboardPage() {
  const employee    = employees.find((e) => e.id === currentUser.employeeId);
  const todayRecord = currentEmployeeAttendance.find((r) => r.date === TODAY);
  const recentRecs  = [...currentEmployeeAttendance].sort((a, b) => b.date.localeCompare(a.date));
  const summary     = currentEmployeeMonthlySummary;

  if (!employee) {
    return (
      <div className="p-8">
        <div className="bg-red-50 border border-red-200 rounded-xl px-6 py-5 text-sm text-red-700">
          Employee profile not found. Contact your administrator.
        </div>
      </div>
    );
  }

  return (
    <div className="p-8 max-w-screen-lg">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Welcome, {employee.name.split(" ")[0]}</h1>
        <p className="text-sm text-gray-500 mt-1">
          Wednesday, July 2, 2026 · {employee.department} · {employee.jobTitle}
        </p>
      </div>

      {/* Attendance policy banner */}
      {!attendancePolicy.active && (
        <div className="mb-6 bg-red-50 border border-red-200 rounded-xl px-5 py-3.5 text-sm text-red-700">
          Attendance policy is not active. Contact an admin before checking in.
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {/* Today's status — left large card */}
        <div className="lg:col-span-2 space-y-4">
          {/* Today status card */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h2 className="text-sm font-semibold text-gray-700">Today's Attendance</h2>
                <p className="text-xs text-gray-400 mt-0.5">{formatDate(TODAY)}</p>
              </div>
              {todayRecord ? (
                <StatusBadge status={todayRecord.status} />
              ) : (
                <span className="text-xs text-gray-400">Not checked in yet</span>
              )}
            </div>

            {todayRecord ? (
              <div className="grid grid-cols-3 gap-4">
                <div className="bg-green-50 rounded-lg p-4">
                  <p className="text-xs text-gray-500">Check In</p>
                  <p className="text-xl font-bold text-green-700 mt-1">{formatTime(todayRecord.checkInAt)}</p>
                </div>
                <div className={`rounded-lg p-4 ${todayRecord.checkOutAt ? "bg-blue-50" : "bg-gray-50"}`}>
                  <p className="text-xs text-gray-500">Check Out</p>
                  <p className={`text-xl font-bold mt-1 ${todayRecord.checkOutAt ? "text-blue-700" : "text-gray-400"}`}>
                    {formatTime(todayRecord.checkOutAt)}
                  </p>
                </div>
                <div className="bg-indigo-50 rounded-lg p-4">
                  <p className="text-xs text-gray-500">Worked</p>
                  <p className="text-xl font-bold text-indigo-700 mt-1">
                    {todayRecord.totalMinutes ? formatMinutes(todayRecord.totalMinutes) : "In progress"}
                  </p>
                </div>
              </div>
            ) : (
              <div className="bg-gray-50 rounded-lg p-5 text-sm text-gray-500 text-center">
                No attendance record for today. Use the panel on the right to check in.
              </div>
            )}
          </div>

          {/* Monthly summary */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h2 className="text-sm font-semibold text-gray-700 mb-4">
              {formatMonthLabel(summary.month)} Summary
            </h2>
            <div className="grid grid-cols-3 gap-3">
              {[
                { label: "Present",  value: summary.presentDays,  color: "text-green-700",  bg: "bg-green-50" },
                { label: "Late",     value: summary.lateDays,      color: "text-amber-700",  bg: "bg-amber-50" },
                { label: "Absent",   value: summary.absentDays,    color: "text-red-700",    bg: "bg-red-50" },
                { label: "Half Day", value: summary.halfDays,       color: "text-blue-700",   bg: "bg-blue-50" },
                { label: "On Leave", value: summary.leaveDays,      color: "text-purple-700", bg: "bg-purple-50" },
                { label: "Total Hours", value: formatMinutes(summary.totalWorkedMinutes), color: "text-indigo-700", bg: "bg-indigo-50" },
              ].map(({ label, value, color, bg }) => (
                <div key={label} className={`rounded-lg p-3 ${bg}`}>
                  <p className="text-xs text-gray-500">{label}</p>
                  <p className={`text-lg font-bold mt-0.5 ${color}`}>{value}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Check In/Out panel — right column */}
        <div className="space-y-4">
          <CheckInOutPanel todayRecord={todayRecord} />

          {/* Policy info */}
          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Office Radius</h3>
            <p className="text-sm text-gray-700">{attendancePolicy.officeName}</p>
            <p className="text-xs text-gray-400 mt-1">
              Allowed radius: {attendancePolicy.allowedRadiusMeters}m · Work starts at {attendancePolicy.workStartTime}
            </p>
          </div>
        </div>
      </div>

      {/* Recent attendance */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
          <h2 className="text-sm font-semibold text-gray-900">Recent Attendance</h2>
          <a href="/employee/attendance" className="text-xs text-indigo-600 hover:text-indigo-800 font-medium">
            View full history →
          </a>
        </div>

        {recentRecs.length === 0 ? (
          <p className="px-6 py-8 text-sm text-gray-400 text-center">No attendance records found for this month.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100">
                  {["Date", "Check In", "Check Out", "Worked", "Status", "Late"].map((h) => (
                    <th key={h} className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider bg-gray-50">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {recentRecs.map((rec) => (
                  <tr key={rec.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-5 py-3.5 text-gray-900 font-medium">{formatDate(rec.date)}</td>
                    <td className="px-5 py-3.5 text-gray-600 tabular-nums">{formatTime(rec.checkInAt)}</td>
                    <td className="px-5 py-3.5 text-gray-600 tabular-nums">{formatTime(rec.checkOutAt)}</td>
                    <td className="px-5 py-3.5 text-gray-600 tabular-nums">{formatMinutes(rec.totalMinutes)}</td>
                    <td className="px-5 py-3.5"><StatusBadge status={rec.status} /></td>
                    <td className="px-5 py-3.5 text-gray-500 tabular-nums">
                      {rec.lateMinutes > 0 ? `${rec.lateMinutes}m` : "—"}
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
