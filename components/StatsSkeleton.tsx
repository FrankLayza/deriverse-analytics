import { Skeleton } from "@/components/ui/skeleton";

export default function StatsSkeleton() {
  return (
    <div className="min-h-screen bg-background space-y-6 px-6 py-6">
      {/* HERO METRICS - 4 Cards */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className="rounded-lg border border-border bg-card p-4 space-y-3"
          >
            {/* Header with icon */}
            <div className="flex items-center justify-between">
              <Skeleton className="h-4 w-24 bg-muted/50" />
              <Skeleton className="h-4 w-4 rounded-full bg-muted/50" />
            </div>
            {/* Main metric */}
            <Skeleton className="h-8 w-32 bg-muted/50" />
            {/* Subtext */}
            <Skeleton className="h-3 w-20 bg-muted/50" />
          </div>
        ))}
      </div>

      <div className="border-t border-border" />

      {/* PERFORMANCE CHARTS SECTION */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Main Chart - 2/3 width */}
        <div className="lg:col-span-2 rounded-lg border border-border bg-card p-4 space-y-4">
          <div className="flex items-center justify-between">
            <Skeleton className="h-4 w-32 bg-muted/50" />
            <div className="flex gap-2">
              {[1, 2, 3, 4].map((i) => (
                <Skeleton key={i} className="h-7 w-12 bg-muted/50 rounded" />
              ))}
            </div>
          </div>
          <Skeleton className="h-64 w-full bg-muted/50 rounded" />
        </div>

        {/* Risk & Averages Card - 1/3 width */}
        <div className="rounded-lg border border-border bg-card p-4 space-y-3">
          <Skeleton className="h-4 w-32 bg-muted/50" />
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="border-b border-border pb-3">
              <Skeleton className="h-3 w-24 mb-2 bg-muted/50" />
              <Skeleton className="h-5 w-28 bg-muted/50" />
            </div>
          ))}
        </div>
      </div>

      <div className="border-t border-border" />

      {/* TRADE JOURNAL TABLE */}
      <div className="rounded-lg border border-border bg-card p-4 space-y-4">
        <Skeleton className="h-4 w-40 bg-muted/50" />

        {/* Table Header Skeleton */}
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border">
                {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((i) => (
                  <th key={i} className="px-4 py-3">
                    <Skeleton className="h-3 w-16 bg-muted/50" />
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((row) => (
                <tr key={row} className="border-b border-border">
                  {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((col) => (
                    <td key={col} className="px-4 py-3">
                      <Skeleton className="h-4 w-20 bg-muted/50" />
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination Skeleton */}
        <div className="flex items-center justify-between gap-4 border-t border-border pt-4">
          <Skeleton className="h-4 w-48 bg-muted/50" />
          <div className="flex gap-2">
            <Skeleton className="h-8 w-20 bg-muted/50 rounded" />
            <Skeleton className="h-8 w-20 bg-muted/50 rounded" />
          </div>
        </div>
      </div>

      <div className="border-t border-border" />

      {/* BREAKDOWN CHARTS - Fee Composition & Session Performance */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {[1, 2].map((i) => (
          <div
            key={i}
            className="rounded-lg border border-border bg-card p-4 space-y-4"
          >
            <Skeleton className="h-4 w-40 bg-muted/50" />
            <Skeleton className="h-56 w-full bg-muted/50 rounded" />
          </div>
        ))}
      </div>
    </div>
  );
}
