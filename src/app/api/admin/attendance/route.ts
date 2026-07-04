import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth, handleAuthError } from "@/lib/auth";
import type { Prisma } from "@/generated/prisma/client";

export async function GET(req: NextRequest) {
  try {
    await requireAuth(["ADMIN", "MANAGER"]);
  } catch (err) {
    const { status, message } = handleAuthError(err);
    return NextResponse.json({ error: message }, { status });
  }

  try {
    const sp = new URL(req.url).searchParams;
    const where: Prisma.AttendanceRecordWhereInput = {};

    const employeeId = sp.get("employee");
    const department = sp.get("department");
    const status = sp.get("status");
    const date = sp.get("date");
    const month = sp.get("month");
    const lateOnly = sp.get("late") === "true";
    const missingCheckout = sp.get("missingCheckout") === "true";

    if (employeeId) where.employeeId = employeeId;
    if (status) where.status = status as Prisma.EnumAttendanceStatusFilter;
    if (lateOnly) where.isLate = true;
    if (missingCheckout) {
      where.checkInAt = { not: null };
      where.checkOutAt = null;
    }
    if (date) {
      const d = new Date(date + "T00:00:00.000Z");
      where.date = { gte: d, lt: new Date(d.getTime() + 86_400_000) };
    } else if (month) {
      const [y, m] = month.split("-").map(Number);
      where.date = {
        gte: new Date(Date.UTC(y, m - 1, 1)),
        lt: new Date(Date.UTC(y, m, 1)),
      };
    }
    if (department) {
      where.employee = { department: { name: department } };
    }

    const records = await prisma.attendanceRecord.findMany({
      where,
      include: {
        employee: {
          include: {
            user: { select: { name: true } },
            department: { select: { name: true } },
          },
        },
      },
      orderBy: [{ date: "desc" }, { checkInAt: "desc" }],
      take: 500,
    });

    return NextResponse.json({ data: records });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Failed to load attendance records." }, { status: 500 });
  }
}
