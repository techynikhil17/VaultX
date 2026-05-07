"use client";
import { createContext, useContext, useState, useCallback, useEffect, ReactNode } from "react";
import {
  deriveVaultKey,
  getOrCreateSalt,
  loadVerifier,
  storeVerifier,
  makeVerifier,
  checkVerifier,
} from "./crypto";

interface VaultCtx {
  key: CryptoKey | null;
  unlocked: boolean;
  unlock: (masterPassword: string) => Promise<boolean>;
  lock: () => void;
  userId: string | null;
  setUserId: (id: string | null) => void;
}

const Ctx = createContext<VaultCtx | null>(null);

export function VaultProvider({ children }: { children: ReactNode }) {
  const [key, setKey] = useState<CryptoKey | null>(null);
  const [userId, setUserId] = useState<string | null>(null);

  const lock = useCallback(() => setKey(null), []);

  const unlock = useCallback(
    async (masterPassword: string) => {
      if (!userId) return false;
      const salt = getOrCreateSalt(userId);
      const derived = await deriveVaultKey(masterPassword, salt);
      const existing = loadVerifier(userId);
      if (existing) {
        const ok = await checkVerifier(derived, existing);
        if (!ok) return false;
      } else {
        const v = await makeVerifier(derived);
        storeVerifier(userId, v);
      }
      setKey(derived);
      return true;
    },
    [userId]
  );

  // Auto-lock on tab close.
  useEffect(() => {
    const handler = () => setKey(null);
    window.addEventListener("beforeunload", handler);
    return () => window.removeEventListener("beforeunload", handler);
  }, []);

  return (
    <Ctx.Provider value={{ key, unlocked: !!key, unlock, lock, userId, setUserId }}>
      {children}
    </Ctx.Provider>
  );
}

export function useVault() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useVault outside VaultProvider");
  return ctx;
}
