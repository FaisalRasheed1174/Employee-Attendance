import "dotenv/config";
import { PrismaClient } from "../src/generated/prisma/client.js";
import { PrismaPg } from "@prisma/adapter-pg";
import bcrypt from "bcryptjs";

// ── Change this before running in a new environment ──────────────────────────
const SEED_EMAIL = "faisal@example.com";
// ─────────────────────────────────────────────────────────────────────────────

const EMPLOYEE_PASSWORD = "password123";
const OFFICE_LAT = 24.7136;
const OFFICE_LNG = 46.6753;
const WORK_START_HOUR = 9;
const LATE_THRESHOLD_MIN = 15; // minutes past 09:00

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL ?? "" });
const prisma = new PrismaClient({ adapter });

// ── Types ─────────────────────────────────────────────────────────────────────
type Scenario = "PRESENT" | "LATE" | "MISSING_CHECKOUT" | "HALF_DAY" | "ABSENT";

interface EmployeeSeed {
  name: string;
  email: string;
  department: string;
  jobTitle: string;
  employeeCode: string;
  role: "EMPLOYEE" | "MANAGER" | "ADMIN";
  empStatus: "ACTIVE" | "INACTIVE" | "SUSPENDED";
  hiredAt: Date;
  pattern: Scenario[];
}

// ── Static Data ───────────────────────────────────────────────────────────────
const DEPARTMENTS = [
  "Management", "HR", "Engineering", "Design", "QA", "DevOps", "Support",
];

const EMPLOYEES: EmployeeSeed[] = [
  {
    name: "Faisal Al-Qahtani",
    email: "faisal.qahtani@company.com",
    department: "Management",
    jobTitle: "Admin Manager",
    employeeCode: "EMP-001",
    role: "MANAGER",
    empStatus: "ACTIVE",
    hiredAt: new Date("2022-01-15"),
    pattern: ["PRESENT", "PRESENT", "PRESENT", "PRESENT", "PRESENT", "LATE", "PRESENT", "PRESENT", "MISSING_CHECKOUT", "PRESENT"],
  },
  {
    name: "Sara Al-Harbi",
    email: "sara.harbi@company.com",
    department: "HR",
    jobTitle: "HR Specialist",
    employeeCode: "EMP-002",
    role: "EMPLOYEE",
    empStatus: "ACTIVE",
    hiredAt: new Date("2022-03-01"),
    pattern: ["PRESENT", "PRESENT", "PRESENT", "PRESENT", "LATE", "PRESENT", "PRESENT", "ABSENT", "PRESENT", "PRESENT"],
  },
  {
    name: "Omar Al-Otaibi",
    email: "omar.otaibi@company.com",
    department: "Engineering",
    jobTitle: "Software Engineer",
    employeeCode: "EMP-003",
    role: "EMPLOYEE",
    empStatus: "ACTIVE",
    hiredAt: new Date("2022-06-15"),
    pattern: ["PRESENT", "LATE", "PRESENT", "MISSING_CHECKOUT", "PRESENT", "ABSENT", "LATE", "PRESENT", "PRESENT", "LATE"],
  },
  {
    name: "Noura Al-Dossari",
    email: "noura.dossari@company.com",
    department: "Design",
    jobTitle: "Product Designer",
    employeeCode: "EMP-004",
    role: "EMPLOYEE",
    empStatus: "ACTIVE",
    hiredAt: new Date("2023-01-10"),
    pattern: ["PRESENT", "PRESENT", "PRESENT", "HALF_DAY", "PRESENT", "PRESENT", "LATE", "PRESENT", "PRESENT", "PRESENT"],
  },
  {
    name: "Khalid Al-Mutairi",
    email: "khalid.mutairi@company.com",
    department: "Engineering",
    jobTitle: "Backend Developer",
    employeeCode: "EMP-005",
    role: "EMPLOYEE",
    empStatus: "ACTIVE",
    hiredAt: new Date("2023-04-01"),
    pattern: ["LATE", "LATE", "PRESENT", "LATE", "MISSING_CHECKOUT", "LATE", "PRESENT", "ABSENT", "LATE", "LATE"],
  },
  {
    name: "Reem Al-Zahrani",
    email: "reem.zahrani@company.com",
    department: "QA",
    jobTitle: "QA Engineer",
    employeeCode: "EMP-006",
    role: "EMPLOYEE",
    empStatus: "ACTIVE",
    hiredAt: new Date("2023-07-01"),
    pattern: ["PRESENT", "PRESENT", "LATE", "PRESENT", "PRESENT", "ABSENT", "PRESENT", "PRESENT", "PRESENT", "LATE"],
  },
  {
    name: "Abdullah Al-Shehri",
    email: "abdullah.shehri@company.com",
    department: "DevOps",
    jobTitle: "DevOps Engineer",
    employeeCode: "EMP-007",
    role: "EMPLOYEE",
    empStatus: "ACTIVE",
    hiredAt: new Date("2024-01-15"),
    pattern: ["PRESENT", "PRESENT", "ABSENT", "PRESENT", "PRESENT", "MISSING_CHECKOUT", "PRESENT", "LATE", "PRESENT", "PRESENT"],
  },
  {
    name: "Maha Al-Anazi",
    email: "maha.anazi@company.com",
    department: "Support",
    jobTitle: "Support Specialist",
    employeeCode: "EMP-008",
    role: "EMPLOYEE",
    empStatus: "INACTIVE",
    hiredAt: new Date("2024-03-01"),
    pattern: [], // inactive — no attendance records seeded
  },
];

// ── Date Helpers ──────────────────────────────────────────────────────────────

/** Returns all Sunday–Thursday dates from `from` (inclusive) up to `to` (exclusive). */
function workingDaysBetween(from: Date, to: Date): Date[] {
  const days: Date[] = [];
  const cur = new Date(from.getFullYear(), from.getMonth(), from.getDate());
  const end = new Date(to.getFullYear(), to.getMonth(), to.getDate());
  while (cur < end) {
    const dow = cur.getDay(); // 0=Sun, 5=Fri, 6=Sat
    if (dow !== 5 && dow !== 6) days.push(new Date(cur));
    cur.setDate(cur.getDate() + 1);
  }
  return days;
}

/** Returns a date-only value (midnight UTC) suitable for @db.Date fields. */
function toDateOnly(d: Date): Date {
  return new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
}

/** Builds a datetime on the same calendar date as `base` with given h:m. */
function withTime(base: Date, hour: number, minute: number): Date {
  return new Date(base.getFullYear(), base.getMonth(), base.getDate(), hour, minute, 0, 0);
}

// ── Attendance Record Builder ─────────────────────────────────────────────────

function buildAttendanceData(
  date: Date,
  scenario: Scenario,
  employeeId: string,
  empIdx: number,
  dayIdx: number,
) {
  // Deterministic offsets so times are stable across re-runs
  const v = (empIdx * 7 + dayIdx * 13) % 10; // 0..9

  if (scenario === "ABSENT") return null; // no record inserted

  const dateOnly = toDateOnly(date);

  if (scenario === "PRESENT") {
    const checkInAt = withTime(date, WORK_START_HOUR - 1, 45 + v); // 08:45–08:54
    const checkOutAt = withTime(date, 17, v * 2);                   // 17:00–17:18
    const totalMinutes = Math.floor((checkOutAt.getTime() - checkInAt.getTime()) / 60000);
    return {
      employeeId, date: dateOnly,
      checkInAt, checkOutAt, totalMinutes,
      status: "PRESENT" as const, isLate: false, lateMinutes: 0,
      checkInLatitude: OFFICE_LAT, checkInLongitude: OFFICE_LNG,
      checkOutLatitude: OFFICE_LAT, checkOutLongitude: OFFICE_LNG,
      checkInDistanceMeters: 40 + v * 8, checkOutDistanceMeters: 35 + v * 9,
      source: "WEB" as const,
    };
  }

  if (scenario === "LATE") {
    const extraMin = 20 + v * 8;                                     // 20–92 min late
    const checkInAt = withTime(date, WORK_START_HOUR, LATE_THRESHOLD_MIN + extraMin);
    const checkOutAt = withTime(date, 17, 30);
    const totalMinutes = Math.floor((checkOutAt.getTime() - checkInAt.getTime()) / 60000);
    return {
      employeeId, date: dateOnly,
      checkInAt, checkOutAt, totalMinutes,
      status: "LATE" as const, isLate: true, lateMinutes: LATE_THRESHOLD_MIN + extraMin,
      checkInLatitude: OFFICE_LAT, checkInLongitude: OFFICE_LNG,
      checkOutLatitude: OFFICE_LAT, checkOutLongitude: OFFICE_LNG,
      checkInDistanceMeters: 60 + v * 5, checkOutDistanceMeters: 55 + v * 6,
      source: "WEB" as const,
    };
  }

  if (scenario === "MISSING_CHECKOUT") {
    const checkInAt = withTime(date, WORK_START_HOUR, v);            // 09:00–09:09
    return {
      employeeId, date: dateOnly,
      checkInAt, checkOutAt: null, totalMinutes: null,
      status: "MISSING_CHECKOUT" as const, isLate: false, lateMinutes: 0,
      checkInLatitude: OFFICE_LAT, checkInLongitude: OFFICE_LNG,
      checkOutLatitude: null, checkOutLongitude: null,
      checkInDistanceMeters: 45 + v * 7, checkOutDistanceMeters: null,
      source: "WEB" as const,
    };
  }

  if (scenario === "HALF_DAY") {
    const checkInAt = withTime(date, WORK_START_HOUR, v);
    const checkOutAt = withTime(date, 13, 0);                        // leaves at 13:00
    const totalMinutes = Math.floor((checkOutAt.getTime() - checkInAt.getTime()) / 60000); // ~240
    return {
      employeeId, date: dateOnly,
      checkInAt, checkOutAt, totalMinutes,
      status: "HALF_DAY" as const, isLate: false, lateMinutes: 0,
      checkInLatitude: OFFICE_LAT, checkInLongitude: OFFICE_LNG,
      checkOutLatitude: OFFICE_LAT, checkOutLongitude: OFFICE_LNG,
      checkInDistanceMeters: 38 + v * 6, checkOutDistanceMeters: 42 + v * 5,
      source: "WEB" as const,
    };
  }

  return null;
}

// ── Main ──────────────────────────────────────────────────────────────────────
async function main() {
  // ── 1. Attendance Policy ───────────────────────────────────────────────────
  await prisma.attendancePolicy.updateMany({ where: { active: true }, data: { active: false } });
  await prisma.attendancePolicy.create({
    data: {
      officeName: "Head Office",
      officeLatitude: OFFICE_LAT,
      officeLongitude: OFFICE_LNG,
      allowedRadiusMeters: 200,
      workStartTime: "09:00",
      timezone: "Asia/Riyadh",
      minimumFullDayMinutes: 420,
      minimumHalfDayMinutes: 210,
      active: true,
    },
  });
  console.log("✓ Attendance policy seeded");

  // ── 2. Departments ─────────────────────────────────────────────────────────
  const deptMap: Record<string, string> = {};
  for (const name of DEPARTMENTS) {
    const dept = await prisma.department.upsert({
      where: { name },
      update: {},
      create: { name },
    });
    deptMap[name] = dept.id;
  }
  console.log(`✓ Departments seeded (${DEPARTMENTS.length})`);

  // ── 3. Admin User ──────────────────────────────────────────────────────────
  const adminHash = await bcrypt.hash("12345678", 12);
  const admin = await prisma.user.upsert({
    where: { email: SEED_EMAIL },
    update: {},
    create: {
      name: "Faisal",
      email: SEED_EMAIL,
      passwordHash: adminHash,
      role: "ADMIN",
      status: "ACTIVE",
      emailVerified: new Date(),
    },
  });
  console.log(`✓ Admin user: ${admin.email}`);

  // ── 4. Employees ───────────────────────────────────────────────────────────
  const empHash = await bcrypt.hash(EMPLOYEE_PASSWORD, 12);
  const employeeIds: string[] = [];

  for (const e of EMPLOYEES) {
    const userStatus = e.empStatus === "INACTIVE" ? "INACTIVE" : "ACTIVE";
    const user = await prisma.user.upsert({
      where: { email: e.email },
      update: { name: e.name, role: e.role, status: userStatus },
      create: {
        name: e.name,
        email: e.email,
        passwordHash: empHash,
        role: e.role,
        status: userStatus,
        emailVerified: new Date(),
      },
    });

    const employee = await prisma.employee.upsert({
      where: { employeeCode: e.employeeCode },
      update: {
        jobTitle: e.jobTitle,
        departmentId: deptMap[e.department],
        status: e.empStatus,
      },
      create: {
        userId: user.id,
        employeeCode: e.employeeCode,
        jobTitle: e.jobTitle,
        departmentId: deptMap[e.department],
        hiredAt: e.hiredAt,
        status: e.empStatus,
      },
    });

    employeeIds.push(employee.id);
  }
  console.log(`✓ Employees seeded (${EMPLOYEES.length})`);

  // ── 5. Attendance Records ──────────────────────────────────────────────────
  // Generate records for the last 30 calendar days up to (not including) today.
  const today = new Date();
  const thirtyDaysAgo = new Date(today);
  thirtyDaysAgo.setDate(today.getDate() - 30);
  const workingDays = workingDaysBetween(thirtyDaysAgo, today);

  // Clear existing records for seeded employees before recreating
  await prisma.attendanceRecord.deleteMany({
    where: { employeeId: { in: employeeIds } },
  });

  let recordCount = 0;
  for (let empIdx = 0; empIdx < EMPLOYEES.length; empIdx++) {
    const e = EMPLOYEES[empIdx];
    if (e.pattern.length === 0) continue; // inactive — skip

    const employeeId = employeeIds[empIdx];

    for (let dayIdx = 0; dayIdx < workingDays.length; dayIdx++) {
      const date = workingDays[dayIdx];
      const scenario = e.pattern[dayIdx % e.pattern.length];
      const data = buildAttendanceData(date, scenario, employeeId, empIdx, dayIdx);
      if (!data) continue; // ABSENT — no record

      await prisma.attendanceRecord.create({ data });
      recordCount++;
    }
  }
  console.log(`✓ Attendance records seeded (${recordCount})`);

  // ── 6. Audit Logs ─────────────────────────────────────────────────────────
  await prisma.auditLog.deleteMany({ where: { actorId: admin.id } });

  const auditEntries = [
    ...EMPLOYEES.map((e, i) => ({
      actorId: admin.id,
      action: "EMPLOYEE_CREATED",
      targetType: "Employee",
      targetId: employeeIds[i],
      metadata: { employeeCode: e.employeeCode, name: e.name, department: e.department },
      ipAddress: "192.168.1.10",
      userAgent: "Mozilla/5.0 (seed)",
    })),
    {
      actorId: admin.id,
      action: "EMPLOYEE_UPDATED",
      targetType: "Employee",
      targetId: employeeIds[7], // Maha Al-Anazi — status changed to INACTIVE
      metadata: { field: "status", from: "ACTIVE", to: "INACTIVE" },
      ipAddress: "192.168.1.10",
      userAgent: "Mozilla/5.0 (seed)",
    },
    {
      actorId: admin.id,
      action: "ATTENDANCE_CORRECTED",
      targetType: "AttendanceRecord",
      targetId: employeeIds[2], // Omar Al-Otaibi
      metadata: {
        field: "checkOutAt",
        from: null,
        to: "17:00",
        reason: "Employee forgot to check out",
      },
      ipAddress: "192.168.1.10",
      userAgent: "Mozilla/5.0 (seed)",
    },
    {
      actorId: admin.id,
      action: "SETTINGS_UPDATED",
      targetType: "AttendancePolicy",
      targetId: "policy",
      metadata: { field: "allowedRadiusMeters", from: 100, to: 200 },
      ipAddress: "192.168.1.10",
      userAgent: "Mozilla/5.0 (seed)",
    },
  ];

  for (const entry of auditEntries) {
    await prisma.auditLog.create({ data: entry as Parameters<typeof prisma.auditLog.create>[0]["data"] });
  }
  console.log(`✓ Audit logs seeded (${auditEntries.length})`);

  console.log("\n✅  Seed complete.");
  console.log(`   Admin login:      ${SEED_EMAIL} / 12345678`);
  console.log(`   Employee login:   <any employee email> / ${EMPLOYEE_PASSWORD}`);
  console.log(`   Working days seeded: ${workingDays.length}`);
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
