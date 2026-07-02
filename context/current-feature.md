# Current Feature: Iteration 01 — Mock Data Foundation

## Status

In Progress

## Goals

Create a single source of truth for temporary mock data used by the Employee Attendance System UI while the real database is not yet implemented.

The mock data must support:

- Admin dashboard
- Manager dashboard
- Employee dashboard
- Employee attendance profile
- Attendance tables
- Monthly attendance calendar
- Recent attendance events
- Late arrivals
- Missing checkouts
- Absence summaries
- Attendance policy display

This iteration is only for static display data. No helper functions, fake APIs, service logic, calculations, Prisma schema, backend routes, or React components.

## Implementation Details

**File:** `src/lib/mockdata.ts`

This file is the only source of temporary mock data for the dashboard UI.

**Exports:**

| Export | Description |
|---|---|
| `currentUser` | Admin user object — default for admin dashboard views |
| `employees` | 12 employees across Engineering, HR, Finance, Operations, Sales, Support |
| `attendanceRecords` | Records for current month covering all attendance statuses |
| `absences` | Unexcused absences and approved leave records |
| `employeeMonthlySummaries` | Per-employee monthly rollup for dashboard cards and profile pages |
| `dashboardSummary` | Card values for the admin dashboard |
| `recentAttendanceEvents` | 10 events — check-ins, late check-ins, check-outs, corrections |
| `lateArrivals` | Records for the late arrivals panel |
| `missingCheckoutRecords` | Records for the missing checkout panel |
| `employeeMonthlyCalendar` | Calendar grid data for a single employee's month view |
| `attendancePolicy` | Office location, radius, work start time, and timezone |

**TypeScript union types exported:**

- `UserRole` — `"ADMIN" | "MANAGER" | "EMPLOYEE"`
- `UserStatus` — `"ACTIVE" | "INACTIVE" | "SUSPENDED"`
- `EmployeeStatus` — `"ACTIVE" | "INACTIVE" | "SUSPENDED"`
- `AttendanceStatus` — `"PRESENT" | "LATE" | "HALF_DAY" | "ABSENT" | "ON_LEAVE" | "MISSING_CHECKOUT"`
- `AbsenceStatus` — `"ABSENT" | "ON_LEAVE" | "UNEXCUSED"`
- `AttendanceEventType` — `"CHECK_IN" | "CHECK_OUT" | "LATE_CHECK_IN" | "MISSING_CHECKOUT" | "ADMIN_CORRECTION" | "REJECTED_LOCATION"`
- `AttendanceSource` — `"EMPLOYEE" | "ADMIN_CORRECTION" | "SYSTEM"`

## Testing

- Verify `src/lib/mockdata.ts` exists and all exports are importable.
- Verify data matches the Employee Attendance System domain (no SaaS, CRM, marketing, or finance data).
- Verify employee IDs referenced in attendance records, absences, late arrivals, missing checkouts, and calendar data match entries in the `employees` array.
- Verify the admin dashboard UI can import `dashboardSummary`, `recentAttendanceEvents`, `lateArrivals`, and `missingCheckoutRecords`.
- Verify employee UI can filter `attendanceRecords` and `employeeMonthlyCalendar` by `currentUser.employeeId`.

## Notes

- `currentUser` defaults to an admin (emp-001) so the admin dashboard renders all data without filtering.
- All attendance records use ISO 8601 timestamps.
- `checkOutAt` and `totalMinutes` are `null` for ABSENT and MISSING_CHECKOUT records.
- `employeeMonthlyCalendar` currently contains only Jul 1–2 entries for emp-002; remaining days will be populated by the real database.
- Spec reference: `context/features/dashboard-phase1-spec.md`

## History

- 2026-07-02 — `src/lib/mockdata.ts` created. All 11 exports implemented. Status set to In Progress.