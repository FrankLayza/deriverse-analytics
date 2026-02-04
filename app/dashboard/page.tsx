'use client';

import React from 'react';
import Link from 'next/link';

export default function DashboardPage() {
  return (
    <main className="min-h-screen bg-zinc-950 text-zinc-50 flex items-center justify-center">
      <div className="space-y-4 text-center">
        <h1 className="text-2xl font-semibold">Deriverse Dashboard</h1>
        <p className="text-zinc-400">
          Dashboard UI coming soon. For now, connect your wallet on the home page.
        </p>
        <Link href="/" className="underline text-zinc-300">
          Go to wallet connect
        </Link>
      </div>
    </main>
  );
}

