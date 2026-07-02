const attendanceConfig: Record<string, { label: string; className: string }> = {
  PRESENT:          { label: "Present",          className: "bg-green-100 text-green-800 ring-1 ring-green-200" },
  LATE:             { label: "Late",              className: "bg-amber-100 text-amber-800 ring-1 ring-amber-200" },
  HALF_DAY:         { label: "Half Day",          className: "bg-blue-100 text-blue-800 ring-1 ring-blue-200" },
  ABSENT:           { label: "Absent",            className: "bg-red-100 text-red-800 ring-1 ring-red-200" },
  ON_LEAVE:         { label: "On Leave",          className: "bg-purple-100 text-purple-800 ring-1 ring-purple-200" },
  MISSING_CHECKOUT: { label: "Missing Checkout",  className: "bg-orange-100 text-orange-800 ring-1 ring-orange-200" },
};

const employeeStatusConfig: Record<string, { label: string; className: string }> = {
  ACTIVE:    { label: "Active",    className: "bg-green-100 text-green-800 ring-1 ring-green-200" },
  INACTIVE:  { label: "Inactive",  className: "bg-gray-100 text-gray-600 ring-1 ring-gray-200" },
  SUSPENDED: { label: "Suspended", className: "bg-red-100 text-red-800 ring-1 ring-red-200" },
};

export function StatusBadge({ status }: { status: string }) {
  const cfg = attendanceConfig[status] ?? { label: status, className: "bg-gray-100 text-gray-700 ring-1 ring-gray-200" };
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${cfg.className}`}>
      {cfg.label}
    </span>
  );
}

export function EmployeeStatusBadge({ status }: { status: string }) {
  const cfg = employeeStatusConfig[status] ?? { label: status, className: "bg-gray-100 text-gray-700 ring-1 ring-gray-200" };
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${cfg.className}`}>
      {cfg.label}
    </span>
  );
}

// Calendar cell variant — compact colored dot with letter code
const calendarDotConfig: Record<string, { label: string; className: string }> = {
  PRESENT:          { label: "P",  className: "bg-green-500 text-white" },
  LATE:             { label: "L",  className: "bg-amber-500 text-white" },
  HALF_DAY:         { label: "HD", className: "bg-blue-500 text-white" },
  ABSENT:           { label: "A",  className: "bg-red-500 text-white" },
  ON_LEAVE:         { label: "OL", className: "bg-purple-500 text-white" },
  MISSING_CHECKOUT: { label: "MC", className: "bg-orange-500 text-white" },
};

export function CalendarDot({ status }: { status: string }) {
  const cfg = calendarDotConfig[status] ?? { label: "?", className: "bg-gray-400 text-white" };
  return (
    <span className={`inline-flex items-center justify-center rounded text-white font-bold px-1 ${cfg.className}`} style={{ fontSize: "0.6rem", minWidth: "1.4rem" }}>
      {cfg.label}
    </span>
  );
}
