"use client";

import { useState, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

interface FileData {
  activities: string | null;
  reactions: string | null;
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

    try {
      localStorage.setItem(
        "strava_upload_data",
        JSON.stringify({
          activities: files.activities,
          reactions: files.reactions,
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
          <p className="hero-subtitle max-w-xl">
            No API connection needed. Use your Strava data export files.
          </p>
        </div>

        {/* Upload Container */}
        <div className="w-full max-w-2xl mb-12">
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
              <div className="py-20 px-8 text-center bg-transparent">
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

                <div className="space-y-4">
                  {/* Activities File Card */}
                  <div
                    className={`
                      relative overflow-hidden rounded-xl p-6 border transition-all duration-200
                      ${
                        files.activities
                          ? "bg-zinc-800/80 border-green-500/30 shadow-[0_0_15px_rgba(16,185,129,0.1)]"
                          : "bg-zinc-900/50 border-zinc-700/50 hover:bg-zinc-800/50 cursor-pointer"
                      }
                    `}
                    onClick={() =>
                      !files.activities && fileInputRef.current?.click()
                    }
                  >
                    <div className="flex items-center justify-between z-10 relative">
                      <div className="flex items-center gap-4">
                        <div
                          className={`
                          w-10 h-10 rounded-lg flex items-center justify-center
                          ${
                            files.activities
                              ? "bg-green-500/20 text-green-400"
                              : "bg-zinc-800 text-zinc-500"
                          }
                        `}
                        >
                          {files.activities ? (
                            <svg
                              className="w-6 h-6"
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M5 13l4 4L19 7"
                              />
                            </svg>
                          ) : (
                            <span className="text-lg font-bold">1</span>
                          )}
                        </div>
                        <div>
                          <p
                            className={`font-semibold text-lg ${
                              files.activities ? "text-white" : "text-zinc-400"
                            }`}
                          >
                            activities.csv
                          </p>
                          <p className="text-xs text-zinc-500 uppercase tracking-wider font-medium">
                            Required
                          </p>
                        </div>
                      </div>

                      {files.activities ? (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleRemoveFile("activities");
                          }}
                          className="p-2 hover:bg-zinc-700 rounded-full text-zinc-500 hover:text-red-400 transition-colors"
                        >
                          <svg
                            className="w-5 h-5"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M6 18L18 6M6 6l12 12"
                            />
                          </svg>
                        </button>
                      ) : (
                        <span className="text-sm text-zinc-500 font-medium px-3 py-1 bg-zinc-800 rounded-full">
                          Missing
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Reactions File Card */}
                  <div
                    className={`
                      relative overflow-hidden rounded-xl p-6 border transition-all duration-200
                      ${
                        files.reactions
                          ? "bg-zinc-800/80 border-blue-500/30 shadow-[0_0_15px_rgba(59,130,246,0.1)]"
                          : "bg-zinc-900/50 border-zinc-700/50 hover:bg-zinc-800/50 cursor-pointer"
                      }
                    `}
                    onClick={() =>
                      !files.reactions && fileInputRef.current?.click()
                    }
                  >
                    <div className="flex items-center justify-between z-10 relative">
                      <div className="flex items-center gap-4">
                        <div
                          className={`
                          w-10 h-10 rounded-lg flex items-center justify-center
                          ${
                            files.reactions
                              ? "bg-blue-500/20 text-blue-400"
                              : "bg-zinc-800 text-zinc-500"
                          }
                        `}
                        >
                          {files.reactions ? (
                            <svg
                              className="w-6 h-6"
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M5 13l4 4L19 7"
                              />
                            </svg>
                          ) : (
                            <span className="text-lg font-bold">2</span>
                          )}
                        </div>
                        <div>
                          <p
                            className={`font-semibold text-lg ${
                              files.reactions ? "text-white" : "text-zinc-400"
                            }`}
                          >
                            reactions.csv
                          </p>
                          <p className="text-xs text-zinc-500 uppercase tracking-wider font-medium">
                            Optional - for Kudos
                          </p>
                        </div>
                      </div>

                      {files.reactions ? (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleRemoveFile("reactions");
                          }}
                          className="p-2 hover:bg-zinc-700 rounded-full text-zinc-500 hover:text-red-400 transition-colors"
                        >
                          <svg
                            className="w-5 h-5"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M6 18L18 6M6 6l12 12"
                            />
                          </svg>
                        </button>
                      ) : (
                        <span className="text-sm text-zinc-500 font-medium px-3 py-1 bg-zinc-800 rounded-full">
                          Optional
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Help Section - Collapsible */}
        <div className="w-full max-w-2xl mb-12">
          <details className="group">
            <summary className="flex items-center justify-center gap-2 cursor-pointer text-zinc-500 hover:text-zinc-300 transition-colors list-none">
              <span className="text-base font-medium">
                How to get your Strava data export
              </span>
              <svg
                className="w-4 h-4 transition-transform group-open:rotate-180"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 9l-7 7-7-7"
                />
              </svg>
            </summary>
            <div className="mt-8 stat-card">
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
            </div>
          </details>
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
            disabled={!files.activities}
            className={`btn-primary ${
              !files.activities ? "opacity-50 cursor-not-allowed" : ""
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
