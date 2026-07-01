# Employee Attendance System - MVP Production Build Guide

> File purpose: implementation-level guide for coding agents. Use this together with `project-overview.md`.

---

## 🛠️ Recommended MVP Stack

The coding agent may adapt the stack, but the recommended production-friendly MVP is:

```txt
Frontend: Next.js / React
Backend: Next.js API routes, NestJS, Express, or similar
Database: PostgreSQL
ORM: Prisma
Auth: Secure session cookies or JWT with refresh-token strategy
Validation: Zod or equivalent schema validation
Styling: Tailwind CSS or a component library
Deployment: Vercel/Render/Fly.io/Railway + managed PostgreSQL
```

Hard requirements:

- Use real database persistence.
- Use migrations.
- Use environment variables.
- Use role-based access control.
- Use server-side attendance validation.
- Use no hardcoded dummy employee or attendance data.

---

## 🗄️ Prisma Schema MVP

Create or adapt `prisma/schema.prisma` like this. This schema assumes PostgreSQL.

```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

enum UserRole {
  ADMIN
  MANAGER
  EMPLOYEE
}

enum UserStatus {
  ACTIVE
  INACTIVE
  SUSPENDED
}

enum AttendanceStatus {
  PRESENT
  LATE
  HALF_DAY
  ABSENT
  ON_LEAVE
  MISSING_CHECKOUT
}

enum AttendanceSource {
  WEB
  MOBILE
  ADMIN_CORRECTION
}

enum AuditAction {
  LOGIN
  LOGOUT
  CHECK_IN
  CHECK_OUT
  CHECK_IN_REJECTED
  CHECK_OUT_REJECTED
  CREATE_EMPLOYEE
  UPDATE_EMPLOYEE
  DEACTIVATE_EMPLOYEE
  DELETE_EMPLOYEE
  UPDATE_ATTENDANCE
  UPDATE_ATTENDANCE_POLICY
}

model User {
  id                 String             @id @default(cuid())
  name               String
  email              String             @unique
  passwordHash       String
  role               UserRole           @default(EMPLOYEE)
  status             UserStatus         @default(ACTIVE)
  lastLoginAt        DateTime?
  createdAt          DateTime           @default(now())
  updatedAt          DateTime           @updatedAt

  employee           Employee?
  sessions           Session[]
  auditLogs          AuditLog[]         @relation("ActorAuditLogs")
  corrections        AttendanceRecord[] @relation("AttendanceCorrections")
  managedDepartments Department[]       @relation("DepartmentManager")

  @@index([role, status])
}

model Session {
  id               String    @id @default(cuid())
  userId           String
  refreshTokenHash String
  expiresAt        DateTime
  revokedAt        DateTime?
  createdAt        DateTime  @default(now())

  user             User      @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@index([userId])
  @@index([expiresAt])
}

model Department {
  id        String     @id @default(cuid())
  name      String     @unique
  managerId String?
  createdAt DateTime   @default(now())
  updatedAt DateTime   @updatedAt

  manager   User?      @relation("DepartmentManager", fields: [managerId], references: [id], onDelete: SetNull)
  employees Employee[]

  @@index([managerId])
}

model Employee {
  id           String             @id @default(cuid())
  userId       String             @unique
  employeeCode String             @unique
  phone        String?
  departmentId String?
  jobTitle     String?
  hiredAt      DateTime?
  status       UserStatus         @default(ACTIVE)
  createdAt    DateTime           @default(now())
  updatedAt    DateTime           @updatedAt

  user         User               @relation(fields: [userId], references: [id], onDelete: Cascade)
  department   Department?         @relation(fields: [departmentId], references: [id], onDelete: SetNull)
  attendances  AttendanceRecord[]

  @@index([departmentId, status])
  @@index([employeeCode])
}

model AttendanceRecord {
  id                     String           @id @default(cuid())
  employeeId             String
  date                   DateTime         @db.Date
  checkInAt              DateTime?
  checkOutAt             DateTime?
  totalMinutes           Int?
  status                 AttendanceStatus @default(PRESENT)
  isLate                 Boolean          @default(false)
  lateMinutes            Int              @default(0)

  checkInLatitude        Decimal?         @db.Decimal(10, 7)
  checkInLongitude       Decimal?         @db.Decimal(10, 7)
  checkOutLatitude       Decimal?         @db.Decimal(10, 7)
  checkOutLongitude      Decimal?         @db.Decimal(10, 7)
  checkInAccuracyMeters  Int?
  checkOutAccuracyMeters Int?
  checkInDistanceMeters  Int?
  checkOutDistanceMeters Int?

  source                 AttendanceSource @default(WEB)
  correctedById          String?
  correctionReason       String?
  createdAt              DateTime         @default(now())
  updatedAt              DateTime         @updatedAt

  employee               Employee         @relation(fields: [employeeId], references: [id], onDelete: Cascade)
  correctedBy            User?            @relation("AttendanceCorrections", fields: [correctedById], references: [id], onDelete: SetNull)

  @@unique([employeeId, date])
  @@index([date])
  @@index([status, date])
  @@index([employeeId, date])
  @@index([isLate, date])
}

model AttendancePolicy {
  id                    String   @id @default(cuid())
  officeName            String
  officeLatitude        Decimal  @db.Decimal(10, 7)
  officeLongitude       Decimal  @db.Decimal(10, 7)
  allowedRadiusMeters   Int      @default(200)
  maxAccuracyMeters     Int      @default(100)
  workStartTime         String   // HH:mm in policy timezone, example: 09:00
  timezone              String   @default("Asia/Riyadh")
  minimumFullDayMinutes Int      @default(480)
  minimumHalfDayMinutes Int      @default(240)
  active                Boolean  @default(true)
  createdAt             DateTime @default(now())
  updatedAt             DateTime @updatedAt

  @@index([active])
}

model AuditLog {
  id         String      @id @default(cuid())
  actorId    String?
  action     AuditAction
  targetType String?
  targetId   String?
  metadata   Json?
  ipAddress  String?
  userAgent  String?
  createdAt  DateTime    @default(now())

  actor      User?       @relation("ActorAuditLogs", fields: [actorId], references: [id], onDelete: SetNull)

  @@index([actorId])
  @@index([action])
  @@index([createdAt])
  @@index([targetType, targetId])
}
```

Notes:

- `User` stores login identity.
- `Employee` stores staff profile data.
- Employee email/name should be read from `User` to avoid duplicated identity fields.
- `AttendanceRecord` enforces one attendance record per employee per date.
- `AttendancePolicy` stores office coordinates and work rules.
- `AuditLog` records login, check-in, check-out, admin edits, and rejected attempts.

---

## Entity Relationship Diagram

```mermaid
erDiagram
    USER ||--o| EMPLOYEE : has_profile
    USER ||--o{ SESSION : has_sessions
    USER ||--o{ AUDIT_LOG : creates
    USER ||--o{ ATTENDANCE_RECORD : corrects
    DEPARTMENT ||--o{ EMPLOYEE : contains
    USER ||--o{ DEPARTMENT : manages
    EMPLOYEE ||--o{ ATTENDANCE_RECORD : has_records

    USER {
        string id PK
        string name
        string email UK
        string passwordHash
        enum role
        enum status
    }

    EMPLOYEE {
        string id PK
        string userId UK
        string employeeCode UK
        string phone
        string departmentId FK
        string jobTitle
        enum status
    }

    ATTENDANCE_RECORD {
        string id PK
        string employeeId FK
        date date
        datetime checkInAt
        datetime checkOutAt
        int totalMinutes
        enum status
        boolean isLate
        int lateMinutes
    }

    ATTENDANCE_POLICY {
        string id PK
        decimal officeLatitude
        decimal officeLongitude
        int allowedRadiusMeters
        string workStartTime
        string timezone
        boolean active
    }
```

---

## 🔌 API Contracts

### `POST /api/auth/login`

Request:

```json
{
  "email": "employee@company.com",
  "password": "user-password"
}
```

Response:

```json
{
  "user": {
    "id": "user_id",
    "name": "Employee Name",
    "email": "employee@company.com",
    "role": "EMPLOYEE"
  }
}
```

Rules:

- Reject inactive or suspended users.
- Hash-compare password.
- Create secure session.
- Update `lastLoginAt`.
- Write audit log.

---

### `POST /api/attendance/check-in`

Request:

```json
{
  "latitude": 24.0000000,
  "longitude": 46.0000000,
  "accuracyMeters": 35
}
```

Success response:

```json
{
  "attendanceId": "attendance_id",
  "status": "PRESENT",
  "checkInAt": "2026-07-01T06:05:00.000Z",
  "distanceMeters": 73,
  "isLate": false,
  "lateMinutes": 0
}
```

Error response:

```json
{
  "error": "OUTSIDE_ALLOWED_RADIUS",
  "message": "You are outside the allowed attendance area. Move within the office radius and try again."
}
```

Rules:

- Employee role only.
- Employee must be active.
- Backend uses server time.
- Backend calculates distance.
- Reject if outside radius.
- Reject or flag if accuracy is worse than policy `maxAccuracyMeters`.
- Prevent duplicate check-ins for the same date.
- Mark late if check-in is after policy work start time.
- Write audit log for success or rejection.

---

### `POST /api/attendance/check-out`

Request:

```json
{
  "latitude": 24.0000000,
  "longitude": 46.0000000,
  "accuracyMeters": 40
}
```

Rules:

- Must have a check-in record for today.
- Must not already have `checkOutAt`.
- Must pass location validation.
- Calculate `totalMinutes` from server timestamps.
- Set status using attendance policy thresholds.
- Write audit log.

Status calculation example:

```txt
If checkOutAt is null -> MISSING_CHECKOUT
If totalMinutes >= minimumFullDayMinutes and isLate false -> PRESENT
If totalMinutes >= minimumFullDayMinutes and isLate true -> LATE
If totalMinutes >= minimumHalfDayMinutes and < minimumFullDayMinutes -> HALF_DAY
If no record for a workday -> ABSENT in reporting layer
```

---

### `GET /api/admin/attendance`

Query parameters:

```txt
employeeId
employeeCode
departmentId
fromDate
toDate
month
status
lateOnly
missingCheckoutOnly
page
limit
```

Response should be paginated:

```json
{
  "items": [],
  "page": 1,
  "limit": 20,
  "total": 0
}
```

Rules:

- Admin/manager only.
- Managers may be scoped to their department.
- Use database filtering and pagination.
- Do not fetch all records and filter in memory.

---

## Geolocation Distance Utility

Use the Haversine formula on the backend.

```ts
export function getDistanceMeters(input: {
  fromLat: number;
  fromLng: number;
  toLat: number;
  toLng: number;
}): number {
  const earthRadiusMeters = 6371000;

  const toRad = (value: number) => (value * Math.PI) / 180;

  const dLat = toRad(input.toLat - input.fromLat);
  const dLng = toRad(input.toLng - input.fromLng);

  const lat1 = toRad(input.fromLat);
  const lat2 = toRad(input.toLat);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1) * Math.cos(lat2) *
      Math.sin(dLng / 2) * Math.sin(dLng / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return Math.round(earthRadiusMeters * c);
}
```

Backend validation pattern:

```ts
if (accuracyMeters > policy.maxAccuracyMeters) {
  throw new Error("LOCATION_ACCURACY_TOO_LOW");
}

const distanceMeters = getDistanceMeters({
  fromLat: Number(policy.officeLatitude),
  fromLng: Number(policy.officeLongitude),
  toLat: body.latitude,
  toLng: body.longitude,
});

if (distanceMeters > policy.allowedRadiusMeters) {
  throw new Error("OUTSIDE_ALLOWED_RADIUS");
}
```

---

## Attendance Service Logic

### Check In

```txt
1. Require authenticated employee.
2. Load employee profile.
3. Confirm employee is ACTIVE.
4. Load active AttendancePolicy.
5. Validate latitude, longitude, and accuracy.
6. Calculate distance from office.
7. Reject if outside radius.
8. Get current server time in policy timezone.
9. Calculate attendance date.
10. Find existing record by employeeId + date.
11. If checked in already, reject duplicate check-in.
12. Calculate lateness from workStartTime.
13. Create attendance record.
14. Write audit log.
15. Return attendance summary.
```

### Check Out

```txt
1. Require authenticated employee.
2. Load today's attendance record.
3. Reject if no check-in exists.
4. Reject if already checked out.
5. Validate location again.
6. Use current server time as checkOutAt.
7. Calculate totalMinutes.
8. Recalculate status.
9. Update attendance record.
10. Write audit log.
11. Return updated attendance summary.
```

### Admin Correction

```txt
1. Require ADMIN role, or manager if allowed.
2. Validate corrected fields.
3. Require correctionReason.
4. Recalculate totalMinutes, isLate, lateMinutes, and status.
5. Set source = ADMIN_CORRECTION.
6. Set correctedById = current user.
7. Write audit log with old and new values.
```

---

## Status and Lateness Rules

Inputs from `AttendancePolicy`:

```txt
workStartTime = HH:mm
minimumFullDayMinutes = 480
minimumHalfDayMinutes = 240
allowedRadiusMeters = 200
maxAccuracyMeters = 100
timezone = Asia/Riyadh
```

Recommended logic:

```txt
lateMinutes = max(0, checkInAt - workStartTime)
isLate = lateMinutes > 0
```

Status when check-in exists:

```txt
No checkOutAt -> MISSING_CHECKOUT
With checkOutAt and totalMinutes < minimumHalfDayMinutes -> HALF_DAY
With checkOutAt and totalMinutes >= minimumHalfDayMinutes but < minimumFullDayMinutes -> HALF_DAY
With checkOutAt and totalMinutes >= minimumFullDayMinutes and isLate -> LATE
With checkOutAt and totalMinutes >= minimumFullDayMinutes and not late -> PRESENT
```

Absence is usually calculated in reporting rather than stored for every employee every day:

```txt
If employee is active, the date is a required working day, and no attendance record exists -> ABSENT
```

---

## Frontend UX Requirements

### Employee Dashboard

Show:

- User name.
- Today's date.
- Current attendance status.
- Check-in button if not checked in.
- Check-out button if checked in but not checked out.
- Check-in/check-out timestamps.
- Total worked time.
- Location permission status.
- Error messages for denied location, low accuracy, or outside radius.
- Link to monthly attendance view.

### Admin Dashboard

Show:

- Summary cards.
- Filtered attendance table.
- Late arrivals.
- Missing checkout employees.
- Employee search.
- Department filter.
- Month/date filter.

### Employee Profile for Admin

Show:

- Name and email from User.
- Employee code.
- Phone.
- Department.
- Job title.
- Status.
- Monthly calendar.
- Attendance table.
- Manual correction button if admin.

---

## Monthly Calendar Data Shape

Recommended endpoint:

```txt
GET /api/admin/employees/:id/calendar?month=2026-07
```

Response:

```json
{
  "employee": {
    "id": "employee_id",
    "name": "Employee Name",
    "email": "employee@company.com",
    "employeeCode": "EMP-001"
  },
  "month": "2026-07",
  "summary": {
    "presentDays": 0,
    "lateDays": 0,
    "absentDays": 0,
    "halfDays": 0,
    "missingCheckoutDays": 0,
    "totalMinutes": 0
  },
  "days": [
    {
      "date": "2026-07-01",
      "status": "PRESENT",
      "checkInAt": "2026-07-01T06:00:00.000Z",
      "checkOutAt": "2026-07-01T14:00:00.000Z",
      "totalMinutes": 480,
      "isLate": false,
      "lateMinutes": 0
    }
  ]
}
```

---

## Validation Rules

Use schema validation for all request bodies.

### Login

```txt
email: valid email
password: required string
```

### Check In / Check Out

```txt
latitude: number between -90 and 90
longitude: number between -180 and 180
accuracyMeters: positive integer, recommended <= maxAccuracyMeters
```

### Employee Create

```txt
name: required
email: valid email and unique
password: required or invite flow
employeeCode: unique
phone: optional
departmentId: optional
jobTitle: optional
status: ACTIVE | INACTIVE | SUSPENDED
```

### Attendance Correction

```txt
checkInAt: optional datetime
checkOutAt: optional datetime, must be after checkInAt
status: valid status
correctionReason: required, minimum length 10
```

---

## Security Checklist

- Hash passwords using a strong algorithm such as Argon2id or bcrypt.
- Use HTTPS in production.
- Use secure, HTTP-only cookies for sessions where possible.
- Validate roles on every protected API route.
- Use CSRF protection if using cookie sessions.
- Rate-limit login attempts.
- Do not trust frontend timestamps.
- Do not trust frontend distance calculations.
- Store secrets in environment variables.
- Add audit logs for admin edits and rejected attendance attempts.
- Sanitize and validate all inputs.
- Use pagination for admin lists.
- Do not expose password hashes or internal session tokens.

---

## Environment Variables

Example `.env.example`:

```bash
DATABASE_URL="postgresql://USER:PASSWORD@HOST:PORT/DATABASE?schema=public"
SESSION_SECRET="replace-with-a-long-random-secret"
APP_URL="http://localhost:3000"
```

Do not commit real `.env` values.

---

## Database Migration Commands

Example Prisma commands:

```bash
npx prisma format
npx prisma migrate dev --name init_employee_attendance_mvp
npx prisma generate
```

For production:

```bash
npx prisma migrate deploy
```

---

## Seed Policy

Do not seed fake attendance data.

Allowed seed data:

- First admin user through a secure script.
- Default attendance policy only if provided by environment variables or explicit setup form.
- Optional departments if the real company provides them.

Not allowed:

- Fake employees.
- Fake attendance records.
- Fake dashboard metrics.

Recommended first-run behavior:

1. If no admin exists, show a protected setup flow or run a one-time admin creation script.
2. If no attendance policy exists, require admin to create one before employees can check in.

---

## Testing Plan

### Unit Tests

Test:

- Haversine distance calculation.
- Lateness calculation.
- Total working minutes.
- Status calculation.
- Authorization helper.
- Validation schemas.

### Integration Tests

Test:

- Login success and failure.
- Employee check-in inside radius.
- Employee check-in outside radius.
- Duplicate check-in rejection.
- Check-out without check-in rejection.
- Admin attendance correction.
- Manager/admin route protection.

### Manual QA Scenarios

```txt
1. Admin creates employee.
2. Employee logs in.
3. Employee denies location permission.
4. Employee attempts check-in outside 200m.
5. Employee checks in inside 200m.
6. Employee checks out inside 200m.
7. Admin views dashboard cards.
8. Admin filters by late-only.
9. Admin opens employee monthly calendar.
10. Admin corrects attendance with reason.
```

---

## Implementation Order for Coding Agent

Build in this order:

1. Project setup and environment variables.
2. Prisma schema and migrations.
3. Authentication and session management.
4. RBAC middleware.
5. Admin employee CRUD.
6. Attendance policy CRUD.
7. Employee check-in/check-out API.
8. Attendance service with location validation.
9. Employee dashboard.
10. Admin dashboard summary.
11. Attendance table with filters and pagination.
12. Employee profile and monthly calendar.
13. Admin correction flow.
14. Audit logs.
15. Tests and production hardening.

---

## Suggested Folder Structure

```txt
src/
  app/
    login/
    employee/
      dashboard/
      attendance/
      profile/
    admin/
      dashboard/
      employees/
      attendance/
      settings/
      audit-logs/
    api/
      auth/
      attendance/
      admin/
  components/
    attendance/
    dashboard/
    employees/
    ui/
  lib/
    auth/
    db/
    geo/
    rbac/
    validation/
  services/
    attendance.service.ts
    employee.service.ts
    policy.service.ts
    audit-log.service.ts
  types/
prisma/
  schema.prisma
  migrations/
```

---

## Coding Agent Guardrails

When generating code:

- Do not hardcode office coordinates in business logic.
- Store office coordinates in `AttendancePolicy`.
- Do not use local browser time as source of truth.
- Do not allow attendance without active policy.
- Do not allow inactive users to check in.
- Do not allow duplicate attendance per employee per date.
- Do not return password hashes in API responses.
- Do not skip backend authorization because the UI hides a button.
- Do not create fake data in components.
- Use reusable services for attendance calculations.
- Keep Prisma queries paginated and indexed.

---

## Definition of Done

The MVP is done only when all of these are true:

- Database schema exists and migrations run successfully.
- Admin can create and manage real employees.
- Employee can log in using real credentials.
- Employee check-in and check-out are persisted.
- Backend enforces the 200-meter radius rule.
- Dashboard metrics come from database queries.
- Monthly calendar is generated from real attendance records.
- Admin can filter attendance records.
- Admin can correct attendance with audit log.
- Role-based access is enforced server-side.
- Tests cover attendance calculations and main API flows.
- No dummy dashboard or attendance data remains.

---

## Reference Links

- Prisma schema documentation: https://www.prisma.io/docs/orm/prisma-schema/overview
- MDN Geolocation API: https://developer.mozilla.org/en-US/docs/Web/API/Geolocation_API
- OWASP Authentication Cheat Sheet: https://cheatsheetseries.owasp.org/cheatsheets/Authentication_Cheat_Sheet.html
- OWASP Password Storage Cheat Sheet: https://cheatsheetseries.owasp.org/cheatsheets/Password_Storage_Cheat_Sheet.html
- PostgreSQL documentation: https://www.postgresql.org/docs/current/