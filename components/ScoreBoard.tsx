"use client";

import type { GridSize } from "@/lib/game";

interface ScoreBoardProps {
  score: number;
  bestScore: number;
  gridSize: GridSize;
}

const SIZE_CLASSES: Record<GridSize, string> = {
  3: "max-w-[280px] sm:max-w-[320px]",
  4: "max-w-[340px] sm:max-w-[400px]",
  5: "max-w-[360px] sm:max-w-[420px]",
};

export default function ScoreBoard({ score, bestScore, gridSize }: ScoreBoardProps) {
  return (
    <div className={`flex gap-3 w-full ${SIZE_CLASSES[gridSize]} mx-auto`}>
      <div
        className="flex-1 glass-card rounded-2xl p-3 text-center
          shadow-[0_4px_20px_rgba(0,0,0,0.04)]"
      >
        <div className="text-[10px] sm:text-xs uppercase tracking-[0.15em] text-[#8b8fa3] font-semibold">
          Score
        </div>
        <div className="text-xl sm:text-2xl font-extrabold text-[#1a1a2e] mt-0.5 tabular-nums">
          {score.toLocaleString()}
        </div>
      </div>
      <div
        className="flex-1 glass-card rounded-2xl p-3 text-center
          shadow-[0_4px_20px_rgba(0,0,0,0.04)]"
      >
        <div className="text-[10px] sm:text-xs uppercase tracking-[0.15em] text-[#8b8fa3] font-semibold">
          Best
        </div>
        <div className="text-xl sm:text-2xl font-extrabold text-base-blue mt-0.5 tabular-nums">
          {bestScore.toLocaleString()}
        </div>
      </div>
    </div>
  );
}
