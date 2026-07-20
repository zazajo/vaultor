import type { ReactNode } from "react";
import StatCell from "@/components/StatCell";

export interface StatsBarCell {
  key: string;
  props: Parameters<typeof StatCell>[0];
}

// With a 3-column grid, a cell count that isn't a multiple of 3 leaves the last
// row incomplete. Stretch the trailing cell(s) so the final row always fills
// completely instead of leaving an empty grid box.
function getTrailingSpanClass(index: number, total: number): string {
  const remainder = total % 3;
  if (remainder === 0 || index !== total - 1) return "";
  return remainder === 1 ? "sm:col-span-2 md:col-span-3" : "sm:col-span-2 md:col-span-2";
}

export default function StatsBar({ cells }: { cells: StatsBarCell[] }): ReactNode {
  return (
    <div className="grid grid-cols-1 gap-px overflow-hidden rounded-xl border border-border-subtle bg-border-subtle sm:grid-cols-2 md:grid-cols-3">
      {cells.map((cell, i) => (
        <div key={cell.key} className={getTrailingSpanClass(i, cells.length)}>
          <StatCell {...cell.props} />
        </div>
      ))}
    </div>
  );
}
