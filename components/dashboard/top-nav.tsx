'use client'

import { LogOut, Wallet as WalletIcon, ArrowRight, RefreshCw } from 'lucide-react'
import { useWalletModal } from '@solana/wallet-adapter-react-ui'
import { useWallet } from '@solana/wallet-adapter-react'
import { Button } from '@/components/ui/button'

export function TopNav({ onRefresh, isSyncing }) {
  const { setVisible } = useWalletModal()
  const { connected, publicKey, disconnect } = useWallet()

  return (
    <div className="sticky top-0 z-50 w-full border-b border-white/10 bg-background/60 backdrop-blur-xl supports-backdrop-filter:bg-background/60">
      <div className="flex items-center justify-between px-4 py-3 sm:px-6 sm:py-4">
        <div className="flex items-center gap-2 sm:gap-3 min-w-0">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-primary">
            <span className="text-sm font-bold text-primary-foreground">D</span>
          </div>
          <span className="hidden font-mono text-sm font-bold text-foreground sm:inline-block md:text-base">
            DERIVERSE.SCAN
          </span>
        </div>

        <div className="flex items-center gap-2 sm:gap-3">
          {connected && publicKey ? (
            <>
              {/* Sync Button: Triggers the onRefresh logic passed from page.tsx */}
              <Button
                variant="outline"
                size="sm"
                onClick={onRefresh}
                disabled={isSyncing}
                className="cursor-pointer gap-2 border-border bg-muted/30 hover:bg-muted/50 text-foreground"
              >
                <RefreshCw 
                  className={`h-4 w-4 ${isSyncing ? 'animate-spin' : ''}`} 
                />
                <span className="hidden sm:inline">
                  {isSyncing ? 'Syncing...' : 'Sync Logs'}
                </span>
              </Button>

              <div className="hidden items-center gap-2 rounded-lg border border-border bg-muted/30 px-3 py-2 hover:bg-muted/50 transition-colors sm:flex">
                <div className="h-2 w-2 shrink-0 rounded-full bg-emerald-500 shadow-lg shadow-emerald-500/50" />
                <span className="font-mono text-xs text-foreground sm:text-sm">
                  {publicKey.toString().slice(0, 4)}...{publicKey.toString().slice(-4)}
                </span>
              </div>
              
              <button
                onClick={() => disconnect()}
                className="cursor-pointer rounded-lg p-2 text-muted-foreground hover:bg-muted/50 hover:text-foreground transition-colors"
              >
                <LogOut className="h-4 w-4" />
              </button>
            </>
          ) : (
            <Button
              onClick={() => setVisible(true)}
              className="cursor-pointer py-5 gap-1 bg-primary text-primary-foreground font-semibold shadow-lg shadow-primary/20 transition-all duration-200 hover:bg-primary/90 hover:shadow-primary/40 sm:gap-2"
              size="sm"
            >
              <WalletIcon className="h-5 w-4" />
              <span className="hidden sm:inline font-extrabold">Connect Wallet</span>
              <span className="sm:hidden">Connect</span>
              <ArrowRight className="hidden h-4 w-4 opacity-60 sm:inline" />
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}