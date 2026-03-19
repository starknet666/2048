"use client";

import { useState } from "react";
import dynamic from "next/dynamic";
import BaseAppGate from "@/components/BaseAppGate";
import WalletConnect from "@/components/WalletConnect";
import ModeSelect from "@/components/ModeSelect";
import type { GridSize } from "@/lib/game";

const Game = dynamic(() => import("@/components/Game"), { ssr: false });
const Leaderboard = dynamic(() => import("@/components/Leaderboard"), { ssr: false });

type Screen = "menu" | "game" | "leaderboard";

export default function Home() {
  const [screen, setScreen] = useState<Screen>("menu");
  const [gridSize, setGridSize] = useState<GridSize>(4);

  const handleSelectMode = (size: GridSize) => {
    setGridSize(size);
    setScreen("game");
  };

  return (
    <BaseAppGate>
      <div className="animated-bg">
        <div className="orb orb-1" />
        <div className="orb orb-2" />
        <div className="orb orb-3" />
        <div className="orb orb-4" />
        <div className="orb orb-5" />
      </div>

      <main className="relative z-10 flex flex-col h-[100dvh] overflow-hidden">
        <header className="flex items-center justify-between px-4 py-3 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-base-blue flex items-center justify-center shadow-md shadow-blue-500/20">
              <svg
                width="16"
                height="16"
                viewBox="0 0 111 111"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M54.921 110.034C85.359 110.034 110.034 85.402 110.034 55.017C110.034 24.6319 85.359 0 54.921 0C26.0432 0 2.35281 22.1714 0 50.3923H72.8467V59.6416H0C2.35281 87.8625 26.0432 110.034 54.921 110.034Z"
                  fill="white"
                />
              </svg>
            </div>
            <span className="text-[#1a1a2e] font-bold text-sm tracking-tight">
              2048 on Base
            </span>
          </div>
          <WalletConnect />
        </header>

        <div className="flex-1 flex items-center justify-center min-h-0 pb-6 overflow-y-auto">
          {screen === "menu" && (
            <ModeSelect
              onSelectMode={handleSelectMode}
              onOpenLeaderboard={() => setScreen("leaderboard")}
            />
          )}

          {screen === "game" && (
            <Game
              gridSize={gridSize}
              onBack={() => setScreen("menu")}
            />
          )}

          {screen === "leaderboard" && (
            <Leaderboard onBack={() => setScreen("menu")} />
          )}
        </div>
      </main>
    </BaseAppGate>
  );
}
