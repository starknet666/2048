"use client";

import { usePrivy } from "@privy-io/react-auth";

interface AuthState {
  ready: boolean;
  authenticated: boolean;
  address: string | undefined;
  login: () => void;
  logout: () => Promise<void>;
}

const NOOP_AUTH: AuthState = {
  ready: true,
  authenticated: false,
  address: undefined,
  login: () => {},
  logout: async () => {},
};

export function useAuth(): AuthState {
  try {
    const { ready, authenticated, login, logout, user } = usePrivy();
    return {
      ready,
      authenticated,
      address: user?.wallet?.address,
      login,
      logout,
    };
  } catch {
    return NOOP_AUTH;
  }
}
