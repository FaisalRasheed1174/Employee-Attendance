# Current Feature: Iteration 05 — Seed Data

## Status

Completed

## Goals

Replace the existing employee attendance seed script with rich sample data for development and demos. The new seed creates a real user, system item types, collections, and items as defined in `context/features/seed-spec.md`. The existing `prisma/seed.ts` is fully overwritten.

## Spec Reference

`context/features/seed-spec.md`

## Implementation Details

### User

| Field          | Value                                      |
|----------------|--------------------------------------------|
| name           | Faisal                                     |
| email          | from `EMAIL_ADDRESS` env var (placeholder) |
| password       | `12345678` — hashed with bcryptjs, 12 rounds |
| isPro          | true                                       |
| emailVerified  | current date at seed time                  |

### System Item Types

Seeded with `isSystem: true`. All 7 must be upserted so the seed is idempotent.

| name    | icon       | color   |
|---------|------------|---------|
| snippet | Code       | #3b82f6 |
| prompt  | Sparkles   | #8b5cf6 |
| command | Terminal   | #f97316 |
| note    | StickyNote | #fde047 |
| file    | File       | #6b7280 |
| image   | Image      | #ec4899 |
| link    | Link       | #10b981 |

### Collections & Items

#### React Patterns
- Description: `Reusable React patterns and hooks`
- 3 × snippet items (TypeScript):
  - Custom hooks (useDebounce, useLocalStorage)
  - Component patterns (Context providers, compound components)
  - Utility functions

#### AI Workflows
- Description: `AI prompts and workflow automations`
- 3 × prompt items:
  - Code review prompts
  - Documentation generation
  - Refactoring assistance

#### DevOps
- Description: `Infrastructure and deployment resources`
- 1 × snippet (Docker / CI/CD config)
- 1 × command (deployment scripts)
- 2 × link (real documentation URLs)

#### Terminal Commands
- Description: `Useful shell commands for everyday development`
- 4 × command items:
  - Git operations
  - Docker commands
  - Process management
  - Package manager utilities

#### Design Resources
- Description: `UI/UX resources and references`
- 4 × link items (real URLs):
  - CSS / Tailwind references
  - Component libraries
  - Design systems
  - Icon libraries

### Rules

- Use `upsert` or `deleteMany` + `createMany` so the script is safe to re-run.
- Hash the password with `bcryptjs` at 12 rounds — never store plain text.
- Use real, working URLs for all link items.
- `EMAIL_ADDRESS` in the spec is a placeholder — use a clearly labelled constant at the top of the seed file (e.g. `const SEED_EMAIL = "faisal@example.com"`) so it is easy to change before running.
- The seed must connect via the `PrismaPg` adapter (same pattern as current `prisma/seed.ts`).
- Run `npx prisma db seed` after implementation to verify against the Neon dev branch.

## Notes

- The Prisma schema may need new models (`ItemType`, `Collection`, `Item`, etc.) — check the schema before writing seed data. If the models don't exist yet, note that as a blocker and do not invent field names.
- If schema changes are required, create a new migration with `npx prisma migrate dev --name <name>` before seeding. Never use `db push`.
- Spec reference: `context/features/seed-spec.md`

---

## History

## History

- 2026-07-02 — **Iteration 01 completed**: Mock Data Foundation. Created `src/lib/mockdata.ts` as the single source of truth for all dashboard display data. Exported 11 data objects (`currentUser`, `employees`, `attendanceRecords`, `absences`, `employeeMonthlySummaries`, `dashboardSummary`, `recentAttendanceEvents`, `lateArrivals`, `missingCheckoutRecords`, `employeeMonthlyCalendar`, `attendancePolicy`) plus TypeScript union types. Added `auditLogs`, `currentEmployeeAttendance`, `currentEmployeeMonthlySummary` during Iteration 02. Branch: `feat/mock-data-foundation`. Spec: `context/features/dashboard-phase1-spec.md`.

- 2026-07-02 — **Iteration 02 completed**: Dashboard UI and Attendance Screens. Built 13 routes (zero TypeScript errors, clean `next build`) using only mock data and Tailwind CSS — no external component libraries. Admin routes: `/admin/dashboard`, `/admin/employees`, `/admin/employees/new`, `/admin/employees/:id`, `/admin/employees/:id/edit`, `/admin/attendance`, `/admin/settings`, `/admin/audit-logs`. Employee routes: `/employee/dashboard`, `/employee/attendance`, `/employee/profile`. Shared components: `StatusBadge`, `EmployeeStatusBadge`, `CalendarDot`, `AdminSideNav`, `EmployeeSideNav`, `MonthlyCalendar`, `CheckInOutPanel`. Branch: `feat/mock-data-foundation`. Spec: `context/features/dashbaord-phase2-spec.md`.

- 2026-07-04 — **Iteration 03 completed**: Production Backend Integration. Replaced all mock data with a real production-ready backend. Added: Prisma v5 schema with 6 models (User, Employee, Department, AttendanceRecord, AttendancePolicy, AuditLog), PostgreSQL persistence, JWT auth in HTTP-only cookies (jose), bcrypt password hashing, RBAC proxy (`src/proxy.ts`), Haversine-based server-side GPS validation, full CRUD API routes, seed script, server actions for employee management and attendance correction, real Prisma queries on all pages with graceful DB-not-connected amber banners. Zero TypeScript errors, clean `npm run build`. Branch: `feat/backend-integration`. Spec: `context/features/dashbaord-phase3-spec.md`.

- 2026-07-04 — **Iteration 04 completed**: Neon PostgreSQL & Prisma 7 Migration. Upgraded Prisma v5 → v7 (ESM-only, driver adapters required, datasource URL moved to `prisma.config.ts`, generator provider renamed, output path now required). Configured Neon PostgreSQL as the database. Added `@prisma/adapter-pg` + `pg` driver, `dotenv` for CLI env loading. Set `"type": "module"` and `target: ES2023` in tsconfig. Created `prisma.config.ts` at project root. Updated all `@prisma/client` imports to generated client path (`@/generated/prisma/client`). Created and applied initial migration (`20260704104508_init`) to Neon dev branch. Seeded: 6 departments, attendance policy, admin account. Added `scripts/test-db.ts` and `npm run db:test` for connection verification — all checks pass. Branch: `feat/neon-prisma7`. Spec: `context/features/database-spec.md`.
