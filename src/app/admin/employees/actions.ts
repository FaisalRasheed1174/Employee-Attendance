"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth";
import { writeAuditLog } from "@/lib/audit";

export async function createEmployee(_prevState: unknown, formData: FormData) {
  let session;
  try {
    session = await requireAuth(["ADMIN", "MANAGER"]);
  } catch {
    return { error: "You do not have permission to create employees." };
  }

  const name = (formData.get("name") as string)?.trim();
  const email = (formData.get("email") as string)?.trim().toLowerCase();
  const password = formData.get("password") as string;
  const phone = (formData.get("phone") as string)?.trim();
  const department = (formData.get("department") as string)?.trim();
  const jobTitle = (formData.get("jobTitle") as string)?.trim();
  const hiredAt = formData.get("hiredAt") as string;
  const role = (formData.get("role") as string) ?? "EMPLOYEE";

  if (!name || !email || !password || !department || !jobTitle || !hiredAt) {
    return { error: "All required fields must be filled." };
  }
  if (password.length < 8) {
    return { error: "Password must be at least 8 characters." };
  }

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) return { error: "An account with this email already exists." };

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
      email,
      passwordHash,
      role: role as "ADMIN" | "MANAGER" | "EMPLOYEE",
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

  revalidatePath("/admin/employees");
  redirect("/admin/employees");
}

export async function updateEmployee(id: string, _prevState: unknown, formData: FormData) {
  let session;
  try {
    session = await requireAuth(["ADMIN", "MANAGER"]);
  } catch {
    return { error: "You do not have permission to edit employees." };
  }

  const name = (formData.get("name") as string)?.trim();
  const phone = (formData.get("phone") as string)?.trim();
  const department = (formData.get("department") as string)?.trim();
  const jobTitle = (formData.get("jobTitle") as string)?.trim();
  const hiredAt = formData.get("hiredAt") as string;
  const role = formData.get("role") as string;
  const status = formData.get("status") as string;

  if (!name || !department || !jobTitle || !hiredAt) {
    return { error: "All required fields must be filled." };
  }

  const employee = await prisma.employee.findUnique({ where: { id }, include: { user: true } });
  if (!employee) return { error: "Employee not found." };

  const dept = await prisma.department.upsert({
    where: { name: department },
    create: { name: department },
    update: {},
  });

  await prisma.$transaction([
    prisma.user.update({
      where: { id: employee.userId },
      data: { name, role: role as "ADMIN" | "MANAGER" | "EMPLOYEE" },
    }),
    prisma.employee.update({
      where: { id },
      data: {
        phone: phone || null,
        departmentId: dept.id,
        jobTitle,
        hiredAt: new Date(hiredAt),
        status: status as "ACTIVE" | "INACTIVE" | "SUSPENDED",
      },
    }),
  ]);

  await writeAuditLog({
    actorId: session.userId,
    action: "EMPLOYEE_UPDATED",
    targetType: "Employee",
    targetId: id,
    metadata: { name, department, jobTitle },
  });

  revalidatePath(`/admin/employees/${id}`);
  revalidatePath("/admin/employees");
  redirect(`/admin/employees/${id}`);
}

export async function deactivateEmployee(id: string) {
  let session;
  try {
    session = await requireAuth(["ADMIN"]);
  } catch {
    return { error: "Unauthorized." };
  }

  const employee = await prisma.employee.findUnique({ where: { id } });
  if (!employee) return { error: "Employee not found." };

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

  revalidatePath("/admin/employees");
  redirect("/admin/employees");
}
