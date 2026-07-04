import Link from "next/link";
import { prisma } from "@/lib/prisma";

type FieldRowProps = { label: string; value: string | number | boolean };

function FieldRow({ label, value }: FieldRowProps) {
  const display =
    typeof value === "boolean"
      ? value ? "Yes — Policy is active" : "No — Policy is inactive"
      : String(value);

  return (
    <div className="flex items-start justify-between py-4 border-b border-gray-100 last:border-0">
      <dt className="text-sm font-medium text-gray-600 w-52 flex-shrink-0">{label}</dt>
      <dd className={`text-sm text-right ${typeof value === "boolean" ? (value ? "text-green-700 font-medium" : "text-red-700 font-medium") : "text-gray-900"}`}>
        {display}
      </dd>
    </div>
  );
}

export default async function AdminSettingsPage() {
  let policy: Awaited<ReturnType<typeof prisma.attendancePolicy.findFirst>> = null;
  let dbError = false;

  try {
    policy = await prisma.attendancePolicy.findFirst({ where: { active: true } });
  } catch {
    dbError = true;
  }

  return (
    <div className="p-8 max-w-2xl">
      <div className="mb-8 flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Attendance Policy</h1>
          <p className="text-sm text-gray-500 mt-1">System-wide attendance rules and office location.</p>
        </div>
        <Link
          href="/admin/settings/edit"
          className="px-4 py-2 text-sm font-semibold text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 transition-colors"
        >
          Edit Policy
        </Link>
      </div>

      {dbError && (
        <div className="mb-6 rounded-xl bg-amber-50 border border-amber-200 px-5 py-4 text-sm text-amber-800">
          Database not connected. Configure <code className="font-mono">DATABASE_URL</code> and run migrations.
        </div>
      )}

      {!policy && !dbError && (
        <div className="mb-6 rounded-xl bg-amber-50 border border-amber-200 px-5 py-4 text-sm text-amber-800">
          No active attendance policy configured.{" "}
          <Link href="/admin/settings/edit" className="font-medium underline">Create one now →</Link>
        </div>
      )}

      {policy && (
        <>
          {/* Active status banner */}
          <div className={`rounded-xl border px-5 py-3.5 mb-6 flex items-center gap-3 ${
            policy.active ? "bg-green-50 border-green-200" : "bg-red-50 border-red-200"
          }`}>
            <span className={`w-2.5 h-2.5 rounded-full flex-shrink-0 ${policy.active ? "bg-green-500" : "bg-red-500"}`} />
            <p className={`text-sm font-medium ${policy.active ? "text-green-800" : "text-red-800"}`}>
              {policy.active
                ? "Attendance policy is active. Employees can check in and check out."
                : "Attendance policy is inactive. Check-in and check-out are currently disabled."}
            </p>
          </div>

          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100">
              <h2 className="text-sm font-semibold text-gray-900">{policy.officeName}</h2>
              <p className="text-xs text-gray-400 mt-0.5">Policy ID: {policy.id}</p>
            </div>
            <dl className="px-6">
              <FieldRow label="Office Name"              value={policy.officeName} />
              <FieldRow label="Office Latitude"          value={policy.officeLatitude} />
              <FieldRow label="Office Longitude"         value={policy.officeLongitude} />
              <FieldRow label="Allowed Radius"           value={`${policy.allowedRadiusMeters} meters`} />
              <FieldRow label="Work Start Time"          value={policy.workStartTime} />
              <FieldRow label="Timezone"                 value={policy.timezone} />
              <FieldRow label="Minimum Full Day"         value={`${policy.minimumFullDayMinutes} min (${(policy.minimumFullDayMinutes / 60).toFixed(1)}h)`} />
              <FieldRow label="Minimum Half Day"         value={`${policy.minimumHalfDayMinutes} min (${(policy.minimumHalfDayMinutes / 60).toFixed(1)}h)`} />
              <FieldRow label="Policy Active"            value={policy.active} />
            </dl>
          </div>

          <div className="mt-6 bg-white rounded-xl border border-gray-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100">
              <h2 className="text-sm font-semibold text-gray-900">Office Location</h2>
              <p className="text-xs text-gray-400 mt-0.5">
                {policy.officeLatitude}, {policy.officeLongitude} · {policy.allowedRadiusMeters}m radius
              </p>
            </div>
            <div className="bg-gray-50 h-40 flex items-center justify-center">
              <p className="text-sm text-gray-400">
                Map view: {policy.officeLatitude}, {policy.officeLongitude}
              </p>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
