const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? "https://vaultor-production.up.railway.app/api";

export interface SiteConfig {
  presale_start: string | null;
  current_phase: string;
  presale_open: boolean;
  social_links: Record<string, string>;
}

export interface Phase {
  id: number;
  slug: string;
  title: string;
  description: string;
  status: "current" | "coming_soon" | "complete";
  order: number;
  features: string[] | Record<string, string>;
}

// The `features` field is a JSONField on the backend and has been seeded as
// both an array and a plain object depending on the phase, so normalize it.
export function getPhaseFeatures(phase: Phase): string[] {
  return Array.isArray(phase.features) ? phase.features : Object.values(phase.features);
}

export interface Post {
  id: number;
  title: string;
  slug: string;
  body: string;
  category: string;
  cover_image: string | null;
  created_at: string;
  updated_at: string;
}

export interface FAQItem {
  id: number;
  category: string;
  question: string;
  answer: string;
  order: number;
}

export interface Document {
  id: number;
  title: string;
  file: string;
  version: string;
  description: string;
  uploaded_at: string;
}

interface Paginated<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}

export interface Tier {
  id: number;
  name: string;
  min_lamports: string;
  bonus_bps: number;
  description: string;
  order: number;
}

// Every lamport amount is a decimal string, not a number: the values can exceed
// Number.MAX_SAFE_INTEGER, so they are parsed with BigInt (see lib/lamports.ts)
// rather than being allowed to land as floats.
export interface PresaleStatus {
  treasury_address: string;
  cluster: string;
  is_paused: boolean;
  soft_cap_lamports: string;
  hard_cap_lamports: string;
  min_contribution_lamports: string;
  max_contribution_lamports: string;
  token_price_lamports: string;
  // Advertised prices, independent of the lamport price that drives allocations.
  presale_price_usd: string | null;
  launch_price_usd: string | null;
  raised_lamports: string;
  contributor_count: number;
  tiers: Tier[];
  last_indexed_at: string | null;
  // Display only. Refreshed by the indexer, never used to compute allocations.
  sol_usd_price: string | null;
  sol_usd_updated_at: string | null;
}

export interface Allocation {
  address: string;
  contributed_lamports: string;
  tier: Tier | null;
  bonus_bps: number;
  base_tokens: string | null;
  bonus_tokens: string | null;
  total_tokens: string | null;
  contribution_count: number;
}

async function apiFetch<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE_URL}${path}`, {
    ...init,
    headers: { Accept: "application/json", ...init?.headers },
  });

  if (!res.ok) {
    throw new Error(`API request to ${path} failed with status ${res.status}`);
  }

  return res.json() as Promise<T>;
}

export function getConfig(): Promise<SiteConfig> {
  return apiFetch<SiteConfig>("/config/");
}

export async function getRoadmap(): Promise<Phase[]> {
  const data = await apiFetch<Paginated<Phase>>("/roadmap/");
  return data.results;
}

export async function getUpdates(): Promise<Post[]> {
  const data = await apiFetch<Paginated<Post>>("/updates/");
  return data.results;
}

export function getUpdate(slug: string): Promise<Post> {
  return apiFetch<Post>(`/updates/${slug}/`);
}

export async function getFaq(): Promise<FAQItem[]> {
  const data = await apiFetch<Paginated<FAQItem>>("/faq/");
  return data.results;
}

export async function getDocuments(): Promise<Document[]> {
  const data = await apiFetch<Paginated<Document>>("/documents/");
  return data.results;
}

// Documents are matched by title from a handful of fixed spots (hero,
// roadmap) rather than by id, so a renamed/missing document just hides the
// button instead of breaking the build.
export function findDocument(documents: Document[], title: string): Document | undefined {
  const needle = title.trim().toLowerCase();
  return documents.find((doc) => doc.title.trim().toLowerCase() === needle);
}

export function formatDocTitle(title: string): string {
  return title.replace(/_/g, " ");
}

// Presale figures move during a live raise, so these two never read from cache —
// a stale raised total on the incubator page would misreport how much has come in.
export function getPresaleStatus(): Promise<PresaleStatus> {
  return apiFetch<PresaleStatus>("/presale/", { cache: "no-store" });
}

export function getAllocation(address: string): Promise<Allocation> {
  return apiFetch<Allocation>(`/presale/allocation/?address=${encodeURIComponent(address)}`, {
    cache: "no-store",
  });
}
