"use client";

import { memo } from "react";
import type { GridSize, TileData } from "@/lib/game";

const TILE_STYLES: Record<number, { bg: string; text: string; shadow: string }> = {
  2: {
    bg: "bg-[#fef9ef]",
    text: "text-[#6b5c4d]",
    shadow: "shadow-[0_2px_8px_rgba(200,180,160,0.3)]",
  },
  4: {
    bg: "bg-[#fef3dc]",
    text: "text-[#6b5c4d]",
    shadow: "shadow-[0_2px_8px_rgba(200,170,130,0.3)]",
  },
  8: {
    bg: "bg-gradient-to-br from-[#ffb366] to-[#f2994a]",
    text: "text-white",
    shadow: "shadow-[0_4px_12px_rgba(242,153,74,0.35)]",
  },
  16: {
    bg: "bg-gradient-to-br from-[#ff9e5c] to-[#f2784b]",
    text: "text-white",
    shadow: "shadow-[0_4px_12px_rgba(242,120,75,0.35)]",
  },
  32: {
    bg: "bg-gradient-to-br from-[#ff7e6b] to-[#f25c54]",
    text: "text-white",
    shadow: "shadow-[0_4px_14px_rgba(242,92,84,0.4)]",
  },
  64: {
    bg: "bg-gradient-to-br from-[#ff5c4a] to-[#e63946]",
    text: "text-white",
    shadow: "shadow-[0_4px_16px_rgba(230,57,70,0.4)]",
  },
  128: {
    bg: "bg-gradient-to-br from-[#ffe066] to-[#ffd23f]",
    text: "text-white",
    shadow: "shadow-[0_4px_20px_rgba(255,210,63,0.45)]",
  },
  256: {
    bg: "bg-gradient-to-br from-[#ffd23f] to-[#f7c948]",
    text: "text-white",
    shadow: "shadow-[0_4px_20px_rgba(247,201,72,0.45)]",
  },
  512: {
    bg: "bg-gradient-to-br from-[#f7c948] to-[#f0b429]",
    text: "text-white",
    shadow: "shadow-[0_4px_22px_rgba(240,180,41,0.5)]",
  },
  1024: {
    bg: "bg-gradient-to-br from-[#f0b429] to-[#e8a317]",
    text: "text-white",
    shadow: "shadow-[0_6px_24px_rgba(232,163,23,0.5)]",
  },
  2048: {
    bg: "bg-gradient-to-br from-[#7c3aed] to-[#4f46e5]",
    text: "text-white",
    shadow: "shadow-[0_6px_28px_rgba(79,70,229,0.5)]",
  },
  4096: {
    bg: "bg-gradient-to-br from-[#ec4899] to-[#be185d]",
    text: "text-white",
    shadow: "shadow-[0_6px_28px_rgba(236,72,153,0.5)]",
  },
};

const DEFAULT_STYLE = {
  bg: "bg-gradient-to-br from-[#4338ca] to-[#312e81]",
  text: "text-white",
  shadow: "shadow-[0_6px_24px_rgba(67,56,202,0.4)]",
};

function getFontSize(value: number, gridSize: GridSize): string {
  if (gridSize === 3) {
    if (value < 100) return "text-3xl sm:text-4xl";
    if (value < 1000) return "text-2xl sm:text-3xl";
    return "text-xl sm:text-2xl";
  }
  if (gridSize === 5) {
    if (value < 100) return "text-xl sm:text-2xl";
    if (value < 1000) return "text-base sm:text-lg";
    if (value < 10000) return "text-sm sm:text-base";
    return "text-xs sm:text-sm";
  }
  if (value < 100) return "text-2xl sm:text-3xl";
  if (value < 1000) return "text-xl sm:text-2xl";
  if (value < 10000) return "text-lg sm:text-xl";
  return "text-base sm:text-lg";
}

interface TileProps {
  tile: TileData;
  size: GridSize;
}

function TileComponent({ tile, size }: TileProps) {
  const style = TILE_STYLES[tile.value] || DEFAULT_STYLE;
  const animation = tile.isNew
    ? "animate-tile-pop"
    : tile.isMerged
      ? "animate-tile-merge"
      : "";

  return (
    <div
      className={`
        absolute inset-[3px] sm:inset-1 rounded-xl sm:rounded-2xl
        flex items-center justify-center
        font-extrabold select-none
        transition-all duration-100
        ${style.bg} ${style.text} ${style.shadow}
        ${getFontSize(tile.value, size)}
        ${animation}
      `}
    >
      {tile.value}
    </div>
  );
}

export default memo(TileComponent);
