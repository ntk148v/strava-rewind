"use client";

import { useState, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

interface FileData {
  activities: string | null;
  reactions: string | null;
}

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

export default function UploadPage() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [files, setFiles] = useState<FileData>({
    activities: null,
    reactions: null,
  });
  const [error, setError] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [firstName, setFirstName] = useState("");

  const handleFileRead = useCallback((file: File) => {
    const fileName = file.name.toLowerCase();

    if (fileName !== "activities.csv" && fileName !== "reactions.csv") {
      setError(
        `Invalid file: ${file.name}. Please upload activities.csv or reactions.csv`
      );
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const content = e.target?.result as string;
      setError(null);

      if (fileName === "activities.csv") {
        setFiles((prev) => ({ ...prev, activities: content }));
      } else {
        setFiles((prev) => ({ ...prev, reactions: content }));
      }
    };
    reader.onerror = () => {
      setError(`Failed to read ${file.name}`);
    };
    reader.readAsText(file);
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);
      const droppedFiles = Array.from(e.dataTransfer.files);
      droppedFiles.forEach((file) => {
        if (file.name.endsWith(".csv")) {
          handleFileRead(file);
        }
      });
    },
    [handleFileRead]
  );

  const handleFileSelect = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const selectedFiles = Array.from(e.target.files || []);
      selectedFiles.forEach((file) => {
        handleFileRead(file);
      });
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    },
    [handleFileRead]
  );

  const handleRemoveFile = (type: "activities" | "reactions") => {
    setFiles((prev) => ({ ...prev, [type]: null }));
  };

  const handleGenerate = () => {
    if (!files.activities) {
      setError("Please upload activities.csv first");
      return;
    }
    if (!firstName.trim()) {
      setError("Please enter your first name");
      return;
    }

    try {
      localStorage.setItem(
        "strava_upload_data",
        JSON.stringify({
          activities: files.activities,
          reactions: files.reactions,
          firstName: firstName.trim(),
          timestamp: Date.now(),
        })
      );

      const currentYear = new Date().getFullYear();
      router.push(`/dashboard?source=upload&year=${currentYear}`);
    } catch {
      setError("Failed to process files. Please try again.");
    }
  };

  const hasFiles = files.activities || files.reactions;

  return (
    <div className="page-wrapper relative overflow-hidden min-h-screen flex flex-col">
      <div className="hero-bg" />

      {/* Header */}
      <header className="site-header glass relative z-10 w-full">
        <div className="container flex items-center h-16">
          <Link href="/" className="flex items-center gap-2">
            <span className="text-2xl">🏃</span>
            <span className="font-bold text-lg gradient-text">
              Strava Rewind
            </span>
          </Link>
        </div>
      </header>

      {/* Main Content */}
      <main className="page-content relative z-10 flex flex-col items-center justify-center">
        {/* Title Group */}
        <div className="hero-content animate-slide-up">
          <h1 className="hero-title">
            Upload Your <br />
            <span className="gradient-text">Strava Data</span>
          </h1>

          {/* Subtitle */}
          <div className="flex gap-2">
            <span className="hero-subtitle max-w-xl">
              No API connection needed. Use your Strava data export files.
            </span>
            <div className="tooltip-trigger relative">
              <InfoIcon />
              <div className="tooltip">
                <p className="tooltip-title">
                  How to get your Strava data export
                </p>
                {/* Help Section - Collapsible */}
                <ol className="relative ml-3 space-y-8">
                  <li className="pl-8 relative">
                    <p className="text-zinc-300">
                      1. Go to{" "}
                      <a
                        href="https://www.strava.com/athlete/delete_your_account"
                        target="_blank"
                        className="text-strava hover:underline"
                      >
                        Strava Settings
                      </a>
                    </p>
                  </li>
                  <li className="pl-8 relative">
                    <p className="text-zinc-300">
                      2. Click{" "}
                      <strong className="text-white">"Download Request"</strong>{" "}
                      under "Download or Delete Your Account"
                    </p>
                  </li>
                  <li className="pl-8 relative">
                    <p className="text-zinc-300">
                      3. Wait for the email (can take a few hours) and download
                      zip
                    </p>
                  </li>
                  <li className="pl-8 relative">
                    <p className="text-zinc-300">
                      4. Extract and upload{" "}
                      <code className="bg-zinc-800 px-1.5 py-0.5 rounded text-white text-sm">
                        activities.csv
                      </code>
                    </p>
                  </li>
                </ol>
                <div className="tooltip-arrow" />
              </div>
            </div>
          </div>
        </div>

        {/* Upload Container */}
        <div className="w-full max-w-2xl mb-8">
          <div
            className={`
              stat-card group cursor-pointer relative
              !border-2 !border-dashed !rounded-[2rem]
              ${
                isDragging
                  ? "border-strava bg-strava/10 scale-[1.02]"
                  : "hover:border-strava/50"
              }
            `}
            onDragOver={(e) => {
              e.preventDefault();
              setIsDragging(true);
            }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={handleDrop}
            onClick={() => !hasFiles && fileInputRef.current?.click()}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept=".csv"
              multiple
              className="hidden"
              onChange={handleFileSelect}
            />

            {!hasFiles ? (
              /* Empty State */
              <div className="flex flex-col items-center gap-4">
                <div className="w-16 h-16 mx-auto mb-6 text-zinc-500 group-hover:text-zinc-300 transition-colors">
                  <svg
                    className="w-full h-full"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1.5}
                      d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                    />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-white mb-2">
                  Upload activities.csv and reactions.csv
                </h3>
                <p className="text-zinc-400">
                  From your Strava activity zip file
                </p>
              </div>
            ) : (
              /* Files List State */
              <div
                className="py-12 px-8 md:px-16"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="flex items-center justify-between mb-8">
                  <h3 className="text-xl font-bold text-white">Files Ready</h3>
                  <button
                    onClick={() => {
                      setFiles({ activities: null, reactions: null });
                      if (fileInputRef.current) fileInputRef.current.value = "";
                    }}
                    className="text-sm text-zinc-500 hover:text-red-400 transition-colors"
                  >
                    Clear All
                  </button>
                </div>

                <div className="flex flex-col gap-4 w-full">
                  {/* Activities File Card */}
                  <div
                    className={`
                      flex items-center justify-between p-4 rounded-lg border transition-all
                      ${
                        files.activities
                          ? "bg-zinc-800/50 border-zinc-700"
                          : "bg-zinc-900/50 border-zinc-700/50 hover:bg-zinc-800/50 cursor-pointer"
                      }
                    `}
                    onClick={() =>
                      !files.activities && fileInputRef.current?.click()
                    }
                  >
                    <div className="flex items-center gap-2">
                      {files.activities ? (
                        <span className="text-green-500">✓</span>
                      ) : (
                        <span className="text-zinc-500">1</span>
                      )}
                      <span
                        className={`text-sm ${
                          files.activities ? "text-white" : "text-zinc-400"
                        }`}
                      >
                        activities.csv
                      </span>
                      {!files.activities && (
                        <span className="text-xs text-red-400">(Required)</span>
                      )}
                    </div>
                    {files.activities ? (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleRemoveFile("activities");
                        }}
                        className="text-xs text-zinc-500 hover:text-red-400 transition-colors"
                      >
                        Remove
                      </button>
                    ) : (
                      <span className="text-xs text-zinc-500">Missing</span>
                    )}
                  </div>

                  {/* Reactions File Card */}
                  <div
                    className={`
                      flex items-center justify-between p-4 rounded-lg border transition-all
                      ${
                        files.reactions
                          ? "bg-zinc-800/50 border-zinc-700"
                          : "bg-zinc-900/50 border-zinc-700/50 hover:bg-zinc-800/50 cursor-pointer"
                      }
                    `}
                    onClick={() =>
                      !files.reactions && fileInputRef.current?.click()
                    }
                  >
                    <div className="flex items-center gap-2">
                      {files.reactions ? (
                        <span className="text-green-500">✓</span>
                      ) : (
                        <span className="text-zinc-500">2</span>
                      )}
                      <span
                        className={`text-sm ${
                          files.reactions ? "text-white" : "text-zinc-400"
                        }`}
                      >
                        reactions.csv
                      </span>
                      <span className="text-xs text-zinc-500">
                        (Optional - for Kudos)
                      </span>
                    </div>
                    {files.reactions ? (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleRemoveFile("reactions");
                        }}
                        className="text-xs text-zinc-500 hover:text-red-400 transition-colors"
                      >
                        Remove
                      </button>
                    ) : (
                      <span className="text-xs text-zinc-500">Optional</span>
                    )}
                  </div>

                  {/* Name Input */}
                  <div className="mt-4 space-y-2 text-left">
                    <label
                      htmlFor="firstName"
                      className="text-sm font-medium text-zinc-300"
                    >
                      What&apos;s your first name?{" "}
                      <span className="text-red-500">*</span>
                    </label>
                    <input
                      id="firstName"
                      type="text"
                      placeholder="Enter your name"
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      className="w-full px-3 py-2 bg-zinc-900 border border-zinc-700 rounded-md text-sm text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-strava focus:border-transparent transition-all"
                    />
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Error Toast */}
        {error && (
          <div className="mb-8 animate-slide-up">
            <div className="bg-red-500/10 border border-red-500/20 text-red-200 px-6 py-4 rounded-xl flex items-center gap-3">
              <svg
                className="w-5 h-5 text-red-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              {error}
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex gap-4 justify-center">
          <Link href="/" className="btn-secondary">
            ← Back
          </Link>
          <button
            onClick={handleGenerate}
            disabled={!files.activities || !firstName.trim()}
            className={`btn-primary ${
              !files.activities || !firstName.trim()
                ? "opacity-50 cursor-not-allowed"
                : ""
            }`}
          >
            Generate Report →
          </button>
        </div>
      </main>

      {/* Footer */}
      <footer className="site-footer relative z-10">
        <p className="text-zinc-600 text-sm text-center">
          Your data stays in your browser. Nothing is uploaded to any server.
        </p>
      </footer>
    </div>
  );
}
