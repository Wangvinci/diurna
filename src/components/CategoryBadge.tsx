import { Category, CATEGORY_LABELS } from '@/lib/types';

export function CategoryBadge({ category }: { category: Category }) {
  const label = CATEGORY_LABELS[category];
  return (
    <span className="text-[9px] font-medium tracking-[0.18em] uppercase text-[var(--gold)] opacity-80">
      {label.en}
    </span>
  );
}
