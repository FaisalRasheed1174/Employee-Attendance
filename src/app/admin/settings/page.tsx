import { attendancePolicy } from "@/lib/mockdata";

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

export default function AdminSettingsPage() {
  return (
    <div className="p-8 max-w-2xl">
      {/* Header */}
      <div className="mb-8 flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Attendance Policy</h1>
          <p className="text-sm text-gray-500 mt-1">System-wide attendance rules and office location.</p>
        </div>
        <button disabled className="px-4 py-2 text-sm font-semibold text-white bg-indigo-600 rounded-lg opacity-40 cursor-not-allowed" title="Edit coming in next iteration">
          Edit Policy
        </button>
      </div>

      {/* Active status banner */}
      <div className={`rounded-xl border px-5 py-3.5 mb-6 flex items-center gap-3 ${
        attendancePolicy.active ? "bg-green-50 border-green-200" : "bg-red-50 border-red-200"
      }`}>
        <span className={`w-2.5 h-2.5 rounded-full flex-shrink-0 ${attendancePolicy.active ? "bg-green-500" : "bg-red-500"}`} />
        <p className={`text-sm font-medium ${attendancePolicy.active ? "text-green-800" : "text-red-800"}`}>
          {attendancePolicy.active
            ? "Attendance policy is active. Employees can check in and check out."
            : "Attendance policy is inactive. Check-in and check-out are currently disabled."}
        </p>
      </div>

      {/* Policy card */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100">
          <h2 className="text-sm font-semibold text-gray-900">{attendancePolicy.officeName}</h2>
          <p className="text-xs text-gray-400 mt-0.5">Policy ID: {attendancePolicy.id}</p>
        </div>
        <dl className="px-6">
          <FieldRow label="Office Name"              value={attendancePolicy.officeName} />
          <FieldRow label="Office Latitude"          value={attendancePolicy.officeLatitude} />
          <FieldRow label="Office Longitude"         value={attendancePolicy.officeLongitude} />
          <FieldRow label="Allowed Radius"           value={`${attendancePolicy.allowedRadiusMeters} meters`} />
          <FieldRow label="Work Start Time"          value={attendancePolicy.workStartTime} />
          <FieldRow label="Timezone"                 value={attendancePolicy.timezone} />
          <FieldRow label="Minimum Full Day"         value={`${attendancePolicy.minimumFullDayMinutes} min (${(attendancePolicy.minimumFullDayMinutes / 60).toFixed(1)}h)`} />
          <FieldRow label="Minimum Half Day"         value={`${attendancePolicy.minimumHalfDayMinutes} min (${(attendancePolicy.minimumHalfDayMinutes / 60).toFixed(1)}h)`} />
          <FieldRow label="Policy Active"            value={attendancePolicy.active} />
        </dl>
      </div>

      {/* Map placeholder */}
      <div className="mt-6 bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100">
          <h2 className="text-sm font-semibold text-gray-900">Office Location</h2>
          <p className="text-xs text-gray-400 mt-0.5">
            {attendancePolicy.officeLatitude}, {attendancePolicy.officeLongitude} · {attendancePolicy.allowedRadiusMeters}m radius
          </p>
        </div>
        <div className="bg-gray-50 h-40 flex items-center justify-center">
          <p className="text-sm text-gray-400">
            Map integration available after backend setup. Coordinates: {attendancePolicy.officeLatitude}, {attendancePolicy.officeLongitude}
          </p>
        </div>
      </div>

      {/* Admin note */}
      <div className="mt-6 rounded-lg bg-blue-50 border border-blue-200 px-5 py-4 text-sm text-blue-700">
        Policy editing, including changing the office location or radius, requires admin privileges and is implemented with backend validation in a future iteration.
      </div>
    </div>
  );
}
