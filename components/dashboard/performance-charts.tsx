"use client";

import { useState, useMemo } from "react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { Button } from "@/components/ui/button";
import { ChartContainer } from "@/components/ui/chart";
import {
  PnLTimeSeriesPoint,
  DrawdownData,
  RiskMetrics,
} from "@/lib/calculations";

interface PerformanceChartsProps {
  pnlSeries: PnLTimeSeriesPoint[];
  drawdown: DrawdownData;
  risk: RiskMetrics;
}

/**
 * Formats milliseconds into a readable duration (e.g., "1d 4h" or "4h 32m")
 */
function formatDuration(ms: number) {
  if (!ms || ms === 0) return "0m";
  const minutes = Math.floor(ms / (1000 * 60));
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (days > 0) return `${days}d ${hours % 24}h`;
  if (hours > 0) return `${hours}h ${minutes % 60}m`;
  return `${minutes}m`;
}

export function PerformanceCharts({
  pnlSeries,
  drawdown,
  risk,
}: PerformanceChartsProps) {
  const [timeframe, setTimeframe] = useState("All");

  // Combine PnL and Drawdown series, filter by timeframe, and format the X-Axis dates dynamically!
  const chartData = useMemo(() => {
    if (!pnlSeries || pnlSeries.length === 0) return [];

    const now = Date.now();
    let cutoff = 0;

    // 1. Determine the exact millisecond cutoff
    switch (timeframe) {
      case "1D":
        cutoff = now - 24 * 60 * 60 * 1000;
        break;
      case "1W":
        cutoff = now - 7 * 24 * 60 * 60 * 1000;
        break;
      case "1M":
        cutoff = now - 30 * 24 * 60 * 60 * 1000;
        break;
      case "All":
      default:
        cutoff = 0;
    }

    // 2. Filter out old trades
    const filteredData = pnlSeries
      .map((point, index) => ({
        rawTimestamp: point.timestamp, // Keep the raw number for accurate math
        pnl: point.cumulativePnL,
        drawdown: drawdown.drawdownSeries[index]?.drawdown || 0,
      }))
      .filter((item) => item.rawTimestamp >= cutoff);

    // 3. Format the X-Axis labels beautifully based on the timeframe
    return filteredData.map((item) => {
      const dateObj = new Date(item.rawTimestamp);

      // Short format for the X-Axis (Bottom of chart)
      let displayDate = "";
      if (timeframe === "1D") {
        displayDate = dateObj.toLocaleTimeString(undefined, {
          hour: "2-digit",
          minute: "2-digit",
        }); // "14:30"
      } else {
        displayDate = dateObj.toLocaleDateString(undefined, {
          month: "short",
          day: "numeric",
        }); // "Feb 11"
      }

      // Long format for the Hover Tooltip
      const fullDate = dateObj.toLocaleString(undefined, {
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      }); // "Feb 11, 2:30 PM"

      return {
        ...item,
        date: displayDate, // Used by XAxis
        fullDate: fullDate,
      };
    });
  }, [pnlSeries, drawdown, timeframe]);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 px-6 py-6">
      {/* PnL & Drawdown Chart - 2/3 width */}
      <div className="lg:col-span-2 rounded-lg border border-border bg-card p-4 flex flex-col">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-foreground">
            Historical PnL & Drawdown
          </h3>
          <div className="flex gap-2">
            {["1D", "1W", "1M", "All"].map((t) => (
              <Button
                key={t}
                size="sm"
                variant={timeframe === t ? "default" : "outline"}
                className={`cursor-pointer h-7 px-3 text-xs font-medium ${
                  timeframe === t
                    ? "bg-primary text-primary-foreground"
                    : "border-border bg-transparent text-muted-foreground hover:bg-muted hover:text-foreground"
                }`}
                onClick={() => setTimeframe(t)}
              >
                {t}
              </Button>
            ))}
          </div>
        </div>

        {/* 🚨 THE FIX: Conditional Rendering for Empty Data */}
        {chartData.length > 0 ? (
          <ChartContainer
            config={{
              pnl: {
                label: "PnL",
                color: "hsl(132, 63%, 47%)",
              },
              drawdown: {
                label: "Drawdown",
                color: "hsl(0, 83%, 53%)",
              },
            }}
            className="h-64 w-full mt-8"
          >
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart
                data={chartData}
                margin={{ top: 10, right: 20, left: 0, bottom: 0 }}
              >
                <defs>
                  <linearGradient id="colorPnl" x1="0" y1="0" x2="0" y2="1">
                    <stop
                      offset="5%"
                      stopColor="hsl(132, 63%, 47%)"
                      stopOpacity={0.3}
                    />
                    <stop
                      offset="95%"
                      stopColor="hsl(132, 63%, 47%)"
                      stopOpacity={0.01}
                    />
                  </linearGradient>
                  <linearGradient id="colorDrawdown" x1="0" y1="0" x2="0" y2="1">
                    <stop
                      offset="5%"
                      stopColor="hsl(0, 83%, 53%)"
                      stopOpacity={0.2}
                    />
                    <stop
                      offset="95%"
                      stopColor="hsl(0, 83%, 53%)"
                      stopOpacity={0.01}
                    />
                  </linearGradient>
                </defs>
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="hsl(var(--border))"
                  vertical={false}
                />
                <XAxis
                  dy={10}
                  dataKey="date"
                  stroke="hsl(var(--muted-foreground))"
                  style={{ fontSize: "11px" }}
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis
                  stroke="hsl(var(--muted-foreground))"
                  style={{ fontSize: "11px" }}
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(val) => `$${val.toLocaleString()}`}
                />
                <Tooltip
                  content={({ active, payload }) => {
                    if (active && payload?.length) {
                      return (
                        <div className="rounded border border-border bg-card p-2 shadow-lg">
                          <p className="mb-1 text-[10px] text-muted-foreground font-mono">
                            {payload[0].payload.fullDate}
                          </p>
                          {payload.map((entry, index) => (
                            <div
                              key={index}
                              className="font-mono text-xs flex justify-between gap-4"
                              style={{ color: entry.color }}
                            >
                              <span>{entry.name}:</span>
                              <span className="font-bold font-mono">
                                $
                                {entry.value?.toLocaleString(undefined, {
                                  minimumFractionDigits: 2,
                                })}
                              </span>
                            </div>
                          ))}
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="pnl"
                  stroke="hsl(132, 63%, 47%)"
                  fillOpacity={1}
                  fill="url(#colorPnl)"
                  name="PnL"
                  strokeWidth={2}
                />
                <Area
                  type="monotone"
                  dataKey="drawdown"
                  stroke="hsl(0, 83%, 53%)"
                  fillOpacity={1}
                  fill="url(#colorDrawdown)"
                  name="Drawdown"
                  strokeWidth={1}
                />
              </AreaChart>
            </ResponsiveContainer>
          </ChartContainer>
        ) : (
          /* 🚨 Fallback State */
          <div className="mt-8 flex h-64 w-full flex-col items-center justify-center rounded-md border border-dashed border-border/50 bg-muted/20">
            <div className="text-center text-muted-foreground">
              <p className="text-sm font-medium">No activity found</p>
              <p className="text-xs opacity-70">
                No trades recorded for this timeframe
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Risk Management Card (Unchanged) */}
      <div className="rounded-lg border border-border bg-card p-4">
        <h3 className="mb-4 text-xs font-semibold uppercase tracking-wider text-foreground">
          Risk & Averages
        </h3>
        <div className="space-y-3">
          <div className="border-b border-border pb-3">
            <div className="text-xs text-muted-foreground">Largest Gain</div>
            <div className="font-mono text-sm font-bold text-primary">
              +$
              {risk.largestGain.toLocaleString(undefined, {
                minimumFractionDigits: 2,
              })}
            </div>
          </div>
          <div className="border-b border-border pb-3">
            <div className="text-xs text-muted-foreground">Largest Loss</div>
            <div className="font-mono text-sm font-bold text-secondary">
              -$
              {Math.abs(risk.largestLoss).toLocaleString(undefined, {
                minimumFractionDigits: 2,
              })}
            </div>
          </div>
          <div className="border-b border-border pb-3">
            <div className="text-xs text-muted-foreground">Avg Win Amount</div>
            <div className="font-mono text-sm font-bold text-foreground">
              +$
              {risk.avgWin.toLocaleString(undefined, {
                minimumFractionDigits: 2,
              })}
            </div>
          </div>
          <div className="border-b border-border pb-3">
            <div className="text-xs text-muted-foreground">Avg Loss Amount</div>
            <div className="font-mono text-sm font-bold text-foreground">
              -$
              {Math.abs(risk.avgLoss).toLocaleString(undefined, {
                minimumFractionDigits: 2,
              })}
            </div>
          </div>
          <div className="border-b border-border pb-3">
            <div className="text-xs text-muted-foreground">Profit Factor</div>
            <div className="font-mono text-sm font-bold text-foreground">
              {risk.profitFactor.toFixed(2)}x
            </div>
          </div>
          <div>
            <div className="text-xs text-muted-foreground">
              Avg Trade Duration
            </div>
            <div className="font-mono text-sm font-bold text-foreground">
              {formatDuration(risk.avgTradeDuration)}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}