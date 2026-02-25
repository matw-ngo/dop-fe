/**
 * MSW Dev Toolbar Component
 *
 * Development toolbar for controlling MSW (Mock Service Worker)
 * Shows MSW status and provides controls for development testing
 */

"use client";

import React, { useState, useEffect } from "react";
import { mswStore } from "@/mocks/store";

// SVG Icons for professional appearance
const CloseIcon = () => (
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
      d="M6 18L18 6M6 6l12 12"
    />
  </svg>
);

const PlayIcon = () => (
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
      d="M14.828 14.828a4 4 0 01-5.656 0M9 10h1.586a1 1 0 01.707.293l.707.707A1 1 0 0012.414 11H13m-4 4h1.586a1 1 0 01.707.293l.707.707A1 1 0 0012.414 15H13m0-4v4"
    />
  </svg>
);

const PauseIcon = () => (
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
      d="M10 9v6m4-6v6m7-3a9 9 0 11-18 0 9 9 0 0118 0z"
    />
  </svg>
);

export const MSWToolbar: React.FC = () => {
  const [mswStatus, setMswStatus] = useState<
    "loading" | "enabled" | "disabled"
  >("loading");
  const [isHovered, setIsHovered] = useState(false);

  useEffect(() => {
    // Only show in development
    if (process.env.NODE_ENV !== "development") return;

    // Check MSW status
    const checkMSWStatus = () => {
      const worker = (window as any).__MSW_WORKER__;
      if (worker) {
        setMswStatus(mswStore.isMswEnabled() ? "enabled" : "disabled");
      } else {
        // MSW might not be initialized yet
        setTimeout(checkMSWStatus, 1000);
      }
    };

    checkMSWStatus();
  }, []);

  const toggleMSW = () => {
    const worker = (window as any).__MSW_WORKER__;
    if (worker) {
      if (mswStatus === "enabled") {
        worker.stop();
        mswStore.setMswEnabled(false);
        setMswStatus("disabled");
        console.log("🔌 MSW stopped - using real APIs");
      } else {
        worker.start({ onUnhandledRequest: "bypass", quiet: true });
        mswStore.setMswEnabled(true);
        setMswStatus("enabled");
        console.log("🚀 MSW restarted - API requests will be mocked");
      }
    }
  };

  const resetMSWData = () => {
    mswStore.resetMockData();
    window.location.reload();
  };

  // Don't render in production
  if (process.env.NODE_ENV !== "development") {
    return null;
  }

  return (
    <div
      className="fixed bottom-4 left-4 z-[9999] flex gap-2"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Single MSW button */}
      <button
        onClick={toggleMSW}
        disabled={mswStatus === "loading"}
        className={`
          flex items-center justify-center h-8 px-3 text-[11px] font-medium rounded-full transition-all duration-200 cursor-pointer border backdrop-blur-md
          disabled:cursor-not-allowed shadow-sm
          ${
            mswStatus === "enabled"
              ? "bg-black/90 hover:bg-black text-green-400 border-zinc-800 shadow-xl"
              : mswStatus === "disabled"
                ? "bg-zinc-100/80 hover:bg-zinc-200 text-zinc-500 border-zinc-200"
                : "bg-zinc-100/80 hover:bg-zinc-200 text-zinc-500 border-zinc-200 animate-pulse"
          }
        `}
      >
        {mswStatus === "loading"
          ? "..."
          : mswStatus === "enabled"
            ? "MSW ON"
            : "MSW OFF"}
      </button>

      {/* Reset Data Button */}
      <div
        className={`transition-all duration-300 transform origin-left ${
          isHovered
            ? "scale-x-100 opacity-100 w-auto"
            : "scale-x-0 opacity-0 w-0 overflow-hidden"
        }`}
      >
        <button
          onClick={resetMSWData}
          className="flex items-center justify-center h-8 px-3 text-[11px] font-medium rounded-full transition-all duration-200 cursor-pointer border backdrop-blur-md bg-black/90 hover:bg-black text-white border-zinc-800 shadow-sm"
        >
          Reset Data
        </button>
      </div>
    </div>
  );
};
