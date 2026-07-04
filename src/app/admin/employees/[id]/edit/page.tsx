"use client";

import Link from "next/link";
import { useActionState } from "react";
import { useEffect, useState } from "react";
import { updateEmployee } from "../../actions";

const DEPARTMENTS = ["Engineering", "HR", "Finance", "Operations", "Sales", "Support"];

type Employee = {
  id: string;
  employeeCode: string;
  phone: string | null;
  jobTitle: string;
  hiredAt: string;
  status: string;
  user: { name: string; email: string; role: string };
  department: { name: string };
};

export default function EditEmployeePage({ params }: { params: Promise<{ id: string }> }) {
  const [id, setId] = useState<string | null>(null);
  const [employee, setEmployee] = useState<Employee | null>(null);
  const [loadError, setLoadError] = useState("");

  useEffect(() => {
    params.then(({ id: empId }) => {
      setId(empId);
      fetch(`/api/admin/employees/${empId}`)
        .then((r) => r.json())
        .then((j) => {
          if (j.error) setLoadError(j.error);
          else {
            const e = j.data;
            setEmployee({
              id: e.id,
              employeeCode: e.employeeCode,
              phone: e.phone,
              jobTitle: e.jobTitle,
              hiredAt: new Date(e.hiredAt).toISOString().slice(0, 10),
              status: e.status,
              user: e.user,
              department: e.department,
            });
          }
        })
        .catch(() => setLoadError("Failed to load employee."));
    });
  }, [params]);

  const boundAction = id ? updateEmployee.bind(null, id) : null;
  const [state, formAction, pending] = useActionState(
    boundAction ?? (async () => ({ error: "Loading…" })),
    null
  );

  if (loadError) {
    return (
      <div className="p-8">
        <div className="bg-red-50 border border-red-200 rounded-xl px-6 py-5 text-sm text-red-700">
          {loadError}
        </div>
      </div>
    );
  }

  if (!employee) {
    return (
      <div className="p-8">
        <div className="bg-white rounded-xl border border-gray-200 p-8 text-sm text-gray-400 text-center">
          Loading employee…
        </div>
      </div>
    );
  }

  return (
    <div className="p-8 max-w-2xl">
      <div className="mb-8">
        <Link href={`/admin/employees/${employee.id}`} className="text-sm text-gray-500 hover:text-gray-700">
          ← Back to {employee.user.name}
        </Link>
        <h1 className="text-2xl font-bold text-gray-900 mt-3">Edit Employee</h1>
        <p className="text-sm text-gray-500 mt-1">{employee.employeeCode} · {employee.department.name}</p>
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
              <input name="name" type="text" required defaultValue={employee.user.name}
                className="w-full text-sm border border-gray-200 rounded-md px-3 py-2 text-gray-700 focus:outline-none focus:ring-1 focus:ring-indigo-400" />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1.5">Employee Code</label>
              <input type="text" defaultValue={employee.employeeCode}
                className="w-full text-sm border border-gray-200 rounded-md px-3 py-2 text-gray-400 bg-gray-50" disabled />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1.5">Email Address</label>
            <input type="email" defaultValue={employee.user.email}
              className="w-full text-sm border border-gray-200 rounded-md px-3 py-2 text-gray-500 bg-gray-50" disabled />
            <p className="text-xs text-gray-400 mt-1">Email cannot be changed after account creation.</p>
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1.5">Phone Number</label>
            <input name="phone" type="tel" defaultValue={employee.phone ?? ""}
              placeholder="+966-50-000-0000"
              className="w-full text-sm border border-gray-200 rounded-md px-3 py-2 text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-indigo-400" />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1.5">Department <span className="text-red-500">*</span></label>
              <select name="department" required defaultValue={employee.department.name}
                className="w-full text-sm border border-gray-200 rounded-md px-3 py-2 text-gray-700 bg-white focus:outline-none focus:ring-1 focus:ring-indigo-400">
                {DEPARTMENTS.map((d) => <option key={d}>{d}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1.5">Job Title <span className="text-red-500">*</span></label>
              <input name="jobTitle" type="text" required defaultValue={employee.jobTitle}
                className="w-full text-sm border border-gray-200 rounded-md px-3 py-2 text-gray-700 focus:outline-none focus:ring-1 focus:ring-indigo-400" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1.5">Hire Date <span className="text-red-500">*</span></label>
              <input name="hiredAt" type="date" required defaultValue={employee.hiredAt}
                className="w-full text-sm border border-gray-200 rounded-md px-3 py-2 text-gray-700 focus:outline-none focus:ring-1 focus:ring-indigo-400" />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1.5">Status</label>
              <select name="status" defaultValue={employee.status}
                className="w-full text-sm border border-gray-200 rounded-md px-3 py-2 text-gray-700 bg-white focus:outline-none focus:ring-1 focus:ring-indigo-400">
                <option value="ACTIVE">Active</option>
                <option value="INACTIVE">Inactive</option>
                <option value="SUSPENDED">Suspended</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1.5">Role</label>
            <select name="role" defaultValue={employee.user.role}
              className="w-full text-sm border border-gray-200 rounded-md px-3 py-2 text-gray-700 bg-white focus:outline-none focus:ring-1 focus:ring-indigo-400">
              <option value="EMPLOYEE">Employee</option>
              <option value="MANAGER">Manager</option>
              <option value="ADMIN">Admin</option>
            </select>
          </div>

          <div className="mt-8 flex items-center gap-3 pt-5 border-t border-gray-100">
            <button type="submit" disabled={pending}
              className="px-5 py-2.5 bg-indigo-600 text-white text-sm font-semibold rounded-lg hover:bg-indigo-700 disabled:opacity-60 transition-colors">
              {pending ? "Saving…" : "Save Changes"}
            </button>
            <Link href={`/admin/employees/${employee.id}`}
              className="px-5 py-2.5 text-sm font-medium text-gray-600 hover:text-gray-900">
              Cancel
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}
