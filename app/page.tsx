'use client';

import React from 'react';
import { Wallet, LogOut } from 'lucide-react';
import {useWallet} from '@solana/wallet-adapter-react';
import {useWalletModal} from '@solana/wallet-adapter-react-ui';
// import { useAccountBalance } from '@/hooks/useDeriverse';
import "@solana/wallet-adapter-react-ui/styles.css";

// Helper function to shorten wallet address
function shortenAddress(address: string, chars = 4): string {
  return `${address.slice(0, chars)}...${address.slice(-chars)}`;
}

export default function Home() {
  const {connected, publicKey, disconnect} = useWallet();
  // const balance = useAccountBalance(publicKey?.toString() || null);
  const {setVisible} = useWalletModal();

  const handleConnectWallet = () => {
    if(!connected) {
      setVisible(true);
    }
  };

  const handleDisconnect = async () => {
    try {
      await disconnect();
    } catch (error) {
      console.error('Error disconnecting wallet:', error);
    }
  };

  return (
    <div className="min-h-screen bg-zinc-950 flex items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        {connected && publicKey ? (
          <>
            <div className="flex flex-col items-center gap-2">
              <button
                onClick={handleConnectWallet}
                className="cursor-pointer flex items-center gap-3 px-6 py-3 bg-zinc-800 hover:bg-zinc-700 text-zinc-50 rounded-lg transition-colors border border-zinc-700"
              >
                <Wallet size={20} />
                <span>{shortenAddress(publicKey.toString())}</span>
              </button>
              <span className="text-zinc-400 text-sm">Balance: 0 SOL</span>
            </div>
            <button
              onClick={handleDisconnect}
              className="cursor-pointer flex items-center gap-2 px-4 py-2 bg-red-500/20 hover:bg-red-500/30 text-red-400 rounded-lg transition-colors border border-red-500/30"
            >
              <LogOut size={16} />
              <span>Disconnect</span>
            </button>
          </>
        ) : (
          <button
            onClick={handleConnectWallet}
            className="cursor-pointer flex items-center gap-3 px-6 py-3 bg-zinc-800 hover:bg-zinc-700 text-zinc-50 rounded-lg transition-colors border border-zinc-700"
          >
            <Wallet size={20} />
            <span>Connect Wallet</span>
          </button>
        )}
      </div>
    </div>
  );
}
