import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { EmployeeStatusBadge } from "@/components/StatusBadge";
import { formatDate } from "@/lib/format";

const DEPARTMENTS = ["Engineering", "HR", "Finance", "Operations", "Sales", "Support"];

async function getEmployees(department?: string, status?: string, search?: string) {
  return prisma.employee.findMany({
    where: {
      ...(status ? { status: status as "ACTIVE" | "INACTIVE" | "SUSPENDED" } : {}),
      ...(department ? { department: { name: department } } : {}),
      ...(search
        ? {
            OR: [
              { user: { name: { contains: search, mode: "insensitive" } } },
              { user: { email: { contains: search, mode: "insensitive" } } },
              { employeeCode: { contains: search, mode: "insensitive" } },
            ],
          }
        : {}),
    },
    include: {
      user: { select: { name: true, email: true, role: true } },
      department: { select: { name: true } },
    },
    orderBy: { user: { name: "asc" } },
  });
}

export default async function AdminEmployeesPage({
  searchParams,
}: {
  searchParams: Promise<{ department?: string; status?: string; search?: string }>;
}) {
  const sp = await searchParams;
  let employees: Awaited<ReturnType<typeof getEmployees>> = [];
  let dbError = false;

  try {
    employees = await getEmployees(sp.department, sp.status, sp.search);
  } catch {
    dbError = true;
  }

  const active    = employees.filter((e) => e.status === "ACTIVE").length;
  const inactive  = employees.filter((e) => e.status === "INACTIVE").length;
  const suspended = employees.filter((e) => e.status === "SUSPENDED").length;

  return (
    <div className="p-8 max-w-screen-xl">
      <div className="mb-8 flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Employees</h1>
          <p className="text-sm text-gray-500 mt-1">
            {active} active · {inactive} inactive · {suspended} suspended
          </p>
        </div>
        <Link
          href="/admin/employees/new"
          className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white text-sm font-semibold rounded-lg hover:bg-indigo-700 transition-colors"
        >
          + Add Employee
        </Link>
      </div>

      {dbError && (
        <div className="mb-6 rounded-xl bg-amber-50 border border-amber-200 px-5 py-4 text-sm text-amber-800">
          Database not connected. Configure <code className="font-mono">DATABASE_URL</code> and run migrations first.
        </div>
      )}

      {/* Filters */}
      <form method="GET" className="bg-white rounded-xl border border-gray-200 mb-6 px-5 py-3 flex flex-wrap gap-3 items-center">
        <input
          type="text"
          name="search"
          defaultValue={sp.search ?? ""}
          placeholder="Search by name or email…"
          className="text-sm border border-gray-200 rounded-md px-3 py-1.5 text-gray-600 flex-1 min-w-48 focus:outline-none focus:ring-1 focus:ring-indigo-400"
        />
        <select
          name="department"
          defaultValue={sp.department ?? ""}
          className="text-sm border border-gray-200 rounded-md px-3 py-1.5 text-gray-600 bg-white"
        >
          <option value="">All Departments</option>
          {DEPARTMENTS.map((d) => <option key={d}>{d}</option>)}
        </select>
        <select
          name="status"
          defaultValue={sp.status ?? ""}
          className="text-sm border border-gray-200 rounded-md px-3 py-1.5 text-gray-600 bg-white"
        >
          <option value="">All Statuses</option>
          <option value="ACTIVE">Active</option>
          <option value="INACTIVE">Inactive</option>
          <option value="SUSPENDED">Suspended</option>
        </select>
        <button type="submit" className="px-3 py-1.5 text-sm font-medium bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors">
          Filter
        </button>
        {(sp.search || sp.department || sp.status) && (
          <Link href="/admin/employees" className="text-xs text-gray-400 hover:text-gray-600">
            Clear filters
          </Link>
        )}
      </form>

      {/* Table */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        {employees.length === 0 ? (
          <p className="px-6 py-12 text-sm text-gray-400 text-center">
            {dbError ? "Connect the database to view employees." : "No employees found."}
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100">
                  {["Code", "Name", "Department", "Job Title", "Status", "Hired", "Actions"].map((h) => (
                    <th key={h} className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider bg-gray-50">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {employees.map((emp) => (
                  <tr key={emp.id} className="hover:bg-gray-50/60 transition-colors">
                    <td className="px-5 py-3.5 text-gray-500 tabular-nums font-mono text-xs">{emp.employeeCode}</td>
                    <td className="px-5 py-3.5">
                      <div>
                        <p className="font-medium text-gray-900">{emp.user.name}</p>
                        <p className="text-xs text-gray-400">{emp.user.email}</p>
                      </div>
                    </td>
                    <td className="px-5 py-3.5 text-gray-600">{emp.department.name}</td>
                    <td className="px-5 py-3.5 text-gray-600">{emp.jobTitle}</td>
                    <td className="px-5 py-3.5"><EmployeeStatusBadge status={emp.status} /></td>
                    <td className="px-5 py-3.5 text-gray-500 tabular-nums">{formatDate(emp.hiredAt.toISOString().slice(0, 10))}</td>
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-3">
                        <Link href={`/admin/employees/${emp.id}`} className="text-xs text-indigo-600 hover:text-indigo-800 font-medium">
                          Profile
                        </Link>
                        <Link href={`/admin/employees/${emp.id}/edit`} className="text-xs text-gray-500 hover:text-gray-700 font-medium">
                          Edit
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
