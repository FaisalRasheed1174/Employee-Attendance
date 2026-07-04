import "dotenv/config";
import { PrismaClient } from "../src/generated/prisma/client.js";
import { PrismaPg } from "@prisma/adapter-pg";
import bcrypt from "bcryptjs";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL ?? "" });
const prisma = new PrismaClient({ adapter });

async function main() {
  // Create departments
  const deptNames = ["Engineering", "HR", "Finance", "Operations", "Sales", "Support"];
  for (const name of deptNames) {
    await prisma.department.upsert({ where: { name }, create: { name }, update: {} });
  }
  console.log("✓ Departments seeded");

  // Create default attendance policy
  const existingPolicy = await prisma.attendancePolicy.findFirst({ where: { active: true } });
  if (!existingPolicy) {
    await prisma.attendancePolicy.create({
      data: {
        officeName: "Main Office — Riyadh",
        officeLatitude: 24.7136,
        officeLongitude: 46.6753,
        allowedRadiusMeters: 200,
        workStartTime: "08:00",
        timezone: "Asia/Riyadh",
        minimumFullDayMinutes: 420,
        minimumHalfDayMinutes: 210,
        active: true,
      },
    });
    console.log("✓ Attendance policy created");
  }

  // Create default admin user
  const adminEmail = "admin@company.com";
  const existing = await prisma.user.findUnique({ where: { email: adminEmail } });
  if (!existing) {
    const passwordHash = await bcrypt.hash("Admin1234!", 12);
    const hrDept = await prisma.department.findUniqueOrThrow({ where: { name: "HR" } });
    await prisma.user.create({
      data: {
        name: "System Admin",
        email: adminEmail,
        passwordHash,
        role: "ADMIN",
        employee: {
          create: {
            employeeCode: "EMP-0001",
            phone: "+966-50-000-0001",
            departmentId: hrDept.id,
            jobTitle: "System Administrator",
            hiredAt: new Date("2024-01-01"),
          },
        },
      },
    });
    console.log("✓ Admin user created:");
    console.log("  Email:    admin@company.com");
    console.log("  Password: Admin1234!");
  } else {
    console.log("✓ Admin user already exists");
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
