"use client";

import { useCallback, useRef } from "react";
import type { Direction } from "@/lib/game";

interface SwipeHandlers {
  onTouchStart: (e: React.TouchEvent | TouchEvent) => void;
  onTouchEnd: (e: React.TouchEvent | TouchEvent) => void;
}

const MIN_SWIPE_DISTANCE = 30;

export function useSwipe(onSwipe: (dir: Direction) => void): SwipeHandlers {
  const startX = useRef(0);
  const startY = useRef(0);

  const onTouchStart = useCallback((e: React.TouchEvent | TouchEvent) => {
    const touch = e.touches[0];
    startX.current = touch.clientX;
    startY.current = touch.clientY;
  }, []);

  const onTouchEnd = useCallback(
    (e: React.TouchEvent | TouchEvent) => {
      const touch = e.changedTouches[0];
      const dx = touch.clientX - startX.current;
      const dy = touch.clientY - startY.current;

      if (
        Math.abs(dx) < MIN_SWIPE_DISTANCE &&
        Math.abs(dy) < MIN_SWIPE_DISTANCE
      ) {
        return;
      }

      if (Math.abs(dx) > Math.abs(dy)) {
        onSwipe(dx > 0 ? "right" : "left");
      } else {
        onSwipe(dy > 0 ? "down" : "up");
      }
    },
    [onSwipe]
  );

  return { onTouchStart, onTouchEnd };
}
