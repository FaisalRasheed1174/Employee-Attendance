import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth, handleAuthError } from "@/lib/auth";
import { haversineDistance } from "@/lib/geo";
import { writeAuditLog } from "@/lib/audit";
import { getTodayDate, calcLateness } from "@/lib/attendance";

export async function POST(req: NextRequest) {
  let session;
  try {
    session = await requireAuth();
  } catch (err) {
    const { status, message } = handleAuthError(err);
    return NextResponse.json({ error: message }, { status });
  }

  try {
    const body = await req.json();
    const { latitude, longitude, accuracyMeters } = body;

    if (latitude == null || longitude == null || accuracyMeters == null) {
      return NextResponse.json({ error: "GPS coordinates and accuracy are required." }, { status: 400 });
    }

    const policy = await prisma.attendancePolicy.findFirst({ where: { active: true } });
    if (!policy) {
      return NextResponse.json(
        { error: "Attendance policy is not active. Contact an admin." },
        { status: 400 }
      );
    }

    if (accuracyMeters > 100) {
      return NextResponse.json(
        { error: "Your GPS accuracy is too low. Move near a window or try again." },
        { status: 400 }
      );
    }

    const distance = haversineDistance(
      latitude,
      longitude,
      policy.officeLatitude,
      policy.officeLongitude
    );

    const ip = req.headers.get("x-forwarded-for")?.split(",")[0].trim() ?? req.headers.get("x-real-ip");
    const ua = req.headers.get("user-agent");

    if (distance > policy.allowedRadiusMeters) {
      await writeAuditLog({
        actorId: session.userId,
        action: "ATTENDANCE_REJECTED",
        targetType: "AttendanceRecord",
        targetId: "REJECTED",
        metadata: { reason: "Outside allowed radius", distanceMeters: Math.round(distance), accuracyMeters },
        ipAddress: ip,
        userAgent: ua,
      });
      return NextResponse.json(
        { error: "You are outside the allowed attendance area. Move within the office radius and try again." },
        { status: 403 }
      );
    }

    const employee = await prisma.employee.findUnique({ where: { userId: session.userId } });
    if (!employee) {
      return NextResponse.json({ error: "Employee profile not found." }, { status: 404 });
    }
    if (employee.status !== "ACTIVE") {
      return NextResponse.json(
        { error: "Your account is inactive. Contact your administrator." },
        { status: 403 }
      );
    }

    const now = new Date();
    const todayDate = getTodayDate(policy.timezone);

    const existing = await prisma.attendanceRecord.findUnique({
      where: { employeeId_date: { employeeId: employee.id, date: todayDate } },
    });

    if (existing?.checkInAt) {
      return NextResponse.json({ error: "You have already checked in today." }, { status: 409 });
    }

    const { isLate, lateMinutes } = calcLateness(now, policy.workStartTime, policy.timezone);

    const record = await prisma.attendanceRecord.upsert({
      where: { employeeId_date: { employeeId: employee.id, date: todayDate } },
      create: {
        employeeId: employee.id,
        date: todayDate,
        checkInAt: now,
        status: isLate ? "LATE" : "PRESENT",
        isLate,
        lateMinutes,
        checkInLatitude: latitude,
        checkInLongitude: longitude,
        checkInDistanceMeters: Math.round(distance),
        source: "WEB",
      },
      update: {
        checkInAt: now,
        status: isLate ? "LATE" : "PRESENT",
        isLate,
        lateMinutes,
        checkInLatitude: latitude,
        checkInLongitude: longitude,
        checkInDistanceMeters: Math.round(distance),
      },
    });

    await writeAuditLog({
      actorId: session.userId,
      action: "ATTENDANCE_CHECK_IN",
      targetType: "AttendanceRecord",
      targetId: record.id,
      metadata: { distanceMeters: Math.round(distance), accuracyMeters, isLate, lateMinutes },
      ipAddress: ip,
      userAgent: ua,
    });

    return NextResponse.json({ data: { id: record.id, checkInAt: record.checkInAt, isLate, lateMinutes } });
  } catch (err) {
    console.error("Check-in error:", err);
    return NextResponse.json({ error: "An unexpected error occurred." }, { status: 500 });
  }
}
