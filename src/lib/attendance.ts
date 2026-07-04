export function getTodayDate(timezone: string): Date {
  const str = new Intl.DateTimeFormat("en-CA", { timeZone: timezone }).format(new Date());
  const [y, m, d] = str.split("-").map(Number);
  return new Date(Date.UTC(y, m - 1, d));
}

export function calcLateness(
  now: Date,
  workStartTime: string,
  timezone: string
): { isLate: boolean; lateMinutes: number } {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: timezone,
    hour: "numeric",
    minute: "numeric",
    hour12: false,
  }).formatToParts(now);

  const h = parseInt(parts.find((p) => p.type === "hour")!.value, 10);
  const m = parseInt(parts.find((p) => p.type === "minute")!.value, 10);
  const nowTotal = h * 60 + m;

  const [sh, sm] = workStartTime.split(":").map(Number);
  const startTotal = sh * 60 + sm;

  if (nowTotal > startTotal) {
    return { isLate: true, lateMinutes: nowTotal - startTotal };
  }
  return { isLate: false, lateMinutes: 0 };
}

export function calcAttendanceStatus(
  totalMinutes: number,
  isLate: boolean,
  minimumFullDayMinutes: number,
  minimumHalfDayMinutes: number
): "PRESENT" | "LATE" | "HALF_DAY" {
  if (totalMinutes >= minimumFullDayMinutes) {
    return isLate ? "LATE" : "PRESENT";
  }
  if (totalMinutes >= minimumHalfDayMinutes) {
    return "HALF_DAY";
  }
  return "HALF_DAY";
}

export function formatDateUTC(d: Date): string {
  return new Intl.DateTimeFormat("en-CA").format(d);
}
