import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth, handleAuthError } from "@/lib/auth";

export async function GET(req: NextRequest) {
  try {
    await requireAuth(["ADMIN"]);
  } catch (err) {
    const { status, message } = handleAuthError(err);
    return NextResponse.json({ error: message }, { status });
  }

  try {
    const sp = new URL(req.url).searchParams;
    const action = sp.get("action");
    const actorId = sp.get("actor");
    const month = sp.get("month");

    const logs = await prisma.auditLog.findMany({
      where: {
        ...(action ? { action } : {}),
        ...(actorId ? { actorId } : {}),
        ...(month
          ? (() => {
              const [y, m] = month.split("-").map(Number);
              return {
                createdAt: {
                  gte: new Date(Date.UTC(y, m - 1, 1)),
                  lt: new Date(Date.UTC(y, m, 1)),
                },
              };
            })()
          : {}),
      },
      include: { actor: { select: { name: true } } },
      orderBy: { createdAt: "desc" },
      take: 500,
    });

    return NextResponse.json({ data: logs });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Failed to load audit logs." }, { status: 500 });
  }
}
