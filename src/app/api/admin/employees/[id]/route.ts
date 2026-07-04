import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth, handleAuthError } from "@/lib/auth";
import { writeAuditLog } from "@/lib/audit";

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await requireAuth(["ADMIN", "MANAGER"]);
  } catch (err) {
    const { status, message } = handleAuthError(err);
    return NextResponse.json({ error: message }, { status });
  }

  const { id } = await params;
  const employee = await prisma.employee.findUnique({
    where: { id },
    include: {
      user: { select: { id: true, name: true, email: true, role: true, status: true } },
      department: true,
      attendanceRecords: { orderBy: { date: "desc" }, take: 30 },
    },
  });

  if (!employee) return NextResponse.json({ error: "Employee not found." }, { status: 404 });
  return NextResponse.json({ data: employee });
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  let session;
  try {
    session = await requireAuth(["ADMIN", "MANAGER"]);
  } catch (err) {
    const { status, message } = handleAuthError(err);
    return NextResponse.json({ error: message }, { status });
  }

  const { id } = await params;
  try {
    const body = await req.json();
    const { name, phone, department, jobTitle, hiredAt, role, status: empStatus } = body;

    const employee = await prisma.employee.findUnique({
      where: { id },
      include: { user: true },
    });
    if (!employee) return NextResponse.json({ error: "Employee not found." }, { status: 404 });

    const dept = department
      ? await prisma.department.upsert({
          where: { name: department },
          create: { name: department },
          update: {},
        })
      : null;

    await prisma.$transaction([
      prisma.user.update({
        where: { id: employee.userId },
        data: {
          ...(name ? { name } : {}),
          ...(role ? { role } : {}),
        },
      }),
      prisma.employee.update({
        where: { id },
        data: {
          ...(phone !== undefined ? { phone: phone || null } : {}),
          ...(jobTitle ? { jobTitle } : {}),
          ...(hiredAt ? { hiredAt: new Date(hiredAt) } : {}),
          ...(dept ? { departmentId: dept.id } : {}),
          ...(empStatus ? { status: empStatus } : {}),
        },
      }),
    ]);

    await writeAuditLog({
      actorId: session.userId,
      action: "EMPLOYEE_UPDATED",
      targetType: "Employee",
      targetId: id,
      metadata: { fields: Object.keys(body) },
    });

    return NextResponse.json({ data: { ok: true } });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Failed to update employee." }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  let session;
  try {
    session = await requireAuth(["ADMIN"]);
  } catch (err) {
    const { status, message } = handleAuthError(err);
    return NextResponse.json({ error: message }, { status });
  }

  const { id } = await params;
  try {
    const employee = await prisma.employee.findUnique({ where: { id } });
    if (!employee) return NextResponse.json({ error: "Employee not found." }, { status: 404 });

    await prisma.$transaction([
      prisma.employee.update({ where: { id }, data: { status: "INACTIVE" } }),
      prisma.user.update({ where: { id: employee.userId }, data: { status: "INACTIVE" } }),
    ]);

    await writeAuditLog({
      actorId: session.userId,
      action: "EMPLOYEE_DEACTIVATED",
      targetType: "Employee",
      targetId: id,
      metadata: {},
    });

    return NextResponse.json({ data: { ok: true } });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Failed to deactivate employee." }, { status: 500 });
  }
}
