"use client";

import type { GridSize, TileData } from "@/lib/game";
import Tile from "./Tile";

interface BoardProps {
  tiles: TileData[];
  size: GridSize;
}

const GRID_CLASSES: Record<GridSize, string> = {
  3: "grid-cols-3 grid-rows-3",
  4: "grid-cols-4 grid-rows-4",
  5: "grid-cols-5 grid-rows-5",
};

const SIZE_CLASSES: Record<GridSize, string> = {
  3: "max-w-[280px] sm:max-w-[320px]",
  4: "max-w-[340px] sm:max-w-[400px]",
  5: "max-w-[360px] sm:max-w-[420px]",
};

export default function Board({ tiles, size }: BoardProps) {
  const totalCells = size * size;

  return (
    <div className={`relative w-full ${SIZE_CLASSES[size]} aspect-square mx-auto`}>
      <div
        className="absolute inset-0 rounded-2xl sm:rounded-3xl p-2 sm:p-3
          bg-white/50 backdrop-blur-xl
          border border-white/70
          shadow-[0_8px_40px_rgba(0,0,0,0.06)]"
      >
        <div className={`grid ${GRID_CLASSES[size]} gap-1.5 sm:gap-2.5 h-full`}>
          {Array.from({ length: totalCells }).map((_, i) => {
            const row = Math.floor(i / size);
            const col = i % size;
            const tile = tiles.find((t) => t.row === row && t.col === col);

            return (
              <div
                key={`cell-${row}-${col}`}
                className="relative bg-[#e8ecf2]/60 rounded-xl sm:rounded-2xl"
              >
                {tile && <Tile tile={tile} size={size} />}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
