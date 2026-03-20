"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import type { GridSize } from "@/lib/game";
import { fetchLeaderboard, type LeaderboardEntry } from "@/lib/leaderboard";

interface LeaderboardProps {
  onBack: () => void;
}

const TABS: { size: GridSize; label: string }[] = [
  { size: 3, label: "3x3" },
  { size: 4, label: "4x4" },
  { size: 5, label: "5x5" },
];

function truncAddr(addr: string): string {
  return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
}

function getMedal(index: number): string | null {
  if (index === 0) return "🥇";
  if (index === 1) return "🥈";
  if (index === 2) return "🥉";
  return null;
}

export default function Leaderboard({ onBack }: LeaderboardProps) {
  const [activeTab, setActiveTab] = useState<GridSize>(4);
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const { address } = useAuth();

  useEffect(() => {
    setLoading(true);
    fetchLeaderboard(activeTab).then((data) => {
      setEntries(data);
      setLoading(false);
    });
  }, [activeTab]);

  return (
    <div className="flex flex-col h-full w-full max-w-[400px] mx-auto animate-fade-in">
      <div className="flex items-center w-full px-4 pt-2 pb-3 shrink-0">
        <button
          onClick={onBack}
          className="flex items-center gap-1.5 px-3 py-2 glass-card rounded-xl
            text-[#1a1a2e] text-sm font-semibold
            hover:bg-white/80 active:scale-95 transition-all
            shadow-[0_2px_12px_rgba(0,0,0,0.06)]"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
          Back
        </button>
        <h2 className="flex-1 text-center text-xl font-extrabold text-[#1a1a2e] pr-14">
          Leaderboard
        </h2>
      </div>

      <div className="px-4 pb-3 shrink-0">
        <div className="flex gap-1.5 p-1 glass-card rounded-2xl w-full
          shadow-[0_2px_12px_rgba(0,0,0,0.04)]">
          {TABS.map((tab) => (
            <button
              key={tab.size}
              onClick={() => setActiveTab(tab.size)}
              className={`flex-1 py-2 text-sm font-bold rounded-xl transition-all duration-200
                ${activeTab === tab.size
                  ? "bg-base-blue text-white shadow-md shadow-blue-500/20"
                  : "text-[#8b8fa3] hover:text-[#1a1a2e]"
                }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-4 pb-4 min-h-0">
        <div className="w-full glass-card rounded-2xl shadow-[0_4px_20px_rgba(0,0,0,0.04)] overflow-hidden">
          {loading ? (
            <div className="py-12 flex justify-center">
              <div className="w-6 h-6 border-2 border-base-blue border-t-transparent rounded-full animate-spin" />
            </div>
          ) : entries.length === 0 ? (
            <div className="py-12 text-center">
              <div className="text-3xl mb-2">🏆</div>
              <p className="text-[#8b8fa3] text-sm font-medium">No scores yet</p>
              <p className="text-[#c0c4d8] text-xs mt-1">Be the first to play!</p>
            </div>
          ) : (
            <div className="divide-y divide-[#e8ecf2]/60">
              {entries.map((entry, i) => {
                const medal = getMedal(i);
                const isMe = address?.toLowerCase() === entry.address.toLowerCase();

                return (
                  <div
                    key={`${entry.address}-${activeTab}`}
                    className={`flex items-center gap-3 px-4 py-3 transition-colors
                      ${isMe ? "bg-blue-50/60" : "hover:bg-[#f8f9fc]/60"}`}
                  >
                    <div className="w-8 text-center shrink-0">
                      {medal ? (
                        <span className="text-lg">{medal}</span>
                      ) : (
                        <span className="text-xs font-bold text-[#c0c4d8]">
                          {i + 1}
                        </span>
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className={`text-sm font-semibold truncate
                        ${isMe ? "text-base-blue" : "text-[#1a1a2e]"}`}
                      >
                        {truncAddr(entry.address)}
                        {isMe && (
                          <span className="ml-1.5 text-[10px] bg-base-blue/10 text-base-blue
                            px-1.5 py-0.5 rounded-full font-bold">
                            YOU
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="text-right shrink-0">
                      <div className={`text-sm font-extrabold tabular-nums
                        ${i === 0 ? "text-amber-500" : "text-[#1a1a2e]"}`}
                      >
                        {entry.score.toLocaleString()}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <p className="text-[10px] text-[#c0c4d8] text-center mt-3 pb-2">
          Scores are saved automatically at end of each game
        </p>
      </div>
    </div>
  );
}
