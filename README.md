# Employee Attendance System

A production-ready web application where employees can check in and check out only when physically inside an approved office radius. Admins and managers can manage employees, view attendance dashboards, filter records, and inspect monthly attendance calendars.

## Tech Stack

- **Framework:** Next.js 16 (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS v4
- **Runtime:** React 19

## Getting Started

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Scripts

```bash
npm run dev      # Start development server
npm run build    # Production build
npm run start    # Start production server
npm run lint     # Run ESLint
```

## MVP Features

- **Authentication** — Role-based login for admins, managers, and employees
- **Role Dashboards** — Separate views per role with relevant actions
- **Employee Management** — CRUD operations by admin or manager
- **GPS Check-in / Check-out** — Location validated within a 200-meter office radius
- **Server-side Timestamps** — Attendance times recorded server-side only
- **Attendance States** — Present, late, absent, half-day, and missing-checkout
- **Working Hours** — Automatic calculation per session
- **Monthly Calendar** — Per-employee attendance calendar view
- **Attendance Table** — Filterable records with status breakdowns
- **Admin Corrections** — Admins can edit attendance records
- **Audit Logs** — Sensitive actions are logged

## User Roles

| Role | Capabilities |
|------|-------------|
| **Employee** | Check in/out, view own dashboard, own attendance history and calendar |
| **Manager** | All employee capabilities + manage employees, view team attendance |
| **Admin** | Full access including corrections, audit logs, and system configuration |
