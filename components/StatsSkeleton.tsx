import { Card, CardContent, CardHeader } from "@/components/ui/card";

export default function StatsSkeleton() {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {[1, 2, 3, 4].map((i) => (
        <Card key={i} className="bg-zinc-900 border-zinc-800">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            {/* Title Placeholder */}
            <div className="h-4 w-24 bg-zinc-800 rounded animate-pulse" />
            {/* Icon Placeholder */}
            <div className="h-4 w-4 bg-zinc-800 rounded-full animate-pulse" />
          </CardHeader>
          <CardContent>
            {/* Large Metric Placeholder */}
            <div className="h-8 w-32 bg-zinc-800 rounded animate-pulse mb-2" />
            {/* Subtext Placeholder */}
            <div className="h-3 w-20 bg-zinc-800 rounded animate-pulse" />
          </CardContent>
        </Card>
      ))}
    </div>
  );
}