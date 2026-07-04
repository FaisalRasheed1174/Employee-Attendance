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

- Assign a sequential employee code (e.g. `EMP-001` through `EMP-008`)
- Give each a unique email (e.g. `sara@company.com`)
- Use a common dummy password (`password123` hashed at 12 rounds)
- Hire dates should be realistic (spread over the last 2 years)
- Employee role in User table: `EMPLOYEE` (except Admin Manager → can keep `ADMIN` or `MANAGER`)

### Attendance Records

Policy (use the seeded AttendancePolicy):
- Work start: `09:00`
- Late threshold: `09:15`
- Working days: Sunday–Thursday (skip Friday and Saturday)

Generate records for the **current month** up to yesterday. Cover all statuses:

| Scenario        | Status             | Description                                        |
|-----------------|--------------------|----------------------------------------------------|
| On-time         | `PRESENT`          | checkInAt ≤ 09:14, checkOutAt ≥ 17:00              |
| Late            | `LATE`             | checkInAt between 09:15–10:30, `isLate: true`      |
| Missing checkout| `MISSING_CHECKOUT` | checkInAt present, checkOutAt null                 |
| Absent          | `ABSENT`           | no record (skip the day in seed)                   |
| Half day        | `HALF_DAY`         | totalMinutes < 420 but ≥ 210                       |

- Use `@@unique([employeeId, date])` — do not create duplicate records for the same employee+date
- `totalMinutes` = difference between checkIn and checkOut in minutes (null if no checkout)
- `lateMinutes` = minutes past 09:00 when late (0 otherwise)
- Set `checkInLatitude / checkInLongitude` to plausible office coordinates
- `source: WEB`

Spread different scenarios across employees — not every employee should have the same pattern.

### Leave / Absences

The current schema has **no Leave model**. Leave/absence records are **blocked** — do not invent fields or models. Mark absent days by simply not inserting an AttendanceRecord for that date and leaving a comment in the seed. If a Leave model is added in a future iteration, this section can be wired up.

### Audit Logs

Create sample audit log entries using the existing `AuditLog` model:

| action                | targetType   | Description                        |
|-----------------------|--------------|------------------------------------|
| `EMPLOYEE_CREATED`    | `Employee`   | Admin created each of the 8 employees |
| `EMPLOYEE_UPDATED`    | `Employee`   | One employee status changed         |
| `ATTENDANCE_CORRECTED`| `AttendanceRecord` | Admin corrected one record   |
| `SETTINGS_UPDATED`    | `AttendancePolicy` | Admin updated office policy  |

- `actorId` = the seeded admin user's id
- `metadata` = relevant JSON (e.g. `{ "field": "status", "from": "ACTIVE", "to": "INACTIVE" }`)
- Use real-looking `ipAddress` values (e.g. `192.168.1.10`)

### Attendance Policy

Upsert a single active policy:

| Field                  | Value               |
|------------------------|---------------------|
| officeName             | `Head Office`       |
| officeLatitude         | `24.7136`           |
| officeLongitude        | `46.6753`           |
| allowedRadiusMeters    | `200`               |
| workStartTime          | `09:00`             |
| timezone               | `Asia/Riyadh`       |
| minimumFullDayMinutes  | `420`               |
| minimumHalfDayMinutes  | `210`               |
| active                 | `true`              |

### Rules

- Safe to re-run: use `upsert` on User (by email), Department (by name), Employee (via userId), AttendancePolicy; use `deleteMany` + `create` for AttendanceRecord and AuditLog
- Never store plain-text passwords
- Use the `PrismaPg` adapter pattern (same as current `prisma/seed.ts`)
- `SEED_EMAIL` constant at top of file — easy to change before running
- After writing the seed, run `npx prisma db seed` to verify against the Neon dev branch

## Blocker Check

Before writing the seed, verify:
- [ ] `Department`, `User`, `Employee`, `AttendanceRecord`, `AttendancePolicy`, `AuditLog` all exist in `prisma/schema.prisma` ✓
- [ ] `Leave` model does NOT exist — skip leave records ✓
- [ ] No new migration needed — existing schema covers all seeded data ✓

---

## History

- 2026-07-02 — **Iteration 01 completed**: Mock Data Foundation. Created `src/lib/mockdata.ts` as the single source of truth for all dashboard display data. Exported 11 data objects (`currentUser`, `employees`, `attendanceRecords`, `absences`, `employeeMonthlySummaries`, `dashboardSummary`, `recentAttendanceEvents`, `lateArrivals`, `missingCheckoutRecords`, `employeeMonthlyCalendar`, `attendancePolicy`) plus TypeScript union types. Added `auditLogs`, `currentEmployeeAttendance`, `currentEmployeeMonthlySummary` during Iteration 02. Branch: `feat/mock-data-foundation`. Spec: `context/features/dashboard-phase1-spec.md`.

- 2026-07-02 — **Iteration 02 completed**: Dashboard UI and Attendance Screens. Built 13 routes (zero TypeScript errors, clean `next build`) using only mock data and Tailwind CSS — no external component libraries. Admin routes: `/admin/dashboard`, `/admin/employees`, `/admin/employees/new`, `/admin/employees/:id`, `/admin/employees/:id/edit`, `/admin/attendance`, `/admin/settings`, `/admin/audit-logs`. Employee routes: `/employee/dashboard`, `/employee/attendance`, `/employee/profile`. Shared components: `StatusBadge`, `EmployeeStatusBadge`, `CalendarDot`, `AdminSideNav`, `EmployeeSideNav`, `MonthlyCalendar`, `CheckInOutPanel`. Branch: `feat/mock-data-foundation`. Spec: `context/features/dashbaord-phase2-spec.md`.

- 2026-07-04 — **Iteration 03 completed**: Production Backend Integration. Replaced all mock data with a real production-ready backend. Added: Prisma v5 schema with 6 models (User, Employee, Department, AttendanceRecord, AttendancePolicy, AuditLog), PostgreSQL persistence, JWT auth in HTTP-only cookies (jose), bcrypt password hashing, RBAC proxy (`src/proxy.ts`), Haversine-based server-side GPS validation, full CRUD API routes, seed script, server actions for employee management and attendance correction, real Prisma queries on all pages with graceful DB-not-connected amber banners. Zero TypeScript errors, clean `npm run build`. Branch: `feat/backend-integration`. Spec: `context/features/dashbaord-phase3-spec.md`.

- 2026-07-04 — **Iteration 04 completed**: Neon PostgreSQL & Prisma 7 Migration. Upgraded Prisma v5 → v7 (ESM-only, driver adapters required, datasource URL moved to `prisma.config.ts`, generator provider renamed, output path now required). Configured Neon PostgreSQL as the database. Added `@prisma/adapter-pg` + `pg` driver, `dotenv` for CLI env loading. Set `"type": "module"` and `target: ES2023` in tsconfig. Created `prisma.config.ts` at project root. Updated all `@prisma/client` imports to generated client path (`@/generated/prisma/client`). Created and applied initial migration (`20260704104508_init`) to Neon dev branch. Seeded: 6 departments, attendance policy, admin account. Added `scripts/test-db.ts` and `npm run db:test` for connection verification — all checks pass. Branch: `feat/neon-prisma7`. Spec: `context/features/database-spec.md`.

- 2026-07-04 — **Iteration 06 completed**: Attendance Seed Data. Replaced seed script with realistic attendance system data: admin user (faisal@example.com), 7 departments, 8 employees (7 active / 1 inactive) each with User + Employee records, 137 attendance records across 21 working days (Sunday–Thursday) with PRESENT/LATE/MISSING_CHECKOUT/HALF_DAY/ABSENT scenarios per employee, 11 audit log entries. No schema changes required. Branch: `feat/attendance-seed`. Spec: `context/features/seed-spec.md`.

- 2026-07-04 — **Iteration 05 completed**: Seed Data (Item Types / Collections). Replaced the employee attendance seed script with demo data for an item-management context: user Faisal (isPro, emailVerified), 7 system ItemTypes (snippet/prompt/command/note/file/image/link), 5 Collections (React Patterns, AI Workflows, DevOps, Terminal Commands, Design Resources) with 18 total Items. Added new Prisma migration `20260704114829_seed_data_models` adding `isPro` + `emailVerified` to User and new `ItemType`, `Collection`, `Item` models. Fixed Turbopack/Prisma 7 dev-server crash by switching `npm run dev` to `--webpack` flag and adding `serverExternalPackages` to `next.config.ts`. Branch: `feat/seed-data`. Spec: `context/features/seed-spec.md` (prior version).
