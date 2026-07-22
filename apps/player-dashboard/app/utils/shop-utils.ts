/* eslint-disable @typescript-eslint/no-explicit-any */
import { send } from "./server-utils";

export async function buyShopItem(
  id: number,
  option?: string,
): Promise<{ ok?: boolean; balance?: number; error?: string }> {
  const res = await send("POST", `/shop/buy/${id}`, { option });
  return res;
}

export async function claimTrophy(
  id: number,
): Promise<{ ok?: boolean; claimed?: boolean; xp?: number; need?: number; error?: string }> {
  const res = await send("POST", `/shop/claim/${id}`);
  return res;
}
