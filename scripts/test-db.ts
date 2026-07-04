/**
 * Database connection test script.
 * Run with: npx tsx scripts/test-db.ts
 *
 * Verifies:
 *  - Prisma can connect to the configured DATABASE_URL
 *  - All 6 tables exist and are queryable
 *  - Seed data is present (departments, policy, admin user)
 */

import "dotenv/config";
import { PrismaClient } from "../src/generated/prisma/client.js";
import { PrismaPg } from "@prisma/adapter-pg";

const url = process.env.DATABASE_URL;
if (!url) {
  console.error("❌  DATABASE_URL is not set. Copy .env.example to .env and fill in your Neon connection string.");
  process.exit(1);
}

// Print host only — never log the full URL (contains password)
const host = new URL(url).hostname;
console.log(`\n🔌  Connecting to: ${host}\n`);

const adapter = new PrismaPg({ connectionString: url });
const prisma = new PrismaClient({ adapter });

async function main() {
  // ── Table existence + row counts ─────────────────────────────────────────
  const checks: Array<{ label: string; query: () => Promise<number> }> = [
    { label: "User",             query: () => prisma.user.count() },
    { label: "Employee",         query: () => prisma.employee.count() },
    { label: "Department",       query: () => prisma.department.count() },
    { label: "AttendanceRecord", query: () => prisma.attendanceRecord.count() },
    { label: "AttendancePolicy", query: () => prisma.attendancePolicy.count() },
    { label: "AuditLog",         query: () => prisma.auditLog.count() },
  ];

  let allPassed = true;

  for (const { label, query } of checks) {
    try {
      const count = await query();
      console.log(`  ✅  ${label.padEnd(20)} ${count} row${count !== 1 ? "s" : ""}`);
    } catch (err) {
      console.error(`  ❌  ${label.padEnd(20)} FAILED — ${(err as Error).message}`);
      allPassed = false;
    }
  }

  console.log("");

  // ── Seed data verification ────────────────────────────────────────────────
  const deptCount = await prisma.department.count();
  if (deptCount === 6) {
    console.log("  ✅  Seed departments present (6)");
  } else {
    console.warn(`  ⚠️   Expected 6 departments, found ${deptCount}. Run: npx prisma db seed`);
  }

  const policy = await prisma.attendancePolicy.findFirst({ where: { active: true } });
  if (policy) {
    console.log(`  ✅  Active policy: "${policy.officeName}" (radius: ${policy.allowedRadiusMeters}m)`);
  } else {
    console.warn("  ⚠️   No active attendance policy. Run: npx prisma db seed");
  }

  const admin = await prisma.user.findUnique({ where: { email: "admin@company.com" } });
  if (admin) {
    console.log(`  ✅  Admin user present: ${admin.email} (role: ${admin.role})`);
  } else {
    console.warn("  ⚠️   Admin user not found. Run: npx prisma db seed");
  }

  console.log("");

  if (allPassed) {
    console.log("✅  All checks passed — database is connected and ready.\n");
  } else {
    console.error("❌  Some checks failed. Ensure migrations have run: npx prisma migrate dev\n");
    process.exit(1);
  }
}

main()
  .catch((err) => {
    console.error("\n❌  Connection failed:", err.message, "\n");
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
