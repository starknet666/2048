"use client";

import type { GridSize } from "@/lib/game";

interface ModeSelectProps {
  onSelectMode: (size: GridSize) => void;
  onOpenLeaderboard: () => void;
}

const MODES: { size: GridSize; label: string; desc: string; color: string }[] = [
  {
    size: 3,
    label: "3 x 3",
    desc: "Quick & tricky",
    color: "from-emerald-400 to-teal-500",
  },
  {
    size: 4,
    label: "4 x 4",
    desc: "The classic",
    color: "from-blue-500 to-indigo-600",
  },
  {
    size: 5,
    label: "5 x 5",
    desc: "Extended challenge",
    color: "from-purple-500 to-pink-600",
  },
];

export default function ModeSelect({ onSelectMode, onOpenLeaderboard }: ModeSelectProps) {
  return (
    <div className="flex flex-col items-center gap-6 w-full px-6 animate-fade-in">
      <div className="text-center">
        <h1 className="text-6xl sm:text-7xl font-black text-[#1a1a2e] tracking-tighter">
          2048
        </h1>
        <p className="text-sm text-[#8b8fa3] mt-1 font-medium">
          on Base
        </p>
      </div>

      <div className="w-full max-w-[320px] flex flex-col gap-3">
        <p className="text-xs uppercase tracking-[0.2em] text-[#8b8fa3] font-semibold text-center">
          Choose mode
        </p>

        {MODES.map((mode) => (
          <button
            key={mode.size}
            onClick={() => onSelectMode(mode.size)}
            className="group relative w-full overflow-hidden rounded-2xl
              glass-card shadow-[0_4px_24px_rgba(0,0,0,0.06)]
              hover:shadow-[0_8px_32px_rgba(0,0,0,0.1)]
              active:scale-[0.97] transition-all duration-200"
          >
            <div className={`absolute inset-0 bg-gradient-to-r ${mode.color} opacity-0
              group-hover:opacity-[0.08] transition-opacity duration-300`} />

            <div className="relative flex items-center justify-between px-5 py-4">
              <div className="flex items-center gap-4">
                <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${mode.color}
                  flex items-center justify-center shadow-lg`}
                >
                  <span className="text-white font-black text-sm">
                    {mode.size}x{mode.size}
                  </span>
                </div>
                <div className="text-left">
                  <div className="text-[#1a1a2e] font-bold text-base">
                    {mode.label}
                  </div>
                  <div className="text-[#8b8fa3] text-xs">
                    {mode.desc}
                  </div>
                </div>
              </div>
              <svg
                className="w-5 h-5 text-[#c0c4d8]
                  group-hover:text-[#6b6f87] group-hover:translate-x-0.5 transition-all"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2.5}
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
              </svg>
            </div>
          </button>
        ))}
      </div>

      <button
        onClick={onOpenLeaderboard}
        className="flex items-center gap-2.5 px-6 py-3 glass-card rounded-2xl
          shadow-[0_4px_20px_rgba(0,0,0,0.04)]
          hover:shadow-[0_6px_24px_rgba(0,0,0,0.08)]
          active:scale-[0.97] transition-all duration-200 group"
      >
        <svg
          className="w-5 h-5 text-amber-500"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M16.5 18.75h-9m9 0a3 3 0 013 3h-15a3 3 0 013-3m9 0v-4.5A3.375 3.375 0 0019.875 10.875h0A3.375 3.375 0 0016.5 7.5h0V1.5m-9 17.25v-4.5A3.375 3.375 0 014.125 10.875h0A3.375 3.375 0 017.5 7.5h0V1.5m4.5 0v18"
          />
        </svg>
        <span className="text-[#1a1a2e] font-bold text-sm">
          Leaderboard
        </span>
        <svg
          className="w-4 h-4 text-[#c0c4d8] group-hover:text-[#6b6f87]
            group-hover:translate-x-0.5 transition-all"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2.5}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
        </svg>
      </button>
    </div>
  );
}
