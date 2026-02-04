import { useEffect, useState } from 'react';
import { PublicKey } from '@solana/web3.js';
import { connection } from '@/app/lib/solana';

export function useAccountBalance(userPublicKey: string | null) {
  const [balance, setBalance] = useState<number>(0);

  useEffect(() => {
    if (!userPublicKey) return;

    const fetchBalance = async () => {
      try {
        const pubkey = new PublicKey(userPublicKey);
        const lamports = await connection.getBalance(pubkey);
        // Convert lamports to SOL
        setBalance(lamports / 1_000_000_000);
      } catch (error) {
        console.error('Failed to fetch balance:', error);
      }
    };

    fetchBalance();
  }, [userPublicKey]);

  return balance;
}

