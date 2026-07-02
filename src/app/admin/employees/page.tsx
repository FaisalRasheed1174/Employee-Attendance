import Link from "next/link";
import { employees } from "@/lib/mockdata";
import { EmployeeStatusBadge } from "@/components/StatusBadge";
import { formatDate } from "@/lib/format";

export default function AdminEmployeesPage() {
  const active    = employees.filter((e) => e.status === "ACTIVE").length;
  const inactive  = employees.filter((e) => e.status === "INACTIVE").length;
  const suspended = employees.filter((e) => e.status === "SUSPENDED").length;

  return (
    <div className="p-8 max-w-screen-xl">
      {/* Header */}
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

      {/* Filters — visual only */}
      <div className="bg-white rounded-xl border border-gray-200 mb-6 px-5 py-3 flex flex-wrap gap-3 items-center">
        <input
          type="text"
          placeholder="Search by name or email…"
          className="text-sm border border-gray-200 rounded-md px-3 py-1.5 text-gray-600 flex-1 min-w-48"
          disabled
        />
        <select className="text-sm border border-gray-200 rounded-md px-3 py-1.5 text-gray-600 bg-white" disabled>
          <option>All Departments</option>
          <option>Engineering</option>
          <option>HR</option>
          <option>Finance</option>
          <option>Operations</option>
          <option>Sales</option>
          <option>Support</option>
        </select>
        <select className="text-sm border border-gray-200 rounded-md px-3 py-1.5 text-gray-600 bg-white" disabled>
          <option>All Statuses</option>
          <option>Active</option>
          <option>Inactive</option>
          <option>Suspended</option>
        </select>
        <span className="text-xs text-gray-400">Filters active after backend integration.</span>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        {employees.length === 0 ? (
          <p className="px-6 py-12 text-sm text-gray-400 text-center">No employees found.</p>
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
                        <p className="font-medium text-gray-900">{emp.name}</p>
                        <p className="text-xs text-gray-400">{emp.email}</p>
                      </div>
                    </td>
                    <td className="px-5 py-3.5 text-gray-600">{emp.department}</td>
                    <td className="px-5 py-3.5 text-gray-600">{emp.jobTitle}</td>
                    <td className="px-5 py-3.5"><EmployeeStatusBadge status={emp.status} /></td>
                    <td className="px-5 py-3.5 text-gray-500 tabular-nums">{formatDate(emp.hiredAt)}</td>
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-3">
                        <Link href={`/admin/employees/${emp.id}`} className="text-xs text-indigo-600 hover:text-indigo-800 font-medium">
                          Profile
                        </Link>
                        <Link href={`/admin/employees/${emp.id}/edit`} className="text-xs text-gray-500 hover:text-gray-700 font-medium">
                          Edit
                        </Link>
                        <button disabled className="text-xs text-gray-300 cursor-not-allowed" title="Deactivate coming in next iteration">
                          Deactivate
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
