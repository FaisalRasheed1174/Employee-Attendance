import { prisma } from "@/lib/prisma";
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
  USER_LOGIN:            "User Login",
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
  USER_LOGIN:            "bg-sky-100 text-sky-800",
};

type SearchParams = { action?: string; actor?: string; month?: string };

export default async function AuditLogsPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const sp = await searchParams;
  type LogEntry = {
    id: string; actorId: string; action: string; targetType: string; targetId: string;
    metadata: unknown; ipAddress: string | null; createdAt: Date;
    actor: { name: string };
  };
  let logs: LogEntry[] = [];
  let dbError = false;

  try {
    const month = sp.month;
    logs = await prisma.auditLog.findMany({
      where: {
        ...(sp.action ? { action: sp.action } : {}),
        ...(sp.actor ? { actorId: sp.actor } : {}),
        ...(month
          ? (() => {
              const [y, m] = month.split("-").map(Number);
              return {
                createdAt: {
                  gte: new Date(Date.UTC(y, m - 1, 1)),
                  lt: new Date(Date.UTC(y, m, 1)),
                },
              };
            })()
          : {}),
      },
      include: { actor: { select: { name: true } } },
      orderBy: { createdAt: "desc" },
      take: 500,
    });
  } catch {
    dbError = true;
  }

  return (
    <div className="p-8 max-w-screen-xl">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Audit Logs</h1>
        <p className="text-sm text-gray-500 mt-1">
          Sensitive actions performed by admins, managers, and the system. Read-only.
        </p>
      </div>

      {dbError && (
        <div className="mb-6 rounded-xl bg-amber-50 border border-amber-200 px-5 py-4 text-sm text-amber-800">
          Database not connected. Configure <code className="font-mono">DATABASE_URL</code> and run migrations.
        </div>
      )}

      {/* Filter form */}
      <form method="GET" className="bg-white rounded-xl border border-gray-200 px-5 py-3 mb-6 flex flex-wrap gap-3 items-center">
        <select name="action" defaultValue={sp.action ?? ""}
          className="text-sm border border-gray-200 rounded-md px-3 py-1.5 text-gray-600 bg-white">
          <option value="">All Actions</option>
          {Object.keys(actionLabel).map((k) => <option key={k} value={k}>{actionLabel[k]}</option>)}
        </select>
        <input type="month" name="month" defaultValue={sp.month ?? ""}
          className="text-sm border border-gray-200 rounded-md px-3 py-1.5 text-gray-600" />
        <button type="submit" className="px-3 py-1.5 text-sm font-medium bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors">
          Filter
        </button>
        {(sp.action || sp.month) && (
          <a href="/admin/audit-logs" className="text-xs text-gray-400 hover:text-gray-600">
            Clear
          </a>
        )}
      </form>

      {/* Log table */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
          <p className="text-sm font-semibold text-gray-900">Audit Trail</p>
          <span className="text-xs text-gray-400">{logs.length} entries</span>
        </div>

        {logs.length === 0 ? (
          <p className="px-6 py-12 text-sm text-gray-400 text-center">
            {dbError ? "Connect the database to view audit logs." : "No audit log entries found."}
          </p>
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
                {logs.map((log) => (
                  <tr key={log.id} className="hover:bg-gray-50/60 transition-colors">
                    <td className="px-5 py-3.5 text-gray-600 tabular-nums whitespace-nowrap text-xs">
                      {formatTimestamp(log.createdAt.toISOString())}
                    </td>
                    <td className="px-5 py-3.5">
                      <p className="font-medium text-gray-900 text-sm">{log.actor.name}</p>
                      <p className="text-xs text-gray-400 font-mono">{log.actorId.slice(0, 8)}…</p>
                    </td>
                    <td className="px-5 py-3.5">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${actionColor[log.action] ?? "bg-gray-100 text-gray-700"}`}>
                        {actionLabel[log.action] ?? log.action}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 text-xs">
                      <p className="text-gray-700 font-medium">{log.targetType}</p>
                      <p className="text-gray-400 font-mono">{log.targetId.slice(0, 12)}…</p>
                    </td>
                    <td className="px-5 py-3.5 text-xs text-gray-500 max-w-xs">
                      {typeof log.metadata === "object" && log.metadata
                        ? Object.entries(log.metadata as Record<string, unknown>)
                            .map(([k, v]) => `${k}: ${v}`)
                            .join(" · ")
                        : ""}
                    </td>
                    <td className="px-5 py-3.5 text-xs text-gray-400 font-mono">{log.ipAddress ?? "—"}</td>
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
