import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth, handleAuthError } from "@/lib/auth";

export async function GET(req: NextRequest) {
  let session;
  try {
    session = await requireAuth();
  } catch (err) {
    const { status, message } = handleAuthError(err);
    return NextResponse.json({ error: message }, { status });
  }

  try {
    const employee = await prisma.employee.findUnique({ where: { userId: session.userId } });
    if (!employee) return NextResponse.json({ error: "Employee profile not found." }, { status: 404 });

    const sp = new URL(req.url).searchParams;
    const month = sp.get("month");

    let dateFilter = {};
    if (month) {
      const [y, m] = month.split("-").map(Number);
      dateFilter = {
        gte: new Date(Date.UTC(y, m - 1, 1)),
        lt: new Date(Date.UTC(y, m, 1)),
      };
    }

    const records = await prisma.attendanceRecord.findMany({
      where: {
        employeeId: employee.id,
        ...(month ? { date: dateFilter } : {}),
      },
      orderBy: { date: "desc" },
    });

    return NextResponse.json({ data: records });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Failed to load attendance records." }, { status: 500 });
  }
}
