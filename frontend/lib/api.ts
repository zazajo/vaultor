const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://127.0.0.1:8000/api";

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
