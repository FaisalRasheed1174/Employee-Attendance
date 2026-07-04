"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { formatTime } from "@/lib/format";

type Props = {
  todayRecord:
    | {
        checkInAt: string | null;
        checkOutAt: string | null;
        status: string;
      }
    | undefined;
};

type LocationState = "idle" | "requesting" | "denied" | "ready" | "submitting";

export function CheckInOutPanel({ todayRecord }: Props) {
  const router = useRouter();
  const [locationState, setLocationState] = useState<LocationState>("idle");
  const [coords, setCoords] = useState<{ latitude: number; longitude: number; accuracyMeters: number } | null>(null);
  const [apiError, setApiError] = useState("");

  const hasCheckedIn  = !!todayRecord?.checkInAt;
  const hasCheckedOut = !!todayRecord?.checkOutAt;

  function requestLocation() {
    setLocationState("requesting");
    setApiError("");

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setCoords({
          latitude: pos.coords.latitude,
          longitude: pos.coords.longitude,
          accuracyMeters: pos.coords.accuracy,
        });
        setLocationState("ready");
      },
      () => {
        setLocationState("denied");
      },
      { enableHighAccuracy: true, timeout: 15_000, maximumAge: 0 }
    );
  }

  async function handleAction(endpoint: string) {
    if (!coords) return;
    setLocationState("submitting");
    setApiError("");

    try {
      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(coords),
      });

      const json = await res.json();

      if (!res.ok) {
        setApiError(json.error ?? "An unexpected error occurred.");
        setLocationState("ready");
        return;
      }

      router.refresh();
    } catch {
      setApiError("Network error. Please try again.");
      setLocationState("ready");
    }
  }

  const locationBannerClass =
    locationState === "idle"
      ? "bg-gray-50 text-gray-500 border-gray-200"
      : locationState === "requesting" || locationState === "submitting"
      ? "bg-blue-50 text-blue-700 border-blue-200"
      : locationState === "denied"
      ? "bg-red-50 text-red-700 border-red-200"
      : "bg-green-50 text-green-700 border-green-200";

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6">
      <h2 className="text-sm font-semibold text-gray-700 mb-4">Attendance Action</h2>

      {/* Location status banner */}
      <div className={`rounded-lg px-4 py-3 text-sm mb-4 border ${locationBannerClass}`}>
        {locationState === "idle"       && "Allow location access to check in."}
        {locationState === "requesting" && "Getting your location…"}
        {locationState === "submitting" && "Submitting…"}
        {locationState === "denied"     && "Location permission denied. Enable it in your browser settings and try again."}
        {locationState === "ready"      && "Location verified. You are ready to record attendance."}
      </div>

      {/* API error */}
      {apiError && (
        <div className="rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700 mb-4">
          {apiError}
        </div>
      )}

      {/* Times row */}
      {hasCheckedIn && (
        <div className="grid grid-cols-2 gap-4 mb-5">
          <div className="bg-green-50 rounded-lg p-3">
            <p className="text-xs text-gray-500 mb-1">Checked In</p>
            <p className="text-lg font-bold text-green-700">{formatTime(todayRecord!.checkInAt)}</p>
          </div>
          <div className={`rounded-lg p-3 ${hasCheckedOut ? "bg-blue-50" : "bg-gray-50"}`}>
            <p className="text-xs text-gray-500 mb-1">Checked Out</p>
            <p className={`text-lg font-bold ${hasCheckedOut ? "text-blue-700" : "text-gray-400"}`}>
              {hasCheckedOut ? formatTime(todayRecord!.checkOutAt) : "—"}
            </p>
          </div>
        </div>
      )}

      {/* Action buttons */}
      {!hasCheckedIn && locationState !== "ready" && (
        <button
          onClick={requestLocation}
          disabled={locationState === "requesting" || locationState === "submitting"}
          className="w-full py-3 rounded-lg bg-indigo-600 text-white text-sm font-semibold hover:bg-indigo-700 disabled:opacity-60 transition-colors"
        >
          {locationState === "requesting" ? "Getting Location…" : "Enable Location & Check In"}
        </button>
      )}

      {!hasCheckedIn && locationState === "ready" && (
        <button
          onClick={() => handleAction("/api/attendance/check-in")}
          className="w-full py-3 rounded-lg bg-green-600 text-white text-sm font-semibold hover:bg-green-700 transition-colors"
        >
          Check In
        </button>
      )}

      {hasCheckedIn && !hasCheckedOut && locationState !== "ready" && locationState !== "submitting" && (
        <button
          onClick={requestLocation}
          disabled={locationState === "requesting"}
          className="w-full py-3 rounded-lg bg-indigo-600 text-white text-sm font-semibold hover:bg-indigo-700 disabled:opacity-60 transition-colors"
        >
          {locationState === "requesting" ? "Getting Location…" : "Enable Location & Check Out"}
        </button>
      )}

      {hasCheckedIn && !hasCheckedOut && locationState === "ready" && (
        <button
          onClick={() => handleAction("/api/attendance/check-out")}
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
