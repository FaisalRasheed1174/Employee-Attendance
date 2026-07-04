# Current Feature: Iteration 03 — Production Backend Integration

## Status

Completed

## Goals

Replace all temporary mock data with a real production-ready backend.

The project must become a fully working Employee Attendance System with authentication, role-based authorization, PostgreSQL persistence, server-side attendance timestamps, backend location validation, and audit logging.

The mock data in `src/lib/mockdata.ts` is temporary and must be replaced. Dashboard data must not remain hardcoded. Attendance validity must never be decided on the frontend.

## Implementation Details

### Database

PostgreSQL via Prisma. Core models:

| Model | Purpose |
|---|---|
| `User` | Authentication identity — id, name, email, passwordHash, role, status, lastLoginAt |
| `Employee` | Staff profile — id, userId, employeeCode, phone, departmentId, jobTitle, hiredAt, status |
| `Department` | Department reference |
| `AttendanceRecord` | One record per employee per date — check-in/out, totalMinutes, status, isLate, GPS coords, source, correction fields |
| `AttendancePolicy` | Office location, radius, workStartTime, timezone, thresholds, active flag |
| `AuditLog` | actorId, action, targetType, targetId, metadata, ipAddress, userAgent |

**Key constraints:**
- Unique constraint on `AttendanceRecord(employeeId, date)` — no duplicate records per employee per day
- Indexes on `employeeId`, `date`, `status`, `isLate`
- Passwords stored as hashes only — never plain text

### Authentication

| Route | Method |
|---|---|
| `/api/auth/login` | POST |
| `/api/auth/logout` | POST |
| `/api/auth/me` | GET |

- Secure password hashing
- HTTP-only cookies or secure sessions
- Role-based redirect after login (`ADMIN`/`MANAGER` → `/admin/dashboard`, `EMPLOYEE` → `/employee/dashboard`)

### Authorization (enforced server-side, not UI-only)

| Area | Employee | Manager | Admin |
|---|---|---|---|
| Employee self dashboard | Yes | No | No |
| Own attendance history | Yes | No | No |
| Admin dashboard | No | Yes | Yes |
| Employee management | No | Limited | Yes |
| Attendance correction | No | Optional | Yes |
| Policy settings | No | No | Yes |

### Location-based attendance validation

Frontend sends `{ latitude, longitude, accuracyMeters }`. Backend must:

1. Load active attendance policy
2. Calculate distance from office coordinates
3. Reject if distance > allowed radius
4. Reject or flag if GPS accuracy is too poor
5. Use **server time** for check-in/check-out timestamp
6. Create or update attendance record
7. Write audit log

Error message: `You are outside the allowed attendance area. Move within the office radius and try again.`

### Attendance logic

**Check-in:** employee must be active, policy must be active, inside radius, no duplicate for today → create record, calculate lateness, write audit log.

**Check-out:** employee must be active, already checked in today, not already checked out, inside radius → update record, calculate totalMinutes and final status, write audit log.

### API routes

**Employee**
```
GET  /api/employee/attendance?month=YYYY-MM
POST /api/attendance/check-in
POST /api/attendance/check-out
```

**Admin**
```
GET    /api/admin/dashboard/summary
GET    /api/admin/employees
POST   /api/admin/employees
GET    /api/admin/employees/:id
PATCH  /api/admin/employees/:id
DELETE /api/admin/employees/:id
GET    /api/admin/attendance
PATCH  /api/admin/attendance/:id
GET    /api/admin/settings/attendance-policy
PATCH  /api/admin/settings/attendance-policy
GET    /api/admin/audit-logs
```

### Admin attendance correction

Requires: correction reason, `correctedById`, `correctionReason`, recalculated totalMinutes and status, audit log entry. Correction screen must show original and updated values, who corrected, and when.

### Monthly calendar

Generated from real attendance records. Route: `/admin/employees/:employeeId?month=YYYY-MM`

### Audit log events

Employee created/updated/deactivated/deleted, check-in/check-out attempt, failed location validation, admin correction, policy update, unauthorized access attempts.

### Edge cases to handle

- Employee denies location permission
- Low-accuracy GPS from browser
- Duplicate check-in attempt
- Missing checkout (checked in, never checked out)
- Check-out without check-in
- Inactive or suspended employee attempting check-in
- Attendance policy missing or inactive
- Timezone differences between server and office location
- Employee calling admin APIs

## Testing

- Admin can create a real employee account
- Employee can log in with email and password
- Employee can check in only when inside the allowed 200m radius
- Employee can check out and total hours are calculated correctly
- Admin can view attendance records from the database
- Admin can filter by employee, date, month, status, late-only, and missing checkout
- Admin can open employee profile and view a real monthly calendar
- Attendance data survives page refresh and redeployment
- Auth is real — unauthenticated requests are rejected
- Authorization is enforced on the backend — employees cannot access admin APIs
- Location validation happens on the backend — frontend coordinates are verified server-side
- Audit log entries are created for all sensitive actions
- Mock data is no longer the source of any production dashboard data

## Notes

- `src/lib/mockdata.ts` stays in place during development but all UI imports must be replaced by real API calls
- Out of scope for this iteration: payroll, face recognition, QR check-in, mobile app, multi-office, leave approval, biometrics
- Spec reference: `context/features/dashbaord-phase3-spec.md`

## History

- 2026-07-02 — **Iteration 01 completed**: Mock Data Foundation. Created `src/lib/mockdata.ts` as the single source of truth for all dashboard display data. Exported 11 data objects (`currentUser`, `employees`, `attendanceRecords`, `absences`, `employeeMonthlySummaries`, `dashboardSummary`, `recentAttendanceEvents`, `lateArrivals`, `missingCheckoutRecords`, `employeeMonthlyCalendar`, `attendancePolicy`) plus TypeScript union types. Added `auditLogs`, `currentEmployeeAttendance`, `currentEmployeeMonthlySummary` during Iteration 02. Branch: `feat/mock-data-foundation`. Spec: `context/features/dashboard-phase1-spec.md`.
- 2026-07-02 — **Iteration 02 completed**: Dashboard UI and Attendance Screens. Built 13 routes (zero TypeScript errors, clean `next build`) using only mock data and Tailwind CSS — no external component libraries. Admin routes: `/admin/dashboard` (KPI cards, recent events, late arrivals, missing checkout, attendance table), `/admin/employees` (list), `/admin/employees/new` (form, UI only), `/admin/employees/:id` (profile + June 2026 calendar grid), `/admin/employees/:id/edit` (form, UI only), `/admin/attendance` (full table + filter panel), `/admin/settings` (policy display), `/admin/audit-logs` (audit trail). Employee routes: `/employee/dashboard` (today status, Check In/Out panel with location state simulation), `/employee/attendance` (calendar + history), `/employee/profile`. Shared components: `StatusBadge`, `EmployeeStatusBadge`, `CalendarDot`, `AdminSideNav`, `EmployeeSideNav`, `MonthlyCalendar`, `CheckInOutPanel`. Utility: `src/lib/format.ts`. Branch: `feat/mock-data-foundation`. Spec: `context/features/dashbaord-phase2-spec.md`.
- 2026-07-04 — **Iteration 03 completed**: Production Backend Integration. Replaced all mock data with a real production-ready backend. Added: Prisma v5 schema with 6 models (User, Employee, Department, AttendanceRecord, AttendancePolicy, AuditLog), PostgreSQL persistence, JWT auth in HTTP-only cookies (jose), bcrypt password hashing, RBAC proxy (Next.js 16 `src/proxy.ts`), Haversine-based server-side GPS validation, full CRUD API routes (auth, attendance, admin employees, admin attendance, settings, audit logs), seed script (6 departments, default policy, admin user `admin@company.com`/`Admin1234!`), server actions for employee create/edit/deactivate and attendance correction, real Prisma queries on all pages with graceful DB-not-connected amber banners. Zero TypeScript errors, clean `npm run build`. Branch: `feat/backend-integration`. Spec: `context/features/dashbaord-phase3-spec.md`.
