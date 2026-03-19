import type { GridSize } from "./game";

export interface LeaderboardEntry {
  address: string;
  score: number;
  rank: number;
}

export async function fetchLeaderboard(mode: GridSize): Promise<LeaderboardEntry[]> {
  try {
    const res = await fetch(`/api/leaderboard?mode=${mode}`);
    if (!res.ok) return [];
    const data = await res.json();
    return data.entries || [];
  } catch {
    return [];
  }
}

export async function submitScore(
  address: string,
  score: number,
  mode: GridSize
): Promise<{ updated: boolean; bestScore: number; rank: number | null } | null> {
  try {
    const res = await fetch("/api/leaderboard", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ address, score, mode }),
    });
    if (!res.ok) return null;
    return await res.json();
  } catch {
    return null;
  }
}
