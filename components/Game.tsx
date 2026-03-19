"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import {
  initGame,
  move,
  getBestScore,
  saveBestScore,
  type Direction,
  type GameState,
  type GridSize,
} from "@/lib/game";
import {
  playSwipe,
  playMerge,
  playWin,
  playGameOver,
  isMuted,
  setMuted,
  initMuted,
} from "@/lib/sounds";
import { useSwipe } from "@/hooks/useSwipe";
import Board from "./Board";
import ScoreBoard from "./ScoreBoard";
import GameOverlay from "./GameOverlay";

interface GameProps {
  gridSize: GridSize;
  onBack: () => void;
}

const MODE_LABELS: Record<GridSize, string> = {
  3: "3x3",
  4: "4x4",
  5: "5x5",
};

export default function Game({ gridSize, onBack }: GameProps) {
  const [gameState, setGameState] = useState<GameState | null>(null);
  const [bestScore, setBestScore] = useState(0);
  const [showWinOverlay, setShowWinOverlay] = useState(false);
  const [winDismissed, setWinDismissed] = useState(false);
  const [soundOff, setSoundOff] = useState(false);
  const gameRef = useRef<HTMLDivElement>(null);
  const { address } = useAuth();

  useEffect(() => {
    initMuted();
    setSoundOff(isMuted());
    setBestScore(getBestScore(gridSize));
    setGameState(initGame(gridSize));
  }, [gridSize]);

  const toggleMute = useCallback(() => {
    const next = !soundOff;
    setSoundOff(next);
    setMuted(next);
  }, [soundOff]);

  const handleMove = useCallback(
    (direction: Direction) => {
      if (!gameState || gameState.gameOver) return;
      if (showWinOverlay) return;

      setGameState((prev) => {
        if (!prev) return prev;
        const next = move(prev, direction);
        if (next.moved) {
          if (next.mergedMax > 0) {
            playMerge(next.mergedMax);
          } else {
            playSwipe();
          }

          saveBestScore(next.score, gridSize);
          setBestScore((b) => Math.max(b, next.score));

          if (next.won && !winDismissed) {
            setShowWinOverlay(true);
            setTimeout(playWin, 150);
          }
          if (next.gameOver) {
            setTimeout(playGameOver, 200);
          }
        }
        return next;
      });
    },
    [gameState, showWinOverlay, winDismissed, gridSize]
  );

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") {
        onBack();
        return;
      }
      const keyMap: Record<string, Direction> = {
        ArrowUp: "up",
        ArrowDown: "down",
        ArrowLeft: "left",
        ArrowRight: "right",
        w: "up",
        s: "down",
        a: "left",
        d: "right",
      };

      const direction = keyMap[e.key];
      if (direction) {
        e.preventDefault();
        handleMove(direction);
      }
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleMove, onBack]);

  const { onTouchStart, onTouchEnd } = useSwipe(handleMove);

  useEffect(() => {
    const el = gameRef.current;
    if (!el) return;

    const opts = { passive: false } as AddEventListenerOptions;

    function preventScroll(e: TouchEvent) {
      e.preventDefault();
    }

    el.addEventListener("touchmove", preventScroll, opts);
    el.addEventListener("touchstart", onTouchStart as EventListener, opts);
    el.addEventListener("touchend", onTouchEnd as EventListener, opts);

    return () => {
      el.removeEventListener("touchmove", preventScroll);
      el.removeEventListener("touchstart", onTouchStart as EventListener);
      el.removeEventListener("touchend", onTouchEnd as EventListener);
    };
  }, [onTouchStart, onTouchEnd]);

  const handleRestart = useCallback(() => {
    setShowWinOverlay(false);
    setWinDismissed(false);
    setGameState(initGame(gridSize));
  }, [gridSize]);

  const handleContinue = useCallback(() => {
    setShowWinOverlay(false);
    setWinDismissed(true);
  }, []);

  const handleBack = useCallback(() => {
    onBack();
  }, [onBack]);

  if (!gameState) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-2 border-base-blue border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center gap-3 sm:gap-4 w-full px-4 animate-fade-in">
      <div className="flex items-center justify-between w-full max-w-[360px] sm:max-w-[420px] mx-auto">
        <button
          onClick={handleBack}
          className="flex items-center gap-1.5 px-3 py-2 glass-card rounded-xl
            text-[#1a1a2e] text-sm font-semibold
            hover:bg-white/80 active:scale-95 transition-all
            shadow-[0_2px_12px_rgba(0,0,0,0.06)]"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
          Menu
        </button>

        <div className="text-center">
          <h1 className="text-3xl sm:text-4xl font-black text-[#1a1a2e] tracking-tight">
            2048
          </h1>
          <span className="text-[10px] font-bold text-[#8b8fa3] uppercase tracking-widest">
            {MODE_LABELS[gridSize]}
          </span>
        </div>

        <div className="flex items-center gap-1.5">
          <button
            onClick={toggleMute}
            className="p-2 glass-card text-[#1a1a2e] rounded-xl
              hover:bg-white/80 active:scale-95 transition-all
              shadow-[0_2px_12px_rgba(0,0,0,0.06)]"
            title={soundOff ? "Unmute" : "Mute"}
          >
            {soundOff ? (
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round"
                  d="M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M17 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2" />
              </svg>
            ) : (
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round"
                  d="M15.536 8.464a5 5 0 010 7.072M18.364 5.636a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
              </svg>
            )}
          </button>
          <button
            onClick={handleRestart}
            className="p-2 glass-card text-[#1a1a2e] rounded-xl
              hover:bg-white/80 active:scale-95 transition-all
              shadow-[0_2px_12px_rgba(0,0,0,0.06)]"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round"
                d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182M20.98 14.153v4.992" />
            </svg>
          </button>
        </div>
      </div>

      <ScoreBoard score={gameState.score} bestScore={bestScore} gridSize={gridSize} />

      <div ref={gameRef} className="relative touch-none select-none w-full">
        <Board tiles={gameState.tiles} size={gridSize} />

        {gameState.gameOver && (
          <div className={`absolute inset-0 flex items-center justify-center
            ${gridSize === 3 ? "max-w-[280px] sm:max-w-[320px]" : gridSize === 5 ? "max-w-[360px] sm:max-w-[420px]" : "max-w-[340px] sm:max-w-[400px]"}
            mx-auto`}
          >
            <GameOverlay
              type="lost"
              score={gameState.score}
              onRestart={handleRestart}
              onBackToMenu={handleBack}
              walletConnected={!!address}
            />
          </div>
        )}

        {showWinOverlay && (
          <div className={`absolute inset-0 flex items-center justify-center
            ${gridSize === 3 ? "max-w-[280px] sm:max-w-[320px]" : gridSize === 5 ? "max-w-[360px] sm:max-w-[420px]" : "max-w-[340px] sm:max-w-[400px]"}
            mx-auto`}
          >
            <GameOverlay
              type="won"
              score={gameState.score}
              onRestart={handleRestart}
              onContinue={handleContinue}
              onBackToMenu={handleBack}
              walletConnected={!!address}
            />
          </div>
        )}
      </div>

      <p className="text-[#a0a4b8] text-xs text-center max-w-[280px]">
        {address
          ? "Your score will be saved to the leaderboard"
          : "Log in to save scores to leaderboard"}
      </p>
    </div>
  );
}
