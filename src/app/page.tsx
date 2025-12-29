// Landing Page - Connect with Strava
import Image from "next/image";

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

          {/* CTA Button - Official Strava Connect Button */}
          {/* Use regular <a> tag instead of Link to force full page navigation for OAuth */}
          <div className="hero-cta">
            <a
              href="/api/auth/login"
              className="inline-block hover:opacity-90 transition-opacity"
            >
              <Image
                src="/strava/btn_strava_connect_with_orange.svg"
                alt="Connect with Strava"
                width={193}
                height={48}
                priority
              />
            </a>
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
                Streaks &amp; Consistency
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
        <div className="flex flex-col items-center gap-4">
          {/* Powered by Strava logo */}
          <Image
            src="/strava/api_logo_pwrdBy_strava_horiz_white.svg"
            alt="Powered by Strava"
            width={162}
            height={30}
          />
          <p className="text-zinc-500 text-sm">
            Built for athletes, by athletes ❤️
          </p>
        </div>
      </footer>
    </div>
  );
}
