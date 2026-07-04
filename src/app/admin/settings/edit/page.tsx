import Link from "next/link";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth";
import { writeAuditLog } from "@/lib/audit";

async function updatePolicy(formData: FormData) {
  "use server";
  let session;
  try {
    session = await requireAuth(["ADMIN"]);
  } catch {
    redirect("/admin/settings/edit?error=Only+admins+can+modify+the+attendance+policy.");
  }

  const officeName = (formData.get("officeName") as string)?.trim();
  const officeLatitude = parseFloat(formData.get("officeLatitude") as string);
  const officeLongitude = parseFloat(formData.get("officeLongitude") as string);
  const allowedRadiusMeters = parseInt(formData.get("allowedRadiusMeters") as string, 10);
  const workStartTime = formData.get("workStartTime") as string;
  const timezone = formData.get("timezone") as string;
  const minimumFullDayMinutes = parseInt(formData.get("minimumFullDayMinutes") as string, 10);
  const minimumHalfDayMinutes = parseInt(formData.get("minimumHalfDayMinutes") as string, 10);
  const active = formData.get("active") === "on";

  if (!officeName || isNaN(officeLatitude) || isNaN(officeLongitude)) {
    redirect("/admin/settings/edit?error=Office+name+and+valid+coordinates+are+required.");
  }

  const existing = await prisma.attendancePolicy.findFirst({ where: { active: true } });

  const updated = existing
    ? await prisma.attendancePolicy.update({
        where: { id: existing.id },
        data: { officeName, officeLatitude, officeLongitude, allowedRadiusMeters, workStartTime, timezone, minimumFullDayMinutes, minimumHalfDayMinutes, active },
      })
    : await prisma.attendancePolicy.create({
        data: { officeName, officeLatitude, officeLongitude, allowedRadiusMeters, workStartTime, timezone, minimumFullDayMinutes, minimumHalfDayMinutes, active },
      });

  await writeAuditLog({
    actorId: session.userId,
    action: "POLICY_UPDATED",
    targetType: "AttendancePolicy",
    targetId: updated.id,
    metadata: { officeName, allowedRadiusMeters, active },
  });

  revalidatePath("/admin/settings");
  redirect("/admin/settings");
}

export default async function EditPolicyPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const sp = await searchParams;
  let policy: Awaited<ReturnType<typeof prisma.attendancePolicy.findFirst>> = null;
  try {
    policy = await prisma.attendancePolicy.findFirst({ where: { active: true } });
  } catch {
    // DB not connected — show empty form
  }

  return (
    <div className="p-8 max-w-2xl">
      <div className="mb-8">
        <Link href="/admin/settings" className="text-sm text-gray-500 hover:text-gray-700">
          ← Back to Settings
        </Link>
        <h1 className="text-2xl font-bold text-gray-900 mt-3">Edit Attendance Policy</h1>
        <p className="text-sm text-gray-500 mt-1">Changes take effect immediately for all employees.</p>
      </div>

      {sp.error && (
        <div className="mb-5 rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
          {decodeURIComponent(sp.error)}
        </div>
      )}

      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <form action={updatePolicy} className="space-y-5">
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1.5">Office Name <span className="text-red-500">*</span></label>
            <input name="officeName" type="text" required defaultValue={policy?.officeName ?? ""}
              placeholder="e.g. Main Office — Riyadh"
              className="w-full text-sm border border-gray-200 rounded-md px-3 py-2 text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-indigo-400" />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1.5">Office Latitude <span className="text-red-500">*</span></label>
              <input name="officeLatitude" type="number" step="any" required defaultValue={policy?.officeLatitude ?? ""}
                className="w-full text-sm border border-gray-200 rounded-md px-3 py-2 text-gray-700 focus:outline-none focus:ring-1 focus:ring-indigo-400" />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1.5">Office Longitude <span className="text-red-500">*</span></label>
              <input name="officeLongitude" type="number" step="any" required defaultValue={policy?.officeLongitude ?? ""}
                className="w-full text-sm border border-gray-200 rounded-md px-3 py-2 text-gray-700 focus:outline-none focus:ring-1 focus:ring-indigo-400" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1.5">Allowed Radius (meters)</label>
              <input name="allowedRadiusMeters" type="number" min="50" max="5000" defaultValue={policy?.allowedRadiusMeters ?? 200}
                className="w-full text-sm border border-gray-200 rounded-md px-3 py-2 text-gray-700 focus:outline-none focus:ring-1 focus:ring-indigo-400" />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1.5">Work Start Time</label>
              <input name="workStartTime" type="time" defaultValue={policy?.workStartTime ?? "08:00"}
                className="w-full text-sm border border-gray-200 rounded-md px-3 py-2 text-gray-700 focus:outline-none focus:ring-1 focus:ring-indigo-400" />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1.5">Timezone</label>
            <input name="timezone" type="text" defaultValue={policy?.timezone ?? "Asia/Riyadh"}
              placeholder="e.g. Asia/Riyadh"
              className="w-full text-sm border border-gray-200 rounded-md px-3 py-2 text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-indigo-400" />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1.5">Min. Full Day (minutes)</label>
              <input name="minimumFullDayMinutes" type="number" min="60" max="600" defaultValue={policy?.minimumFullDayMinutes ?? 420}
                className="w-full text-sm border border-gray-200 rounded-md px-3 py-2 text-gray-700 focus:outline-none focus:ring-1 focus:ring-indigo-400" />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1.5">Min. Half Day (minutes)</label>
              <input name="minimumHalfDayMinutes" type="number" min="30" max="300" defaultValue={policy?.minimumHalfDayMinutes ?? 210}
                className="w-full text-sm border border-gray-200 rounded-md px-3 py-2 text-gray-700 focus:outline-none focus:ring-1 focus:ring-indigo-400" />
            </div>
          </div>

          <div>
            <label className="flex items-center gap-3 text-sm text-gray-700 cursor-pointer">
              <input name="active" type="checkbox" defaultChecked={policy?.active ?? true}
                className="w-4 h-4 rounded text-indigo-600" />
              Policy is active (employees can check in/out)
            </label>
          </div>

          <div className="flex items-center gap-3 pt-5 border-t border-gray-100">
            <button type="submit"
              className="px-5 py-2.5 bg-indigo-600 text-white text-sm font-semibold rounded-lg hover:bg-indigo-700 transition-colors">
              Save Policy
            </button>
            <Link href="/admin/settings"
              className="px-5 py-2.5 text-sm font-medium text-gray-600 hover:text-gray-900">
              Cancel
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}
