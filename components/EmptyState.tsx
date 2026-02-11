import { LineChart, ExternalLink, Activity } from "lucide-react";

export default function EmptyState() {
  return (
    <div className="w-full bg-zinc-900/40 border border-zinc-800/50 rounded-3xl p-12 backdrop-blur-sm flex flex-col items-center justify-center text-center animate-in fade-in duration-500">
      <div className="relative mb-6">
        {/* Decorative Glow */}
        <div className="absolute inset-0 bg-indigo-500/20 blur-xl rounded-full" />
        <div className="relative bg-zinc-900 border border-zinc-800 p-5 rounded-2xl">
          <LineChart className="w-12 h-12 text-indigo-400" />
        </div>
      </div>
      
      <h3 className="text-2xl font-bold text-white mb-2">No Trading History Found</h3>
      <p className="text-zinc-400 max-w-md mx-auto mb-8">
        We couldn't find any spot or perpetual trades for this wallet. Start trading on Deriverse to generate your performance analytics and PnL tracking.
      </p>

      <div className="flex flex-col sm:flex-row gap-4">
        <a 
          href="https://deriverse.com" 
          target="_blank" 
          rel="noopener noreferrer"
          className="flex items-center gap-2 px-8 py-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-semibold transition-all shadow-lg shadow-indigo-500/20"
        >
          <Activity size={18} />
          Start Trading
          <ExternalLink size={16} className="ml-1 opacity-70" />
        </a>
      </div>
    </div>
  );
}