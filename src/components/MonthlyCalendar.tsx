import { generateCalendarCells, padDate } from "@/lib/format";
import { CalendarDot } from "@/components/StatusBadge";

type CalendarEntry = {
  employeeId: string;
  date: string;
  status: string;
  checkInAt: string | null;
  checkOutAt: string | null;
  totalMinutes: number | null;
  isLate: boolean;
  lateMinutes: number;
};

const WEEK_DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

type Props = {
  year: number;
  month: number;
  entries: CalendarEntry[];
};

export function MonthlyCalendar({ year, month, entries }: Props) {
  const cells = generateCalendarCells(year, month);
  const entryMap = new Map(entries.map((e) => [e.date, e]));

  return (
    <div>
      {/* Legend */}
      <div className="flex flex-wrap gap-3 mb-4 text-xs text-gray-500">
        {[
          { label: "Present",          dot: "bg-green-500" },
          { label: "Late",             dot: "bg-amber-500" },
          { label: "Half Day",         dot: "bg-blue-500" },
          { label: "Absent",           dot: "bg-red-500" },
          { label: "On Leave",         dot: "bg-purple-500" },
          { label: "Missing Checkout", dot: "bg-orange-500" },
        ].map(({ label, dot }) => (
          <span key={label} className="flex items-center gap-1.5">
            <span className={`w-2.5 h-2.5 rounded-sm inline-block ${dot}`} />
            {label}
          </span>
        ))}
      </div>

      {/* Week day headers */}
      <div className="grid grid-cols-7 mb-1">
        {WEEK_DAYS.map((d) => (
          <div key={d} className="text-center text-xs font-medium text-gray-400 py-2">
            {d}
          </div>
        ))}
      </div>

      {/* Calendar grid */}
      <div className="grid grid-cols-7 gap-1">
        {cells.map((day, idx) => {
          if (day === null) {
            return <div key={idx} className="h-14 rounded-md bg-gray-50" />;
          }

          const dateStr = padDate(year, month, day);
          const entry = entryMap.get(dateStr);
          const isWeekend = (() => {
            const dow = new Date(year, month - 1, day).getDay();
            return dow === 0 || dow === 6;
          })();

          return (
            <div
              key={idx}
              title={entry ? `${dateStr}: ${entry.status}` : dateStr}
              className={`h-14 rounded-md border p-1.5 flex flex-col justify-between transition-colors ${
                isWeekend
                  ? "bg-gray-50 border-gray-100"
                  : entry
                  ? "bg-white border-gray-200 hover:border-gray-300"
                  : "bg-white border-gray-100"
              }`}
            >
              <span className={`text-xs font-medium leading-none ${isWeekend ? "text-gray-400" : "text-gray-600"}`}>
                {day}
              </span>
              <div>
                {entry && <CalendarDot status={entry.status} />}
                {!entry && !isWeekend && (
                  <span className="text-gray-200 text-xs">—</span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
