"use client";

import { useRef, useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { YearStats } from "@/types";
import { formatDistance, formatDuration } from "@/lib/stats";

interface ShareCardProps {
  stats: YearStats;
  year: number;
}

export default function ShareCard({ stats, year }: ShareCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleDownload = async () => {
    if (!cardRef.current) return;

    setIsGenerating(true);

    try {
      const html2canvasModule = await import("html2canvas");
      const html2canvas = html2canvasModule.default;

      const canvas = await html2canvas(cardRef.current, {
        backgroundColor: "#18181b",
        scale: 2,
        useCORS: true,
        allowTaint: true,
      });

      const link = document.createElement("a");
      link.download = `strava-rewind-${year}.png`;
      link.href = canvas.toDataURL("image/png");
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error("Failed to generate image:", error);
      alert("Failed to generate image. Please try again.");
    } finally {
      setIsGenerating(false);
    }
  };

  const modalContent = (
    <div
      className="fixed inset-0 flex items-center justify-center bg-black/80"
      style={{ zIndex: 99999, padding: "1.5rem" }}
      onClick={(e) => {
        if (e.target === e.currentTarget) setShowPreview(false);
      }}
    >
      <div className="bg-zinc-900 rounded-2xl p-6 max-w-md w-full max-h-[90vh] overflow-auto">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold">Share Your Year</h3>
          <button
            onClick={() => setShowPreview(false)}
            className="text-zinc-400 hover:text-white p-1"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        {/* Share Card Preview */}
        <div
          ref={cardRef}
          className="rounded-xl p-6 mb-4"
          style={{
            width: "100%",
            aspectRatio: "1",
            background:
              "linear-gradient(135deg, #18181b 0%, #27272a 50%, #18181b 100%)",
          }}
        >
          <div className="text-center mb-5">
            <div className="text-3xl mb-1">🏃</div>
            <h2 className="text-2xl font-bold mb-1">
              <span style={{ color: "#fc4c02" }}>{year}</span> Rewind
            </h2>
            <p className="text-zinc-400 text-sm">
              {stats.athlete.firstname}&apos;s Year in Sport
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3 mb-5">
            <div
              className="text-center p-3 rounded-lg"
              style={{ background: "rgba(255,255,255,0.05)" }}
            >
              <div className="text-xl font-bold" style={{ color: "#fc4c02" }}>
                {stats.totalActivities}
              </div>
              <div className="text-xs text-zinc-400">Activities</div>
            </div>
            <div
              className="text-center p-3 rounded-lg"
              style={{ background: "rgba(255,255,255,0.05)" }}
            >
              <div className="text-xl font-bold" style={{ color: "#fc4c02" }}>
                {formatDistance(stats.totalDistance)}
              </div>
              <div className="text-xs text-zinc-400">Distance</div>
            </div>
            <div
              className="text-center p-3 rounded-lg"
              style={{ background: "rgba(255,255,255,0.05)" }}
            >
              <div className="text-xl font-bold" style={{ color: "#fc4c02" }}>
                {formatDuration(stats.totalTime)}
              </div>
              <div className="text-xs text-zinc-400">Time</div>
            </div>
            <div
              className="text-center p-3 rounded-lg"
              style={{ background: "rgba(255,255,255,0.05)" }}
            >
              <div className="text-xl font-bold" style={{ color: "#fc4c02" }}>
                {Math.round(stats.totalElevation).toLocaleString()}m
              </div>
              <div className="text-xs text-zinc-400">Elevation</div>
            </div>
          </div>

          <div className="flex justify-around text-center mb-5">
            <div>
              <div className="text-lg">🔥</div>
              <div className="text-lg font-bold">{stats.longestStreak}</div>
              <div className="text-xs text-zinc-400">Day Streak</div>
            </div>
            <div>
              <div className="text-lg">📅</div>
              <div className="text-lg font-bold">{stats.daysActive}</div>
              <div className="text-xs text-zinc-400">Days Active</div>
            </div>
            <div>
              <div className="text-lg">⭐</div>
              <div className="text-lg font-bold">{stats.totalPRs}</div>
              <div className="text-xs text-zinc-400">PRs</div>
            </div>
          </div>

          <div className="text-center text-xs text-zinc-500">Strava Rewind</div>
        </div>

        <div className="flex gap-3">
          <button
            onClick={handleDownload}
            disabled={isGenerating}
            className="flex-1 btn-primary flex items-center justify-center gap-2"
          >
            {isGenerating ? (
              "Generating..."
            ) : (
              <>
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
                  />
                </svg>
                Download
              </>
            )}
          </button>
          <button
            onClick={() => setShowPreview(false)}
            className="btn-secondary"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <>
      <button
        onClick={() => setShowPreview(true)}
        className="btn-primary flex items-center gap-2"
      >
        <svg
          className="w-5 h-5"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z"
          />
        </svg>
        Share Your Year
      </button>
      {mounted && showPreview && createPortal(modalContent, document.body)}
    </>
  );
}
