"use client";

import { useEffect, useState } from "react";
import { Order } from "../types";
import { api } from "../utils/server-utils";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { Package, Clock, CheckCircle, XCircle } from "@phosphor-icons/react";

const statusIcon: Record<string, React.ReactNode> = {
  pending: <Clock className="size-4 text-amber-500" />,
  fulfilled: <CheckCircle className="size-4 text-emerald-500" />,
  cancelled: <XCircle className="size-4 text-destructive" />,
};

const statusColor: Record<string, string> = {
  pending: "warning",
  fulfilled: "success",
  cancelled: "destructive",
};

function timeAgo(date: string) {
  const sec = Math.floor((Date.now() - new Date(date).getTime()) / 1000);
  if (sec < 60) return "just now";
  const min = Math.floor(sec / 60);
  if (min < 60) return `${min}m ago`;
  const hr = Math.floor(min / 60);
  if (hr < 24) return `${hr}h ago`;
  const d = Math.floor(hr / 24);
  return `${d}d ago`;
}

export default function Orders() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        const data = await api("/orders");
        setOrders(data.orders || []);
      } catch {}
      setLoading(false);
    }
    load();
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col gap-6 p-6">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 p-6">
      <div>
        <h1 className="text-2xl font-heading font-bold">Orders</h1>
        <p className="text-sm text-muted-foreground">Track your shop orders and their status</p>
      </div>

      {orders.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center gap-3 py-16 text-center">
            <Package className="size-12 text-muted-foreground/40" />
            <p className="text-sm text-muted-foreground">No orders yet</p>
            <p className="text-xs text-muted-foreground">Visit the shop to place your first order</p>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>Order History</CardTitle>
            <CardDescription>{orders.length} order{orders.length !== 1 ? "s" : ""} placed</CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Item</TableHead>
                  <TableHead>Options</TableHead>
                  <TableHead>Price</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Date</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {orders.map((order) => (
                  <TableRow key={order.id}>
                    <TableCell className="font-medium">{order.item_name}</TableCell>
                    <TableCell className="text-muted-foreground">{order.option || "—"}</TableCell>
                    <TableCell className="font-mono">{order.price.toLocaleString()} PX</TableCell>
                    <TableCell>
                      <Badge variant={(statusColor[order.status] || "ghost") as any}>
                        <span className="flex items-center gap-1">
                          {statusIcon[order.status]}
                          {order.status}
                        </span>
                      </Badge>
                    </TableCell>
                    <TableCell className="text-muted-foreground text-xs">
                      {timeAgo(order.created_at)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
