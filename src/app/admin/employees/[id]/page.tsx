import Link from "next/link";
import { notFound } from "next/navigation";
import {
  employees,
  attendanceRecords,
  employeeMonthlySummaries,
  employeeMonthlyCalendar,
} from "@/lib/mockdata";
import { StatusBadge, EmployeeStatusBadge } from "@/components/StatusBadge";
import { MonthlyCalendar } from "@/components/MonthlyCalendar";
import { formatTime, formatDate, formatMinutes, formatMonthLabel } from "@/lib/format";

// Calendar is populated for June 2026 (emp-002). Show June for that employee,
// July for others (partial data shown, remaining days labelled as not yet recorded).
const CALENDAR_YEAR  = 2026;
const CALENDAR_MONTH = 6; // June

export default async function EmployeeProfilePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const employee = employees.find((e) => e.id === id);

  if (!employee) notFound();

  const summary  = employeeMonthlySummaries.find((s) => s.employeeId === id);
  const records  = attendanceRecords.filter((r) => r.employeeId === id);
  const calendar = employeeMonthlyCalendar.filter((c) => c.employeeId === id);

  return (
    <div className="p-8 max-w-screen-xl">
      {/* Breadcrumb */}
      <div className="mb-6 text-xs text-gray-400 flex items-center gap-1.5">
        <Link href="/admin/employees" className="hover:text-gray-700">Employees</Link>
        <span>/</span>
        <span className="text-gray-600">{employee.name}</span>
      </div>

      {/* Employee info card */}
      <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6 flex items-start justify-between gap-6">
        <div className="flex items-center gap-5">
          <div className="w-14 h-14 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 text-xl font-bold flex-shrink-0">
            {employee.name.charAt(0)}
          </div>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-xl font-bold text-gray-900">{employee.name}</h1>
              <EmployeeStatusBadge status={employee.status} />
            </div>
            <p className="text-sm text-gray-500 mt-0.5">{employee.jobTitle} · {employee.department}</p>
            <p className="text-xs text-gray-400 mt-1">{employee.email} · {employee.phone}</p>
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
      {summary ? (
        <div className="grid grid-cols-4 lg:grid-cols-7 gap-3 mb-6">
          {[
            { label: "Present",          value: summary.presentDays,        color: "text-green-700",  bg: "bg-green-50" },
            { label: "Late",             value: summary.lateDays,            color: "text-amber-700",  bg: "bg-amber-50" },
            { label: "Absent",           value: summary.absentDays,          color: "text-red-700",    bg: "bg-red-50" },
            { label: "Half Day",         value: summary.halfDays,            color: "text-blue-700",   bg: "bg-blue-50" },
            { label: "On Leave",         value: summary.leaveDays,           color: "text-purple-700", bg: "bg-purple-50" },
            { label: "Mssng Checkout",   value: summary.missingCheckoutDays, color: "text-orange-700", bg: "bg-orange-50" },
            { label: "Total Hours",      value: formatMinutes(summary.totalWorkedMinutes), color: "text-indigo-700", bg: "bg-indigo-50" },
          ].map(({ label, value, color, bg }) => (
            <div key={label} className={`rounded-xl border border-gray-100 p-4 ${bg}`}>
              <p className="text-xs text-gray-500">{label}</p>
              <p className={`text-xl font-bold mt-1 ${color}`}>{value}</p>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-gray-50 rounded-xl border border-gray-200 px-6 py-4 mb-6 text-sm text-gray-400">
          No monthly summary available for this employee yet.
        </div>
      )}

      {/* Calendar section */}
      <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
        <div className="flex items-center justify-between mb-5">
          <div>
            <h2 className="text-sm font-semibold text-gray-900">Monthly Calendar</h2>
            <p className="text-xs text-gray-400 mt-0.5">{formatMonthLabel(`${CALENDAR_YEAR}-${String(CALENDAR_MONTH).padStart(2, "0")}`)}</p>
          </div>
          {calendar.length === 0 && (
            <span className="text-xs text-gray-400">No calendar data available for this employee.</span>
          )}
        </div>
        {calendar.length > 0 ? (
          <MonthlyCalendar
            year={CALENDAR_YEAR}
            month={CALENDAR_MONTH}
            entries={calendar}
          />
        ) : (
          <div className="py-8 text-center text-sm text-gray-400">
            No attendance records found for {formatMonthLabel(`${CALENDAR_YEAR}-${String(CALENDAR_MONTH).padStart(2, "0")}`)}.
          </div>
        )}
      </div>

      {/* Attendance records table */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100">
          <h2 className="text-sm font-semibold text-gray-900">Attendance Records</h2>
          <p className="text-xs text-gray-400 mt-0.5">{records.length} records found · July 2026</p>
        </div>

        {records.length === 0 ? (
          <p className="px-6 py-10 text-sm text-gray-400 text-center">
            No attendance records found for {employee.name}.
          </p>
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
                {records.map((rec) => (
                  <tr key={rec.id} className="hover:bg-gray-50/60 transition-colors">
                    <td className="px-5 py-3.5 text-gray-900 font-medium tabular-nums">{formatDate(rec.date)}</td>
                    <td className="px-5 py-3.5 text-gray-600 tabular-nums">{formatTime(rec.checkInAt)}</td>
                    <td className="px-5 py-3.5 text-gray-600 tabular-nums">{formatTime(rec.checkOutAt)}</td>
                    <td className="px-5 py-3.5 text-gray-600 tabular-nums">{formatMinutes(rec.totalMinutes)}</td>
                    <td className="px-5 py-3.5"><StatusBadge status={rec.status} /></td>
                    <td className="px-5 py-3.5 text-gray-500 tabular-nums">{rec.lateMinutes > 0 ? `${rec.lateMinutes}m` : "—"}</td>
                    <td className="px-5 py-3.5 text-xs text-gray-400 font-mono">{rec.source}</td>
                    <td className="px-5 py-3.5">
                      <button disabled className="text-xs text-gray-300 cursor-not-allowed" title="Correction in next iteration">
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
