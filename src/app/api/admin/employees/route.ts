import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { requireAuth, handleAuthError } from "@/lib/auth";
import { writeAuditLog } from "@/lib/audit";

export async function GET(req: NextRequest) {
  let session;
  try {
    session = await requireAuth(["ADMIN", "MANAGER"]);
  } catch (err) {
    const { status, message } = handleAuthError(err);
    return NextResponse.json({ error: message }, { status });
  }

  try {
    const sp = new URL(req.url).searchParams;
    const department = sp.get("department");
    const status = sp.get("status");
    const search = sp.get("search");

    const employees = await prisma.employee.findMany({
      where: {
        ...(status ? { status: status as "ACTIVE" | "INACTIVE" | "SUSPENDED" } : {}),
        ...(department ? { department: { name: department } } : {}),
        ...(search
          ? {
              OR: [
                { user: { name: { contains: search, mode: "insensitive" } } },
                { user: { email: { contains: search, mode: "insensitive" } } },
                { employeeCode: { contains: search, mode: "insensitive" } },
              ],
            }
          : {}),
      },
      include: {
        user: { select: { id: true, name: true, email: true, role: true } },
        department: { select: { name: true } },
      },
      orderBy: { user: { name: "asc" } },
    });

    return NextResponse.json({ data: employees });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Failed to load employees." }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  let session;
  try {
    session = await requireAuth(["ADMIN", "MANAGER"]);
  } catch (err) {
    const { status, message } = handleAuthError(err);
    return NextResponse.json({ error: message }, { status });
  }

  try {
    const body = await req.json();
    const { name, email, password, role, department, jobTitle, phone, hiredAt } = body;

    if (!name || !email || !password || !department || !jobTitle || !hiredAt) {
      return NextResponse.json({ error: "All required fields must be provided." }, { status: 400 });
    }

    const existing = await prisma.user.findUnique({ where: { email: email.toLowerCase() } });
    if (existing) {
      return NextResponse.json({ error: "An account with this email already exists." }, { status: 409 });
    }

    const passwordHash = await bcrypt.hash(password, 12);

    const dept = await prisma.department.upsert({
      where: { name: department },
      create: { name: department },
      update: {},
    });

    const count = await prisma.employee.count();
    const employeeCode = `EMP-${String(count + 1).padStart(4, "0")}`;

    const user = await prisma.user.create({
      data: {
        name,
        email: email.toLowerCase(),
        passwordHash,
        role: role ?? "EMPLOYEE",
        employee: {
          create: {
            employeeCode,
            phone: phone || null,
            departmentId: dept.id,
            jobTitle,
            hiredAt: new Date(hiredAt),
          },
        },
      },
      include: { employee: true },
    });

    await writeAuditLog({
      actorId: session.userId,
      action: "EMPLOYEE_CREATED",
      targetType: "Employee",
      targetId: user.employee!.id,
      metadata: { name, email, department, employeeCode },
    });

    return NextResponse.json({ data: { id: user.employee!.id, employeeCode } }, { status: 201 });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Failed to create employee." }, { status: 500 });
  }
}
