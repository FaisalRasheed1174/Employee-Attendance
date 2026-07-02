import Link from "next/link";
import { notFound } from "next/navigation";
import { employees } from "@/lib/mockdata";
import { formatDate } from "@/lib/format";

const DEPARTMENTS = ["Engineering", "HR", "Finance", "Operations", "Sales", "Support"];

export default async function EditEmployeePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const employee = employees.find((e) => e.id === id);

  if (!employee) notFound();

  return (
    <div className="p-8 max-w-2xl">
      <div className="mb-8">
        <Link href={`/admin/employees/${id}`} className="text-sm text-gray-500 hover:text-gray-700">
          ← Back to {employee.name}
        </Link>
        <h1 className="text-2xl font-bold text-gray-900 mt-3">Edit Employee</h1>
        <p className="text-sm text-gray-500 mt-1">{employee.employeeCode} · {employee.department}</p>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <div className="rounded-lg bg-amber-50 border border-amber-200 px-4 py-3 text-sm text-amber-800 mb-6">
          Form submission is disabled in this iteration. Backend integration is implemented in a future iteration.
        </div>

        <div className="space-y-5">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1.5">Full Name</label>
              <input type="text" defaultValue={employee.name} className="w-full text-sm border border-gray-200 rounded-md px-3 py-2 text-gray-700 bg-gray-50" disabled />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1.5">Employee Code</label>
              <input type="text" defaultValue={employee.employeeCode} className="w-full text-sm border border-gray-200 rounded-md px-3 py-2 text-gray-400 bg-gray-50" disabled />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1.5">Email Address</label>
            <input type="email" defaultValue={employee.email} className="w-full text-sm border border-gray-200 rounded-md px-3 py-2 text-gray-700 bg-gray-50" disabled />
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1.5">Phone Number</label>
            <input type="tel" defaultValue={employee.phone} className="w-full text-sm border border-gray-200 rounded-md px-3 py-2 text-gray-700 bg-gray-50" disabled />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1.5">Department</label>
              <select defaultValue={employee.department} className="w-full text-sm border border-gray-200 rounded-md px-3 py-2 text-gray-700 bg-gray-50" disabled>
                {DEPARTMENTS.map((d) => <option key={d}>{d}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1.5">Job Title</label>
              <input type="text" defaultValue={employee.jobTitle} className="w-full text-sm border border-gray-200 rounded-md px-3 py-2 text-gray-700 bg-gray-50" disabled />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1.5">Hire Date</label>
              <input type="date" defaultValue={employee.hiredAt} className="w-full text-sm border border-gray-200 rounded-md px-3 py-2 text-gray-700 bg-gray-50" disabled />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1.5">Status</label>
              <select defaultValue={employee.status} className="w-full text-sm border border-gray-200 rounded-md px-3 py-2 text-gray-700 bg-gray-50" disabled>
                <option>ACTIVE</option>
                <option>INACTIVE</option>
                <option>SUSPENDED</option>
              </select>
            </div>
          </div>
        </div>

        <div className="mt-8 flex items-center gap-3 pt-5 border-t border-gray-100">
          <button disabled className="px-5 py-2.5 bg-indigo-600 text-white text-sm font-semibold rounded-lg opacity-40 cursor-not-allowed">
            Save Changes
          </button>
          <Link href={`/admin/employees/${id}`} className="px-5 py-2.5 text-sm font-medium text-gray-600 hover:text-gray-900">
            Cancel
          </Link>
        </div>
      </div>
    </div>
  );
}
