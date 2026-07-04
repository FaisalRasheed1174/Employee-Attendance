import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { createSession } from "@/lib/auth";
import { writeAuditLog } from "@/lib/audit";

export async function POST(req: NextRequest) {
  try {
    const { email, password } = await req.json();

    if (!email || !password) {
      return NextResponse.json({ error: "Email and password are required." }, { status: 400 });
    }

    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase().trim() },
      include: { employee: { select: { id: true } } },
    });

    if (!user || !(await bcrypt.compare(password, user.passwordHash))) {
      return NextResponse.json({ error: "Invalid email or password." }, { status: 401 });
    }

    if (user.status !== "ACTIVE") {
      return NextResponse.json(
        { error: "Your account is inactive. Contact your administrator." },
        { status: 403 }
      );
    }

    await prisma.user.update({
      where: { id: user.id },
      data: { lastLoginAt: new Date() },
    });

    await createSession({
      userId: user.id,
      role: user.role,
      employeeId: user.employee?.id ?? null,
      name: user.name,
    });

    await writeAuditLog({
      actorId: user.id,
      action: "USER_LOGIN",
      targetType: "User",
      targetId: user.id,
      metadata: { role: user.role },
      ipAddress: req.headers.get("x-forwarded-for")?.split(",")[0].trim(),
      userAgent: req.headers.get("user-agent"),
    });

    return NextResponse.json({ data: { role: user.role, name: user.name } });
  } catch (err) {
    console.error("Login error:", err);
    return NextResponse.json({ error: "An unexpected error occurred." }, { status: 500 });
  }
}
