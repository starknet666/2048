"use client";

import { useCallback, useState } from "react";
import {
  createPublicClient,
  http,
  decodeEventLog,
  encodeFunctionData,
  type Hex,
} from "viem";
import { base } from "viem/chains";
import { Attribution } from "ox/erc8021";
import { useAuth } from "@/hooks/useAuth";
import { GAME_CONTRACT_ADDRESS, GAME_CONTRACT_ABI } from "@/lib/contract";
import type { GridSize } from "@/lib/game";

const DATA_SUFFIX = Attribution.toDataSuffix({ codes: ["bc_vdsgq9gw"] });
const PAYMASTER_URL =
  typeof window !== "undefined"
    ? `${window.location.origin}/api/paymaster`
    : "/api/paymaster";

const publicClient = createPublicClient({
  chain: base,
  transport: http("https://mainnet.base.org"),
});

type EthereumProvider = {
  request: (args: { method: string; params?: unknown[] }) => Promise<unknown>;
};

function getProvider(): EthereumProvider {
  const ethereum = typeof window !== "undefined"
    ? (window as unknown as { ethereum?: EthereumProvider }).ethereum
    : undefined;
  if (!ethereum) throw new Error("No wallet provider found");
  return ethereum;
}

function appendSuffix(data: Hex): Hex {
  return (data + DATA_SUFFIX.slice(2)) as Hex;
}

async function sendWithPaymaster(
  provider: EthereumProvider,
  from: string,
  to: string,
  data: Hex
): Promise<string> {
  try {
    const result = await provider.request({
      method: "wallet_sendCalls",
      params: [
        {
          version: "1",
          from,
          chainId: `0x${(8453).toString(16)}`,
          calls: [{ to, data }],
          capabilities: {
            paymasterService: {
              url: PAYMASTER_URL,
            },
          },
        },
      ],
    });
    const callId = result as string;

    for (let i = 0; i < 60; i++) {
      await new Promise((r) => setTimeout(r, 2000));
      try {
        const status = (await provider.request({
          method: "wallet_getCallsStatus",
          params: [callId],
        })) as { status: string; receipts?: Array<{ transactionHash: string }> };

        if (status.status === "CONFIRMED" && status.receipts?.[0]) {
          return status.receipts[0].transactionHash;
        }
      } catch {
        /* keep polling */
      }
    }
    throw new Error("Transaction timed out");
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : String(e);
    if (
      msg.includes("not supported") ||
      msg.includes("not found") ||
      msg.includes("does not support")
    ) {
      throw new Error("FALLBACK");
    }
    throw e;
  }
}

async function sendRegular(
  provider: EthereumProvider,
  from: string,
  to: string,
  data: Hex
): Promise<string> {
  const hash = await provider.request({
    method: "eth_sendTransaction",
    params: [{ from, to, data }],
  });
  return hash as string;
}

export function useContract() {
  const { address: authAddress } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const sendTx = useCallback(
    async (data: Hex): Promise<string> => {
      if (!authAddress) throw new Error("Please connect your wallet first");
      const provider = getProvider();
      const calldata = appendSuffix(data);

      try {
        return await sendWithPaymaster(
          provider,
          authAddress,
          GAME_CONTRACT_ADDRESS,
          calldata
        );
      } catch (e: unknown) {
        const msg = e instanceof Error ? e.message : "";
        if (msg === "FALLBACK") {
          return await sendRegular(
            provider,
            authAddress,
            GAME_CONTRACT_ADDRESS,
            calldata
          );
        }
        throw e;
      }
    },
    [authAddress]
  );

  const startGame = useCallback(
    async (
      gridSize: GridSize
    ): Promise<{ success: boolean; nftMinted: boolean; tokenId?: string }> => {
      setLoading(true);
      setError(null);
      try {
        const data = encodeFunctionData({
          abi: GAME_CONTRACT_ABI,
          functionName: "startGame",
          args: [gridSize],
        });

        const hash = await sendTx(data);
        const receipt = await publicClient.waitForTransactionReceipt({
          hash: hash as `0x${string}`,
        });

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
              tokenId = String(
                (event.args as unknown as { tokenId: bigint }).tokenId
              );
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
    [sendTx]
  );

  const gm = useCallback(async (): Promise<boolean> => {
    setLoading(true);
    setError(null);
    try {
      const data = encodeFunctionData({
        abi: GAME_CONTRACT_ABI,
        functionName: "gm",
        args: [],
      });

      const hash = await sendTx(data);
      await publicClient.waitForTransactionReceipt({
        hash: hash as `0x${string}`,
      });
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
  }, [sendTx]);

  const canGm = useCallback(async (address: string): Promise<boolean> => {
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
  }, []);

  const getPlayerStats = useCallback(async (address: string) => {
    try {
      const result = await publicClient.readContract({
        address: GAME_CONTRACT_ADDRESS,
        abi: GAME_CONTRACT_ABI,
        functionName: "getPlayerStats",
        args: [address as `0x${string}`],
      });
      const [games, streak, gms, hasNFT] = result as [number, number, number, boolean];
      return {
        games: Number(games),
        streak: Number(streak),
        gms: Number(gms),
        hasNFT,
      };
    } catch {
      return null;
    }
  }, []);

  return { startGame, gm, canGm, getPlayerStats, loading, error };
}
