"use client";

interface SportData {
  name: string;
  value: number;
  color: string;
}

interface SportsPieChartProps {
  data: SportData[];
  total: number;
}

const SPORT_COLORS: Record<string, string> = {
  Run: "#f97316",
  TrailRun: "#22c55e",
  Ride: "#3b82f6",
  MountainBikeRide: "#f59e0b",
  GravelRide: "#eab308",
  VirtualRide: "#a855f7",
  VirtualRun: "#ec4899",
  Walk: "#14b8a6",
  Hike: "#10b981",
  Swim: "#06b6d4",
  WeightTraining: "#ef4444",
  Yoga: "#8b5cf6",
  Workout: "#f43f5e",
  EBikeRide: "#84cc16",
};

export function getSportColor(sport: string): string {
  return SPORT_COLORS[sport] || "#71717a";
}

export default function SportsPieChart({ data, total }: SportsPieChartProps) {
  // Calculate percentages and create segments
  let currentAngle = 0;
  const segments = data.map((item) => {
    const percentage = (item.value / total) * 100;
    const angle = (item.value / total) * 360;
    const segment = {
      ...item,
      percentage,
      startAngle: currentAngle,
      endAngle: currentAngle + angle,
    };
    currentAngle += angle;
    return segment;
  });

  // Create SVG arc path
  function describeArc(
    cx: number,
    cy: number,
    radius: number,
    startAngle: number,
    endAngle: number
  ): string {
    const start = polarToCartesian(cx, cy, radius, endAngle);
    const end = polarToCartesian(cx, cy, radius, startAngle);
    const largeArcFlag = endAngle - startAngle <= 180 ? "0" : "1";

    return [
      "M",
      cx,
      cy,
      "L",
      start.x,
      start.y,
      "A",
      radius,
      radius,
      0,
      largeArcFlag,
      0,
      end.x,
      end.y,
      "Z",
    ].join(" ");
  }

  function polarToCartesian(
    cx: number,
    cy: number,
    radius: number,
    angleInDegrees: number
  ) {
    const angleInRadians = ((angleInDegrees - 90) * Math.PI) / 180;
    return {
      x: cx + radius * Math.cos(angleInRadians),
      y: cy + radius * Math.sin(angleInRadians),
    };
  }

  return (
    <div className="stat-card">
      {/* <h3 className="section-header text-lg mb-4">
        <span>🎯</span> Sports Distribution
      </h3> */}

      <div className="flex items-start justify-between mb-3">
        <span className="text-2xl">🎯</span>
      </div>
      <p className="text-zinc-400 text-sm mb-1">Sports Distribution</p>

      <div className="flex items-center gap-6">
        {/* Pie Chart */}
        <div className="relative w-32 h-32 flex-shrink-0">
          <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
            {segments.map((segment, index) => (
              <path
                key={index}
                d={describeArc(
                  50,
                  50,
                  45,
                  segment.startAngle,
                  segment.endAngle - 0.5
                )}
                fill={segment.color}
                className="transition-opacity hover:opacity-80"
              />
            ))}
            {/* Center hole for donut effect */}
            <circle cx="50" cy="50" r="25" fill="var(--bg-card)" />
          </svg>
          {/* Center text */}
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-xl font-bold">{total}</span>
          </div>
        </div>

        {/* Legend */}
        <div className="flex-1 space-y-2">
          {segments.slice(0, 5).map((segment, index) => (
            <div key={index} className="flex items-center gap-2 text-sm">
              <div
                className="w-3 h-3 rounded-full flex-shrink-0"
                style={{ backgroundColor: segment.color }}
              />
              <span className="flex-1 truncate">{segment.name}</span>
              <span className="text-zinc-400">
                {segment.percentage.toFixed(0)}%
              </span>
            </div>
          ))}
          {segments.length > 5 && (
            <div className="text-xs text-zinc-500">
              +{segments.length - 5} more
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
