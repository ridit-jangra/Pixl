"use client";

import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from "recharts";
import type { PixelFlowPoint } from "@/lib/db";
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
  given: { label: "Given out", color: "#22c55e" },
  deducted: { label: "Deducted", color: "#f43f5e" },
} satisfies ChartConfig;

export function PixelFlowChart({ points }: { points: PixelFlowPoint[] }) {
  const n = points.length;
  const tickIdx = n > 1 ? [0, Math.floor((n - 1) / 2), n - 1] : [0];
  const ticks = tickIdx.map((i) => points[i]?.date).filter(Boolean);

  return (
    <div>
      <div className="flex items-baseline justify-between mb-1">
        <div className="font-pixel text-xl text-foreground">Pixels</div>
        <div className="text-xs text-muted-foreground">given out vs deducted, per day</div>
      </div>

      <ChartContainer config={config} className="aspect-auto h-[200px] w-full">
        <AreaChart data={points} margin={{ left: 4, right: 8, top: 8 }}>
          <defs>
            <linearGradient id="fill-given" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="var(--color-given)" stopOpacity={0.28} />
              <stop offset="95%" stopColor="var(--color-given)" stopOpacity={0.02} />
            </linearGradient>
            <linearGradient id="fill-deducted" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="var(--color-deducted)" stopOpacity={0.28} />
              <stop offset="95%" stopColor="var(--color-deducted)" stopOpacity={0.02} />
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
          <YAxis width={40} tickLine={false} axisLine={false} />
          <ChartTooltip
            cursor={{ stroke: "var(--chart-cross)" }}
            content={<ChartTooltipContent labelFormatter={(v) => dateLabel(String(v))} />}
          />
          <ChartLegend content={<ChartLegendContent />} />
          <Area dataKey="given" type="monotone" stroke="var(--color-given)" strokeWidth={2} fill="url(#fill-given)" />
          <Area dataKey="deducted" type="monotone" stroke="var(--color-deducted)" strokeWidth={2} fill="url(#fill-deducted)" />
        </AreaChart>
      </ChartContainer>
    </div>
  );
}
