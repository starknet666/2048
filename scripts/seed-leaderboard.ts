const { Redis } = require("@upstash/redis");

const redis = new Redis({
  url: "https://together-stork-77911.upstash.io",
  token: "gQAAAAAAATBXAAIncDJjOTg2YzY5YmI1YjM0NjM3YTVjZWM5NWMxYWMwMTc4MXAyNzc5MTE",
});

function randomAddr(): string {
  const hex = "0123456789abcdef";
  let addr = "0x";
  for (let i = 0; i < 40; i++) addr += hex[Math.floor(Math.random() * 16)];
  return addr;
}

async function seed() {
  const modes = [3, 4, 5];
  const scoreRanges: Record<number, [number, number]> = {
    3: [200, 4800],
    4: [500, 28000],
    5: [800, 52000],
  };

  const wallets = Array.from({ length: 45 }, () => randomAddr());

  for (const mode of modes) {
    const [min, max] = scoreRanges[mode];
    const entries: { score: number; member: string }[] = [];

    for (const addr of wallets) {
      const score = Math.floor(min + Math.random() * (max - min));
      entries.push({ score, member: addr });
    }

    await redis.zadd(`lb:${mode}`, ...entries);
    console.log(`Mode ${mode}x${mode}: added ${entries.length} entries`);
  }

  console.log("Done!");
}

seed().catch(console.error);
