// Landing Page - Connect with Strava
import Link from "next/link";

export default function Home() {
  return (
    <div className="page-wrapper relative overflow-hidden">
      {/* Background */}
      <div className="hero-bg" />

      {/* Header */}
      <header className="site-header glass relative z-10">
        <div className="container flex justify-between items-center">
          <div className="flex items-center gap-2">
            <span className="text-2xl">🏃</span>
            <span className="font-bold text-lg gradient-text">
              Strava Rewind
            </span>
          </div>
        </div>
      </header>

      {/* Hero */}
      <main className="page-content relative z-10 flex flex-col items-center justify-center">
        <div className="hero-content animate-slide-up">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 mb-8">
            <span className="animate-float text-2xl">✨</span>
            <span className="text-zinc-400">Personal Year in Sport</span>
          </div>

          {/* Headline */}
          <h1 className="hero-title">
            Your <span className="gradient-text">Year in Sport</span>
            <br />
            Beautifully Wrapped
          </h1>

          {/* Subtitle */}
          <p className="hero-subtitle">
            Connect with Strava to discover your personal running, cycling, and
            workout highlights. See your achievements, streaks, and insights
            beautifully visualized.
          </p>

          {/* CTA Button */}
          <div className="hero-cta">
            <Link
              href="/api/auth/login"
              className="btn-primary text-lg animate-pulse-glow"
            >
              <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor">
                <path d="M15.387 17.944l-2.089-4.116h-3.065L15.387 24l5.15-10.172h-3.066m-7.008-5.599l2.836 5.598h4.172L10.463 0l-7 13.828h4.169" />
              </svg>
              Connect with Strava
            </Link>
          </div>
        </div>

        {/* Feature Grid */}
        <div className="container animate-fade-in delay-300">
          <div className="features-grid">
            <div className="stat-card">
              <div className="text-3xl mb-4">📊</div>
              <h3 className="font-semibold text-lg mb-2">
                Complete Statistics
              </h3>
              <p className="text-zinc-400 text-sm">
                Distance, time, elevation, and more for every sport you track.
              </p>
            </div>
            <div className="stat-card">
              <div className="text-3xl mb-4">🔥</div>
              <h3 className="font-semibold text-lg mb-2">
                Streaks & Consistency
              </h3>
              <p className="text-zinc-400 text-sm">
                Your longest streaks, most active days, and training patterns.
              </p>
            </div>
            <div className="stat-card">
              <div className="text-3xl mb-4">💡</div>
              <h3 className="font-semibold text-lg mb-2">Personal Insights</h3>
              <p className="text-zinc-400 text-sm">
                Unique insights tailored to your training habits and
                achievements.
              </p>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="site-footer relative z-10">
        <p>
          Not affiliated with Strava Inc. • Built for athletes, by athletes ❤️
        </p>
      </footer>
    </div>
  );
}
