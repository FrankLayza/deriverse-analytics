'use client'

import { useEffect, useRef, useCallback } from 'react'
import { useWallet } from '@solana/wallet-adapter-react'

// Default: 10 minutes
const DEFAULT_TIMEOUT = 10 * 60 * 1000 

export function useWalletTimeout(timeoutMs: number = DEFAULT_TIMEOUT, onTimeout?: () => void) {
  const { connected, disconnect } = useWallet()
  const timerRef = useRef<NodeJS.Timeout | null>(null)

  const handleLogout = useCallback(async () => {
    if (connected) {
      console.log('⏳ Session expired due to inactivity.')
      
      // 1. Notify the parent component BEFORE disconnecting
      if (onTimeout) {
        onTimeout()
      }
      
      // 2. Disconnect
      try {
        await disconnect()
      } catch (error) {
        console.error("Failed to disconnect wallet:", error)
      }
    }
  }, [connected, disconnect, onTimeout])

  const resetTimer = useCallback(() => {
    if (!connected) return
    if (timerRef.current) clearTimeout(timerRef.current)
    timerRef.current = setTimeout(handleLogout, timeoutMs)
  }, [connected, handleLogout, timeoutMs])

  useEffect(() => {
    if (!connected) return

    const events = ['mousedown', 'mousemove', 'keydown', 'scroll', 'touchstart', 'click']
    
    resetTimer()
    events.forEach(event => document.addEventListener(event, resetTimer))

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current)
      events.forEach(event => document.removeEventListener(event, resetTimer))
    }
  }, [connected, resetTimer])
}