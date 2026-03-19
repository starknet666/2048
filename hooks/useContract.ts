"use client";

import { useCallback, useState } from "react";
import { createPublicClient, createWalletClient, custom, http, decodeEventLog } from "viem";
import { base } from "viem/chains";
let useWallets: () => { wallets: Array<{ address: string; switchChain: (id: number) => Promise<void>; getEthereumProvider: () => Promise<unknown> }> };
try {
  useWallets = require("@privy-io/react-auth").useWallets;
} catch {
  useWallets = () => ({ wallets: [] });
}
import { GAME_CONTRACT_ADDRESS, GAME_CONTRACT_ABI } from "@/lib/contract";
import type { GridSize } from "@/lib/game";

const publicClient = createPublicClient({
  chain: base,
  transport: http("https://mainnet.base.org"),
});

export function useContract() {
  const { wallets } = useWallets();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const getWalletClient = useCallback(async () => {
    const wallet = wallets[0];
    if (!wallet) throw new Error("No wallet connected");
    await wallet.switchChain(8453);
    const provider = await wallet.getEthereumProvider();
    return createWalletClient({
      chain: base,
      transport: custom(provider as Parameters<typeof custom>[0]),
      account: wallet.address as `0x${string}`,
    });
  }, [wallets]);

  const startGame = useCallback(
    async (gridSize: GridSize): Promise<{ success: boolean; nftMinted: boolean; tokenId?: string }> => {
      setLoading(true);
      setError(null);
      try {
        const client = await getWalletClient();
        const hash = await client.writeContract({
          address: GAME_CONTRACT_ADDRESS,
          abi: GAME_CONTRACT_ABI,
          functionName: "startGame",
          args: [gridSize],
        });
        const receipt = await publicClient.waitForTransactionReceipt({ hash });

        let nftMinted = false;
        let tokenId: string | undefined;
        for (const log of receipt.logs) {
          try {
            const event = decodeEventLog({
              abi: GAME_CONTRACT_ABI,
              data: log.data,
              topics: log.topics,
            });
            if (event.eventName === "EarlyAdopterMinted") {
              nftMinted = true;
              tokenId = String((event.args as unknown as { tokenId: bigint }).tokenId);
            }
          } catch {
            /* skip non-matching logs */
          }
        }

        return { success: true, nftMinted, tokenId };
      } catch (e: unknown) {
        const msg = e instanceof Error ? e.message : "Transaction failed";
        if (msg.includes("User rejected") || msg.includes("denied")) {
          setError(null);
        } else {
          setError(msg.length > 80 ? msg.slice(0, 80) + "..." : msg);
        }
        return { success: false, nftMinted: false };
      } finally {
        setLoading(false);
      }
    },
    [getWalletClient]
  );

  const gm = useCallback(async (): Promise<boolean> => {
    setLoading(true);
    setError(null);
    try {
      const client = await getWalletClient();
      const hash = await client.writeContract({
        address: GAME_CONTRACT_ADDRESS,
        abi: GAME_CONTRACT_ABI,
        functionName: "gm",
        args: [],
      });
      await publicClient.waitForTransactionReceipt({ hash });
      return true;
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : "Transaction failed";
      if (msg.includes("User rejected") || msg.includes("denied")) {
        setError(null);
      } else if (msg.includes("Already gm today")) {
        setError("Already checked in today!");
      } else {
        setError(msg.length > 80 ? msg.slice(0, 80) + "..." : msg);
      }
      return false;
    } finally {
      setLoading(false);
    }
  }, [getWalletClient]);

  const canGm = useCallback(
    async (address: string): Promise<boolean> => {
      try {
        const result = await publicClient.readContract({
          address: GAME_CONTRACT_ADDRESS,
          abi: GAME_CONTRACT_ABI,
          functionName: "canGm",
          args: [address as `0x${string}`],
        });
        return result as boolean;
      } catch {
        return false;
      }
    },
    []
  );

  const getPlayerStats = useCallback(
    async (address: string) => {
      try {
        const result = await publicClient.readContract({
          address: GAME_CONTRACT_ADDRESS,
          abi: GAME_CONTRACT_ABI,
          functionName: "getPlayerStats",
          args: [address as `0x${string}`],
        });
        const [games, streak, gms, hasNFT] = result as [number, number, number, boolean];
        return { games: Number(games), streak: Number(streak), gms: Number(gms), hasNFT };
      } catch {
        return null;
      }
    },
    []
  );

  return { startGame, gm, canGm, getPlayerStats, loading, error };
}
