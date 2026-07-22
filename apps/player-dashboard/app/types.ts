export interface Project {
  id: number;
  name: string;
  description: string;
  repo_url?: string;
  demo_url?: string;
  image_url?: string;
  status: string;
  level: number;
  pixels_earned?: number;
  hackatime_projects?: string[];
  hackatime_seconds?: number;
  review_note?: string;
  reject_reason?: string;
  rejected_at?: string;
  banned_at?: string;
  created_at: string;
  shipped_at?: string;
  owner_name?: string;
  owner_id?: string;
  used_ai?: boolean;
  ai_notes?: string;
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

export interface Order {
  id: number;
  item_name: string;
  option: string;
  price: number;
  status: "pending" | "fulfilled" | "cancelled";
  note: string;
  created_at: string;
  fulfilled_at: string | null;
}

export interface Quest {
  id: number;
  name: string;
  description: string;
  region: string;
  npc: string;
  reward: string;
  unlocked: boolean;
}

export interface StoryNode {
  id: string;
  kind: "prologue" | "chapter" | "op" | "operation";
  seal: string;
  tag: string;
  duration?: string;
  dur?: string;
  title: string;
  body: string;
  quote?: string;
  q?: string;
  outcome?: string;
  revealed?: boolean;
}

export interface VaultLevel {
  level: number;
  title: string;
  blurb: string;
  energyRequired: number;
  rewards: { icon?: string; label?: string }[];
  unlocked: boolean;
  energy_required?: number;
}

export interface VaultData {
  energy: number;
  currentLevel: number;
  nextRequired: number | null;
  levels: VaultLevel[];
}

export interface JournalEntry {
  id: number;
  content: string;
  hours: number;
  created_at: string;
}

export interface TimelineEvent {
  kind: string;
  at: string;
  verdict?: string;
  approvedHours?: number;
  claimedHours?: number;
  note?: string;
}

export interface Player {
  id: string;
  display_name: string;
  slack_id?: string;
  avatar_url?: string;
  card_pixelate?: boolean;
  project_count: number;
  level: number;
  xp_hours?: number;
  pixels?: number;
  created_at: string;
}

export interface Report {
  id: number;
  target_id: string;
  target_name: string;
  reason: string;
  status: string;
  anonymous: boolean;
  created_at: string;
}

export interface HackatimeStats {
  connected: boolean;
  totalSeconds: number;
  projects: { name: string; seconds: number }[];
  error?: string;
}
