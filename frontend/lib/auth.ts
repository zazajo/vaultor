// Wraps localStorage rather than using it directly so every call site is
// SSR-safe (this page can be server-rendered by Next) without repeating the
// `typeof window !== "undefined"` guard everywhere.
const TOKEN_KEY = "vaultor_auth_token";

export function getStoredToken(): string | null {
  if (typeof window === "undefined") return null;
  return window.localStorage.getItem(TOKEN_KEY);
}

export function setStoredToken(token: string): void {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(TOKEN_KEY, token);
}

export function clearStoredToken(): void {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(TOKEN_KEY);
}
