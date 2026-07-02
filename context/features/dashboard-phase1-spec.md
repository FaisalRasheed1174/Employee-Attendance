# Iteration 01 — Mock Data Foundation

## Purpose

This iteration creates a single source of truth for temporary mock data used by the Employee Attendance System UI.

The real database is not implemented yet, so the UI needs clean, consistent, TypeScript-friendly mock data that matches the final product domain.

The mock data must support:

* Admin dashboard.
* Manager dashboard.
* Employee dashboard.
* Employee attendance profile.
* Attendance tables.
* Monthly attendance calendar.
* Recent attendance events.
* Late arrivals.
* Missing checkouts.
* Absence summaries.
* Attendance policy display.

This iteration is only for static display data.

Do not build helper functions, fake APIs, service logic, calculations, Prisma schema, backend routes, or React components in this iteration.

---

## Required File

Create this file:

```txt
src/lib/mockdata.ts
```

This file must become the only source of temporary mock data for the dashboard UI.

Do not keep mock arrays inside components.

Do not create separate scattered mock files.

Do not hardcode dashboard values directly inside UI components.

---

## Product Context

This project is an Employee Attendance System.

It is not:

* A SaaS collections dashboard.
* A marketing asset platform.
* A CRM.
* A sales analytics dashboard.
* A campaign dashboard.
* A design-system showcase.
* A revenue analytics product.
* A finance dashboard.

All mock data must support attendance, employees, roles, check-in/check-out, absences, working hours, status badges, and admin/manager reporting.

---

## Current User Mock Data

Create a `currentUser` object.

Default current user should be an admin so the admin dashboard can display all data.

Fields:

```ts
id
name
email
role
status
employeeId
avatarUrl
```

Allowed roles:

```ts
"ADMIN"
"MANAGER"
"EMPLOYEE"
```

Allowed statuses:

```ts
"ACTIVE"
"INACTIVE"
"SUSPENDED"
```

Example intent:

```ts
export const currentUser = {
  id: "user-admin-001",
  name: "Aisha Rahman",
  email: "aisha.rahman@company.com",
  role: "ADMIN",
  status: "ACTIVE",
  employeeId: "emp-001",
  avatarUrl: "/avatars/aisha.png",
}
```

The final structure can differ slightly, but it must be clean and consistent.

---

## Employees Mock Data

Create an `employees` array.

Each employee should include:

```ts
id
userId
employeeCode
name
email
phone
department
jobTitle
status
hiredAt
avatarUrl
```

Use realistic departments:

```ts
Engineering
HR
Finance
Operations
Sales
Support
```

Use mixed statuses:

```ts
ACTIVE
INACTIVE
SUSPENDED
```

Requirements:

* Include at least 8–12 employees.
* Include at least one admin.
* Include at least one manager.
* Include several normal employees.
* Include active, inactive, and suspended examples.
* Every attendance record should reference an employee from this array.
* Use stable IDs such as `emp-001`, `emp-002`, etc.

---

## Attendance Records Mock Data

Create an `attendanceRecords` array.

Each record should represent one employee attendance record for one date.

Fields:

```ts
id
employeeId
employeeName
department
date
checkInAt
checkOutAt
totalMinutes
status
isLate
lateMinutes
source
checkInDistanceMeters
checkOutDistanceMeters
```

Allowed attendance statuses:

```ts
PRESENT
LATE
HALF_DAY
ABSENT
ON_LEAVE
MISSING_CHECKOUT
```

Allowed source values:

```ts
WEB
ADMIN_CORRECTION
SYSTEM
```

Requirements:

* Include records for the current month.
* Include multiple employees.
* Include present records.
* Include late records.
* Include absent records.
* Include half-day records.
* Include on-leave records.
* Include missing-checkout records.
* Use ISO-style date strings.
* Use realistic check-in/check-out times.
* Use `null` for check-out when the status is `MISSING_CHECKOUT` or `ABSENT`.
* Use `totalMinutes: 0` for absent records.
* Use realistic distance values inside the 200-meter radius for accepted records.

---

## Absences Mock Data

Create an `absences` array.

Fields:

```ts
id
employeeId
employeeName
department
date
status
reason
```

Allowed absence statuses:

```ts
ABSENT
ON_LEAVE
UNEXCUSED
```

Requirements:

* Include both approved leave and unexcused absence examples.
* Match employee IDs from the `employees` array.
* Use realistic reasons such as sick leave, personal leave, no check-in, or emergency leave.

---

## Employee Monthly Summaries

Create an `employeeMonthlySummaries` array.

Fields:

```ts
employeeId
employeeName
department
month
presentDays
lateDays
absentDays
halfDays
leaveDays
missingCheckoutDays
totalWorkedMinutes
averageWorkedMinutes
```

Requirements:

* Include one summary per employee.
* Use the same month as the attendance records.
* Data should be realistic enough for dashboard cards and employee profile pages.
* The values do not need to be calculated by code in this file.
* Do not add helper functions to compute these values.
* Enter static values manually.

---

## Dashboard Summary

Create a `dashboardSummary` object.

Fields:

```ts
totalActiveEmployees
presentToday
lateToday
absentToday
missingCheckoutToday
averageWorkingHours
```

Requirements:

* Values should look consistent with the mock attendance records.
* This object will power the admin dashboard cards.
* Do not calculate these values inside this file.
* Do not create helper functions.

---

## Recent Attendance Events

Create a `recentAttendanceEvents` array.

Fields:

```ts
id
employeeId
employeeName
department
type
timestamp
status
message
```

Allowed event types:

```ts
CHECK_IN
CHECK_OUT
LATE_CHECK_IN
MISSING_CHECKOUT
ADMIN_CORRECTION
REJECTED_LOCATION
```

Requirements:

* Include 8–12 events.
* Include normal check-ins.
* Include check-outs.
* Include late check-ins.
* Include at least one missing checkout event.
* Include at least one rejected location event.
* Include at least one admin correction event.

---

## Late Arrivals

Create a `lateArrivals` array.

Fields:

```ts
id
employeeId
employeeName
department
date
checkInAt
lateMinutes
```

Requirements:

* Include employees who checked in after work start time.
* This data will power the late arrivals section on the admin dashboard.

---

## Missing Checkout Records

Create a `missingCheckoutRecords` array.

Fields:

```ts
id
employeeId
employeeName
department
date
checkInAt
status
```

Requirements:

* Include employees who checked in but did not check out.
* Status should usually be `MISSING_CHECKOUT`.
* This data will power the missing checkout section on the admin dashboard.

---

## Employee Monthly Calendar

Create an `employeeMonthlyCalendar` array.

Each item should represent one employee’s attendance state for one calendar date.

Fields:

```ts
employeeId
date
status
checkInAt
checkOutAt
totalMinutes
isLate
lateMinutes
```

Requirements:

* Include enough records to display a month grid.
* Include present, late, absent, half-day, on-leave, and missing-checkout examples.
* The UI should be able to filter this array by employee ID and month.
* Do not create filtering functions in this file.

---

## Attendance Policy

Create an `attendancePolicy` object.

Fields:

```ts
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
```

Requirements:

* Use a 200-meter allowed radius.
* Use a realistic office location.
* Use a realistic timezone.
* Use a normal work start time such as `09:00`.
* Set `active` to `true`.

---

## Export Requirements

Export every data object directly.

Use this style:

```ts
export const currentUser = ...
export const employees = ...
export const attendanceRecords = ...
export const absences = ...
export const employeeMonthlySummaries = ...
export const dashboardSummary = ...
export const recentAttendanceEvents = ...
export const lateArrivals = ...
export const missingCheckoutRecords = ...
export const employeeMonthlyCalendar = ...
export const attendancePolicy = ...
```

Optional: Add TypeScript union types for statuses and roles if helpful.

Allowed:

```ts
export type UserRole = "ADMIN" | "MANAGER" | "EMPLOYEE"
export type AttendanceStatus = "PRESENT" | "LATE" | "HALF_DAY" | "ABSENT" | "ON_LEAVE" | "MISSING_CHECKOUT"
```

Not allowed:

* Helper functions.
* Computed selectors.
* Fake API functions.
* React components.
* Database calls.
* Prisma models.
* Local storage logic.
* Zustand/Redux stores.
* Random data generators.
* Date utility functions.

---

## Acceptance Criteria

This iteration is complete when:

* `src/lib/mockdata.ts` exists.
* All dashboard mock data is centralized in that file.
* Data matches the Employee Attendance System domain.
* Admin UI can import all employee and attendance data.
* Employee UI can later filter data by `currentUser.employeeId`.
* No unrelated SaaS, marketing, CRM, sales, finance, campaign, or collections data exists.
* No helper functions or fake APIs were created.
