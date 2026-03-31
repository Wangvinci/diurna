export interface NewsItem {
  id: string;
  title: { cn: string; en: string };
  summary: { cn: string; en: string };
  source: string;
  url: string;
  timestamp: string;
  category: Category;
}

export interface CategoryAnalysis {
  category: Category;
  analysis: { cn: string; en: string };
  keyTakeaways: { cn: string; en: string }[];
}

export interface DailyBriefing {
  date: string;
  news: NewsItem[];
  categoryAnalyses: CategoryAnalysis[];
  comprehensiveAnalysis: { cn: string; en: string };
  investmentOutlook: { cn: string; en: string };
  podcast: {
    cn: string; // audio file path
    en: string;
  };
}

export type Category = 'ai' | 'tech' | 'finance' | 'investing' | 'politics' | 'current-affairs';

export const CATEGORY_LABELS: Record<Category, { cn: string; en: string; color: string }> = {
  ai: { cn: 'AI 人工智能', en: 'AI', color: 'bg-purple-500' },
  tech: { cn: '科技', en: 'Tech', color: 'bg-blue-500' },
  finance: { cn: '金融', en: 'Finance', color: 'bg-green-500' },
  investing: { cn: '投资', en: 'Investing', color: 'bg-amber-500' },
  politics: { cn: '政治', en: 'Politics', color: 'bg-red-500' },
  'current-affairs': { cn: '时事', en: 'Current Affairs', color: 'bg-cyan-500' },
};
