import {
  currentUser,
  currentEmployeeMonthlySummary,
  currentEmployeeAttendance,
  employees,
  attendancePolicy,
} from "@/lib/mockdata";
import { EmployeeStatusBadge } from "@/components/StatusBadge";
import { formatDate, formatMinutes, formatMonthLabel } from "@/lib/format";

export default function EmployeeProfilePage() {
  const employee = employees.find((e) => e.id === currentUser.employeeId);
  const summary  = currentEmployeeMonthlySummary;
  const records  = currentEmployeeAttendance;

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
    <div className="p-8 max-w-2xl">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">My Profile</h1>
        <p className="text-sm text-gray-500 mt-1">Your employee information and attendance summary.</p>
      </div>

      {/* Profile card */}
      <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
        <div className="flex items-center gap-5 mb-6 pb-6 border-b border-gray-100">
          <div className="w-16 h-16 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-700 text-2xl font-bold flex-shrink-0">
            {employee.name.charAt(0)}
          </div>
          <div>
            <div className="flex items-center gap-3">
              <h2 className="text-lg font-bold text-gray-900">{employee.name}</h2>
              <EmployeeStatusBadge status={employee.status} />
            </div>
            <p className="text-sm text-gray-500 mt-0.5">{employee.jobTitle} · {employee.department}</p>
          </div>
        </div>

        <dl className="space-y-3">
          {[
            { label: "Employee Code", value: employee.employeeCode },
            { label: "Email",         value: employee.email },
            { label: "Phone",         value: employee.phone },
            { label: "Department",    value: employee.department },
            { label: "Job Title",     value: employee.jobTitle },
            { label: "Hire Date",     value: formatDate(employee.hiredAt) },
          ].map(({ label, value }) => (
            <div key={label} className="flex items-center justify-between text-sm">
              <dt className="text-gray-500 w-36 flex-shrink-0">{label}</dt>
              <dd className="text-gray-900 font-medium text-right">{value}</dd>
            </div>
          ))}
        </dl>
      </div>

      {/* Current month summary */}
      <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
        <h3 className="text-sm font-semibold text-gray-900 mb-4">
          {formatMonthLabel(summary.month)} Summary
        </h3>
        <div className="grid grid-cols-3 gap-3">
          {[
            { label: "Present",          value: summary.presentDays,         color: "text-green-700",  bg: "bg-green-50" },
            { label: "Late",             value: summary.lateDays,             color: "text-amber-700",  bg: "bg-amber-50" },
            { label: "Absent",           value: summary.absentDays,           color: "text-red-700",    bg: "bg-red-50" },
            { label: "Half Day",         value: summary.halfDays,             color: "text-blue-700",   bg: "bg-blue-50" },
            { label: "On Leave",         value: summary.leaveDays,            color: "text-purple-700", bg: "bg-purple-50" },
            { label: "Total Hours",      value: formatMinutes(summary.totalWorkedMinutes), color: "text-indigo-700", bg: "bg-indigo-50" },
          ].map(({ label, value, color, bg }) => (
            <div key={label} className={`rounded-lg p-3.5 ${bg}`}>
              <p className="text-xs text-gray-500">{label}</p>
              <p className={`text-xl font-bold mt-0.5 ${color}`}>{value}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Attendance policy info */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h3 className="text-sm font-semibold text-gray-900 mb-4">Attendance Policy</h3>
        <dl className="space-y-3">
          {[
            { label: "Office",          value: attendancePolicy.officeName },
            { label: "Work Starts",     value: attendancePolicy.workStartTime },
            { label: "Timezone",        value: attendancePolicy.timezone },
            { label: "Allowed Radius",  value: `${attendancePolicy.allowedRadiusMeters} meters` },
            { label: "Full Day Threshold", value: formatMinutes(attendancePolicy.minimumFullDayMinutes) },
            { label: "Half Day Threshold", value: formatMinutes(attendancePolicy.minimumHalfDayMinutes) },
          ].map(({ label, value }) => (
            <div key={label} className="flex items-center justify-between text-sm">
              <dt className="text-gray-500 w-40 flex-shrink-0">{label}</dt>
              <dd className="text-gray-900 font-medium text-right">{value}</dd>
            </div>
          ))}
        </dl>
        <p className="text-xs text-gray-400 mt-4 pt-4 border-t border-gray-100">
          Policy changes are made by your administrator and take effect immediately.
        </p>
      </div>
    </div>
  );
}
