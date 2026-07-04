import { prisma } from "./prisma";

export async function writeAuditLog({
  actorId,
  action,
  targetType,
  targetId,
  metadata = {},
  ipAddress,
  userAgent,
}: {
  actorId: string;
  action: string;
  targetType: string;
  targetId: string;
  metadata?: Record<string, unknown>;
  ipAddress?: string | null;
  userAgent?: string | null;
}): Promise<void> {
  try {
    await prisma.auditLog.create({
      data: {
        actorId,
        action,
        targetType,
        targetId,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        metadata: metadata as any,
        ipAddress,
        userAgent,
      },
    });
  } catch (err) {
    console.error("Failed to write audit log:", err);
  }
}
