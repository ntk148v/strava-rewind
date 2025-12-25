"use client";

interface ActivityHeatmapProps {
  activityDates: string[];
  year: number;
}

const MONTHS = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];

function getActivityCountByDate(dates: string[]): Map<string, number> {
  const countMap = new Map<string, number>();
  dates.forEach((date) => {
    const dateKey = new Date(date).toISOString().split("T")[0];
    countMap.set(dateKey, (countMap.get(dateKey) || 0) + 1);
  });
  return countMap;
}

function getIntensityClass(count: number): string {
  if (count === 0) return "bg-zinc-800/50";
  if (count === 1) return "bg-orange-900/60";
  if (count === 2) return "bg-orange-600/80";
  if (count >= 3) return "bg-orange-500";
  return "bg-zinc-800/50";
}

export default function ActivityHeatmap({
  activityDates,
  year,
}: ActivityHeatmapProps) {
  const activityCounts = getActivityCountByDate(activityDates);

  // Generate all weeks for the year (simplified - 52 weeks)
  const weeks: { dates: Date[]; weekNum: number }[] = [];
  const startDate = new Date(year, 0, 1);

  // Find first Sunday
  const firstSunday = new Date(startDate);
  firstSunday.setDate(firstSunday.getDate() - firstSunday.getDay());

  let currentDate = new Date(firstSunday);
  const endOfYear = new Date(year, 11, 31);

  while (currentDate <= endOfYear || weeks.length < 53) {
    const week: Date[] = [];
    for (let i = 0; i < 7; i++) {
      week.push(new Date(currentDate));
      currentDate.setDate(currentDate.getDate() + 1);
    }
    weeks.push({ dates: week, weekNum: weeks.length });
    if (currentDate > endOfYear && weeks.length >= 52) break;
  }

  return (
    <div>
      <h4 className="text-sm text-zinc-400 mb-3">Activity Calendar</h4>

      {/* Month labels */}
      <div className="flex text-xs text-zinc-500 mb-1 pl-6">
        {MONTHS.map((month, i) => (
          <div
            key={month}
            className="flex-1 text-center"
            style={{ minWidth: 0 }}
          >
            {i % 2 === 0 ? month : ""}
          </div>
        ))}
      </div>

      <div className="flex gap-1">
        {/* Day labels */}
        <div
          className="flex flex-col justify-around text-xs text-zinc-500 pr-1"
          style={{ width: "20px" }}
        >
          <span>M</span>
          <span>W</span>
          <span>F</span>
        </div>

        {/* Grid */}
        <div
          className="flex-1 grid gap-[2px]"
          style={{ gridTemplateColumns: `repeat(53, 1fr)` }}
        >
          {weeks.map((week, weekIndex) => (
            <div key={weekIndex} className="flex flex-col gap-[2px]">
              {week.dates.map((date, dayIndex) => {
                const dateKey = date.toISOString().split("T")[0];
                const count = activityCounts.get(dateKey) || 0;
                const isCurrentYear = date.getFullYear() === year;

                return (
                  <div
                    key={dayIndex}
                    className={`aspect-square rounded-[2px] ${
                      isCurrentYear
                        ? getIntensityClass(count)
                        : "bg-transparent"
                    }`}
                    title={
                      isCurrentYear
                        ? `${date.toLocaleDateString()}: ${count} activities`
                        : ""
                    }
                  />
                );
              })}
            </div>
          ))}
        </div>
      </div>

      {/* Legend */}
      <div className="flex items-center justify-end gap-2 mt-3 text-xs text-zinc-500">
        <span>Less</span>
        <div className="flex gap-1">
          <div className="w-2.5 h-2.5 rounded-[2px] bg-zinc-800/50" />
          <div className="w-2.5 h-2.5 rounded-[2px] bg-orange-900/60" />
          <div className="w-2.5 h-2.5 rounded-[2px] bg-orange-600/80" />
          <div className="w-2.5 h-2.5 rounded-[2px] bg-orange-500" />
        </div>
        <span>More</span>
      </div>
    </div>
  );
}
