"use client";

import { useAuth } from "@/hooks/useAuth";

function truncateAddress(address: string): string {
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}

export default function WalletConnect() {
  const { ready, authenticated, address, login, logout } = useAuth();

  if (!ready) return null;

  if (authenticated && address) {
    return (
      <button
        onClick={() => logout()}
        className="flex items-center gap-2 px-3 py-1.5 glass-card
          text-[#1a1a2e] text-xs font-semibold rounded-full
          hover:bg-white/80 active:scale-95 transition-all
          shadow-[0_2px_12px_rgba(0,0,0,0.06)]"
      >
        <span className="w-2 h-2 rounded-full bg-emerald-400 shadow-sm shadow-emerald-400/50" />
        {truncateAddress(address)}
      </button>
    );
  }

  return (
    <button
      onClick={login}
      className="flex items-center gap-2 px-3.5 py-1.5 bg-base-blue
        text-white text-xs font-bold rounded-full
        shadow-md shadow-blue-500/25
        hover:shadow-lg hover:shadow-blue-500/30
        active:scale-95 transition-all"
    >
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M15 3h4a2 2 0 012 2v14a2 2 0 01-2 2h-4" />
        <polyline points="10 17 15 12 10 7" />
        <line x1="15" y1="12" x2="3" y2="12" />
      </svg>
      Log In
    </button>
  );
}
