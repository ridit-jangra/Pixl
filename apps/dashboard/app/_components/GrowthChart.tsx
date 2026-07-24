"use client";

import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  XAxis,
  YAxis,
} from "recharts";
import type { GrowthPoint } from "@/lib/db";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

function fmt(n: number): string {
  return n.toLocaleString("en-US");
}

function dateLabel(date: string): string {
  return new Date(`${date}T00:00:00Z`).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    timeZone: "UTC",
  });
}

export function GrowthChart({
  title,
  series,
  points,
  kind,
}: {
  title: string;
  series: "players" | "projects" | "violations";
  points: GrowthPoint[];
  kind: "cumulative" | "daily";
}) {
  const data = points.map((p) => ({
    date: p.date,
    value: kind === "cumulative" ? p.total : p.added,
  }));

  const config = {
    value: { label: title, color: `var(--chart-${series})` },
  } satisfies ChartConfig;

  const n = data.length;
  const tickIdx = n > 1 ? [0, Math.floor((n - 1) / 2), n - 1] : [0];
  const ticks = tickIdx.map((i) => data[i]?.date).filter(Boolean);

  return (
    <div>
      <div className="flex items-baseline justify-between mb-1">
        <div className="font-pixel text-xl text-foreground">{title}</div>
        <div className="text-xs text-muted-foreground">
          {kind === "cumulative" ? "total over time" : "per day"}
        </div>
      </div>

      <ChartContainer config={config} className="aspect-auto h-[200px] w-full">
        {kind === "cumulative" ? (
          <AreaChart data={data} margin={{ left: 4, right: 8, top: 8 }}>
            <defs>
              <linearGradient id={`fill-${series}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="var(--color-value)" stopOpacity={0.25} />
                <stop offset="95%" stopColor="var(--color-value)" stopOpacity={0.02} />
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
            <YAxis
              width={40}
              tickLine={false}
              axisLine={false}
              tickFormatter={fmt}
            />
            <ChartTooltip
              cursor={{ stroke: "var(--chart-cross)" }}
              content={
                <ChartTooltipContent
                  labelFormatter={(v) => dateLabel(String(v))}
                />
              }
            />
            <Area
              dataKey="value"
              type="monotone"
              stroke="var(--color-value)"
              strokeWidth={2}
              fill={`url(#fill-${series})`}
            />
          </AreaChart>
        ) : (
          <BarChart data={data} margin={{ left: 4, right: 8, top: 8 }}>
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="date"
              ticks={ticks}
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              tickFormatter={dateLabel}
            />
            <YAxis
              width={40}
              tickLine={false}
              axisLine={false}
              tickFormatter={fmt}
            />
            <ChartTooltip
              cursor={{ fill: "var(--muted)", fillOpacity: 0.4 }}
              content={
                <ChartTooltipContent
                  labelFormatter={(v) => dateLabel(String(v))}
                />
              }
            />
            <Bar dataKey="value" fill="var(--color-value)" radius={[4, 4, 0, 0]} />
          </BarChart>
        )}
      </ChartContainer>

      <details className="mt-2 text-xs">
        <summary className="cursor-pointer font-bold text-muted-foreground select-none">
          data table
        </summary>
        <div className="mt-1 max-h-40 overflow-y-auto rounded-lg border border-border">
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                <TableHead className="h-8">Date</TableHead>
                <TableHead className="h-8 text-right">
                  {kind === "cumulative" ? "Total" : "Count"}
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {[...data].reverse().map((p) => (
                <TableRow key={p.date} className="hover:bg-transparent">
                  <TableCell className="py-1">{dateLabel(p.date)}</TableCell>
                  <TableCell className="py-1 text-right tabular-nums">
                    {fmt(p.value)}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </details>
    </div>
  );
}
