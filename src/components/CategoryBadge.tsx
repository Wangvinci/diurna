'use client';

import { Category, CATEGORY_LABELS } from '@/lib/types';

export function CategoryBadge({ category }: { category: Category }) {
  const label = CATEGORY_LABELS[category];
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium text-white ${label.color}`}>
      {label.cn} / {label.en}
    </span>
  );
}
