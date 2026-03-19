import type { GridSize } from "./game";

export interface LeaderboardEntry {
  address: string;
  score: number;
  mode: GridSize;
  timestamp: number;
}

const STORAGE_KEY = "2048-leaderboard";
const MAX_ENTRIES_PER_MODE = 50;

function loadAll(): LeaderboardEntry[] {
  if (typeof window === "undefined") return [];
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
  } catch {
    return [];
  }
}

function saveAll(entries: LeaderboardEntry[]): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
}

export function submitScore(address: string, score: number, mode: GridSize): void {
  const all = loadAll();

  const existing = all.find(
    (e) => e.address.toLowerCase() === address.toLowerCase() && e.mode === mode
  );

  if (existing) {
    if (score > existing.score) {
      existing.score = score;
      existing.timestamp = Date.now();
    } else {
      return;
    }
  } else {
    all.push({ address, score, mode, timestamp: Date.now() });
  }

  const byMode = new Map<GridSize, LeaderboardEntry[]>();
  for (const entry of all) {
    const list = byMode.get(entry.mode) || [];
    list.push(entry);
    byMode.set(entry.mode, list);
  }

  const trimmed: LeaderboardEntry[] = [];
  for (const [, list] of byMode) {
    list.sort((a, b) => b.score - a.score);
    trimmed.push(...list.slice(0, MAX_ENTRIES_PER_MODE));
  }

  saveAll(trimmed);
}

export function getLeaderboard(mode: GridSize): LeaderboardEntry[] {
  return loadAll()
    .filter((e) => e.mode === mode)
    .sort((a, b) => b.score - a.score);
}

export function getTopScore(address: string, mode: GridSize): number {
  const entry = loadAll().find(
    (e) => e.address.toLowerCase() === address.toLowerCase() && e.mode === mode
  );
  return entry?.score ?? 0;
}
