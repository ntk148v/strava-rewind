"use client";

interface MonthlyChartProps {
  data: { month: string; value: number }[];
  label: string;
  unit?: string;
  color?: string;
}

export default function MonthlyChart({
  data,
  label,
  unit = "",
  color = "#fc4c02",
}: MonthlyChartProps) {
  const maxValue = Math.max(...data.map((d) => d.value), 1);

  return (
    <div className="stat-card">
      <h3 className="text-sm text-zinc-400 mb-4">{label}</h3>

      <div className="flex items-end gap-1 h-32">
        {data.map((item, index) => {
          const heightPercent = (item.value / maxValue) * 100;
          return (
            <div
              key={index}
              className="flex-1 flex flex-col items-center gap-1"
            >
              {/* Bar */}
              <div className="w-full flex-1 flex items-end">
                <div
                  className="w-full rounded-t transition-all duration-500 hover:opacity-80"
                  style={{
                    height: `${Math.max(heightPercent, 2)}%`,
                    minHeight: item.value > 0 ? "4px" : "2px",
                    background:
                      item.value > 0
                        ? `linear-gradient(to top, ${color}, ${color}dd)`
                        : "rgba(255,255,255,0.1)",
                  }}
                  title={`${item.month}: ${item.value.toLocaleString()}${unit}`}
                />
              </div>
              {/* Label */}
              <span className="text-xs text-zinc-500">
                {item.month.slice(0, 1)}
              </span>
            </div>
          );
        })}
      </div>

      {/* Y-axis labels */}
      <div className="flex justify-between text-xs text-zinc-500 mt-2">
        <span>0</span>
        <span>
          {maxValue.toLocaleString()}
          {unit}
        </span>
      </div>
    </div>
  );
}
