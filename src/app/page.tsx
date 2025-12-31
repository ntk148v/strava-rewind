// Landing Page - Choose your data source
import Link from "next/link";

function InfoIcon() {
  return (
    <svg
      className="info-icon"
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
      />
    </svg>
  );
}

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
          <a
            href="https://github.com/ntk148v/strava-rewind"
            target="_blank"
            rel="noopener noreferrer"
            className="text-zinc-400 hover:text-white transition-colors"
          >
            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
            </svg>
          </a>
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
          <p className="hero-subtitle max-w-xl">
            Discover your running, cycling, and workout highlights.
            <br />
            See your achievements, streaks, and progress beautifully visualized.
          </p>

          {/* Two Options */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mt-10">
            {/* OAuth Option */}
            <div className="flex flex-col items-center gap-2">
              <div className="flex items-center gap-2">
                <span className="text-zinc-400 text-sm">Real-time sync</span>
                <div className="tooltip-trigger relative">
                  <InfoIcon />
                  <div className="tooltip">
                    <p className="tooltip-title">Self-Hosting Required</p>
                    <p>
                      Deploy your own instance with Strava API credentials from{" "}
                      <a
                        href="https://www.strava.com/settings/api"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-strava hover:underline"
                      >
                        Strava API settings
                      </a>
                    </p>
                    <div className="tooltip-arrow" />
                  </div>
                </div>
              </div>
              <a href="/api/auth/login" className="btn-primary min-w-[200px]">
                Connect with Strava
              </a>
            </div>

            {/* Divider */}
            <span className="text-zinc-600 text-sm px-2">or</span>

            {/* Upload Option */}
            <div className="flex flex-col items-center gap-2">
              <div className="flex items-center gap-2">
                <span className="text-zinc-400 text-sm">No API needed</span>
                <div className="tooltip-trigger relative">
                  <InfoIcon />
                  <div className="tooltip">
                    <p className="tooltip-title">Use Your Data Export</p>
                    <p>
                      Request your data from Strava Settings → My Account →
                      Download Request. Your data never leaves your browser.
                    </p>
                    <div className="tooltip-arrow" />
                  </div>
                </div>
              </div>
              <Link href="/upload" className="btn-primary min-w-[200px]">
                Upload CSV Files
              </Link>
            </div>
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
        <div className="flex flex-col items-center gap-3">
          <p className="text-zinc-500 text-sm">
            Built for athletes, by athletes ❤️
          </p>
          <p className="text-zinc-600 text-xs">
            Open source •{" "}
            <a
              href="https://github.com/ntk148v/strava-rewind"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-zinc-400 transition-colors"
            >
              View on GitHub
            </a>
          </p>
        </div>
      </footer>
    </div>
  );
}
