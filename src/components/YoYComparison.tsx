"use client";

interface YoYComparisonProps {
  currentYear: number;
  currentStats: {
    totalActivities: number;
    totalDistance: number;
    totalTime: number;
    totalElevation: number;
    daysActive: number;
  };
  previousStats: {
    totalActivities: number;
    totalDistance: number;
    totalTime: number;
    totalElevation: number;
    daysActive: number;
  } | null;
}

interface ComparisonItem {
  label: string;
  icon: string;
  current: number;
  previous: number;
  format: (value: number) => string;
}

function formatChange(
  current: number,
  previous: number
): { text: string; positive: boolean } {
  if (previous === 0) {
    return { text: "New!", positive: true };
  }

  const change = ((current - previous) / previous) * 100;
  const sign = change >= 0 ? "+" : "";

  return {
    text: `${sign}${change.toFixed(0)}%`,
    positive: change >= 0,
  };
}

export default function YoYComparison({
  currentYear,
  currentStats,
  previousStats,
}: YoYComparisonProps) {
  if (!previousStats) {
    return null;
  }

  const comparisons: ComparisonItem[] = [
    {
      label: "Activities",
      icon: "🏃",
      current: currentStats.totalActivities,
      previous: previousStats.totalActivities,
      format: (v) => v.toString(),
    },
    {
      label: "Distance",
      icon: "📏",
      current: currentStats.totalDistance,
      previous: previousStats.totalDistance,
      format: (v) => `${(v / 1000).toFixed(0)}km`,
    },
    {
      label: "Time",
      icon: "⏱️",
      current: currentStats.totalTime,
      previous: previousStats.totalTime,
      format: (v) => `${Math.round(v / 3600)}h`,
    },
    {
      label: "Elevation",
      icon: "⛰️",
      current: currentStats.totalElevation,
      previous: previousStats.totalElevation,
      format: (v) => `${Math.round(v)}m`,
    },
    {
      label: "Days Active",
      icon: "📅",
      current: currentStats.daysActive,
      previous: previousStats.daysActive,
      format: (v) => v.toString(),
    },
  ];

  return (
    <div className="stat-card">
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
        {comparisons.map((item) => {
          const change = formatChange(item.current, item.previous);

          return (
            <div key={item.label} className="text-center">
              <div className="text-lg mb-1">{item.icon}</div>
              <div className="text-xs text-zinc-400 mb-1">{item.label}</div>
              <div
                className={`text-lg font-bold ${
                  change.positive ? "text-green-400" : "text-red-400"
                }`}
              >
                {change.text}
              </div>
              <div className="text-xs text-zinc-500">
                {item.format(item.previous)} → {item.format(item.current)}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
