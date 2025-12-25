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
        logging: false,
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
      className="fixed inset-0 flex items-center justify-center"
      style={{
        zIndex: 99999,
        padding: "1.5rem",
        backgroundColor: "rgba(0,0,0,0.8)",
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) setShowPreview(false);
      }}
    >
      <div
        style={{
          backgroundColor: "#18181b",
          borderRadius: "1rem",
          padding: "1.5rem",
          maxWidth: "420px",
          width: "100%",
          maxHeight: "90vh",
          overflow: "auto",
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "1rem",
          }}
        >
          <h3
            style={{
              fontSize: "1.125rem",
              fontWeight: "600",
              color: "#ffffff",
            }}
          >
            Share Your Year
          </h3>
          <button
            onClick={() => setShowPreview(false)}
            style={{ color: "#a1a1aa", padding: "0.25rem" }}
          >
            <svg
              style={{ width: "1.5rem", height: "1.5rem" }}
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

        {/* Share Card Preview - ALL INLINE STYLES for html2canvas compatibility */}
        <div
          ref={cardRef}
          style={{
            width: "100%",
            aspectRatio: "1",
            background:
              "linear-gradient(135deg, #18181b 0%, #27272a 50%, #18181b 100%)",
            borderRadius: "0.75rem",
            padding: "1.5rem",
            marginBottom: "1rem",
            fontFamily: "system-ui, -apple-system, sans-serif",
          }}
        >
          <div style={{ textAlign: "center", marginBottom: "1.25rem" }}>
            <div style={{ fontSize: "2rem", marginBottom: "0.25rem" }}>🏃</div>
            <h2
              style={{
                fontSize: "1.5rem",
                fontWeight: "bold",
                marginBottom: "0.25rem",
                color: "#ffffff",
              }}
            >
              <span style={{ color: "#fc4c02" }}>{year}</span> Rewind
            </h2>
            <p style={{ color: "#a1a1aa", fontSize: "0.875rem" }}>
              {stats.athlete.firstname}&apos;s Year in Sport
            </p>
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: "0.75rem",
              marginBottom: "1.25rem",
            }}
          >
            <div
              style={{
                textAlign: "center",
                padding: "0.75rem",
                borderRadius: "0.5rem",
                background: "rgba(255,255,255,0.05)",
              }}
            >
              <div
                style={{
                  fontSize: "1.25rem",
                  fontWeight: "bold",
                  color: "#fc4c02",
                }}
              >
                {stats.totalActivities}
              </div>
              <div style={{ fontSize: "0.75rem", color: "#a1a1aa" }}>
                Activities
              </div>
            </div>
            <div
              style={{
                textAlign: "center",
                padding: "0.75rem",
                borderRadius: "0.5rem",
                background: "rgba(255,255,255,0.05)",
              }}
            >
              <div
                style={{
                  fontSize: "1.25rem",
                  fontWeight: "bold",
                  color: "#fc4c02",
                }}
              >
                {formatDistance(stats.totalDistance)}
              </div>
              <div style={{ fontSize: "0.75rem", color: "#a1a1aa" }}>
                Distance
              </div>
            </div>
            <div
              style={{
                textAlign: "center",
                padding: "0.75rem",
                borderRadius: "0.5rem",
                background: "rgba(255,255,255,0.05)",
              }}
            >
              <div
                style={{
                  fontSize: "1.25rem",
                  fontWeight: "bold",
                  color: "#fc4c02",
                }}
              >
                {formatDuration(stats.totalTime)}
              </div>
              <div style={{ fontSize: "0.75rem", color: "#a1a1aa" }}>Time</div>
            </div>
            <div
              style={{
                textAlign: "center",
                padding: "0.75rem",
                borderRadius: "0.5rem",
                background: "rgba(255,255,255,0.05)",
              }}
            >
              <div
                style={{
                  fontSize: "1.25rem",
                  fontWeight: "bold",
                  color: "#fc4c02",
                }}
              >
                {Math.round(stats.totalElevation).toLocaleString()}m
              </div>
              <div style={{ fontSize: "0.75rem", color: "#a1a1aa" }}>
                Elevation
              </div>
            </div>
          </div>

          <div
            style={{
              display: "flex",
              justifyContent: "space-around",
              textAlign: "center",
              marginBottom: "1.25rem",
            }}
          >
            <div>
              <div style={{ fontSize: "1.125rem" }}>🔥</div>
              <div
                style={{
                  fontSize: "1.125rem",
                  fontWeight: "bold",
                  color: "#ffffff",
                }}
              >
                {stats.longestStreak}
              </div>
              <div style={{ fontSize: "0.75rem", color: "#a1a1aa" }}>
                Day Streak
              </div>
            </div>
            <div>
              <div style={{ fontSize: "1.125rem" }}>📅</div>
              <div
                style={{
                  fontSize: "1.125rem",
                  fontWeight: "bold",
                  color: "#ffffff",
                }}
              >
                {stats.daysActive}
              </div>
              <div style={{ fontSize: "0.75rem", color: "#a1a1aa" }}>
                Days Active
              </div>
            </div>
            <div>
              <div style={{ fontSize: "1.125rem" }}>⭐</div>
              <div
                style={{
                  fontSize: "1.125rem",
                  fontWeight: "bold",
                  color: "#ffffff",
                }}
              >
                {stats.totalPRs}
              </div>
              <div style={{ fontSize: "0.75rem", color: "#a1a1aa" }}>PRs</div>
            </div>
          </div>

          <div
            style={{
              textAlign: "center",
              fontSize: "0.75rem",
              color: "#71717a",
            }}
          >
            Strava Rewind
          </div>
        </div>

        <div style={{ display: "flex", gap: "0.75rem" }}>
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
                  style={{ width: "1.25rem", height: "1.25rem" }}
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
