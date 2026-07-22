"use client";

import { useEffect, useState } from "react";
import { ShopData } from "../types";
import { api } from "../utils/server-utils";
import { Hash, HeartPulse } from "@/components/ui/dot-matrix";

export default function Shop() {
  const [shop, setShop] = useState<ShopData>();
  const [loading, setLoading] = useState<boolean>();

  useEffect(() => {
    async function load() {
      setLoading(true);
      const data = await api("/shop/items");
      setShop(data);
      setLoading(false);
    }

    load();
  }, []);

  if (loading)
    return (
      <div className="absolute top-1/2 left-[40%] -translate-x-1/2 -translate-y-1/2">
        <HeartPulse size={60} color="#ff8c37" />
      </div>
    );

  return <div></div>;
}
