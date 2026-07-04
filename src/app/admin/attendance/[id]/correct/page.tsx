"use client";

import Link from "next/link";
import { useActionState, useEffect, useState } from "react";
import { correctAttendance } from "../../actions";

type Rec = {
  id: string;
  date: string;
  checkInAt: string | null;
  checkOutAt: string | null;
  status: string;
  source: string;
  correctionReason: string | null;
  employee: { user: { name: string } };
};

function toLocalInput(iso: string | null): string {
  if (!iso) return "";
  const d = new Date(iso);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

export default function CorrectAttendancePage({ params }: { params: Promise<{ id: string }> }) {
  const [id, setId] = useState<string | null>(null);
  const [rec, setRec] = useState<Rec | null>(null);
  const [loadError, setLoadError] = useState("");

  useEffect(() => {
    params.then(({ id: rid }) => {
      setId(rid);
      fetch(`/api/admin/attendance?employee=&date=`, { method: "GET" })
        .then(() => {})
        .catch(() => {});
    });
  }, [params]);

  useEffect(() => {
    if (!id) return;
    fetch(`/api/admin/attendance?employee=`)
      .then((r) => r.json())
      .then((j) => {
        if (j.error) { setLoadError(j.error); return; }
        const found = j.data?.find((r: Rec) => r.id === id);
        if (!found) setLoadError("Record not found.");
        else setRec(found);
      })
      .catch(() => setLoadError("Failed to load record."));
  }, [id]);

  const boundAction = id ? correctAttendance.bind(null, id) : null;
  const [state, formAction, pending] = useActionState(
    boundAction ?? (async () => ({ error: "Loading…" })),
    null
  );

  if (loadError) {
    return (
      <div className="p-8">
        <div className="bg-red-50 border border-red-200 rounded-xl px-6 py-5 text-sm text-red-700">{loadError}</div>
      </div>
    );
  }

  if (!rec) {
    return (
      <div className="p-8">
        <div className="bg-white rounded-xl border border-gray-200 p-8 text-sm text-gray-400 text-center">Loading…</div>
      </div>
    );
  }

  return (
    <div className="p-8 max-w-lg">
      <div className="mb-8">
        <Link href="/admin/attendance" className="text-sm text-gray-500 hover:text-gray-700">
          ← Back to Attendance
        </Link>
        <h1 className="text-2xl font-bold text-gray-900 mt-3">Correct Attendance Record</h1>
        <p className="text-sm text-gray-500 mt-1">{rec.employee.user.name} · {rec.date}</p>
      </div>

      {/* Original values */}
      <div className="bg-gray-50 rounded-xl border border-gray-200 p-5 mb-6">
        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Original Values</p>
        <dl className="space-y-2 text-sm">
          <div className="flex justify-between">
            <dt className="text-gray-500">Check In</dt>
            <dd className="text-gray-900 font-medium">{rec.checkInAt ? new Date(rec.checkInAt).toLocaleString() : "—"}</dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-gray-500">Check Out</dt>
            <dd className="text-gray-900 font-medium">{rec.checkOutAt ? new Date(rec.checkOutAt).toLocaleString() : "—"}</dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-gray-500">Status</dt>
            <dd className="text-gray-900 font-medium">{rec.status}</dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-gray-500">Source</dt>
            <dd className="text-gray-900 font-mono text-xs">{rec.source}</dd>
          </div>
        </dl>
      </div>

      {/* Correction form */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        {state?.error && (
          <div className="rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700 mb-5">
            {state.error}
          </div>
        )}

        <form action={formAction} className="space-y-5">
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1.5">New Check-in Time</label>
            <input
              name="checkInAt"
              type="datetime-local"
              defaultValue={toLocalInput(rec.checkInAt)}
              className="w-full text-sm border border-gray-200 rounded-md px-3 py-2 text-gray-700 focus:outline-none focus:ring-1 focus:ring-indigo-400"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1.5">New Check-out Time</label>
            <input
              name="checkOutAt"
              type="datetime-local"
              defaultValue={toLocalInput(rec.checkOutAt)}
              className="w-full text-sm border border-gray-200 rounded-md px-3 py-2 text-gray-700 focus:outline-none focus:ring-1 focus:ring-indigo-400"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1.5">
              Correction Reason <span className="text-red-500">*</span>
            </label>
            <textarea
              name="correctionReason"
              required
              rows={3}
              placeholder="Describe why this record is being corrected…"
              className="w-full text-sm border border-gray-200 rounded-md px-3 py-2 text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-indigo-400 resize-none"
            />
          </div>

          <div className="bg-amber-50 border border-amber-200 rounded-lg px-4 py-3 text-xs text-amber-800">
            This correction will be logged in the audit trail. The original values cannot be recovered.
          </div>

          <div className="flex items-center gap-3 pt-2 border-t border-gray-100">
            <button type="submit" disabled={pending}
              className="px-5 py-2.5 bg-indigo-600 text-white text-sm font-semibold rounded-lg hover:bg-indigo-700 disabled:opacity-60 transition-colors">
              {pending ? "Saving…" : "Save Correction"}
            </button>
            <Link href="/admin/attendance"
              className="px-5 py-2.5 text-sm font-medium text-gray-600 hover:text-gray-900">
              Cancel
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}
