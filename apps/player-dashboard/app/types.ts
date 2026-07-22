export interface Project {
  id: number;
  name: string;
  description: string;
  [key: string]: unknown;
}

export interface ShopItem {
  id: number;
  name: string;
  description: string;
  price: number;
  image_url: string;
  limited: boolean;
  limited_until: string | null;
  unlock_xp: number;
  options: string[];
}

export interface ShopData {
  items: ShopItem[];
  xp: number;
  claimed: number[];
}
