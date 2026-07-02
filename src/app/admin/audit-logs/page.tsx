import { auditLogs } from "@/lib/mockdata";
import { formatTimestamp } from "@/lib/format";

const actionLabel: Record<string, string> = {
  ATTENDANCE_CHECK_IN:   "Check In",
  ATTENDANCE_CHECK_OUT:  "Check Out",
  ATTENDANCE_CORRECTION: "Record Corrected",
  ATTENDANCE_REJECTED:   "Check-In Rejected",
  EMPLOYEE_CREATED:      "Employee Created",
  EMPLOYEE_UPDATED:      "Employee Updated",
  EMPLOYEE_DEACTIVATED:  "Employee Deactivated",
  POLICY_UPDATED:        "Policy Updated",
};

const actionColor: Record<string, string> = {
  ATTENDANCE_CHECK_IN:   "bg-green-100 text-green-800",
  ATTENDANCE_CHECK_OUT:  "bg-blue-100 text-blue-800",
  ATTENDANCE_CORRECTION: "bg-indigo-100 text-indigo-800",
  ATTENDANCE_REJECTED:   "bg-red-100 text-red-800",
  EMPLOYEE_CREATED:      "bg-teal-100 text-teal-800",
  EMPLOYEE_UPDATED:      "bg-gray-100 text-gray-700",
  EMPLOYEE_DEACTIVATED:  "bg-orange-100 text-orange-800",
  POLICY_UPDATED:        "bg-purple-100 text-purple-800",
};

const sorted = [...auditLogs].sort((a, b) => b.createdAt.localeCompare(a.createdAt));

export default function AuditLogsPage() {
  return (
    <div className="p-8 max-w-screen-xl">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Audit Logs</h1>
        <p className="text-sm text-gray-500 mt-1">
          Sensitive actions performed by admins, managers, and the system. Read-only.
        </p>
      </div>

      {/* Filter row — visual only */}
      <div className="bg-white rounded-xl border border-gray-200 px-5 py-3 mb-6 flex flex-wrap gap-3 items-center">
        <select className="text-sm border border-gray-200 rounded-md px-3 py-1.5 text-gray-600 bg-white" disabled>
          <option>All Actions</option>
          {Object.keys(actionLabel).map((k) => <option key={k}>{actionLabel[k]}</option>)}
        </select>
        <select className="text-sm border border-gray-200 rounded-md px-3 py-1.5 text-gray-600 bg-white" disabled>
          <option>All Actors</option>
        </select>
        <input type="month" defaultValue="2026-07" className="text-sm border border-gray-200 rounded-md px-3 py-1.5 text-gray-600" disabled />
        <span className="text-xs text-gray-400">Filters active after backend integration.</span>
      </div>

      {/* Log table */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
          <p className="text-sm font-semibold text-gray-900">Audit Trail</p>
          <span className="text-xs text-gray-400">{sorted.length} entries</span>
        </div>

        {sorted.length === 0 ? (
          <p className="px-6 py-12 text-sm text-gray-400 text-center">No audit log entries found.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100">
                  {["Time", "Actor", "Action", "Target", "Details", "IP Address"].map((h) => (
                    <th key={h} className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider bg-gray-50">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {sorted.map((log) => (
                  <tr key={log.id} className="hover:bg-gray-50/60 transition-colors">
                    <td className="px-5 py-3.5 text-gray-600 tabular-nums whitespace-nowrap text-xs">
                      {formatTimestamp(log.createdAt)}
                    </td>
                    <td className="px-5 py-3.5">
                      <p className="font-medium text-gray-900 text-sm">{log.actorName}</p>
                      <p className="text-xs text-gray-400">{log.actorId}</p>
                    </td>
                    <td className="px-5 py-3.5">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${actionColor[log.action] ?? "bg-gray-100 text-gray-700"}`}>
                        {actionLabel[log.action] ?? log.action}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 text-xs">
                      <p className="text-gray-700 font-medium">{log.targetType}</p>
                      <p className="text-gray-400 font-mono">{log.targetId}</p>
                    </td>
                    <td className="px-5 py-3.5 text-xs text-gray-500 max-w-xs">
                      {Object.entries(log.metadata)
                        .map(([k, v]) => `${k}: ${v}`)
                        .join(" · ")}
                    </td>
                    <td className="px-5 py-3.5 text-xs text-gray-400 font-mono">{log.ipAddress}</td>
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
