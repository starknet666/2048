"use client";

interface GameOverlayProps {
  type: "won" | "lost";
  score: number;
  onRestart: () => void;
  onContinue?: () => void;
  onBackToMenu?: () => void;
  walletConnected?: boolean;
}

export default function GameOverlay({
  type,
  score,
  onRestart,
  onContinue,
  onBackToMenu,
  walletConnected,
}: GameOverlayProps) {
  const isWon = type === "won";

  return (
    <div className="absolute inset-0 z-20 flex items-center justify-center bg-white/60 backdrop-blur-md rounded-2xl sm:rounded-3xl animate-fade-in">
      <div className="text-center animate-slide-up px-6">
        <div className="text-5xl sm:text-6xl mb-3">
          {isWon ? "🎉" : "😔"}
        </div>
        <h2 className="text-2xl sm:text-3xl font-extrabold text-[#1a1a2e] mb-1">
          {isWon ? "You Win!" : "Game Over"}
        </h2>
        <p className="text-[#8b8fa3] text-sm mb-1">
          {isWon
            ? `Score: ${score.toLocaleString()}`
            : `Final score: ${score.toLocaleString()}`}
        </p>
        {walletConnected && (
          <p className="text-[10px] text-emerald-500 font-semibold mb-4">
            Score saved to leaderboard
          </p>
        )}
        {!walletConnected && (
          <p className="text-[10px] text-amber-500 font-semibold mb-4">
            Connect wallet to save score
          </p>
        )}
        <div className="flex flex-col gap-2.5">
          {isWon && onContinue && (
            <button
              onClick={onContinue}
              className="px-6 py-2.5 bg-base-blue text-white font-bold rounded-xl
                shadow-md shadow-blue-500/25
                hover:shadow-lg hover:shadow-blue-500/30
                active:scale-95 transition-all text-sm"
            >
              Continue Playing
            </button>
          )}
          <button
            onClick={onRestart}
            className={`px-6 py-2.5 font-bold rounded-xl transition-all text-sm active:scale-95
              ${isWon
                ? "bg-white/80 text-[#1a1a2e] border border-[#e0e4ec] hover:bg-white shadow-sm"
                : "bg-base-blue text-white shadow-md shadow-blue-500/25 hover:shadow-lg hover:shadow-blue-500/30"
              }`}
          >
            Play Again
          </button>
          {onBackToMenu && (
            <button
              onClick={onBackToMenu}
              className="px-6 py-2 text-[#8b8fa3] text-xs font-semibold
                hover:text-[#1a1a2e] transition-colors"
            >
              Back to Menu
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
