import Parser from 'rss-parser';

const parser = new Parser();

interface RawNewsItem {
  title: string;
  link: string;
  pubDate: string;
  contentSnippet?: string;
  source: string;
  category: string;
}

const RSS_FEEDS = [
  // AI & Tech
  { url: 'https://techcrunch.com/category/artificial-intelligence/feed/', source: 'TechCrunch', category: 'ai' },
  { url: 'https://www.theverge.com/rss/ai-artificial-intelligence/index.xml', source: 'The Verge', category: 'ai' },
  { url: 'https://feeds.arstechnica.com/arstechnica/technology-lab', source: 'Ars Technica', category: 'tech' },
  { url: 'https://www.wired.com/feed/category/business/latest/rss', source: 'Wired', category: 'tech' },

  // Finance & Investing
  { url: 'https://feeds.a]reuters.com/reuters/businessNews', source: 'Reuters', category: 'finance' },
  { url: 'https://feeds.bloomberg.com/markets/news.rss', source: 'Bloomberg', category: 'investing' },

  // Politics & Current Affairs
  { url: 'https://feeds.bbci.co.uk/news/world/rss.xml', source: 'BBC World', category: 'current-affairs' },
  { url: 'https://rss.nytimes.com/services/xml/rss/nyt/World.xml', source: 'NYT', category: 'politics' },
];

export async function fetchNews(): Promise<RawNewsItem[]> {
  const allItems: RawNewsItem[] = [];
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  yesterday.setHours(0, 0, 0, 0);

  for (const feed of RSS_FEEDS) {
    try {
      const result = await parser.parseURL(feed.url);
      const items = (result.items || [])
        .filter(item => {
          if (!item.pubDate) return true;
          return new Date(item.pubDate) >= yesterday;
        })
        .slice(0, 5)
        .map(item => ({
          title: item.title || '',
          link: item.link || '',
          pubDate: item.pubDate || new Date().toISOString(),
          contentSnippet: item.contentSnippet?.slice(0, 500) || '',
          source: feed.source,
          category: feed.category,
        }));
      allItems.push(...items);
    } catch (err) {
      console.error(`Failed to fetch ${feed.source}: ${err}`);
    }
  }

  return allItems;
}

// Run standalone
if (require.main === module) {
  fetchNews().then(items => {
    console.log(`Fetched ${items.length} news items`);
    console.log(JSON.stringify(items, null, 2));
  });
}
