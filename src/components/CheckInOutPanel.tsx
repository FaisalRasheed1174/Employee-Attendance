"use client";

import { useState } from "react";
import { formatTime } from "@/lib/format";

type Props = {
  todayRecord: {
    checkInAt: string | null;
    checkOutAt: string | null;
    status: string;
  } | undefined;
};

export function CheckInOutPanel({ todayRecord }: Props) {
  const [locationState, setLocationState] = useState<"idle" | "requesting" | "denied" | "ready">("idle");

  const hasCheckedIn  = !!todayRecord?.checkInAt;
  const hasCheckedOut = !!todayRecord?.checkOutAt;

  function handleRequestLocation() {
    setLocationState("requesting");
    // Simulate location request
    setTimeout(() => setLocationState("ready"), 1200);
  }

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6">
      <h2 className="text-sm font-semibold text-gray-700 mb-4">Attendance Action</h2>

      {/* Location status */}
      <div className={`rounded-lg px-4 py-3 text-sm mb-5 ${
        locationState === "idle"       ? "bg-gray-50 text-gray-500 border border-gray-200" :
        locationState === "requesting" ? "bg-blue-50 text-blue-700 border border-blue-200" :
        locationState === "denied"     ? "bg-red-50 text-red-700 border border-red-200" :
                                         "bg-green-50 text-green-700 border border-green-200"
      }`}>
        {locationState === "idle"       && "Allow location access to check in."}
        {locationState === "requesting" && "Verifying your location…"}
        {locationState === "denied"     && "Location permission denied. Enable it in your browser and try again."}
        {locationState === "ready"      && "Location verified. You are within the office radius."}
      </div>

      {/* Times row */}
      {hasCheckedIn && (
        <div className="grid grid-cols-2 gap-4 mb-5">
          <div className="bg-green-50 rounded-lg p-3">
            <p className="text-xs text-gray-500 mb-1">Checked In</p>
            <p className="text-lg font-bold text-green-700">{formatTime(todayRecord!.checkInAt)}</p>
          </div>
          <div className={`rounded-lg p-3 ${hasCheckedOut ? "bg-red-50" : "bg-gray-50"}`}>
            <p className="text-xs text-gray-500 mb-1">Checked Out</p>
            <p className={`text-lg font-bold ${hasCheckedOut ? "text-red-700" : "text-gray-400"}`}>
              {hasCheckedOut ? formatTime(todayRecord!.checkOutAt) : "—"}
            </p>
          </div>
        </div>
      )}

      {/* Action buttons */}
      {!hasCheckedIn && (
        <div className="space-y-3">
          {locationState !== "ready" ? (
            <button
              onClick={handleRequestLocation}
              disabled={locationState === "requesting"}
              className="w-full py-3 rounded-lg bg-indigo-600 text-white text-sm font-semibold hover:bg-indigo-700 disabled:opacity-60 transition-colors"
            >
              {locationState === "requesting" ? "Getting Location…" : "Enable Location & Check In"}
            </button>
          ) : (
            <button
              onClick={() => alert("Check-in would POST coordinates to /api/attendance/check-in")}
              className="w-full py-3 rounded-lg bg-green-600 text-white text-sm font-semibold hover:bg-green-700 transition-colors"
            >
              Check In
            </button>
          )}
        </div>
      )}

      {hasCheckedIn && !hasCheckedOut && (
        <button
          onClick={() => alert("Check-out would POST coordinates to /api/attendance/check-out")}
          className="w-full py-3 rounded-lg bg-red-600 text-white text-sm font-semibold hover:bg-red-700 transition-colors"
        >
          Check Out
        </button>
      )}

      {hasCheckedIn && hasCheckedOut && (
        <div className="text-center py-3 text-green-600 font-medium text-sm">
          Attendance complete for today.
        </div>
      )}
    </div>
  );
}
