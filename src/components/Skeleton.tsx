export default function Skeleton() {
  return (
    <div className="page-wrapper animate-pulse">
      {/* Header Skeleton */}
      <header className="site-header glass">
        <div className="container flex justify-between items-center">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-zinc-700 rounded-full" />
            <div className="w-32 h-6 bg-zinc-700 rounded" />
          </div>
          <div className="flex items-center gap-4">
            <div className="hidden sm:flex gap-2">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="w-14 h-8 bg-zinc-700 rounded" />
              ))}
            </div>
            <div className="w-9 h-9 bg-zinc-700 rounded-full" />
            <div className="w-20 h-8 bg-zinc-700 rounded-full" />
          </div>
        </div>
      </header>

      <main className="page-content">
        <div className="container container-narrow">
          {/* Hero Skeleton */}
          <div className="text-center mb-16">
            <div className="w-64 h-12 bg-zinc-700 rounded mx-auto mb-4" />
            <div className="w-40 h-6 bg-zinc-700 rounded mx-auto" />
          </div>

          {/* Stats Grid Skeleton */}
          <div className="mb-16">
            <div className="w-48 h-8 bg-zinc-700 rounded mb-8" />
            <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="stat-card">
                  <div className="w-8 h-8 bg-zinc-700 rounded mb-3" />
                  <div className="w-20 h-4 bg-zinc-700 rounded mb-2" />
                  <div className="w-24 h-8 bg-zinc-700 rounded mb-2" />
                  <div className="w-16 h-3 bg-zinc-700 rounded" />
                </div>
              ))}
            </div>
          </div>

          {/* Charts Skeleton */}
          <div className="mb-16">
            <div className="w-48 h-8 bg-zinc-700 rounded mb-8" />
            <div className="grid md:grid-cols-2 gap-6">
              <div className="stat-card h-48" />
              <div className="stat-card h-48" />
            </div>
          </div>

          {/* Achievements Skeleton */}
          <div className="mb-16">
            <div className="stat-card">
              <div className="w-48 h-8 bg-zinc-700 rounded mb-6" />
              <div className="grid grid-cols-5 gap-3">
                {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((i) => (
                  <div key={i} className="h-20 bg-zinc-700 rounded-xl" />
                ))}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
