import { requireAdmin } from "@/lib/guard";
import { ticketStats, ticketActivity } from "@/lib/tickets";
import { Card } from "@/components/ui/card";
import { TicketsClient } from "./TicketsClient";
import { TicketsActivityChart } from "./TicketsActivityChart";

export const dynamic = "force-dynamic";

function StatCard({ label, value }: { label: string; value: string | number }) {
  return (
    <Card className="p-4 gap-1">
      <div className="text-xs uppercase tracking-wide text-muted-foreground">{label}</div>
      <div className="text-2xl font-semibold tabular-nums">{value}</div>
    </Card>
  );
}

export default async function TicketsPage() {
  await requireAdmin();
  const [stats, activity] = await Promise.all([ticketStats(), ticketActivity()]);

  return (
    <div>
      <h1 className="text-2xl font-semibold text-foreground tracking-tight mb-1">Tickets</h1>
      <p className="text-sm text-muted-foreground mb-6">
        Support requests from the Slack help channel. Reply in-thread from here.
      </p>

      <div className="grid grid-cols-3 gap-3 mb-6 max-w-lg">
        <StatCard label="Total" value={stats.total} />
        <StatCard label="Open" value={stats.open} />
        <StatCard label="Resolved" value={stats.resolved} />
      </div>

      <Card className="p-5 mb-6">
        <TicketsActivityChart points={activity} />
      </Card>

      <TicketsClient />
    </div>
  );
}
