import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth, handleAuthError } from "@/lib/auth";
import { writeAuditLog } from "@/lib/audit";
import { calcAttendanceStatus } from "@/lib/attendance";

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  let session;
  try {
    session = await requireAuth(["ADMIN"]);
  } catch (err) {
    const { status, message } = handleAuthError(err);
    return NextResponse.json({ error: message }, { status });
  }

  const { id } = await params;
  try {
    const { checkInAt, checkOutAt, correctionReason } = await req.json();

    if (!correctionReason?.trim()) {
      return NextResponse.json({ error: "A correction reason is required." }, { status: 400 });
    }

    const existing = await prisma.attendanceRecord.findUnique({ where: { id } });
    if (!existing) return NextResponse.json({ error: "Record not found." }, { status: 404 });

    const policy = await prisma.attendancePolicy.findFirst({ where: { active: true } });

    const newCheckIn = checkInAt ? new Date(checkInAt) : existing.checkInAt;
    const newCheckOut = checkOutAt ? new Date(checkOutAt) : existing.checkOutAt;

    let totalMinutes = existing.totalMinutes;
    let newStatus = existing.status;

    if (newCheckIn && newCheckOut) {
      totalMinutes = Math.floor((newCheckOut.getTime() - newCheckIn.getTime()) / 60_000);
      newStatus = calcAttendanceStatus(
        totalMinutes,
        existing.isLate,
        policy?.minimumFullDayMinutes ?? 420,
        policy?.minimumHalfDayMinutes ?? 210
      );
    } else if (newCheckIn && !newCheckOut) {
      newStatus = "MISSING_CHECKOUT";
      totalMinutes = null;
    }

    const updated = await prisma.attendanceRecord.update({
      where: { id },
      data: {
        checkInAt: newCheckIn,
        checkOutAt: newCheckOut,
        totalMinutes,
        status: newStatus as "PRESENT" | "LATE" | "HALF_DAY" | "MISSING_CHECKOUT",
        source: "ADMIN_CORRECTION",
        correctedById: session.userId,
        correctionReason: correctionReason.trim(),
      },
    });

    await writeAuditLog({
      actorId: session.userId,
      action: "ATTENDANCE_CORRECTION",
      targetType: "AttendanceRecord",
      targetId: id,
      metadata: {
        originalCheckIn: existing.checkInAt?.toISOString(),
        originalCheckOut: existing.checkOutAt?.toISOString(),
        newCheckIn: updated.checkInAt?.toISOString(),
        newCheckOut: updated.checkOutAt?.toISOString(),
        correctionReason,
      },
    });

    return NextResponse.json({ data: updated });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Failed to correct attendance record." }, { status: 500 });
  }
}
