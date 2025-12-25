"use client";

import { YearStats } from "@/types";

interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  unlocked: boolean;
  progress?: number;
  target?: number;
}

interface AchievementBadgesProps {
  stats: YearStats;
}

function calculateAchievements(stats: YearStats): Achievement[] {
  const achievements: Achievement[] = [];

  // Marathon Month - 42km in running activities
  const avgMonthlyRunDistance =
    stats.sportStats
      .filter((s) => s.sport.toLowerCase().includes("run"))
      .reduce((sum, s) => sum + s.totalDistance, 0) / 12;

  achievements.push({
    id: "marathon-month",
    name: "Marathon Month",
    description: "Run 42km+ in a single month",
    icon: "🏃",
    unlocked: avgMonthlyRunDistance >= 42000,
    progress: Math.min(avgMonthlyRunDistance / 42000, 1) * 100,
    target: 42,
  });

  // Century Rider - 100km single ride
  const longestRide = stats.sportStats
    .filter((s) => s.sport.toLowerCase().includes("ride"))
    .reduce((max, s) => Math.max(max, s.longestActivity), 0);

  achievements.push({
    id: "century-rider",
    name: "Century Rider",
    description: "Complete a 100km+ ride",
    icon: "🚴",
    unlocked: longestRide >= 100000,
    progress: Math.min(longestRide / 100000, 1) * 100,
    target: 100,
  });

  // Week Warrior - 7 day streak
  achievements.push({
    id: "week-warrior",
    name: "Week Warrior",
    description: "Achieve a 7-day activity streak",
    icon: "🔥",
    unlocked: stats.longestStreak >= 7,
    progress: Math.min(stats.longestStreak / 7, 1) * 100,
    target: 7,
  });

  // Everest Climber - 8848m elevation
  achievements.push({
    id: "everest-climber",
    name: "Everest Climber",
    description: "Climb 8,848m total elevation (Mt. Everest height)",
    icon: "⛰️",
    unlocked: stats.totalElevation >= 8848,
    progress: Math.min(stats.totalElevation / 8848, 1) * 100,
    target: 8848,
  });

  // Consistency King - 100+ days active
  achievements.push({
    id: "consistency-king",
    name: "Consistency King",
    description: "Be active for 100+ days",
    icon: "👑",
    unlocked: stats.daysActive >= 100,
    progress: Math.min(stats.daysActive / 100, 1) * 100,
    target: 100,
  });

  // Social Star - 500+ kudos
  achievements.push({
    id: "social-star",
    name: "Social Star",
    description: "Receive 500+ kudos",
    icon: "⭐",
    unlocked: stats.totalKudos >= 500,
    progress: Math.min(stats.totalKudos / 500, 1) * 100,
    target: 500,
  });

  // Record Breaker - 10+ PRs
  achievements.push({
    id: "record-breaker",
    name: "Record Breaker",
    description: "Set 10+ personal records",
    icon: "🏆",
    unlocked: stats.totalPRs >= 10,
    progress: Math.min(stats.totalPRs / 10, 1) * 100,
    target: 10,
  });

  // Multi-Sport Athlete - 3+ sports
  achievements.push({
    id: "multi-sport",
    name: "Multi-Sport Athlete",
    description: "Practice 3+ different sports",
    icon: "🎯",
    unlocked: stats.sportStats.length >= 3,
    progress: Math.min(stats.sportStats.length / 3, 1) * 100,
    target: 3,
  });

  // Globe Trotter - 3+ countries
  achievements.push({
    id: "globe-trotter",
    name: "Globe Trotter",
    description: "Work out in 3+ countries",
    icon: "🌍",
    unlocked: stats.countries.length >= 3,
    progress: Math.min(stats.countries.length / 3, 1) * 100,
    target: 3,
  });

  // Early Bird - Prefer morning workouts
  const totalTimeActivities =
    stats.morningActivities +
    stats.afternoonActivities +
    stats.eveningActivities;
  const morningPercent =
    totalTimeActivities > 0
      ? (stats.morningActivities / totalTimeActivities) * 100
      : 0;

  achievements.push({
    id: "early-bird",
    name: "Early Bird",
    description: "Do 50%+ of workouts in the morning",
    icon: "🌅",
    unlocked: morningPercent >= 50,
    progress: Math.min(morningPercent / 50, 1) * 100,
    target: 50,
  });

  return achievements;
}

export default function AchievementBadges({ stats }: AchievementBadgesProps) {
  const achievements = calculateAchievements(stats);

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3 stat-card">
      {achievements.map((achievement) => (
        <div
          key={achievement.id}
          className={`relative p-3 rounded-xl text-center transition-all ${
            achievement.unlocked
              ? "bg-gradient-to-br from-orange-500/20 to-yellow-500/10 border border-orange-500/30"
              : "bg-zinc-800/50 border border-zinc-700/50 opacity-50"
          }`}
          title={achievement.description}
        >
          <div
            className={`text-2xl mb-1 ${
              achievement.unlocked ? "" : "grayscale"
            }`}
          >
            {achievement.icon}
          </div>
          <div className="text-xs font-medium truncate">{achievement.name}</div>
          {!achievement.unlocked && achievement.progress !== undefined && (
            <div className="mt-1 h-1 bg-zinc-700 rounded-full overflow-hidden">
              <div
                className="h-full bg-orange-500/50 rounded-full"
                style={{ width: `${achievement.progress}%` }}
              />
            </div>
          )}
          {achievement.unlocked && (
            <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 rounded-full flex items-center justify-center">
              <svg
                className="w-2.5 h-2.5 text-white"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={3}
                  d="M5 13l4 4L19 7"
                />
              </svg>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
