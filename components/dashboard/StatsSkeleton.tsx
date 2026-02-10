export default function StatsSkeleton() {
  return (
    <div className="grid gap-4 md:grid-cols-3">
      {[1, 2, 3].map((i) => (
        <div key={i} className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 h-28 animate-pulse">
          <div className="h-4 w-24 bg-zinc-800 rounded mb-4" />
          <div className="h-8 w-32 bg-zinc-800 rounded" />
        </div>
      ))}
    </div>
  );
}