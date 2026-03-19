import { NextRequest, NextResponse } from "next/server";
import { getRedis } from "@/lib/redis";

export const dynamic = "force-dynamic";

function leaderboardKey(mode: number) {
  return `lb:${mode}`;
}

export async function GET(req: NextRequest) {
  const mode = req.nextUrl.searchParams.get("mode");
  if (!mode || !["3", "4", "5"].includes(mode)) {
    return NextResponse.json({ error: "Invalid mode" }, { status: 400 });
  }

  const key = leaderboardKey(Number(mode));
  const redis = getRedis();
  const raw = await redis.zrange(key, 0, 49, { rev: true, withScores: true });

  const entries: { address: string; score: number; rank: number }[] = [];
  for (let i = 0; i < raw.length; i += 2) {
    entries.push({
      address: raw[i] as string,
      score: Number(raw[i + 1]),
      rank: entries.length + 1,
    });
  }

  return NextResponse.json({ entries });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { address, score, mode } = body;

    if (!address || typeof address !== "string" || !address.startsWith("0x")) {
      return NextResponse.json({ error: "Invalid address" }, { status: 400 });
    }
    if (!score || typeof score !== "number" || score <= 0) {
      return NextResponse.json({ error: "Invalid score" }, { status: 400 });
    }
    if (![3, 4, 5].includes(mode)) {
      return NextResponse.json({ error: "Invalid mode" }, { status: 400 });
    }

    const key = leaderboardKey(mode);
    const addr = address.toLowerCase();
    const redis = getRedis();

    const current = await redis.zscore(key, addr);
    if (current !== null && Number(current) >= score) {
      return NextResponse.json({ updated: false, bestScore: Number(current) });
    }

    await redis.zadd(key, { score, member: addr });

    const rank = await redis.zrevrank(key, addr);

    return NextResponse.json({
      updated: true,
      bestScore: score,
      rank: rank !== null ? rank + 1 : null,
    });
  } catch {
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
