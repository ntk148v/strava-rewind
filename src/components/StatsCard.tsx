interface StatsCardProps {
  icon: string;
  title: string;
  value: string;
  subtitle?: string;
}

export default function StatsCard({
  icon,
  title,
  value,
  subtitle,
}: StatsCardProps) {
  return (
    <div className="stat-card">
      <div className="flex items-start justify-between mb-3">
        <span className="text-2xl">{icon}</span>
      </div>
      <p className="text-zinc-400 text-sm mb-1">{title}</p>
      <p className="text-2xl md:text-3xl font-bold mb-1 gradient-text">
        {value}
      </p>
      {subtitle && <p className="text-zinc-500 text-sm">{subtitle}</p>}
    </div>
  );
}
