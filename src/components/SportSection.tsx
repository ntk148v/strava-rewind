import { SportStats } from "@/types";
import { formatDistance, formatDuration, formatSportType } from "@/lib/stats";

interface SportSectionProps {
  sport: SportStats;
  index: number;
}

const SPORT_ICONS: Record<string, string> = {
  Run: "🏃",
  TrailRun: "🏃‍♂️",
  Ride: "🚴",
  MountainBikeRide: "🚵",
  GravelRide: "🚴‍♂️",
  VirtualRide: "🚴‍♀️",
  VirtualRun: "🏃‍♀️",
  Walk: "🚶",
  Hike: "🥾",
  Swim: "🏊",
  WeightTraining: "🏋️",
  Yoga: "🧘",
  Workout: "💪",
  EBikeRide: "🔋",
};

const SPORT_COLORS: Record<string, string> = {
  Run: "from-orange-500 to-red-500",
  TrailRun: "from-green-500 to-emerald-600",
  Ride: "from-blue-500 to-cyan-500",
  MountainBikeRide: "from-amber-500 to-orange-500",
  GravelRide: "from-yellow-500 to-amber-500",
  VirtualRide: "from-purple-500 to-pink-500",
  VirtualRun: "from-pink-500 to-rose-500",
  Walk: "from-teal-500 to-green-500",
  Hike: "from-emerald-500 to-green-600",
  Swim: "from-cyan-500 to-blue-500",
  WeightTraining: "from-red-500 to-orange-500",
  Yoga: "from-violet-500 to-purple-500",
  Workout: "from-rose-500 to-red-500",
  EBikeRide: "from-lime-500 to-green-500",
};

export default function SportSection({ sport, index }: SportSectionProps) {
  const icon = SPORT_ICONS[sport.sport] || "🏅";
  const colorClass = SPORT_COLORS[sport.sport] || "from-zinc-500 to-zinc-600";

  return (
    <div
      className="stat-card relative overflow-hidden"
      style={{ animationDelay: `${index * 100}ms` }}
    >
      {/* Gradient accent */}
      <div
        className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${colorClass}`}
      />

      <div className="flex items-center gap-3 mb-4">
        <span className="text-3xl">{icon}</span>
        <div>
          <h3 className="font-semibold text-lg">
            {formatSportType(sport.sport)}
          </h3>
          <p className="text-zinc-500 text-sm">
            {sport.activityCount} activities
          </p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <p className="text-zinc-400 text-xs mb-1">Distance</p>
          <p className="font-semibold">{formatDistance(sport.totalDistance)}</p>
        </div>
        <div>
          <p className="text-zinc-400 text-xs mb-1">Time</p>
          <p className="font-semibold">{formatDuration(sport.totalTime)}</p>
        </div>
        <div>
          <p className="text-zinc-400 text-xs mb-1">Elevation</p>
          <p className="font-semibold">
            {Math.round(sport.totalElevation).toLocaleString()} m
          </p>
        </div>
        <div>
          <p className="text-zinc-400 text-xs mb-1">Kudos</p>
          <p className="font-semibold">{sport.kudosReceived}</p>
        </div>
      </div>

      {sport.prCount > 0 && (
        <div className="mt-4 pt-4 border-t border-white/5">
          <span className="inline-flex items-center gap-1 text-sm text-amber-400">
            <span>⭐</span> {sport.prCount} Personal Records
          </span>
        </div>
      )}
    </div>
  );
}
