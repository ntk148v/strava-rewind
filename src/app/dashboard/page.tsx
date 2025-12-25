"use client";

import { useState, useEffect } from "react";
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

export default function Dashboard() {
  const [stats, setStats] = useState<YearStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());

  const currentYear = new Date().getFullYear();
  const availableYears = Array.from({ length: 5 }, (_, i) => currentYear - i);

  useEffect(() => {
    fetchStats(selectedYear);
  }, [selectedYear]);

  async function fetchStats(year: number) {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/stats?year=${year}`);

      if (response.status === 401) {
        window.location.href = "/";
        return;
      }

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || "Failed to fetch statistics");
      }

      const data = await response.json();
      setStats(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  }

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

            <Link href="/api/auth/logout" className="btn-secondary text-sm">
              Logout
            </Link>
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
            <p className="text-zinc-400 text-lg">
              {stats.athlete.firstname}&apos;s year in sport
            </p>
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
                </div>
              </section>

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
        <p>Made with ❤️ for athletes everywhere</p>
      </footer>
    </div>
  );
}
