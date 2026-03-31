'use client';

interface SplitViewProps {
  cn: React.ReactNode;
  en: React.ReactNode;
  className?: string;
}

export function SplitView({ cn, en, className = '' }: SplitViewProps) {
  return (
    <div className={`grid grid-cols-1 md:grid-cols-2 gap-6 ${className}`}>
      <div className="border-r-0 md:border-r border-gray-200 dark:border-gray-700 pr-0 md:pr-6">
        <div className="text-xs font-medium text-gray-400 mb-2 uppercase tracking-wider">中文</div>
        {cn}
      </div>
      <div className="pl-0 md:pl-0">
        <div className="text-xs font-medium text-gray-400 mb-2 uppercase tracking-wider">English</div>
        {en}
      </div>
    </div>
  );
}
