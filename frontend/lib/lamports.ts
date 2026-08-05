// Lamport amounts arrive from the API as decimal strings because they can
// exceed Number.MAX_SAFE_INTEGER. Everything in this module stays in BigInt
// until the final formatting step, so no amount is ever round-tripped through
// a float.

export const LAMPORTS_PER_SOL = 1_000_000_000n;
const SOL_DECIMALS = 9;

export function toLamports(value: string | null | undefined): bigint {
  if (!value) return 0n;
  try {
    return BigInt(value);
  } catch {
    return 0n;
  }
}

/** Format a lamport amount as SOL, trimming trailing zeros. */
export function formatSol(value: string | bigint | null | undefined, maxDecimals = 4): string {
  const lamports = typeof value === "bigint" ? value : toLamports(value);
  const whole = lamports / LAMPORTS_PER_SOL;
  const remainder = lamports % LAMPORTS_PER_SOL;

  const wholeStr = whole.toLocaleString("en-US");
  if (remainder === 0n || maxDecimals === 0) return wholeStr;

  const fraction = remainder.toString().padStart(SOL_DECIMALS, "0").slice(0, maxDecimals).replace(/0+$/, "");
  return fraction ? `${wholeStr}.${fraction}` : wholeStr;
}

/**
 * Progress toward a cap, 0-100. Scaled with BigInt before converting so large
 * amounts don't lose precision, and a zero/absent cap reads as 0 rather than
 * dividing by zero.
 */
export function percentOf(raised: string | bigint, cap: string | bigint): number {
  const r = typeof raised === "bigint" ? raised : toLamports(raised);
  const c = typeof cap === "bigint" ? cap : toLamports(cap);
  if (c <= 0n) return 0;
  const scaled = (r * 10_000n) / c;
  return Math.min(Number(scaled) / 100, 100);
}

/** Token amounts come back as fixed-point decimal strings from DRF. */
export function formatTokens(value: string | null | undefined, maxDecimals = 2): string {
  if (value === null || value === undefined || value === "") return "—";
  const [whole, fraction = ""] = value.split(".");
  const trimmed = fraction.slice(0, maxDecimals).replace(/0+$/, "");
  const wholeFormatted = BigInt(whole || "0").toLocaleString("en-US");
  return trimmed ? `${wholeFormatted}.${trimmed}` : wholeFormatted;
}

/**
 * Approximate USD value of a lamport amount, for display beside the SOL figure.
 * Returns null when no price is cached, so the caller can omit the line rather
 * than render a misleading "$0".
 */
export function formatUsdValue(
  lamports: string | bigint,
  solUsdPrice: string | null,
): string | null {
  if (!solUsdPrice) return null;
  const rate = Number(solUsdPrice);
  if (!Number.isFinite(rate) || rate <= 0) return null;

  const value = typeof lamports === "bigint" ? lamports : toLamports(lamports);
  // Safe as a Number here: this is a rounded display figure, not an amount
  // anyone is credited, and SOL totals are far below the precision limit.
  const usd = (Number(value) / Number(LAMPORTS_PER_SOL)) * rate;

  return usd.toLocaleString("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: usd >= 100 ? 0 : 2,
  });
}

/** Middle-truncate a base58 address for display. */
export function shortenAddress(address: string, lead = 4, tail = 4): string {
  if (address.length <= lead + tail + 1) return address;
  return `${address.slice(0, lead)}…${address.slice(-tail)}`;
}
