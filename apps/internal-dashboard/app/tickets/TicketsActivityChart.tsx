"use client";

import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from "recharts";
import type { ActivityPoint } from "@/lib/tickets";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
  type ChartConfig,
} from "@/components/ui/chart";

function dateLabel(date: string): string {
  return new Date(`${date}T00:00:00Z`).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    timeZone: "UTC",
  });
}

const config = {
  created: { label: "Created", color: "#f59e0b" },
  resolved: { label: "Resolved", color: "#22c55e" },
} satisfies ChartConfig;

export function TicketsActivityChart({ points }: { points: ActivityPoint[] }) {
  const n = points.length;
  const tickIdx = n > 1 ? [0, Math.floor((n - 1) / 2), n - 1] : [0];
  const ticks = tickIdx.map((i) => points[i]?.date).filter(Boolean);

  return (
    <div>
      <div className="flex items-baseline justify-between mb-1">
        <div className="font-pixel text-xl text-foreground">Tickets, last 30 days</div>
        <div className="text-xs text-muted-foreground">created vs resolved per day</div>
      </div>

      <ChartContainer config={config} className="aspect-auto h-[220px] w-full">
        <AreaChart data={points} margin={{ left: 4, right: 8, top: 8 }}>
          <defs>
            <linearGradient id="fill-created" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="var(--color-created)" stopOpacity={0.28} />
              <stop offset="95%" stopColor="var(--color-created)" stopOpacity={0.02} />
            </linearGradient>
            <linearGradient id="fill-resolved" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="var(--color-resolved)" stopOpacity={0.28} />
              <stop offset="95%" stopColor="var(--color-resolved)" stopOpacity={0.02} />
            </linearGradient>
          </defs>
          <CartesianGrid vertical={false} />
          <XAxis
            dataKey="date"
            ticks={ticks}
            tickLine={false}
            axisLine={false}
            tickMargin={8}
            tickFormatter={dateLabel}
          />
          <YAxis width={28} tickLine={false} axisLine={false} allowDecimals={false} />
          <ChartTooltip
            cursor={{ stroke: "var(--chart-cross)" }}
            content={<ChartTooltipContent labelFormatter={(v) => dateLabel(String(v))} />}
          />
          <ChartLegend content={<ChartLegendContent />} />
          <Area
            dataKey="created"
            type="monotone"
            stroke="var(--color-created)"
            strokeWidth={2}
            fill="url(#fill-created)"
          />
          <Area
            dataKey="resolved"
            type="monotone"
            stroke="var(--color-resolved)"
            strokeWidth={2}
            fill="url(#fill-resolved)"
          />
        </AreaChart>
      </ChartContainer>
    </div>
  );
}
