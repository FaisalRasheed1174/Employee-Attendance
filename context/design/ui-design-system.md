Read these files before making changes:

```txt
context/project-overview.md
context/design/ui-design-system.md
context/features/iteration-01-mock-data-foundation.md
context/features/iteration-02-dashboard-ui-spec.md
context/screenshots/dashboard-ui-main.png
```

We need to keep the whole Employee Attendance System UI consistent.

Do not invent a new visual style for each page. Do not create random layouts, random colors, random card styles, or unrelated SaaS dashboard patterns.

Create a single design source of truth for the project.

If it does not already exist, create this file:

```txt
context/design/ui-design-system.md
```

This file must define the visual design rules for the entire application.

The design system should be specific to an Employee Attendance System, not a generic SaaS dashboard, CRM, collections product, marketing website, or design-system showcase.

## Required design system content

Add clear rules for:

1. Product UI identity

The UI should feel like a professional internal HR, operations, and workforce attendance tool.

It should support:

* Daily attendance monitoring.
* Employee check-in/check-out.
* Late arrivals.
* Absences.
* Missing checkout records.
* Employee profiles.
* Monthly attendance calendars.
* Admin review and correction.
* Attendance policy management.

Do not use visual patterns that make the product look like:

* A marketing dashboard.
* A collections dashboard.
* A revenue dashboard.
* A CRM.
* A campaign analytics product.
* A landing page.
* A brand asset library.
* A design-system documentation site.

2. Layout rules

Define the standard layout for the app:

* App shell.
* Sidebar.
* Top header.
* Page title area.
* Dashboard card grid.
* Main content area.
* Tables.
* Detail pages.
* Forms.
* Empty states.

The layout should be clean, calm, and operational.

Use consistent spacing across all pages.

Recommended structure:

* Sidebar navigation on desktop.
* Top bar with current user and page context.
* Page header with title, subtitle, and primary action.
* KPI card grid below the page header.
* Main content sections below KPI cards.
* Tables and filters inside cards.
* Responsive stacked layout on mobile.

3. shadcn/ui usage

Use shadcn/ui components consistently.

Prefer these components:

* `Card` for dashboard cards and sections.
* `Button` for actions.
* `Badge` for attendance statuses.
* `Table` for employee and attendance records.
* `Tabs` for switching dashboard sections where needed.
* `Select` for filters.
* `Input` for search and form fields.
* `Dialog` for correction or confirmation actions.
* `DropdownMenu` for row actions.
* `Avatar` for employee identity.
* `Separator` for visual grouping.
* `Calendar` or a custom calendar grid for monthly attendance.
* `Alert` for error, warning, or location validation messages.

Do not create unnecessary custom components if shadcn/ui already has a suitable component.

Do not mix multiple component styles.

4. Color scheme

Define one consistent color system.

The color scheme should be calm, readable, and suitable for an internal HR tool.

Use neutral backgrounds and strong readable text.

Recommended direction:

* Background: neutral light background.
* Surfaces: white or near-white cards.
* Borders: soft neutral borders.
* Primary action: one consistent brand color.
* Destructive action: reserved for delete/deactivate.
* Warning: used for late and missing checkout.
* Success: used for present and completed attendance.
* Muted: used for secondary text and inactive records.

Attendance status colors must be consistent everywhere:

* `PRESENT`: success style.
* `LATE`: warning style.
* `HALF_DAY`: amber/orange style.
* `ABSENT`: destructive style.
* `ON_LEAVE`: neutral or info style.
* `MISSING_CHECKOUT`: warning/destructive hybrid style.

Use these colors through shadcn/Tailwind tokens where possible.

Do not use flashy gradients, neon colors, or marketing-style hero colors.

5. Typography

Define typography rules:

* Clear page titles.
* Short descriptive subtitles.
* Strong table readability.
* Consistent label sizes.
* Muted secondary text.
* Avoid oversized marketing headings.

The product is an internal tool, so typography should prioritize scanning and daily operational use.

6. Dashboard card rules

Dashboard cards must be attendance-focused.

Allowed dashboard cards:

* Total active employees.
* Present today.
* Late today.
* Absent today.
* Missing check-out today.
* Average working hours.

Do not create unrelated cards such as:

* Revenue.
* Collections.
* Leads.
* Subscribers.
* Campaigns.
* Invoices.
* Conversion rate.
* Sales pipeline.
* Growth metrics.

Each card should include:

* Label.
* Value.
* Optional supporting description.
* Optional icon.
* Optional trend only if attendance-related.

7. Table rules

Tables should be easy to scan.

Attendance table should support:

* Employee name.
* Department.
* Date.
* Check-in time.
* Check-out time.
* Total worked hours.
* Status badge.
* Late minutes.
* Source.
* Actions.

Employee table should support:

* Employee code.
* Name.
* Email.
* Department.
* Job title.
* Status.
* Hired date.
* Actions.

Use consistent row height, spacing, badges, and action menus.

8. Filter rules

Filters should be grouped clearly above tables.

Use filters for:

* Employee.
* Department.
* Date.
* Month.
* Status.
* Late only.
* Missing checkout only.

Filters should look consistent across admin dashboard, attendance page, and employee profile pages.

9. Monthly calendar rules

Employee profile pages must include a monthly attendance calendar.

Calendar days should clearly show:

* Present.
* Late.
* Absent.
* Half day.
* On leave.
* Missing checkout.

The calendar should support quick scanning.

Do not make the calendar decorative. It must communicate attendance state clearly.

10. Employee dashboard rules

Employee dashboard should be action-oriented.

If the employee has not checked in, the primary action should be:

```txt
Check In
```

If the employee has checked in but not checked out, the primary action should be:

```txt
Check Out
```

If the employee completed the day, show:

* Check-in time.
* Check-out time.
* Total worked hours.
* Attendance status.

Also show clear location messages:

* Location permission required.
* GPS accuracy too low.
* Outside office radius.
* Attendance policy inactive.

11. Empty and error state rules

Every page must have proper empty and error states.

Examples:

* No attendance records found for this month.
* No late arrivals today.
* No missing checkout records today.
* No employees match the selected filters.
* Attendance policy has not been configured.
* Location permission denied.
* Unable to load dashboard summary.
* Employee is inactive and cannot check in.

Do not leave blank cards, empty tables, broken placeholders, or lorem ipsum.

12. Navigation rules

Sidebar navigation should be role-aware.

Admin navigation may include:

* Dashboard.
* Employees.
* Attendance.
* Settings.
* Audit Logs.

Employee navigation may include:

* Dashboard.
* My Attendance.
* Profile.

Manager navigation may include:

* Dashboard.
* Team Attendance.
* Employees.

Do not show admin-only navigation to employees.

13. Consistency rule

All new UI work must follow `context/design/ui-design-system.md`.

Do not duplicate design decisions inside feature files.

Feature files should describe what to build.

The design file should describe how it should look and feel.

If a feature file and the design file conflict, follow the design file for UI decisions and the project overview for product/business rules.

## Update feature files

After creating or updating `context/design/ui-design-system.md`, update the feature specs to reference it.

At the top of UI-related feature specs, add:

```txt
Before implementing UI, read and follow:
context/design/ui-design-system.md
```

Especially update:

```txt
context/features/iteration-02-dashboard-ui-spec.md
```

Do not paste the entire design system into the dashboard feature file.

Keep the design source of truth separate.

## Implementation behavior

When building UI:

* Reuse the same layout pattern.
* Reuse the same card style.
* Reuse the same table style.
* Reuse the same status badge style.
* Reuse the same filter style.
* Reuse the same sidebar and header style.
* Reuse shadcn/ui components consistently.
* Keep the product attendance-focused.

Do not make each page look like a different product.

## Acceptance criteria

This task is complete when:

* `context/design/ui-design-system.md` exists.
* It defines layout, shadcn usage, colors, typography, badges, cards, tables, filters, calendar, navigation, empty states, and error states.
* `context/features/iteration-02-dashboard-ui-spec.md` references the design file.
* UI implementation follows one consistent design language.
* No unrelated SaaS, collections, marketing, CRM, campaign, finance, or design-system-showcase UI remains.
* The Employee Attendance System looks like one coherent internal workforce operations product.
