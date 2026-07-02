# Iteration 02 — Dashboard UI and Attendance Screens

## Purpose

This iteration builds or refactors the UI using the mock data from:

```txt
src/lib/mockdata.ts
```

The goal is to create an attendance-first dashboard experience for admins, managers, and employees.

The UI must look like a professional internal HR, operations, and workforce management tool.

It must not look like:

* A SaaS marketing dashboard.
* A collections dashboard.
* A CRM.
* A campaign dashboard.
* A revenue analytics dashboard.
* A design-system showcase.
* A landing page.
* A generic admin template with unrelated metrics.

---

## Required UI Direction

Every UI component must support the Employee Attendance System.

The dashboard should help users answer:

* Who is present today?
* Who is late today?
* Who is absent today?
* Who has not checked out?
* Which attendance records need review?
* How many hours did employees work?
* Which employees have incomplete records?
* What is the monthly attendance status for each employee?

Do not show unrelated cards such as:

* Revenue.
* Collections.
* Campaigns.
* Leads.
* Subscribers.
* Invoices.
* Marketing assets.
* Conversion rates.
* Sales pipeline.
* Generic growth metrics.

---

## Role-Based UI

The UI must support three role experiences.

### Employee UI

Employee dashboard should focus on:

* Check in.
* Check out.
* Today’s attendance status.
* Location permission state.
* Check-in time.
* Check-out time.
* Total worked hours.
* Monthly personal attendance history.
* Personal attendance calendar.

Employees should not see:

* Other employees.
* Admin dashboard.
* Admin correction actions.
* Audit logs.
* Attendance policy settings.
* Employee management pages.

### Manager UI

Manager dashboard should focus on:

* Team attendance visibility.
* Department-level filters.
* Late arrivals.
* Missing checkout records.
* Employee attendance profiles.
* Monthly calendars for employees.

Managers may have limited access to employees in their department.

### Admin UI

Admin dashboard should focus on:

* Full employee management.
* System-wide attendance overview.
* Attendance policy settings.
* Attendance corrections.
* Audit logs.
* Employee attendance filters.
* Monthly attendance review.

Admin, manager, and employee flows must remain visually and functionally separate.

---

## Admin Dashboard Requirements

Build or refactor the admin dashboard route:

```txt
/admin/dashboard
```

The admin dashboard should use mock data from `src/lib/mockdata.ts`.

Dashboard cards:

* Total active employees.
* Present today.
* Late today.
* Absent today.
* Missing check-out today.
* Average working hours.

Dashboard sections:

* Recent attendance events.
* Late arrivals list.
* Missing checkout list.
* Employee attendance table.
* Attendance filters.

Filters should support UI controls for:

* Employee.
* Department.
* Date.
* Month.
* Status.
* Late only.
* Missing checkout only.

The filters can be visual-only in this iteration if filtering behavior is not implemented yet, but the layout should be ready for real filtering.

---

## Attendance Table Requirements

Create an attendance table that displays:

```txt
Employee name
Department
Date
Check-in time
Check-out time
Total worked hours
Status
Late minutes
Source
Actions
```

Actions may include:

* View details.
* Correct record.

Correction action can be disabled, placeholder, or open a simple modal in this iteration.

Do not implement backend correction logic yet.

---

## Status Badge System

Use consistent badges for attendance statuses:

```txt
PRESENT
LATE
HALF_DAY
ABSENT
ON_LEAVE
MISSING_CHECKOUT
```

Status badges must appear consistently in:

* Dashboard cards.
* Attendance tables.
* Employee profile pages.
* Monthly calendar.
* Recent events.
* Late arrivals.
* Missing checkout sections.
* Filters.

The user should understand attendance state quickly without opening extra details.

Use calm, professional colors.

Avoid flashy gradients or marketing visuals.

---

## Employee Profile Page

Build or prepare the route:

```txt
/admin/employees/:employeeId
```

The employee profile page should show:

* Employee details.
* Department.
* Job title.
* Status.
* Selected month.
* Monthly calendar grid.
* Attendance records table.
* Present days.
* Late days.
* Absent days.
* Half days.
* Leave days.
* Missing checkout days.
* Total worked hours.

Use data from:

```txt
employees
attendanceRecords
employeeMonthlySummaries
employeeMonthlyCalendar
```

The monthly calendar should make attendance status easy to scan.

Each calendar day should show a status badge or visual indicator.

---

## Employee Dashboard

Build or prepare:

```txt
/employee/dashboard
/employee/attendance
/employee/profile
```

The employee dashboard should show only the current employee’s data.

Use:

```txt
currentUser.employeeId
```

The employee dashboard should include:

* Today’s attendance status.
* Check In button.
* Check Out button.
* Check-in time.
* Check-out time.
* Total worked time.
* Location permission status.
* Monthly summary.
* Personal attendance history.
* Monthly attendance calendar.

Check-in/check-out buttons can be UI-only in this iteration.

Do not implement real geolocation logic yet unless it already exists.

---

## Location Feedback UI

The UI should be ready to show location validation messages.

Use user-friendly messages:

```txt
Allow location access to check in.
Your GPS accuracy is too low. Move near a window or try again.
You are outside the allowed attendance area. Move within the office radius and try again.
Attendance policy is not active. Contact an admin.
```

Do not show technical distance calculations as the main message.

Technical values can be secondary details if needed.

---

## Admin Attendance Page

Build or prepare:

```txt
/admin/attendance
```

This page should focus on attendance records and filters.

It should include:

* Full attendance records table.
* Employee filter.
* Department filter.
* Date range filter.
* Month filter.
* Status filter.
* Late-only filter.
* Missing-checkout-only filter.
* Admin correction action placeholder.

---

## Employee Management Pages

Build or prepare:

```txt
/admin/employees
/admin/employees/new
/admin/employees/:id
/admin/employees/:id/edit
```

Employee list should show:

* Employee code.
* Name.
* Email.
* Department.
* Job title.
* Status.
* Hired date.
* Actions.

Actions may include:

* View profile.
* Edit.
* Deactivate.
* Delete.

In this iteration, actions may be UI-only.

Do not implement database writes yet.

---

## Attendance Policy Settings Page

Build or prepare:

```txt
/admin/settings
```

This page should display:

* Office name.
* Office latitude.
* Office longitude.
* Allowed radius in meters.
* Work start time.
* Timezone.
* Minimum full-day minutes.
* Minimum half-day minutes.
* Active policy flag.

Use the mock `attendancePolicy` object.

Editing can be disabled or UI-only in this iteration.

---

## Audit Logs Page

Build or prepare:

```txt
/admin/audit-logs
```

If audit log mock data does not exist yet, add it to `src/lib/mockdata.ts` or create a simple placeholder section.

Audit logs should eventually show:

* Actor.
* Action.
* Target type.
* Target ID.
* Metadata.
* IP address.
* User agent.
* Created time.

Do not implement real audit logging in this iteration.

---

## Empty, Loading, and Error States

Every page should include meaningful states.

Examples:

```txt
No attendance records found for this month.
No late arrivals today.
No employees match the selected filters.
Attendance policy has not been configured.
Location permission denied.
Unable to load dashboard summary.
Employee is inactive and cannot check in.
```

Do not leave blank cards, empty tables without messages, placeholder charts, or broken UI sections.

---

## Visual Style

Use a clean internal-tool design.

Recommended:

* Simple layout.
* Clear typography.
* High contrast.
* Consistent spacing.
* Practical icons only.
* Responsive cards.
* Responsive tables.
* Accessible buttons.
* Accessible form fields.
* Calm status colors.
* Clear page titles.
* Clear section headings.

Avoid:

* Flashy gradients.
* Landing-page hero sections.
* Marketing CTAs.
* Decorative SaaS charts.
* Fake growth widgets.
* Abstract design-system previews.
* Brand asset galleries.

---

## Acceptance Criteria

This iteration is complete when:

* Dashboard UI imports mock data from `src/lib/mockdata.ts`.
* Admin dashboard shows attendance-focused KPI cards.
* Admin dashboard includes recent events, late arrivals, missing checkout list, and attendance table.
* Employee list and employee profile pages use attendance-domain data.
* Employee dashboard shows only the current employee’s attendance information.
* Monthly calendar UI can display attendance statuses.
* No unrelated SaaS, marketing, CRM, sales, finance, campaigns, collections, or design-system UI remains.
* UI is ready to later connect to real backend APIs.
