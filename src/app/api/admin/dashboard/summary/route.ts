import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth, handleAuthError } from "@/lib/auth";
import { getTodayDate } from "@/lib/attendance";

export async function GET() {
  try {
    await requireAuth(["ADMIN", "MANAGER"]);
  } catch (err) {
    const { status, message } = handleAuthError(err);
    return NextResponse.json({ error: message }, { status });
  }

  try {
    const policy = await prisma.attendancePolicy.findFirst({ where: { active: true } });
    const tz = policy?.timezone ?? "UTC";
    const todayDate = getTodayDate(tz);
    const tomorrow = new Date(todayDate.getTime() + 86_400_000);

    const [totalActiveEmployees, todayRecords, monthAggregate] = await Promise.all([
      prisma.employee.count({ where: { status: "ACTIVE" } }),
      prisma.attendanceRecord.findMany({
        where: { date: { gte: todayDate, lt: tomorrow } },
        select: { checkInAt: true, checkOutAt: true, isLate: true, status: true },
      }),
      prisma.attendanceRecord.aggregate({
        where: {
          date: { gte: new Date(Date.UTC(new Date().getUTCFullYear(), new Date().getUTCMonth(), 1)) },
          totalMinutes: { not: null },
        },
        _avg: { totalMinutes: true },
      }),
    ]);

    const presentToday = todayRecords.filter((r) => r.checkInAt).length;
    const lateToday = todayRecords.filter((r) => r.isLate).length;
    const missingCheckoutToday = todayRecords.filter((r) => r.checkInAt && !r.checkOutAt).length;
    const absentToday = Math.max(0, totalActiveEmployees - presentToday);
    const averageWorkingHours = monthAggregate._avg.totalMinutes
      ? Math.round((monthAggregate._avg.totalMinutes / 60) * 10) / 10
      : 0;

    return NextResponse.json({
      data: {
        totalActiveEmployees,
        presentToday,
        lateToday,
        absentToday,
        missingCheckoutToday,
        averageWorkingHours,
      },
    });
  } catch (err) {
    console.error("Dashboard summary error:", err);
    return NextResponse.json({ error: "Failed to load dashboard summary." }, { status: 500 });
  }
}
