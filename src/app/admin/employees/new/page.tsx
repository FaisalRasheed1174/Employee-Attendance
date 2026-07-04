"use client";

import Link from "next/link";
import { useActionState } from "react";
import { createEmployee } from "../actions";

const DEPARTMENTS = ["Engineering", "HR", "Finance", "Operations", "Sales", "Support"];

export default function NewEmployeePage() {
  const [state, formAction, pending] = useActionState(createEmployee, null);

  return (
    <div className="p-8 max-w-2xl">
      <div className="mb-8">
        <Link href="/admin/employees" className="text-sm text-gray-500 hover:text-gray-700">
          ← Back to Employees
        </Link>
        <h1 className="text-2xl font-bold text-gray-900 mt-3">Add New Employee</h1>
        <p className="text-sm text-gray-500 mt-1">Create a new employee account with login credentials.</p>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 p-6">
        {state?.error && (
          <div className="rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700 mb-6">
            {state.error}
          </div>
        )}

        <form action={formAction} className="space-y-5">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1.5">Full Name <span className="text-red-500">*</span></label>
              <input name="name" type="text" required placeholder="e.g. Khalid Al-Nasser"
                className="w-full text-sm border border-gray-200 rounded-md px-3 py-2 text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-indigo-400" />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1.5">Employee Code</label>
              <input type="text" placeholder="Auto-generated"
                className="w-full text-sm border border-gray-200 rounded-md px-3 py-2 text-gray-400 bg-gray-50" disabled />
              <p className="text-xs text-gray-400 mt-1">Assigned automatically on creation.</p>
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1.5">Email Address <span className="text-red-500">*</span></label>
            <input name="email" type="email" required placeholder="name@company.com"
              className="w-full text-sm border border-gray-200 rounded-md px-3 py-2 text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-indigo-400" />
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1.5">Password <span className="text-red-500">*</span></label>
            <input name="password" type="password" required placeholder="Min. 8 characters"
              className="w-full text-sm border border-gray-200 rounded-md px-3 py-2 text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-indigo-400" />
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1.5">Phone Number</label>
            <input name="phone" type="tel" placeholder="+966-50-000-0000"
              className="w-full text-sm border border-gray-200 rounded-md px-3 py-2 text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-indigo-400" />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1.5">Department <span className="text-red-500">*</span></label>
              <select name="department" required
                className="w-full text-sm border border-gray-200 rounded-md px-3 py-2 text-gray-700 bg-white focus:outline-none focus:ring-1 focus:ring-indigo-400">
                <option value="">Select department…</option>
                {DEPARTMENTS.map((d) => <option key={d}>{d}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1.5">Job Title <span className="text-red-500">*</span></label>
              <input name="jobTitle" type="text" required placeholder="e.g. Software Engineer"
                className="w-full text-sm border border-gray-200 rounded-md px-3 py-2 text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-indigo-400" />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1.5">Hire Date <span className="text-red-500">*</span></label>
            <input name="hiredAt" type="date" required
              className="w-full text-sm border border-gray-200 rounded-md px-3 py-2 text-gray-700 focus:outline-none focus:ring-1 focus:ring-indigo-400" />
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1.5">Role</label>
            <select name="role" defaultValue="EMPLOYEE"
              className="w-full text-sm border border-gray-200 rounded-md px-3 py-2 text-gray-700 bg-white focus:outline-none focus:ring-1 focus:ring-indigo-400">
              <option value="EMPLOYEE">Employee</option>
              <option value="MANAGER">Manager</option>
              <option value="ADMIN">Admin</option>
            </select>
          </div>

          <div className="mt-8 flex items-center gap-3 pt-5 border-t border-gray-100">
            <button
              type="submit"
              disabled={pending}
              className="px-5 py-2.5 bg-indigo-600 text-white text-sm font-semibold rounded-lg hover:bg-indigo-700 disabled:opacity-60 transition-colors"
            >
              {pending ? "Creating…" : "Create Employee"}
            </button>
            <Link href="/admin/employees" className="px-5 py-2.5 text-sm font-medium text-gray-600 hover:text-gray-900">
              Cancel
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}
