"use client";

import { WalletProvider, ConnectionProvider } from '@solana/wallet-adapter-react';
import { WalletModalProvider } from '@solana/wallet-adapter-react-ui';
import "@solana/wallet-adapter-react-ui/styles.css";
import { useMemo } from 'react';


export function Providers({ children }: { children: React.ReactNode }) {
    const ENDPOINT_URL = process.env.NEXT_PUBLIC_DERIVERSE_ENDPOINT || "https://api.devnet.solana.com";
    const endpoint = useMemo(() => ENDPOINT_URL, [ENDPOINT_URL]);
    const wallets = useMemo(() => [], []);
    return (
        <ConnectionProvider endpoint={endpoint}>
            <WalletProvider wallets={wallets} autoConnect>
                <WalletModalProvider>{children}</WalletModalProvider>
            </WalletProvider>
        </ConnectionProvider>
    );
}