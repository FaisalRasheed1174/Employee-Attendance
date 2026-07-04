import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { EmployeeStatusBadge } from "@/components/StatusBadge";
import { formatDate, formatMinutes, formatMonthLabel } from "@/lib/format";

export default async function EmployeeProfilePage() {
  const session = await getSession();
  if (!session) redirect("/login");

  let employee: {
    id: string; employeeCode: string; phone: string | null; jobTitle: string; hiredAt: Date; status: string;
    user: { name: string; email: string };
    department: { name: string };
  } | null = null;
  let policy: { officeName: string; workStartTime: string; timezone: string; allowedRadiusMeters: number; minimumFullDayMinutes: number; minimumHalfDayMinutes: number } | null = null;
  let summary = { presentDays: 0, lateDays: 0, absentDays: 0, halfDays: 0, leaveDays: 0, totalWorkedMinutes: 0 };
  let dbError = false;

  try {
    const now = new Date();
    const firstOfMonth = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1));
    const firstOfNextMonth = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() + 1, 1));

    const [empResult, policyResult, monthRecords] = await Promise.all([
      prisma.employee.findUnique({
        where: { userId: session.userId },
        include: {
          user: { select: { name: true, email: true } },
          department: { select: { name: true } },
        },
      }),
      prisma.attendancePolicy.findFirst({ where: { active: true } }),
      prisma.attendanceRecord.findMany({
        where: {
          employee: { userId: session.userId },
          date: { gte: firstOfMonth, lt: firstOfNextMonth },
        },
      }),
    ]);

    if (empResult) {
      employee = empResult;
      policy = policyResult;
      summary = {
        presentDays: monthRecords.filter((r) => r.status === "PRESENT" || r.status === "LATE").length,
        lateDays: monthRecords.filter((r) => r.isLate).length,
        absentDays: monthRecords.filter((r) => r.status === "ABSENT").length,
        halfDays: monthRecords.filter((r) => r.status === "HALF_DAY").length,
        leaveDays: monthRecords.filter((r) => r.status === "ON_LEAVE").length,
        totalWorkedMinutes: monthRecords.reduce((s, r) => s + (r.totalMinutes ?? 0), 0),
      };
    }
  } catch {
    dbError = true;
  }

  const now = new Date();
  const monthLabel = formatMonthLabel(`${now.getUTCFullYear()}-${String(now.getUTCMonth() + 1).padStart(2, "0")}`);

  if (dbError) {
    return (
      <div className="p-8">
        <div className="bg-amber-50 border border-amber-200 rounded-xl px-6 py-5 text-sm text-amber-800">
          Database not connected. Configure <code className="font-mono">DATABASE_URL</code> and run migrations.
        </div>
      </div>
    );
  }

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
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">My Profile</h1>
        <p className="text-sm text-gray-500 mt-1">Your employee information and attendance summary.</p>
      </div>

      {/* Profile card */}
      <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
        <div className="flex items-center gap-5 mb-6 pb-6 border-b border-gray-100">
          <div className="w-16 h-16 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-700 text-2xl font-bold flex-shrink-0">
            {employee.user.name.charAt(0)}
          </div>
          <div>
            <div className="flex items-center gap-3">
              <h2 className="text-lg font-bold text-gray-900">{employee.user.name}</h2>
              <EmployeeStatusBadge status={employee.status} />
            </div>
            <p className="text-sm text-gray-500 mt-0.5">{employee.jobTitle} · {employee.department.name}</p>
          </div>
        </div>

        <dl className="space-y-3">
          {[
            { label: "Employee Code", value: employee.employeeCode },
            { label: "Email",         value: employee.user.email },
            { label: "Phone",         value: employee.phone ?? "Not set" },
            { label: "Department",    value: employee.department.name },
            { label: "Job Title",     value: employee.jobTitle },
            { label: "Hire Date",     value: formatDate(employee.hiredAt.toISOString().slice(0, 10)) },
          ].map(({ label, value }) => (
            <div key={label} className="flex items-center justify-between text-sm">
              <dt className="text-gray-500 w-36 flex-shrink-0">{label}</dt>
              <dd className="text-gray-900 font-medium text-right">{value}</dd>
            </div>
          ))}
        </dl>
      </div>

      {/* Monthly summary */}
      <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
        <h3 className="text-sm font-semibold text-gray-900 mb-4">{monthLabel} Summary</h3>
        <div className="grid grid-cols-3 gap-3">
          {[
            { label: "Present",     value: summary.presentDays,       color: "text-green-700",  bg: "bg-green-50" },
            { label: "Late",        value: summary.lateDays,           color: "text-amber-700",  bg: "bg-amber-50" },
            { label: "Absent",      value: summary.absentDays,         color: "text-red-700",    bg: "bg-red-50" },
            { label: "Half Day",    value: summary.halfDays,           color: "text-blue-700",   bg: "bg-blue-50" },
            { label: "On Leave",    value: summary.leaveDays,          color: "text-purple-700", bg: "bg-purple-50" },
            { label: "Total Hours", value: formatMinutes(summary.totalWorkedMinutes), color: "text-indigo-700", bg: "bg-indigo-50" },
          ].map(({ label, value, color, bg }) => (
            <div key={label} className={`rounded-lg p-3.5 ${bg}`}>
              <p className="text-xs text-gray-500">{label}</p>
              <p className={`text-xl font-bold mt-0.5 ${color}`}>{value}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Policy */}
      {policy && (
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h3 className="text-sm font-semibold text-gray-900 mb-4">Attendance Policy</h3>
          <dl className="space-y-3">
            {[
              { label: "Office",              value: policy.officeName },
              { label: "Work Starts",         value: policy.workStartTime },
              { label: "Timezone",            value: policy.timezone },
              { label: "Allowed Radius",      value: `${policy.allowedRadiusMeters} meters` },
              { label: "Full Day Threshold",  value: formatMinutes(policy.minimumFullDayMinutes) },
              { label: "Half Day Threshold",  value: formatMinutes(policy.minimumHalfDayMinutes) },
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
      )}
    </div>
  );
}
