"use client";

import { useCallback, useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useContract } from "@/hooks/useContract";
import NftNotification from "./NftNotification";
import type { GridSize } from "@/lib/game";

interface ModeSelectProps {
  onSelectMode: (size: GridSize) => void;
  onOpenLeaderboard: () => void;
}

const MODES: { size: GridSize; label: string; desc: string; color: string }[] = [
  { size: 3, label: "3 x 3", desc: "Quick & tricky", color: "from-emerald-400 to-teal-500" },
  { size: 4, label: "4 x 4", desc: "The classic", color: "from-blue-500 to-indigo-600" },
  { size: 5, label: "5 x 5", desc: "Extended challenge", color: "from-purple-500 to-pink-600" },
];

export default function ModeSelect({ onSelectMode, onOpenLeaderboard }: ModeSelectProps) {
  const { authenticated, address, login } = useAuth();
  const { startGame, gm, canGm, getPlayerStats, loading, error } = useContract();
  const [canGmToday, setCanGmToday] = useState(false);
  const [gmDone, setGmDone] = useState(false);
  const [stats, setStats] = useState<{ games: number; streak: number; gms: number; hasNFT: boolean } | null>(null);
  const [nftTokenId, setNftTokenId] = useState<string | null>(null);
  const [pendingMode, setPendingMode] = useState<GridSize | null>(null);

  useEffect(() => {
    if (!authenticated || !address) return;
    canGm(address).then(setCanGmToday);
    getPlayerStats(address).then(setStats);
  }, [authenticated, address, canGm, getPlayerStats]);

  const handleSelectMode = useCallback(
    async (size: GridSize) => {
      if (!authenticated) {
        login();
        return;
      }
      const result = await startGame(size);
      if (result.success) {
        if (result.nftMinted && result.tokenId) {
          setNftTokenId(result.tokenId);
          setPendingMode(size);
        } else {
          onSelectMode(size);
        }
        if (address) getPlayerStats(address).then(setStats);
      }
    },
    [authenticated, login, startGame, onSelectMode, address, getPlayerStats]
  );

  const handleNftClose = useCallback(() => {
    setNftTokenId(null);
    if (pendingMode) {
      onSelectMode(pendingMode);
      setPendingMode(null);
    }
  }, [pendingMode, onSelectMode]);

  const handleGm = useCallback(async () => {
    if (!authenticated) {
      login();
      return;
    }
    const success = await gm();
    if (success) {
      setGmDone(true);
      setCanGmToday(false);
      if (address) getPlayerStats(address).then(setStats);
    }
  }, [authenticated, login, gm, address, getPlayerStats]);

  return (
    <>
      {nftTokenId && (
        <NftNotification tokenId={nftTokenId} onClose={handleNftClose} />
      )}
    <div className="flex flex-col items-center gap-5 w-full px-6 animate-fade-in">
      <div className="text-center">
        <h1 className="text-6xl sm:text-7xl font-black text-[#1a1a2e] tracking-tighter">
          2048
        </h1>
        <p className="text-sm text-[#8b8fa3] mt-1 font-medium">on Base</p>
      </div>

      {/* GM Button */}
      <button
        onClick={handleGm}
        disabled={loading || (!canGmToday && !gmDone && authenticated)}
        className={`w-full max-w-[320px] relative overflow-hidden rounded-2xl
          transition-all duration-200 active:scale-[0.97]
          ${canGmToday && authenticated
            ? "glass-card shadow-[0_4px_24px_rgba(0,0,0,0.06)] hover:shadow-[0_8px_32px_rgba(0,0,0,0.1)]"
            : gmDone
              ? "bg-emerald-50 border border-emerald-200"
              : "glass-card opacity-60"
          }`}
      >
        <div className="flex items-center justify-between px-5 py-3.5">
          <div className="flex items-center gap-3">
            <div className="text-2xl">
              {gmDone ? "✅" : "☀️"}
            </div>
            <div className="text-left">
              <div className="text-[#1a1a2e] font-bold text-sm">
                {gmDone ? "gm checked in!" : loading ? "Confirming..." : "gm"}
              </div>
              <div className="text-[#8b8fa3] text-xs">
                {authenticated && stats
                  ? `${stats.streak} day streak · ${stats.gms} total`
                  : "Daily check-in on Base"}
              </div>
            </div>
          </div>
          {loading ? (
            <div className="w-5 h-5 border-2 border-base-blue border-t-transparent rounded-full animate-spin" />
          ) : canGmToday && authenticated ? (
            <span className="text-xs font-bold text-base-blue bg-blue-50 px-2.5 py-1 rounded-full">
              Claim
            </span>
          ) : !authenticated ? (
            <span className="text-xs font-bold text-[#8b8fa3]">Log in</span>
          ) : null}
        </div>
      </button>

      {/* Mode Selection */}
      <div className="w-full max-w-[320px] flex flex-col gap-3">
        <p className="text-xs uppercase tracking-[0.2em] text-[#8b8fa3] font-semibold text-center">
          Choose mode
        </p>

        {MODES.map((mode) => (
          <button
            key={mode.size}
            onClick={() => handleSelectMode(mode.size)}
            disabled={loading}
            className="group relative w-full overflow-hidden rounded-2xl
              glass-card shadow-[0_4px_24px_rgba(0,0,0,0.06)]
              hover:shadow-[0_8px_32px_rgba(0,0,0,0.1)]
              active:scale-[0.97] transition-all duration-200
              disabled:opacity-60 disabled:pointer-events-none"
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
              {loading ? (
                <div className="w-5 h-5 border-2 border-base-blue border-t-transparent rounded-full animate-spin" />
              ) : (
                <svg
                  className="w-5 h-5 text-[#c0c4d8]
                    group-hover:text-[#6b6f87] group-hover:translate-x-0.5 transition-all"
                  fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                </svg>
              )}
            </div>
          </button>
        ))}
      </div>

      {/* Error */}
      {error && (
        <p className="text-red-500 text-xs text-center max-w-[280px]">{error}</p>
      )}

      {/* Stats */}
      {authenticated && stats && stats.games > 0 && (
        <div className="flex gap-4 text-center">
          <div>
            <div className="text-lg font-extrabold text-[#1a1a2e]">{stats.games}</div>
            <div className="text-[10px] text-[#8b8fa3] uppercase tracking-wider">Games</div>
          </div>
          {stats.hasNFT && (
            <div>
              <div className="text-lg">🏆</div>
              <div className="text-[10px] text-[#8b8fa3] uppercase tracking-wider">Early</div>
            </div>
          )}
        </div>
      )}

      {/* Leaderboard */}
      <button
        onClick={onOpenLeaderboard}
        className="flex items-center gap-2.5 px-6 py-3 glass-card rounded-2xl
          shadow-[0_4px_20px_rgba(0,0,0,0.04)]
          hover:shadow-[0_6px_24px_rgba(0,0,0,0.08)]
          active:scale-[0.97] transition-all duration-200 group"
      >
        <svg className="w-5 h-5 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round"
            d="M16.5 18.75h-9m9 0a3 3 0 013 3h-15a3 3 0 013-3m9 0v-4.5A3.375 3.375 0 0019.875 10.875h0A3.375 3.375 0 0016.5 7.5h0V1.5m-9 17.25v-4.5A3.375 3.375 0 014.125 10.875h0A3.375 3.375 0 017.5 7.5h0V1.5m4.5 0v18" />
        </svg>
        <span className="text-[#1a1a2e] font-bold text-sm">Leaderboard</span>
        <svg className="w-4 h-4 text-[#c0c4d8] group-hover:text-[#6b6f87] group-hover:translate-x-0.5 transition-all"
          fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
        </svg>
      </button>
    </div>
    </>
  );
}
