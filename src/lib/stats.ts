// Statistics Computation Engine
import {
  StravaActivity,
  StravaAthlete,
  YearStats,
  SportStats,
  Insight,
} from "@/types";

const DAYS_OF_WEEK = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
];
const MONTHS = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

export function computeYearStats(
  activities: StravaActivity[],
  athlete: StravaAthlete,
  year: number
): YearStats {
  if (activities.length === 0) {
    return getEmptyStats(athlete, year);
  }

  // Basic totals
  const totalDistance = activities.reduce((sum, a) => sum + a.distance, 0);
  const totalTime = activities.reduce((sum, a) => sum + a.moving_time, 0);
  const totalElevation = activities.reduce(
    (sum, a) => sum + a.total_elevation_gain,
    0
  );
  const totalKudos = activities.reduce((sum, a) => sum + a.kudos_count, 0);
  const totalPRs = activities.reduce((sum, a) => sum + a.pr_count, 0);

  // Sports breakdown
  const sportStats = computeSportStats(activities);
  const primarySport = sportStats.length > 0 ? sportStats[0].sport : "None";

  // Consistency metrics
  const {
    daysActive,
    longestStreak,
    avgWeeklyActivities,
    mostActiveDay,
    mostActiveMonth,
    biggestWeek,
    biggestMonth,
  } = computeConsistencyMetrics(activities, year);

  // Performance highlights
  const longestActivity = activities.reduce(
    (max, a) => (a.distance > (max?.distance || 0) ? a : max),
    activities[0]
  );
  const biggestClimb = activities.reduce(
    (max, a) =>
      a.total_elevation_gain > (max?.total_elevation_gain || 0) ? a : max,
    activities[0]
  );

  const runs = activities.filter((a) =>
    a.sport_type.toLowerCase().includes("run")
  );
  const rides = activities.filter((a) =>
    a.sport_type.toLowerCase().includes("ride")
  );

  const fastestRun =
    runs.length > 0
      ? runs.reduce(
          (max, a) => (a.average_speed > (max?.average_speed || 0) ? a : max),
          runs[0]
        )
      : null;
  const fastestRide =
    rides.length > 0
      ? rides.reduce(
          (max, a) => (a.average_speed > (max?.average_speed || 0) ? a : max),
          rides[0]
        )
      : null;

  // Location stats
  const countries = [
    ...new Set(activities.map((a) => a.location_country).filter(Boolean)),
  ] as string[];
  const cities = [
    ...new Set(activities.map((a) => a.location_city).filter(Boolean)),
  ] as string[];

  // Time preferences
  const {
    morningActivities,
    afternoonActivities,
    eveningActivities,
    preferredTime,
  } = computeTimePreferences(activities);

  // Generate insights
  const insights = generateInsights({
    activities,
    sportStats,
    daysActive,
    longestStreak,
    preferredTime,
    mostActiveMonth,
    countries,
    totalKudos,
    totalPRs,
    year,
  });

  // Activity dates for heatmap
  const activityDates = activities.map((a) => a.start_date_local);

  // Monthly data for charts
  const monthlyData = MONTHS.map((month, index) => {
    const monthActivities = activities.filter(
      (a) => new Date(a.start_date_local).getMonth() === index
    );
    return {
      month,
      activities: monthActivities.length,
      distance: monthActivities.reduce((sum, a) => sum + a.distance, 0),
      time: monthActivities.reduce((sum, a) => sum + a.moving_time, 0),
      elevation: monthActivities.reduce(
        (sum, a) => sum + a.total_elevation_gain,
        0
      ),
    };
  });

  return {
    year,
    athlete,
    totalActivities: activities.length,
    totalDistance,
    totalTime,
    totalElevation,
    totalKudos,
    totalPRs,
    sportStats,
    primarySport,
    daysActive,
    longestStreak,
    avgWeeklyActivities,
    mostActiveDay,
    mostActiveMonth,
    biggestWeek,
    biggestMonth,
    longestActivity,
    biggestClimb,
    fastestRun,
    fastestRide,
    countries,
    cities,
    morningActivities,
    afternoonActivities,
    eveningActivities,
    preferredTime,
    insights,
    activityDates,
    monthlyData,
  };
}

function computeSportStats(activities: StravaActivity[]): SportStats[] {
  const sportMap = new Map<string, StravaActivity[]>();

  activities.forEach((activity) => {
    const sport = activity.sport_type;
    if (!sportMap.has(sport)) {
      sportMap.set(sport, []);
    }
    sportMap.get(sport)!.push(activity);
  });

  const stats: SportStats[] = Array.from(sportMap.entries()).map(
    ([sport, activities]) => {
      const distances = activities.map((a) => a.distance);
      const speeds = activities
        .map((a) => a.average_speed)
        .filter((s) => s > 0);

      return {
        sport,
        activityCount: activities.length,
        totalDistance: activities.reduce((sum, a) => sum + a.distance, 0),
        totalTime: activities.reduce((sum, a) => sum + a.moving_time, 0),
        totalElevation: activities.reduce(
          (sum, a) => sum + a.total_elevation_gain,
          0
        ),
        longestActivity: Math.max(...distances),
        fastestPace: speeds.length > 0 ? Math.max(...speeds) : undefined,
        maxSpeed: Math.max(...activities.map((a) => a.max_speed)),
        kudosReceived: activities.reduce((sum, a) => sum + a.kudos_count, 0),
        prCount: activities.reduce((sum, a) => sum + a.pr_count, 0),
      };
    }
  );

  // Sort by activity count (primary sport first)
  return stats.sort((a, b) => b.activityCount - a.activityCount);
}

function computeConsistencyMetrics(activities: StravaActivity[], year: number) {
  // Get unique activity dates
  const activeDates = new Set(
    activities.map((a) => new Date(a.start_date_local).toDateString())
  );
  const daysActive = activeDates.size;

  // Calculate longest streak
  const sortedDates = Array.from(activeDates)
    .map((d) => new Date(d))
    .sort((a, b) => a.getTime() - b.getTime());

  let longestStreak = 1;
  let currentStreak = 1;

  for (let i = 1; i < sortedDates.length; i++) {
    const diff =
      (sortedDates[i].getTime() - sortedDates[i - 1].getTime()) /
      (1000 * 60 * 60 * 24);
    if (diff === 1) {
      currentStreak++;
      longestStreak = Math.max(longestStreak, currentStreak);
    } else {
      currentStreak = 1;
    }
  }

  // Average weekly activities
  const weeksInYear = 52;
  const avgWeeklyActivities =
    Math.round((activities.length / weeksInYear) * 10) / 10;

  // Most active day of week
  const dayCount = new Array(7).fill(0);
  activities.forEach((a) => {
    const day = new Date(a.start_date_local).getDay();
    dayCount[day]++;
  });
  const mostActiveDayIndex = dayCount.indexOf(Math.max(...dayCount));
  const mostActiveDay = DAYS_OF_WEEK[mostActiveDayIndex];

  // Most active month
  const monthCount = new Array(12).fill(0);
  const monthDistance = new Array(12).fill(0);
  activities.forEach((a) => {
    const month = new Date(a.start_date_local).getMonth();
    monthCount[month]++;
    monthDistance[month] += a.distance;
  });
  const mostActiveMonthIndex = monthCount.indexOf(Math.max(...monthCount));
  const mostActiveMonth = MONTHS[mostActiveMonthIndex];

  // Biggest week
  const weekDistances = new Map<number, number>();
  activities.forEach((a) => {
    const date = new Date(a.start_date_local);
    const weekNum = getWeekNumber(date);
    weekDistances.set(weekNum, (weekDistances.get(weekNum) || 0) + a.distance);
  });
  const biggestWeekEntry = Array.from(weekDistances.entries()).reduce(
    (max, [week, distance]) =>
      distance > max.distance ? { week, distance } : max,
    { week: 1, distance: 0 }
  );

  // Biggest month
  const biggestMonthIndex = monthDistance.indexOf(Math.max(...monthDistance));
  const biggestMonth = {
    month: MONTHS[biggestMonthIndex],
    distance: monthDistance[biggestMonthIndex],
  };

  return {
    daysActive,
    longestStreak,
    avgWeeklyActivities,
    mostActiveDay,
    mostActiveMonth,
    biggestWeek: biggestWeekEntry,
    biggestMonth,
  };
}

function computeTimePreferences(activities: StravaActivity[]) {
  let morningActivities = 0; // 5am - 12pm
  let afternoonActivities = 0; // 12pm - 5pm
  let eveningActivities = 0; // 5pm - 10pm

  activities.forEach((a) => {
    const hour = new Date(a.start_date_local).getHours();
    if (hour >= 5 && hour < 12) morningActivities++;
    else if (hour >= 12 && hour < 17) afternoonActivities++;
    else if (hour >= 17 && hour < 22) eveningActivities++;
  });

  const max = Math.max(
    morningActivities,
    afternoonActivities,
    eveningActivities
  );
  let preferredTime = "morning";
  if (max === afternoonActivities) preferredTime = "afternoon";
  if (max === eveningActivities) preferredTime = "evening";

  return {
    morningActivities,
    afternoonActivities,
    eveningActivities,
    preferredTime,
  };
}

function getWeekNumber(date: Date): number {
  const startOfYear = new Date(date.getFullYear(), 0, 1);
  const days = Math.floor(
    (date.getTime() - startOfYear.getTime()) / (24 * 60 * 60 * 1000)
  );
  return Math.ceil((days + startOfYear.getDay() + 1) / 7);
}

interface InsightParams {
  activities: StravaActivity[];
  sportStats: SportStats[];
  daysActive: number;
  longestStreak: number;
  preferredTime: string;
  mostActiveMonth: string;
  countries: string[];
  totalKudos: number;
  totalPRs: number;
  year: number;
}

function generateInsights(params: InsightParams): Insight[] {
  const insights: Insight[] = [];
  const {
    activities,
    sportStats,
    daysActive,
    longestStreak,
    preferredTime,
    mostActiveMonth,
    countries,
    totalKudos,
    totalPRs,
  } = params;

  // Time preference insight
  if (activities.length >= 10) {
    const timeEmoji =
      preferredTime === "morning"
        ? "🌅"
        : preferredTime === "afternoon"
        ? "☀️"
        : "🌙";
    insights.push({
      type: "time",
      icon: timeEmoji,
      message: `You prefer ${preferredTime} workouts`,
      highlight: preferredTime,
    });
  }

  // Most active month insight
  insights.push({
    type: "consistency",
    icon: "📅",
    message: `${mostActiveMonth} was your most active month`,
    highlight: mostActiveMonth,
  });

  // Streak insight
  if (longestStreak >= 3) {
    insights.push({
      type: "consistency",
      icon: "🔥",
      message: `Your longest streak was ${longestStreak} consecutive days`,
      highlight: `${longestStreak} days`,
    });
  }

  // Multi-sport insight
  if (sportStats.length >= 2) {
    const top2 = sportStats.slice(0, 2);
    insights.push({
      type: "sport",
      icon: "🏆",
      message: `You're a multi-sport athlete! Top sports: ${top2
        .map((s) => formatSportType(s.sport))
        .join(" and ")}`,
      highlight: "multi-sport",
    });
  }

  // Travel insight
  if (countries.length > 1) {
    insights.push({
      type: "location",
      icon: "🌍",
      message: `You worked out in ${countries.length} different countries`,
      highlight: `${countries.length} countries`,
    });
  }

  // PR insight
  if (totalPRs > 0) {
    insights.push({
      type: "achievement",
      icon: "⚡",
      message: `You achieved ${totalPRs} personal records this year!`,
      highlight: `${totalPRs} PRs`,
    });
  }

  // Social insight
  if (totalKudos >= 100) {
    insights.push({
      type: "social",
      icon: "👏",
      message: `You received ${totalKudos} kudos from the community`,
      highlight: `${totalKudos} kudos`,
    });
  }

  // Consistency percentage
  const percentageActive = Math.round((daysActive / 365) * 100);
  if (percentageActive >= 20) {
    insights.push({
      type: "consistency",
      icon: "💪",
      message: `You were active ${percentageActive}% of the year (${daysActive} days)`,
      highlight: `${percentageActive}%`,
    });
  }

  return insights;
}

export function formatSportType(sportType: string): string {
  // Convert camelCase to Title Case with spaces
  return sportType
    .replace(/([A-Z])/g, " $1")
    .replace(/^./, (str) => str.toUpperCase())
    .trim();
}

export function formatDistance(meters: number): string {
  if (meters >= 1000) {
    return `${(meters / 1000).toFixed(1)} km`;
  }
  return `${Math.round(meters)} m`;
}

export function formatDuration(seconds: number): string {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);

  if (hours > 0) {
    return `${hours}h ${minutes}m`;
  }
  return `${minutes}m`;
}

export function formatPace(metersPerSecond: number, isRun: boolean): string {
  if (isRun) {
    // Convert to min/km
    const secondsPerKm = 1000 / metersPerSecond;
    const minutes = Math.floor(secondsPerKm / 60);
    const seconds = Math.round(secondsPerKm % 60);
    return `${minutes}:${seconds.toString().padStart(2, "0")} /km`;
  } else {
    // Convert to km/h for rides
    const kmh = metersPerSecond * 3.6;
    return `${kmh.toFixed(1)} km/h`;
  }
}

function getEmptyStats(athlete: StravaAthlete, year: number): YearStats {
  return {
    year,
    athlete,
    totalActivities: 0,
    totalDistance: 0,
    totalTime: 0,
    totalElevation: 0,
    totalKudos: 0,
    totalPRs: 0,
    sportStats: [],
    primarySport: "None",
    daysActive: 0,
    longestStreak: 0,
    avgWeeklyActivities: 0,
    mostActiveDay: "N/A",
    mostActiveMonth: "N/A",
    biggestWeek: { week: 0, distance: 0 },
    biggestMonth: { month: "N/A", distance: 0 },
    longestActivity: null,
    biggestClimb: null,
    fastestRun: null,
    fastestRide: null,
    countries: [],
    cities: [],
    morningActivities: 0,
    afternoonActivities: 0,
    eveningActivities: 0,
    preferredTime: "N/A",
    insights: [],
    activityDates: [],
    monthlyData: MONTHS.map((month) => ({
      month,
      activities: 0,
      distance: 0,
      time: 0,
      elevation: 0,
    })),
  };
}
