"use client";

import { useEffect, useRef, useCallback } from "react";
import { useWallet } from "@solana/wallet-adapter-react";
import { useWalletModal } from "@solana/wallet-adapter-react-ui";
import { toast } from "sonner"; // Optional: If you use a toast library

// Default to 15 minutes (900,000 ms)
const DEFAULT_TIMEOUT = 15 * 60 * 1000;

export function useWalletTimeout(timeoutMs: number = DEFAULT_TIMEOUT) {
  const { connected, disconnect } = useWallet();
  const { setVisible } = useWalletModal();
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const handleLogout = useCallback(async () => {
    if (connected) {
      console.log("⏳ Session expired due to inactivity.");

      try {
        await disconnect();
        toast.warning("Session expired", {
          description: "You have been disconnected due to inactivity.",
          duration: Infinity,
          action: {
            label: "Reconnect",
            onClick: () => {
              setVisible(true);
            },
          },
        });
      } catch (error) {
        console.error("Failed to disconnect wallet:", error);
      }
    }
  }, [connected, disconnect]);

 const resetTimer = useCallback(() => {
    if (timerRef.current) clearTimeout(timerRef.current)
    if (connected) timerRef.current = setTimeout(handleLogout, timeoutMs)
  }, [connected, handleLogout, timeoutMs])

  useEffect(() => {
    const events = ['mousedown', 'keydown', 'scroll', 'touchstart', 'click']
    
    resetTimer()
    events.forEach(e => document.addEventListener(e, resetTimer))

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current)
      events.forEach(e => document.removeEventListener(e, resetTimer))
    }
  }, [connected, resetTimer])
}
