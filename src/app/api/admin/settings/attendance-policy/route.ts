import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth, handleAuthError } from "@/lib/auth";
import { writeAuditLog } from "@/lib/audit";

export async function GET() {
  try {
    await requireAuth(["ADMIN", "MANAGER"]);
  } catch (err) {
    const { status, message } = handleAuthError(err);
    return NextResponse.json({ error: message }, { status });
  }

  const policy = await prisma.attendancePolicy.findFirst({ where: { active: true } });
  if (!policy) return NextResponse.json({ error: "No active attendance policy found." }, { status: 404 });
  return NextResponse.json({ data: policy });
}

export async function PATCH(req: NextRequest) {
  let session;
  try {
    session = await requireAuth(["ADMIN"]);
  } catch (err) {
    const { status, message } = handleAuthError(err);
    return NextResponse.json({ error: message }, { status });
  }

  try {
    const body = await req.json();
    const policy = await prisma.attendancePolicy.findFirst({ where: { active: true } });

    const updated = policy
      ? await prisma.attendancePolicy.update({ where: { id: policy.id }, data: body })
      : await prisma.attendancePolicy.create({ data: body });

    await writeAuditLog({
      actorId: session.userId,
      action: "POLICY_UPDATED",
      targetType: "AttendancePolicy",
      targetId: updated.id,
      metadata: { fields: Object.keys(body) },
    });

    return NextResponse.json({ data: updated });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Failed to update policy." }, { status: 500 });
  }
}
