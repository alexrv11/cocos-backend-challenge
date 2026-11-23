const BADGE_COLORS: Record<string, string> = {
  Acciones: 'bg-primary/10 text-primary',
  Bonos: 'bg-success/10 text-success',
  CEDEAR: 'bg-[#7C3AED]/10 text-[#7C3AED]',
};

export default function TypeBadge({ type }: { type: string }) {
  const colors = BADGE_COLORS[type] ?? 'bg-tab-bg text-text-secondary';
  return (
    <span className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-medium ${colors}`}>
      {type}
    </span>
  );
}
