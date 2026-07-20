import StatCard, { type StatCardProps } from "@/components/StatCard";

export default function StatsRow({ stats }: { stats: StatCardProps[] }) {
  return (
    <div className="grid grid-cols-1 gap-px overflow-hidden rounded-2xl border border-border-subtle bg-border-subtle sm:grid-cols-2 lg:grid-cols-5">
      {stats.map((stat, i) => (
        <StatCard key={i} {...stat} />
      ))}
    </div>
  );
}
