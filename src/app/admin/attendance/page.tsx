import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { StatusBadge } from "@/components/StatusBadge";
import { formatTime, formatDate, formatMinutes } from "@/lib/format";
import type { Prisma } from "@prisma/client";

const DEPARTMENTS = ["Engineering", "HR", "Finance", "Operations", "Sales", "Support"];
const STATUSES = ["PRESENT", "LATE", "HALF_DAY", "ABSENT", "ON_LEAVE", "MISSING_CHECKOUT"];
const STATUS_LABELS: Record<string, string> = {
  PRESENT: "Present", LATE: "Late", HALF_DAY: "Half Day",
  ABSENT: "Absent", ON_LEAVE: "On Leave", MISSING_CHECKOUT: "Missing Checkout",
};

type SearchParams = {
  employee?: string;
  department?: string;
  status?: string;
  date?: string;
  month?: string;
  late?: string;
  missingCheckout?: string;
};

async function getRecords(sp: SearchParams) {
  const where: Prisma.AttendanceRecordWhereInput = {};

  if (sp.employee) where.employeeId = sp.employee;
  if (sp.status) where.status = sp.status as Prisma.EnumAttendanceStatusFilter;
  if (sp.late === "on") where.isLate = true;
  if (sp.missingCheckout === "on") {
    where.checkInAt = { not: null };
    where.checkOutAt = null;
  }
  if (sp.date) {
    const d = new Date(sp.date + "T00:00:00.000Z");
    where.date = { gte: d, lt: new Date(d.getTime() + 86_400_000) };
  } else if (sp.month) {
    const [y, m] = sp.month.split("-").map(Number);
    where.date = {
      gte: new Date(Date.UTC(y, m - 1, 1)),
      lt: new Date(Date.UTC(y, m, 1)),
    };
  }
  if (sp.department) where.employee = { department: { name: sp.department } };

  return prisma.attendanceRecord.findMany({
    where,
    include: {
      employee: {
        include: {
          user: { select: { name: true } },
          department: { select: { name: true } },
        },
      },
    },
    orderBy: [{ date: "desc" }, { checkInAt: "desc" }],
    take: 500,
  });
}

async function getEmployeeList() {
  return prisma.employee.findMany({
    where: { status: "ACTIVE" },
    include: { user: { select: { name: true } } },
    orderBy: { user: { name: "asc" } },
  });
}

export default async function AdminAttendancePage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const sp = await searchParams;
  let records: Awaited<ReturnType<typeof getRecords>> = [];
  let employees: Awaited<ReturnType<typeof getEmployeeList>> = [];
  let dbError = false;

  try {
    [records, employees] = await Promise.all([getRecords(sp), getEmployeeList()]);
  } catch {
    dbError = true;
  }

  const hasFilters = !!(sp.employee || sp.department || sp.status || sp.date || sp.month || sp.late || sp.missingCheckout);

  return (
    <div className="p-8 max-w-screen-xl">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Attendance Records</h1>
        <p className="text-sm text-gray-500 mt-1">{records.length} records</p>
      </div>

      {dbError && (
        <div className="mb-6 rounded-xl bg-amber-50 border border-amber-200 px-5 py-4 text-sm text-amber-800">
          Database not connected. Configure <code className="font-mono">DATABASE_URL</code> and run migrations.
        </div>
      )}

      {/* Filter form */}
      <form method="GET" className="bg-white rounded-xl border border-gray-200 p-5 mb-6">
        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Filters</p>
        <div className="flex flex-wrap gap-3">
          <div className="flex flex-col gap-1">
            <label className="text-xs text-gray-500">Employee</label>
            <select name="employee" defaultValue={sp.employee ?? ""}
              className="text-sm border border-gray-200 rounded-md px-3 py-1.5 text-gray-600 bg-white min-w-40">
              <option value="">All Employees</option>
              {employees.map((e) => (
                <option key={e.id} value={e.id}>{e.user.name}</option>
              ))}
            </select>
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-xs text-gray-500">Department</label>
            <select name="department" defaultValue={sp.department ?? ""}
              className="text-sm border border-gray-200 rounded-md px-3 py-1.5 text-gray-600 bg-white">
              <option value="">All Departments</option>
              {DEPARTMENTS.map((d) => <option key={d}>{d}</option>)}
            </select>
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-xs text-gray-500">Status</label>
            <select name="status" defaultValue={sp.status ?? ""}
              className="text-sm border border-gray-200 rounded-md px-3 py-1.5 text-gray-600 bg-white">
              <option value="">All Statuses</option>
              {STATUSES.map((s) => <option key={s} value={s}>{STATUS_LABELS[s]}</option>)}
            </select>
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-xs text-gray-500">Date</label>
            <input type="date" name="date" defaultValue={sp.date ?? ""}
              className="text-sm border border-gray-200 rounded-md px-3 py-1.5 text-gray-600" />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-xs text-gray-500">Month</label>
            <input type="month" name="month" defaultValue={sp.month ?? ""}
              className="text-sm border border-gray-200 rounded-md px-3 py-1.5 text-gray-600" />
          </div>
          <div className="flex items-end gap-3">
            <label className="flex items-center gap-2 text-sm text-gray-600 pb-1.5 cursor-pointer">
              <input type="checkbox" name="late" value="on" defaultChecked={sp.late === "on"} className="rounded" />
              Late only
            </label>
            <label className="flex items-center gap-2 text-sm text-gray-600 pb-1.5 cursor-pointer">
              <input type="checkbox" name="missingCheckout" value="on" defaultChecked={sp.missingCheckout === "on"} className="rounded" />
              Missing checkout only
            </label>
          </div>
          <div className="flex items-end gap-2">
            <button type="submit" className="px-3 py-1.5 text-sm font-medium bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors">
              Apply
            </button>
            {hasFilters && (
              <Link href="/admin/attendance" className="text-xs text-gray-400 hover:text-gray-600 pb-2">
                Clear
              </Link>
            )}
          </div>
        </div>
      </form>

      {/* Table */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
          <p className="text-sm font-semibold text-gray-900">All Records</p>
          <span className="text-xs text-gray-400">Showing {records.length} records</span>
        </div>

        {records.length === 0 ? (
          <p className="px-6 py-12 text-sm text-gray-400 text-center">
            {dbError ? "Connect the database to view records." : "No attendance records match the selected filters."}
          </p>
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
                {records.map((rec) => (
                  <tr key={rec.id} className="hover:bg-gray-50/60 transition-colors">
                    <td className="px-5 py-3.5 font-medium text-gray-900">{rec.employee.user.name}</td>
                    <td className="px-5 py-3.5 text-gray-500">{rec.employee.department.name}</td>
                    <td className="px-5 py-3.5 text-gray-600 tabular-nums whitespace-nowrap">
                      {formatDate(new Intl.DateTimeFormat("en-CA").format(new Date(rec.date)))}
                    </td>
                    <td className="px-5 py-3.5 text-gray-600 tabular-nums">{formatTime(rec.checkInAt?.toISOString() ?? null)}</td>
                    <td className="px-5 py-3.5 text-gray-600 tabular-nums">{formatTime(rec.checkOutAt?.toISOString() ?? null)}</td>
                    <td className="px-5 py-3.5 text-gray-600 tabular-nums">{formatMinutes(rec.totalMinutes)}</td>
                    <td className="px-5 py-3.5"><StatusBadge status={rec.status} /></td>
                    <td className="px-5 py-3.5 text-gray-500 tabular-nums">{rec.lateMinutes > 0 ? `${rec.lateMinutes}m` : "—"}</td>
                    <td className="px-5 py-3.5 text-xs text-gray-400 font-mono">{rec.source}</td>
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-3">
                        <Link href={`/admin/employees/${rec.employeeId}`} className="text-xs text-indigo-600 hover:text-indigo-800 font-medium">
                          View
                        </Link>
                        <Link href={`/admin/attendance/${rec.id}/correct`} className="text-xs text-gray-500 hover:text-gray-700 font-medium">
                          Correct
                        </Link>
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
