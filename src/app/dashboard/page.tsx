"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";
import { YearStats } from "@/types";
import {
  formatDistance,
  formatDuration,
  formatSportType,
  formatPace,
} from "@/lib/stats";
import StatsCard from "@/components/StatsCard";
import SportSection from "@/components/SportSection";
import InsightCard from "@/components/InsightCard";
import LoadingSpinner from "@/components/LoadingSpinner";
import ActivityHeatmap from "@/components/ActivityHeatmap";
import MonthlyChart from "@/components/MonthlyChart";
import SportsPieChart, { getSportColor } from "@/components/SportsPieChart";
import AchievementBadges from "@/components/AchievementBadges";
import FunFacts from "@/components/FunFacts";
import ShareCard from "@/components/ShareCard";
import YoYComparison from "@/components/YoYComparison";

// Cache configuration
const CACHE_KEY_PREFIX = "strava_rewind_";
const CACHE_TTL_MS = 60 * 60 * 1000; // 1 hour

interface CachedData {
  stats: YearStats;
  timestamp: number;
}

function getCachedStats(year: number): YearStats | null {
  if (typeof window === "undefined") return null;

  try {
    const cached = localStorage.getItem(`${CACHE_KEY_PREFIX}${year}`);
    if (!cached) return null;

    const data: CachedData = JSON.parse(cached);
    const now = Date.now();

    // Check if cache is still valid
    if (now - data.timestamp < CACHE_TTL_MS) {
      return data.stats;
    }

    // Cache expired, remove it
    localStorage.removeItem(`${CACHE_KEY_PREFIX}${year}`);
    return null;
  } catch {
    return null;
  }
}

function setCachedStats(year: number, stats: YearStats): void {
  if (typeof window === "undefined") return;

  try {
    const data: CachedData = {
      stats,
      timestamp: Date.now(),
    };
    localStorage.setItem(`${CACHE_KEY_PREFIX}${year}`, JSON.stringify(data));
  } catch {
    // Storage might be full, ignore
  }
}

function clearCache(): void {
  if (typeof window === "undefined") return;

  try {
    const keys = Object.keys(localStorage).filter((k) =>
      k.startsWith(CACHE_KEY_PREFIX)
    );
    keys.forEach((k) => localStorage.removeItem(k));
  } catch {
    // Ignore errors
  }
}

export default function Dashboard() {
  const [stats, setStats] = useState<YearStats | null>(null);
  const [previousYearStats, setPreviousYearStats] = useState<YearStats | null>(
    null
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [lastFetched, setLastFetched] = useState<Date | null>(null);

  const currentYear = new Date().getFullYear();
  const availableYears = Array.from({ length: 5 }, (_, i) => currentYear - i);

  const fetchStats = useCallback(async (year: number, forceRefresh = false) => {
    setLoading(true);
    setError(null);
    setPreviousYearStats(null); // Reset previous year stats when switching years

    // Helper function to fetch previous year stats with delay to avoid race condition
    const fetchPreviousYearStats = (previousYear: number) => {
      const cachedPrevious = getCachedStats(previousYear);
      if (cachedPrevious) {
        setPreviousYearStats(cachedPrevious);
        return;
      }

      // Add small delay to allow any token refresh from main request to complete
      // This prevents race condition where concurrent requests see stale tokens
      setTimeout(() => {
        fetch(`/api/stats?year=${previousYear}`, {
          credentials: "include", // Ensure cookies are sent on Vercel
        })
          .then((res) => {
            // Don't throw on 401 for background fetch - just silently fail
            if (res.status === 401) return null;
            return res.ok ? res.json() : null;
          })
          .then((prevData) => {
            if (prevData) {
              setPreviousYearStats(prevData);
              setCachedStats(previousYear, prevData);
            }
          })
          .catch(() => setPreviousYearStats(null));
      }, 500); // 500ms delay to ensure token refresh has completed
    };

    // Try to get cached data first (unless force refresh)
    if (!forceRefresh) {
      const cached = getCachedStats(year);
      if (cached) {
        setStats(cached);
        setLoading(false);
        // Still fetch previous year for comparison
        fetchPreviousYearStats(year - 1);
        return;
      }
    }

    try {
      const response = await fetch(`/api/stats?year=${year}`, {
        credentials: "include",
      });

      if (response.status === 401) {
        clearCache(); // Clear cache on auth failure
        window.location.href = "/";
        return;
      }

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || "Failed to fetch statistics");
      }

      const data = await response.json();
      setStats(data);
      setCachedStats(year, data); // Cache the result
      setLastFetched(new Date());

      // Also fetch previous year stats for comparison (in background)
      fetchPreviousYearStats(year - 1);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStats(selectedYear);
  }, [selectedYear, fetchStats]);

  const handleRefresh = () => {
    fetchStats(selectedYear, true);
  };

  if (loading) {
    return <LoadingSpinner message="Loading your year in sport..." />;
  }

  if (error) {
    return (
      <div className="page-wrapper">
        <div className="page-content flex items-center justify-center">
          <div className="text-center">
            <p className="text-red-400 mb-6">{error}</p>
            <button
              onClick={() => fetchStats(selectedYear)}
              className="btn-primary"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!stats) return null;

  return (
    <div className="page-wrapper">
      {/* Header */}
      <header className="site-header glass">
        <div className="container flex justify-between items-center">
          <Link href="/" className="flex items-center gap-2">
            <span className="text-2xl">🏃</span>
            <span className="font-bold text-lg gradient-text">
              Strava Rewind
            </span>
          </Link>

          <div className="flex items-center gap-4">
            {/* Year Selector */}
            <div className="year-selector hidden sm:flex">
              {availableYears.map((year) => (
                <button
                  key={year}
                  onClick={() => setSelectedYear(year)}
                  className={`year-btn ${
                    selectedYear === year ? "active" : ""
                  }`}
                >
                  {year}
                </button>
              ))}
            </div>

            {/* Refresh Button */}
            <button
              onClick={handleRefresh}
              className="btn-secondary text-sm hidden sm:flex items-center gap-2"
              title="Refresh data from Strava"
            >
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                />
              </svg>
              Refresh
            </button>

            {/* User Profile */}
            <div className="flex items-center gap-3">
              {stats.athlete.profile && (
                <Image
                  src={stats.athlete.profile}
                  alt={stats.athlete.firstname}
                  width={36}
                  height={36}
                  className="rounded-full"
                />
              )}
              <span className="hidden sm:inline text-sm font-medium">
                {stats.athlete.firstname}
              </span>
            </div>

            {/* Use <a> tag instead of Link to prevent prefetching which triggers logout */}
            <a
              href="/api/auth/logout"
              className="btn-secondary text-sm flex items-center gap-2"
            >
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                />
              </svg>
              <span className="hidden sm:inline">Logout</span>
            </a>
          </div>
        </div>
      </header>

      {/* Mobile Year Selector */}
      <div className="sm:hidden container py-4">
        <select
          value={selectedYear}
          onChange={(e) => setSelectedYear(Number(e.target.value))}
          className="w-full glass rounded-lg px-4 py-2 bg-transparent border border-white/10"
        >
          {availableYears.map((year) => (
            <option key={year} value={year} className="bg-zinc-900">
              {year}
            </option>
          ))}
        </select>
      </div>

      <main className="page-content">
        <div className="container container-narrow">
          {/* Hero Section */}
          <section className="section text-center animate-slide-up">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              Your <span className="gradient-text">{selectedYear}</span> Rewind
            </h1>
            <p className="text-zinc-400 text-lg mb-6">
              {stats.athlete.firstname}&apos;s year in sport
            </p>
            {stats.totalActivities > 0 && (
              <ShareCard stats={stats} year={selectedYear} />
            )}
          </section>

          {/* Stats Content */}
          {stats.totalActivities > 0 ? (
            <>
              {/* Year Overview */}
              <section className="section animate-fade-in">
                <h2 className="section-header">
                  <span>📈</span> Year Overview
                </h2>
                <div className="stats-grid">
                  <StatsCard
                    icon="🏃"
                    title="Activities"
                    value={stats.totalActivities.toString()}
                    subtitle={`Primary: ${formatSportType(stats.primarySport)}`}
                  />
                  <StatsCard
                    icon="📏"
                    title="Total Distance"
                    value={formatDistance(stats.totalDistance)}
                    subtitle={`${formatDistance(
                      stats.totalDistance / stats.totalActivities
                    )} avg`}
                  />
                  <StatsCard
                    icon="⏱️"
                    title="Total Time"
                    value={formatDuration(stats.totalTime)}
                    subtitle={`${formatDuration(
                      Math.round(stats.totalTime / stats.totalActivities)
                    )} avg`}
                  />
                  <StatsCard
                    icon="⛰️"
                    title="Elevation Gain"
                    value={`${Math.round(
                      stats.totalElevation
                    ).toLocaleString()} m`}
                    subtitle="Total climbed"
                  />
                  <StatsCard
                    icon="📅"
                    title="Days Active"
                    value={stats.daysActive.toString()}
                    subtitle={`${Math.round(
                      (stats.daysActive / 365) * 100
                    )}% of the year`}
                  />
                  <StatsCard
                    icon="🔥"
                    title="Longest Streak"
                    value={`${stats.longestStreak} days`}
                    subtitle="Consecutive active days"
                  />
                  {/* Activity Heatmap */}
                  {stats.activityDates && stats.activityDates.length > 0 && (
                    <div className="stat-card md:col-span-2">
                      <ActivityHeatmap
                        activityDates={stats.activityDates}
                        year={selectedYear}
                      />
                    </div>
                  )}

                  {/* Distance by Month */}
                  {stats.monthlyData && stats.monthlyData.length > 0 && (
                    <div className="stat-card">
                      <div className="flex items-start justify-between mb-3">
                        <span className="text-2xl">📊</span>
                      </div>
                      <p className="text-zinc-400 text-sm mb-3">
                        Distance by Month
                      </p>

                      <div
                        className="flex items-end gap-1"
                        style={{ height: "100px" }}
                      >
                        {stats.monthlyData.map((m, index) => {
                          const maxDistance = Math.max(
                            ...stats.monthlyData.map((d) => d.distance),
                            1
                          );
                          const heightPercent =
                            (m.distance / maxDistance) * 100;
                          const barHeight = Math.max(
                            (heightPercent / 100) * 80,
                            4
                          );
                          return (
                            <div
                              key={index}
                              className="flex-1 flex flex-col items-center justify-end"
                              style={{ height: "100%" }}
                            >
                              <div
                                className="w-full rounded-t hover:opacity-80 transition-opacity"
                                style={{
                                  height: `${barHeight}px`,
                                  backgroundColor:
                                    m.distance > 0
                                      ? "#fc4c02"
                                      : "rgba(255,255,255,0.1)",
                                }}
                                title={`${m.month}: ${(
                                  m.distance / 1000
                                ).toFixed(1)} km`}
                              />
                              <span className="text-xs text-zinc-500 mt-1">
                                {m.month.slice(0, 1)}
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* Sports Distribution */}
                  <SportsPieChart
                    data={stats.sportStats.map((s) => ({
                      name: formatSportType(s.sport),
                      value: s.activityCount,
                      color: getSportColor(s.sport),
                    }))}
                    total={stats.totalActivities}
                  />
                </div>
              </section>

              {/* Year over Year Comparison */}
              {previousYearStats && (
                <section className="section animate-fade-in delay-100">
                  <h2 className="section-header">
                    <span>📊</span> vs {selectedYear - 1}
                  </h2>
                  <YoYComparison
                    currentYear={selectedYear}
                    currentStats={{
                      totalActivities: stats.totalActivities,
                      totalDistance: stats.totalDistance,
                      totalTime: stats.totalTime,
                      totalElevation: stats.totalElevation,
                      daysActive: stats.daysActive,
                    }}
                    previousStats={{
                      totalActivities: previousYearStats.totalActivities,
                      totalDistance: previousYearStats.totalDistance,
                      totalTime: previousYearStats.totalTime,
                      totalElevation: previousYearStats.totalElevation,
                      daysActive: previousYearStats.daysActive,
                    }}
                  />
                </section>
              )}

              {/* Performance Highlights */}
              <section className="section animate-fade-in delay-100">
                <h2 className="section-header">
                  <span>⚡</span> Performance Highlights
                </h2>
                <div className="stats-grid">
                  {stats.longestActivity && (
                    <StatsCard
                      icon="🏆"
                      title="Longest Activity"
                      value={formatDistance(stats.longestActivity.distance)}
                      subtitle={stats.longestActivity.name}
                    />
                  )}
                  {stats.biggestClimb &&
                    stats.biggestClimb.total_elevation_gain > 0 && (
                      <StatsCard
                        icon="🏔️"
                        title="Biggest Climb"
                        value={`${Math.round(
                          stats.biggestClimb.total_elevation_gain
                        )} m`}
                        subtitle={stats.biggestClimb.name}
                      />
                    )}
                  {stats.fastestRun && (
                    <StatsCard
                      icon="👟"
                      title="Fastest Run Pace"
                      value={formatPace(stats.fastestRun.average_speed, true)}
                      subtitle={stats.fastestRun.name}
                    />
                  )}
                  {stats.fastestRide && (
                    <StatsCard
                      icon="🚴"
                      title="Fastest Ride"
                      value={formatPace(stats.fastestRide.average_speed, false)}
                      subtitle={stats.fastestRide.name}
                    />
                  )}
                  <StatsCard
                    icon="👏"
                    title="Kudos Received"
                    value={stats.totalKudos.toLocaleString()}
                    subtitle="From the community"
                  />
                  {stats.totalPRs > 0 && (
                    <StatsCard
                      icon="⭐"
                      title="Personal Records"
                      value={stats.totalPRs.toString()}
                      subtitle="New PRs this year"
                    />
                  )}
                </div>
              </section>

              {/* Consistency */}
              <section className="section animate-fade-in delay-200">
                <h2 className="section-header">
                  <span>📊</span> Consistency & Patterns
                </h2>
                <div className="stats-grid">
                  <StatsCard
                    icon="📆"
                    title="Most Active Day"
                    value={stats.mostActiveDay}
                    subtitle="Your favorite workout day"
                  />
                  <StatsCard
                    icon="🗓️"
                    title="Most Active Month"
                    value={stats.mostActiveMonth}
                    subtitle="Peak training month"
                  />
                  <StatsCard
                    icon="📈"
                    title="Avg Weekly Activities"
                    value={stats.avgWeeklyActivities.toString()}
                    subtitle="Activities per week"
                  />
                  <StatsCard
                    icon="🎯"
                    title="Biggest Week"
                    value={formatDistance(stats.biggestWeek.distance)}
                    subtitle={`Week ${stats.biggestWeek.week}`}
                  />
                </div>
              </section>

              {/* Sports Breakdown */}
              {stats.sportStats.length > 0 && (
                <section className="section animate-fade-in delay-300">
                  <h2 className="section-header">
                    <span>🏅</span> Sports Breakdown
                  </h2>
                  <div className="sports-grid">
                    {stats.sportStats.slice(0, 4).map((sport, index) => (
                      <SportSection
                        key={sport.sport}
                        sport={sport}
                        index={index}
                      />
                    ))}
                  </div>
                </section>
              )}

              {/* Location */}
              {(stats.countries.length > 0 || stats.cities.length > 0) && (
                <section className="section animate-fade-in delay-400">
                  <h2 className="section-header">
                    <span>🌍</span> Where You Trained
                  </h2>
                  <div className="stat-card">
                    {stats.countries.length > 0 && (
                      <div className="mb-6">
                        <p className="text-zinc-400 text-sm mb-3">Countries</p>
                        <div className="flex flex-wrap gap-3">
                          {stats.countries.map((country) => (
                            <span key={country} className="sport-badge glass">
                              {country}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                    {stats.cities.length > 0 && (
                      <div>
                        <p className="text-zinc-400 text-sm mb-3">
                          Cities ({stats.cities.length})
                        </p>
                        <div className="flex flex-wrap gap-3">
                          {stats.cities.slice(0, 10).map((city) => (
                            <span key={city} className="sport-badge glass">
                              {city}
                            </span>
                          ))}
                          {stats.cities.length > 10 && (
                            <span className="text-zinc-400 text-sm self-center">
                              +{stats.cities.length - 10} more
                            </span>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </section>
              )}

              {/* Insights */}
              {stats.insights.length > 0 && (
                <section className="section animate-fade-in delay-500">
                  <h2 className="section-header">
                    <span>💡</span> Personal Insights
                  </h2>
                  <div className="insights-grid">
                    {stats.insights.map((insight, index) => (
                      <InsightCard key={index} insight={insight} />
                    ))}
                  </div>
                </section>
              )}

              {/* Achievements */}
              <section className="section animate-fade-in delay-100">
                <h2 className="section-header">
                  <span>🏅</span> Achievements
                </h2>
                <AchievementBadges stats={stats} />
              </section>

              {/* Fun Facts */}
              <section className="section animate-fade-in delay-200">
                <h2 className="section-header">
                  <span>🎉</span> Fun Facts
                </h2>
                <FunFacts stats={stats} />
              </section>
            </>
          ) : (
            <section className="section text-center animate-fade-in">
              <div className="text-6xl mb-6">😢</div>
              <h2 className="text-2xl font-semibold mb-4">
                No activities found for {selectedYear}
              </h2>
              <p className="text-zinc-400 mb-8">
                It looks like you haven&apos;t logged any activities this year.
                Try selecting a different year!
              </p>
              <div className="year-selector justify-center">
                {availableYears
                  .filter((y) => y !== selectedYear)
                  .map((year) => (
                    <button
                      key={year}
                      onClick={() => setSelectedYear(year)}
                      className="year-btn"
                    >
                      Try {year}
                    </button>
                  ))}
              </div>
            </section>
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="site-footer">
        <div className="flex flex-col items-center gap-4">
          <Image
            src="/strava/api_logo_pwrdBy_strava_horiz_white.svg"
            alt="Powered by Strava"
            width={162}
            height={30}
          />
          <p className="text-zinc-500 text-sm">
            Made with ❤️ for athletes everywhere
          </p>
        </div>
      </footer>
    </div>
  );
}
