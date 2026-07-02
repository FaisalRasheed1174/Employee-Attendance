# Iteration 03 — Production Backend Integration

## Purpose

This iteration replaces temporary mock-data usage with real production-ready backend behavior.

The project must become a real Employee Attendance System with:

* Authentication.
* Role-based authorization.
* PostgreSQL persistence.
* Prisma models and migrations.
* Server-side attendance timestamps.
* Backend location validation.
* Attendance records.
* Employee management.
* Attendance policy settings.
* Audit logs.

The MVP must not remain a demo.

---

## Important Rule

The mock data from `src/lib/mockdata.ts` is temporary.

It is allowed only until the real database and APIs are implemented.

Once backend integration begins:

* Do not keep dashboard data hardcoded.
* Do not calculate attendance from frontend-only arrays.
* Do not trust the frontend for attendance validity.
* Do not allow employees to modify check-in or check-out timestamps.
* Do not allow employees to access admin data.

---

## Database Requirements

Use PostgreSQL with Prisma.

Core models:

```txt
User
Employee
Department
AttendanceRecord
AttendancePolicy
AuditLog
```

---

## User Model

User represents authentication identity.

Fields:

```txt
id
name
email
passwordHash
role
status
lastLoginAt
createdAt
updatedAt
```

Roles:

```txt
ADMIN
MANAGER
EMPLOYEE
```

Statuses:

```txt
ACTIVE
INACTIVE
SUSPENDED
```

Passwords must be stored only as hashes.

Never store plain-text passwords.

---

## Employee Model

Employee represents the staff profile connected to a user.

Fields:

```txt
id
userId
employeeCode
phone
departmentId
jobTitle
hiredAt
status
createdAt
updatedAt
```

Employee status should control whether the user can mark attendance.

Inactive or suspended employees must not be allowed to check in.

---

## Attendance Record Model

AttendanceRecord represents one employee’s attendance for one date.

Fields:

```txt
id
employeeId
date
checkInAt
checkOutAt
totalMinutes
status
isLate
lateMinutes
checkInLatitude
checkInLongitude
checkOutLatitude
checkOutLongitude
checkInDistanceMeters
checkOutDistanceMeters
source
correctedById
correctionReason
createdAt
updatedAt
```

Important database rule:

There must not be duplicate attendance records for the same employee and date.

Add a unique constraint for:

```txt
employeeId + date
```

Add indexes for:

```txt
employeeId
date
status
isLate
```

---

## Attendance Policy Model

AttendancePolicy stores system-wide attendance rules.

Fields:

```txt
id
officeName
officeLatitude
officeLongitude
allowedRadiusMeters
workStartTime
timezone
minimumFullDayMinutes
minimumHalfDayMinutes
active
createdAt
updatedAt
```

Default MVP policy:

```txt
Allowed radius: 200 meters
Location source: Browser Geolocation API
Validation location: Backend server
Timestamp source: Backend server
```

Only one active attendance policy should be used by attendance validation.

---

## Audit Log Model

AuditLog tracks sensitive actions.

Fields:

```txt
id
actorId
action
targetType
targetId
metadata
ipAddress
userAgent
createdAt
```

Audit logs must be created for:

* Employee created.
* Employee updated.
* Employee deactivated.
* Employee deleted.
* Attendance check-in attempt.
* Attendance check-out attempt.
* Failed location validation.
* Admin attendance correction.
* Attendance policy update.
* Unauthorized access attempt where appropriate.

---

## Authentication Requirements

Implement real authentication.

Recommended behavior:

* Use secure password hashing.
* Use HTTP-only cookies or secure sessions.
* Protect all employee, manager, and admin routes.
* Redirect users based on role after login.
* Store passwords only as hashes.
* Never expose password hashes to the frontend.

Required auth routes:

```txt
POST /api/auth/login
POST /api/auth/logout
GET  /api/auth/me
```

---

## Authorization Requirements

Authorization must be enforced on the backend.

Do not rely only on hiding UI buttons.

Rules:

| Route Area                 | Employee |          Manager | Admin |
| -------------------------- | -------: | ---------------: | ----: |
| Employee self dashboard    |      Yes |               No |    No |
| Own attendance history     |      Yes |               No |    No |
| Admin dashboard            |       No |              Yes |   Yes |
| Employee management        |       No | Limited/Optional |   Yes |
| Attendance correction      |       No |         Optional |   Yes |
| Attendance policy settings |       No |               No |   Yes |

Employees must not:

* Access admin pages.
* View other employees.
* Edit attendance records.
* Mark attendance outside the allowed location radius.
* Modify check-in/check-out timestamps.

Admins can:

* Manage all employees.
* View all attendance records.
* Correct attendance records with a required reason.
* Configure attendance policy.
* View audit logs.

Managers can:

* View employee attendance.
* Filter attendance.
* Open employee profile pages.
* View monthly calendars.
* Optionally be limited to their department.

---

## Location-Based Attendance Validation

Employees can check in or check out only inside the approved office radius.

Frontend may request browser GPS, but the backend must decide if attendance is valid.

Frontend sends:

```json
{
  "latitude": 24.0000000,
  "longitude": 46.0000000,
  "accuracyMeters": 35
}
```

Backend must:

1. Load the active attendance policy.
2. Calculate distance from office coordinates.
3. Reject if distance is greater than the allowed radius.
4. Reject or flag if GPS accuracy is too poor.
5. Use server time for check-in/check-out.
6. Create or update attendance record.
7. Write an audit log.

User-facing error:

```txt
You are outside the allowed attendance area. Move within the office radius and try again.
```

Never trust the frontend to calculate distance or approve attendance.

---

## Attendance Logic

Check-in behavior:

* Employee must be active.
* Attendance policy must be active.
* Location must be inside allowed radius.
* GPS accuracy must be acceptable.
* Server time must be used.
* If employee already checked in today, reject duplicate check-in.
* Create today’s attendance record.
* Calculate whether employee is late.
* Write audit log.

Check-out behavior:

* Employee must be active.
* Attendance policy must be active.
* Location must be inside allowed radius.
* Employee must already have checked in today.
* Employee must not already have checked out.
* Server time must be used.
* Calculate total minutes.
* Determine final status.
* Write audit log.

Attendance statuses:

```txt
PRESENT
LATE
HALF_DAY
ABSENT
ON_LEAVE
MISSING_CHECKOUT
```

---

## Required API Routes

### Employee Attendance

```txt
GET  /api/employee/attendance?month=YYYY-MM
POST /api/attendance/check-in
POST /api/attendance/check-out
```

### Admin

```txt
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

---

## Admin Dashboard Data

The admin dashboard must use database data, not mock arrays.

Dashboard summary must include:

```txt
totalActiveEmployees
presentToday
lateToday
absentToday
missingCheckoutToday
averageWorkingHours
```

Dashboard sections must include:

* Recent attendance events.
* Late arrivals list.
* Missing checkout list.
* Employee attendance table.
* Filters for employee, department, date, month, status, and late-only.

---

## Admin Attendance Correction

Admins can correct attendance records.

Requirements:

* Correction reason is required.
* Store `correctedById`.
* Store `correctionReason`.
* Update attendance values.
* Recalculate total minutes and status if needed.
* Write audit log.

Correction screens should show:

* Original check-in/check-out values.
* Updated values.
* Required correction reason.
* Who made the correction.
* When correction happened.

---

## Monthly Attendance Calendar

Each employee profile must include a monthly attendance calendar.

Calendar should show:

* Present days.
* Late days.
* Absent days.
* Half days.
* Leave days.
* Missing checkout days.
* Total worked hours.

Suggested route:

```txt
/admin/employees/:employeeId?month=YYYY-MM
```

The calendar must be generated from real attendance records.

---

## Edge Cases

Handle:

* Employee denies location permission.
* Browser returns low-accuracy GPS.
* Employee tries to check in twice.
* Employee checks in but forgets to check out.
* Employee checks out without checking in.
* Admin corrects a record after review.
* Employee is inactive or suspended.
* Attendance policy is missing or inactive.
* Timezone differences between server and business location.
* User tries to call admin APIs as an employee.
* Duplicate attendance records for the same employee and date.

---

## Production Rules

Follow these rules strictly:

1. Do not use dummy attendance arrays after backend integration.
2. Persist all employee and attendance data in PostgreSQL.
3. Use Prisma models and migrations.
4. Use server timestamps for attendance.
5. Validate location on the backend.
6. Use role-based authorization middleware.
7. Use input validation for every request.
8. Add database indexes for filters.
9. Add audit logs for admin edits and attendance attempts.
10. Do not allow duplicate attendance records for the same employee and date.
11. Store secrets only in environment variables.
12. Do not commit `.env` files.
13. Add meaningful empty states and error messages.
14. Keep admin and employee UI flows separate.

---

## Out of MVP

Do not implement these in this iteration:

* Payroll.
* Face recognition.
* QR check-in.
* Mobile app.
* Multi-office support.
* Leave approval workflow.
* Biometric verification.
* Advanced device attestation.

Database and service architecture may allow these later, but they should not be built now.

---

## Acceptance Criteria

This iteration is complete when:

* Admin can create a real employee account.
* Employee can log in.
* Employee can check in only inside the allowed radius.
* Employee can check out.
* Total worked hours are calculated.
* Admin can see attendance records from the database.
* Admin can filter by employee, date, month, status, late-only, and missing checkout.
* Admin can open an employee profile and view a monthly calendar.
* Attendance data survives refresh and deployment.
* Authentication is real.
* Authorization is enforced on the backend.
* Location validation happens on the backend.
* Audit logging is implemented.
* Mock data is no longer the source of production dashboard data.
