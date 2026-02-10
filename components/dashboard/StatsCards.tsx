import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowUpRight, Wallet, Activity, CreditCard } from "lucide-react";

export default function StatsCards({ aggregates }: { aggregates: any[] }) {
  const totalVolume = aggregates.reduce((acc, curr) => acc + Number(curr.total_volume), 0);
  const totalFees = aggregates.reduce((acc, curr) => acc + Number(curr.total_fees), 0);
  const totalTrades = aggregates.reduce((acc, curr) => acc + Number(curr.trade_count), 0);

  const stats = [
    { title: "Total Volume", value: `$${totalVolume.toLocaleString()}`, icon: Activity },
    { title: "Cumulative Fees", value: `$${totalFees.toFixed(4)}`, icon: CreditCard },
    { title: "Trade Count", value: totalTrades, icon: ArrowUpRight },
  ];

  return (
    <div className="grid gap-4 md:grid-cols-3">
      {stats.map((stat) => (
        <Card key={stat.title}>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">{stat.title}</CardTitle>
            <stat.icon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stat.value}</div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}