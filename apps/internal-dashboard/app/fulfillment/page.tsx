import Link from "next/link";
import { redirect } from "next/navigation";
import { requireSuper } from "@/lib/guard";
import { listShopOrders, type ShopOrderRow } from "@/lib/db";
import { slackHandles } from "@/lib/slack";
import { fulfillOrder, cancelOrder } from "@/app/actions";
import { PendingButton } from "@/app/_components/PendingButton";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

export const dynamic = "force-dynamic";

const STATUS_BADGE: Record<string, "secondary" | "success" | "destructive"> = {
  pending: "secondary",
  fulfilled: "success",
  cancelled: "destructive",
};

function slackLink(id: string): string {
  return `https://slack.com/app_redirect?channel=${id}`;
}

export default async function FulfillmentPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  const access = await requireSuper();
  if (!access.isSuper) redirect("/");
  const { status } = await searchParams;
  const active = status === "fulfilled" || status === "cancelled" || status === "all" ? status : "pending";

  const orders = await listShopOrders(active === "all" ? undefined : active, 500);
  const pendingCount =
    active === "pending" ? orders.length : (await listShopOrders("pending", 1)).length;
  const handles = await slackHandles(orders.map((o) => o.player_slack));

  const tabs = [
    { key: "pending", label: "Pending" },
    { key: "fulfilled", label: "Fulfilled" },
    { key: "cancelled", label: "Cancelled" },
    { key: "all", label: "All" },
  ];

  return (
    <div>
      <h1 className="text-2xl font-semibold text-foreground tracking-tight mb-1">Fulfillment</h1>
      <p className="text-sm text-muted-foreground mb-5 max-w-2xl">
        Orders players placed in the shop with pixels. Mark one fulfilled once it&apos;s shipped or
        handed over, or cancel it to refund the pixels. Reach out over Slack to sort out delivery.
      </p>

      <div className="flex items-center gap-3 flex-wrap mb-4">
        <div className="inline-flex items-center rounded-lg border border-border p-0.5 bg-card">
          {tabs.map((t) => (
            <Button
              key={t.key}
              asChild
              variant="ghost"
              size="sm"
              className={active === t.key ? "bg-primary text-primary-foreground hover:bg-primary/90 hover:text-primary-foreground" : ""}
            >
              <Link href={t.key === "pending" ? "/fulfillment" : `/fulfillment?status=${t.key}`}>
                {t.label}
                {t.key === "pending" && pendingCount > 0 ? ` (${pendingCount})` : ""}
              </Link>
            </Button>
          ))}
        </div>
      </div>

      {orders.length === 0 ? (
        <Card className="p-8 text-center text-muted-foreground text-sm">
          {active === "pending" ? "No orders waiting to be fulfilled. Nice and clear." : "Nothing here yet."}
        </Card>
      ) : (
        <div className="grid gap-3">
          {orders.map((o) => (
            <OrderCard key={o.id} order={o} handle={o.player_slack ? handles.get(o.player_slack) : undefined} />
          ))}
        </div>
      )}
    </div>
  );
}

function OrderCard({ order: o, handle }: { order: ShopOrderRow; handle?: string }) {
  return (
    <Card className="p-4 gap-3">
      <div className="flex items-start justify-between gap-3 flex-wrap">
        <div className="min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-semibold">{o.item_name || "(item removed)"}</span>
            <Badge variant="success" className="tabular-nums">
              {o.price} px
            </Badge>
            <Badge variant={STATUS_BADGE[o.status] ?? "secondary"} className="capitalize">
              {o.status}
            </Badge>
            {o.option && <Badge variant="secondary">{o.option}</Badge>}
          </div>
          <div className="text-sm text-muted-foreground mt-1">
            <Link href={`/players/${o.user_id}`} className="font-medium text-foreground hover:text-brand">
              {o.player_name}
            </Link>
            {o.player_slack && (
              <>
                {" · "}
                <a href={slackLink(o.player_slack)} target="_blank" rel="noreferrer" className="hover:text-brand">
                  {handle ?? o.player_slack}
                </a>
              </>
            )}
            {" · "}
            {new Date(o.created_at).toLocaleString()}
          </div>
          {o.status !== "pending" && (o.fulfilled_by || o.note) && (
            <div className="text-xs text-muted-foreground mt-1">
              {o.status === "fulfilled" ? "Fulfilled" : "Cancelled"}
              {o.fulfilled_by ? ` by ${o.fulfilled_by}` : ""}
              {o.fulfilled_at ? ` on ${new Date(o.fulfilled_at).toLocaleDateString()}` : ""}
              {o.note ? ` · ${o.note}` : ""}
            </div>
          )}
        </div>
      </div>

      {o.status === "pending" && (
        <div className="flex items-end gap-2 flex-wrap">
          <form action={fulfillOrder} className="flex items-end gap-2 flex-1 min-w-64">
            <input type="hidden" name="id" value={o.id} />
            <label className="block flex-1 min-w-0">
              <span className="block text-xs font-medium text-muted-foreground mb-1">
                Note to player (optional, e.g. tracking info)
              </span>
              <Input name="note" maxLength={300} placeholder="Shipped via…" className="w-full text-sm" />
            </label>
            <PendingButton className="bg-brand text-white border-transparent" pendingText="Saving…">
              Mark fulfilled
            </PendingButton>
          </form>
          <form action={cancelOrder}>
            <input type="hidden" name="id" value={o.id} />
            <PendingButton
              variant="outline"
              pendingText="Refunding…"
              confirm={`Cancel this order and refund ${o.price} pixels to ${o.player_name}?`}
              className="text-rose-600 border-rose-200 dark:border-rose-500/30 hover:bg-rose-50 dark:hover:bg-rose-500/10 hover:text-rose-600"
            >
              Cancel &amp; refund
            </PendingButton>
          </form>
        </div>
      )}
    </Card>
  );
}
