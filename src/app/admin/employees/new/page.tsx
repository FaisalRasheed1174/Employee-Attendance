import Link from "next/link";

const DEPARTMENTS = ["Engineering", "HR", "Finance", "Operations", "Sales", "Support"];

export default function NewEmployeePage() {
  return (
    <div className="p-8 max-w-2xl">
      <div className="mb-8">
        <Link href="/admin/employees" className="text-sm text-gray-500 hover:text-gray-700">
          ← Back to Employees
        </Link>
        <h1 className="text-2xl font-bold text-gray-900 mt-3">Add New Employee</h1>
        <p className="text-sm text-gray-500 mt-1">
          Create a new employee account. The employee will receive an invitation to set their password.
        </p>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <div className="rounded-lg bg-amber-50 border border-amber-200 px-4 py-3 text-sm text-amber-800 mb-6">
          Form submission is disabled in this iteration. Backend integration and validation are implemented in a future iteration.
        </div>

        <div className="space-y-5">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1.5">Full Name</label>
              <input type="text" placeholder="e.g. Khalid Al-Nasser" className="w-full text-sm border border-gray-200 rounded-md px-3 py-2 text-gray-700 placeholder-gray-400" disabled />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1.5">Employee Code</label>
              <input type="text" placeholder="e.g. EMP-0013" className="w-full text-sm border border-gray-200 rounded-md px-3 py-2 text-gray-400 bg-gray-50" disabled />
              <p className="text-xs text-gray-400 mt-1">Auto-generated on creation.</p>
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1.5">Email Address</label>
            <input type="email" placeholder="name@company.com" className="w-full text-sm border border-gray-200 rounded-md px-3 py-2 text-gray-700 placeholder-gray-400" disabled />
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1.5">Phone Number</label>
            <input type="tel" placeholder="+966-50-000-0000" className="w-full text-sm border border-gray-200 rounded-md px-3 py-2 text-gray-700 placeholder-gray-400" disabled />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1.5">Department</label>
              <select className="w-full text-sm border border-gray-200 rounded-md px-3 py-2 text-gray-700 bg-white" disabled>
                <option value="">Select department…</option>
                {DEPARTMENTS.map((d) => <option key={d}>{d}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1.5">Job Title</label>
              <input type="text" placeholder="e.g. Software Engineer" className="w-full text-sm border border-gray-200 rounded-md px-3 py-2 text-gray-700 placeholder-gray-400" disabled />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1.5">Hire Date</label>
            <input type="date" className="w-full text-sm border border-gray-200 rounded-md px-3 py-2 text-gray-700" disabled />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1.5">Role</label>
              <select className="w-full text-sm border border-gray-200 rounded-md px-3 py-2 text-gray-700 bg-white" disabled>
                <option>EMPLOYEE</option>
                <option>MANAGER</option>
                <option>ADMIN</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1.5">Status</label>
              <select className="w-full text-sm border border-gray-200 rounded-md px-3 py-2 text-gray-700 bg-white" disabled>
                <option>ACTIVE</option>
                <option>INACTIVE</option>
              </select>
            </div>
          </div>
        </div>

        <div className="mt-8 flex items-center gap-3 pt-5 border-t border-gray-100">
          <button disabled className="px-5 py-2.5 bg-indigo-600 text-white text-sm font-semibold rounded-lg opacity-40 cursor-not-allowed">
            Create Employee
          </button>
          <Link href="/admin/employees" className="px-5 py-2.5 text-sm font-medium text-gray-600 hover:text-gray-900">
            Cancel
          </Link>
        </div>
      </div>
    </div>
  );
}
