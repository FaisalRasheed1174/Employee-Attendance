"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth";
import { writeAuditLog } from "@/lib/audit";
import { calcAttendanceStatus } from "@/lib/attendance";

export async function correctAttendance(recordId: string, _prevState: unknown, formData: FormData) {
  let session;
  try {
    session = await requireAuth(["ADMIN"]);
  } catch {
    return { error: "Only admins can correct attendance records." };
  }

  const checkInAt = formData.get("checkInAt") as string;
  const checkOutAt = formData.get("checkOutAt") as string;
  const correctionReason = (formData.get("correctionReason") as string)?.trim();

  if (!correctionReason) return { error: "A correction reason is required." };

  const existing = await prisma.attendanceRecord.findUnique({ where: { id: recordId } });
  if (!existing) return { error: "Record not found." };

  const policy = await prisma.attendancePolicy.findFirst({ where: { active: true } });

  const newCheckIn = checkInAt ? new Date(checkInAt) : existing.checkInAt;
  const newCheckOut = checkOutAt ? new Date(checkOutAt) : existing.checkOutAt;

  let totalMinutes = existing.totalMinutes;
  let newStatus: "PRESENT" | "LATE" | "HALF_DAY" | "MISSING_CHECKOUT" = existing.status as "PRESENT" | "LATE" | "HALF_DAY" | "MISSING_CHECKOUT";

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

  await prisma.attendanceRecord.update({
    where: { id: recordId },
    data: {
      checkInAt: newCheckIn,
      checkOutAt: newCheckOut,
      totalMinutes,
      status: newStatus,
      source: "ADMIN_CORRECTION",
      correctedById: session.userId,
      correctionReason,
    },
  });

  await writeAuditLog({
    actorId: session.userId,
    action: "ATTENDANCE_CORRECTION",
    targetType: "AttendanceRecord",
    targetId: recordId,
    metadata: {
      originalCheckIn: existing.checkInAt?.toISOString(),
      originalCheckOut: existing.checkOutAt?.toISOString(),
      newStatus,
      correctionReason,
    },
  });

  revalidatePath("/admin/attendance");
  revalidatePath("/admin/dashboard");
  redirect("/admin/attendance");
}
