# Current Feature: Iteration 06 — Attendance Seed Data

## Status

Completed

## Goals

Replace the existing seed script (`prisma/seed.ts`) with realistic attendance system data for development and demos. The seed must match the schema exactly — no invented field names. It must be safe to re-run using `upsert` / `deleteMany` + `createMany`.

## Spec Reference

`context/features/seed-spec.md`

## Implementation Details

### Admin User

| Field         | Value                                             |
|---------------|---------------------------------------------------|
| name          | Faisal                                            |
| email         | `const SEED_EMAIL = "faisal@example.com"` constant at top of file |
| password      | `12345678` — hashed with bcryptjs, 12 rounds      |
| role          | `ADMIN`                                           |
| emailVerified | current date at seed time                         |
| status        | `ACTIVE`                                          |

### Departments

Upsert these departments before creating employees (schema already has a Department model with `@@unique` on name):

`Management`, `HR`, `Engineering`, `Design`, `QA`, `DevOps`, `Support`

### Employees

Create 8 employees connected to the user records above. Each employee needs a User record first, then an Employee record linked via `userId`.

| Name               | Department  | Job Title          | Status     |
|--------------------|-------------|--------------------|------------|
| Faisal Al-Qahtani  | Management  | Admin Manager      | `ACTIVE`   |
| Sara Al-Harbi      | HR          | HR Specialist      | `ACTIVE`   |
| Omar Al-Otaibi     | Engineering | Software Engineer  | `ACTIVE`   |
| Noura Al-Dossari   | Design      | Product Designer   | `ACTIVE`   |
| Khalid Al-Mutairi  | Engineering | Backend Developer  | `ACTIVE`   |
| Reem Al-Zahrani    | QA          | QA Engineer        | `ACTIVE`   |
| Abdullah Al-Shehri | DevOps      | DevOps Engineer    | `ACTIVE`   |
| Maha Al-Anazi      | Support     | Support Specialist | `INACTIVE` |

- Sequential employee codes `EMP-001` through `EMP-008`
- Unique email per employee (e.g. `sara.harbi@company.com`)
- Common dummy password `password123` hashed at 12 rounds
- Realistic hire dates spread over the last 2 years
- Both `create` and `update` branches always write `passwordHash` so re-runs never leave stale credentials

### Attendance Records

Policy applied:
- Work start: `09:00` — Late threshold: `09:15`
- Working days: Sunday–Thursday (skip Friday and Saturday)
- Seed range: last 30 calendar days up to (not including) today → ~21 working days

| Scenario         | Status             | Notes                                       |
|------------------|--------------------|---------------------------------------------|
| On-time          | `PRESENT`          | checkInAt 08:45–08:54, checkOutAt 17:00+    |
| Late             | `LATE`             | checkInAt after 09:15, `isLate: true`       |
| Missing checkout | `MISSING_CHECKOUT` | checkInAt present, checkOutAt null          |
| Absent           | `ABSENT`           | no record inserted for that date            |
| Half day         | `HALF_DAY`         | checkOutAt 13:00, totalMinutes ≈ 240        |

Each employee has a fixed repeating 10-day pattern so scenarios are deterministic across re-runs. Maha Al-Anazi (INACTIVE) has no attendance records.

### Audit Logs

11 entries: `EMPLOYEE_CREATED` × 8, `EMPLOYEE_UPDATED` × 1 (Maha status change), `ATTENDANCE_CORRECTED` × 1 (Omar missing checkout), `SETTINGS_UPDATED` × 1 (policy radius change). Cleared and recreated on every re-run.

### Attendance Policy

Single active policy: Head Office, Riyadh (24.7136, 46.6753), 200 m radius, 09:00 start, `Asia/Riyadh`, 420 / 210 min thresholds.

---

## History

- 2026-07-02 — **Iteration 01 completed**: Mock Data Foundation. Created `src/lib/mockdata.ts` as the single source of truth for all dashboard display data. Exported 11 data objects (`currentUser`, `employees`, `attendanceRecords`, `absences`, `employeeMonthlySummaries`, `dashboardSummary`, `recentAttendanceEvents`, `lateArrivals`, `missingCheckoutRecords`, `employeeMonthlyCalendar`, `attendancePolicy`) plus TypeScript union types. Added `auditLogs`, `currentEmployeeAttendance`, `currentEmployeeMonthlySummary` during Iteration 02. Branch: `feat/mock-data-foundation`. Spec: `context/features/dashboard-phase1-spec.md`.

- 2026-07-02 — **Iteration 02 completed**: Dashboard UI and Attendance Screens. Built 13 routes (zero TypeScript errors, clean `next build`) using only mock data and Tailwind CSS — no external component libraries. Admin routes: `/admin/dashboard`, `/admin/employees`, `/admin/employees/new`, `/admin/employees/:id`, `/admin/employees/:id/edit`, `/admin/attendance`, `/admin/settings`, `/admin/audit-logs`. Employee routes: `/employee/dashboard`, `/employee/attendance`, `/employee/profile`. Shared components: `StatusBadge`, `EmployeeStatusBadge`, `CalendarDot`, `AdminSideNav`, `EmployeeSideNav`, `MonthlyCalendar`, `CheckInOutPanel`. Branch: `feat/mock-data-foundation`. Spec: `context/features/dashbaord-phase2-spec.md`.

- 2026-07-04 — **Iteration 03 completed**: Production Backend Integration. Replaced all mock data with a real production-ready backend. Added: Prisma v5 schema with 6 models (User, Employee, Department, AttendanceRecord, AttendancePolicy, AuditLog), PostgreSQL persistence, JWT auth in HTTP-only cookies (jose), bcrypt password hashing, RBAC proxy (`src/proxy.ts`), Haversine-based server-side GPS validation, full CRUD API routes, seed script, server actions for employee management and attendance correction, real Prisma queries on all pages with graceful DB-not-connected amber banners. Zero TypeScript errors, clean `npm run build`. Branch: `feat/backend-integration`. Spec: `context/features/dashbaord-phase3-spec.md`.

- 2026-07-04 — **Iteration 04 completed**: Neon PostgreSQL & Prisma 7 Migration. Upgraded Prisma v5 → v7 (ESM-only, driver adapters required, datasource URL moved to `prisma.config.ts`, generator provider renamed, output path now required). Configured Neon PostgreSQL as the database. Added `@prisma/adapter-pg` + `pg` driver, `dotenv` for CLI env loading. Set `"type": "module"` and `target: ES2023` in tsconfig. Created `prisma.config.ts` at project root. Updated all `@prisma/client` imports to generated client path (`@/generated/prisma/client`). Created and applied initial migration (`20260704104508_init`) to Neon dev branch. Seeded: 6 departments, attendance policy, admin account. Added `scripts/test-db.ts` and `npm run db:test` for connection verification — all checks pass. Branch: `feat/neon-prisma7`. Spec: `context/features/database-spec.md`.

- 2026-07-04 — **Iteration 05 completed**: Seed Data (Item Types / Collections). Replaced the employee attendance seed script with demo data for an item-management context: user Faisal (isPro, emailVerified), 7 system ItemTypes (snippet/prompt/command/note/file/image/link), 5 Collections (React Patterns, AI Workflows, DevOps, Terminal Commands, Design Resources) with 18 total Items. Added new Prisma migration `20260704114829_seed_data_models` adding `isPro` + `emailVerified` to User and new `ItemType`, `Collection`, `Item` models. Fixed Turbopack/Prisma 7 dev-server crash by switching `npm run dev` to `--webpack` flag and adding `serverExternalPackages` to `next.config.ts`. Branch: `feat/seed-data`. Spec: `context/features/seed-spec.md` (prior version).

- 2026-07-04 — **Iteration 06 completed**: Attendance Seed Data. Replaced seed script with realistic attendance system data: admin user (`faisal@example.com` / `12345678`), 7 departments, 8 employees (7 active / 1 inactive) each with User + Employee records, 137 attendance records across 21 working days (Sunday–Thursday) covering all 5 attendance statuses, 11 audit log entries. Fixed upsert to always refresh `passwordHash` in both `create` and `update` branches. No schema changes required. Branch: `feat/attendance-seed`. Spec: `context/features/seed-spec.md`.
