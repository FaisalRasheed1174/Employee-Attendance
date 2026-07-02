export function formatTime(isoString: string | null | undefined): string {
  if (!isoString) return "—";
  const timePart = isoString.split("T")[1]?.substring(0, 5) ?? "";
  const [hStr, mStr] = timePart.split(":");
  const h = parseInt(hStr, 10);
  const period = h >= 12 ? "PM" : "AM";
  const h12 = h % 12 || 12;
  return `${h12}:${mStr} ${period}`;
}

export function formatDate(dateString: string): string {
  const [year, month, day] = dateString.split("-").map(Number);
  const months = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
  return `${months[month - 1]} ${day}, ${year}`;
}

export function formatMonthLabel(monthString: string): string {
  const [year, month] = monthString.split("-").map(Number);
  const months = ["January","February","March","April","May","June","July","August","September","October","November","December"];
  return `${months[month - 1]} ${year}`;
}

export function formatMinutes(minutes: number | null | undefined): string {
  if (minutes == null || minutes === 0) return "—";
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return m > 0 ? `${h}h ${m}m` : `${h}h`;
}

export function formatTimestamp(isoString: string): string {
  const t = isoString.replace("Z", "").split("T");
  const [year, month, day] = t[0].split("-").map(Number);
  const [hStr, mStr] = (t[1] ?? "00:00").split(":");
  const h = parseInt(hStr, 10);
  const period = h >= 12 ? "PM" : "AM";
  const h12 = h % 12 || 12;
  const months = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
  return `${months[month - 1]} ${day} · ${h12}:${mStr} ${period}`;
}

export function generateCalendarCells(year: number, month: number): Array<number | null> {
  const daysInMonth = new Date(year, month, 0).getDate();
  const firstDayOfWeek = new Date(year, month - 1, 1).getDay(); // 0=Sun
  const mondayOffset = (firstDayOfWeek + 6) % 7; // shift to Mon=0
  const cells: Array<number | null> = [
    ...Array<null>(mondayOffset).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ];
  while (cells.length % 7 !== 0) cells.push(null);
  return cells;
}

export function padDate(year: number, month: number, day: number): string {
  return `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
}
