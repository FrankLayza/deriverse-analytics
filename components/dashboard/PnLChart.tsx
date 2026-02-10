"use client";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from "recharts";

export default function PnLChart({ data }: { data: any[] }) {
  // Transform data to cumulative PnL for the chart
  let cumulative = 0;
  const chartData = data.map((d) => {
    cumulative += Number(d.total_pnl);
    return {
      date: new Date(d.date).toLocaleDateString("en-US", { month: "short", day: "numeric" }),
      pnl: cumulative,
    };
  });

  return (
    <div className="h-75 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={chartData}>
          <defs>
            <linearGradient id="colorPnl" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
              <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#27272a" />
          <XAxis dataKey="date" stroke="#71717a" fontSize={12} />
          <YAxis stroke="#71717a" fontSize={12} tickFormatter={(val) => `$${val}`} />
          <Tooltip 
            contentStyle={{ backgroundColor: "#18181b", border: "1px solid #27272a" }}
            itemStyle={{ color: "#10b981" }}
          />
          <Area type="monotone" dataKey="pnl" stroke="#10b981" fillOpacity={1} fill="url(#colorPnl)" strokeWidth={2} />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}