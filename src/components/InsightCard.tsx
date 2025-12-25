import { Insight } from "@/types";

interface InsightCardProps {
  insight: Insight;
}

export default function InsightCard({ insight }: InsightCardProps) {
  return (
    <div className="insight-card">
      <span className="text-3xl">{insight.icon}</span>
      <div>
        <p className="text-white">
          {insight.message
            .split(insight.highlight || "")
            .map((part, i, arr) => (
              <span key={i}>
                {part}
                {i < arr.length - 1 && (
                  <span className="gradient-text font-semibold">
                    {insight.highlight}
                  </span>
                )}
              </span>
            ))}
        </p>
      </div>
    </div>
  );
}
