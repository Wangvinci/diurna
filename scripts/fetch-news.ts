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
  { url: 'https://feeds.nbcnews.com/nbcnews/public/business', source: 'NBC Business', category: 'finance' },
  { url: 'https://www.theguardian.com/business/rss', source: 'Guardian Business', category: 'investing' },
  { url: 'https://www.theguardian.com/money/rss', source: 'Guardian Money', category: 'finance' },

  // Politics & Current Affairs
  { url: 'https://feeds.bbci.co.uk/news/world/rss.xml', source: 'BBC World', category: 'current-affairs' },
  { url: 'https://rss.nytimes.com/services/xml/rss/nyt/World.xml', source: 'NYT World', category: 'politics' },
  { url: 'https://feeds.bbci.co.uk/news/politics/rss.xml', source: 'BBC Politics', category: 'politics' },

  // Podcasts (episode summaries)
  { url: 'https://lexfridman.com/feed/podcast/', source: 'Lex Fridman Podcast', category: 'ai' },
  { url: 'https://feeds.simplecast.com/54nAGcIl', source: 'All-In Podcast', category: 'tech' },
  { url: 'https://feeds.megaphone.fm/investlikethebest', source: 'Invest Like the Best', category: 'investing' },
  { url: 'https://feeds.npr.org/510289/podcast.xml', source: 'Planet Money', category: 'finance' },
  { url: 'https://podcasts.files.bbci.co.uk/p02nq0gn.rss', source: 'BBC Global News Podcast', category: 'current-affairs' },
];

export async function fetchNews(): Promise<RawNewsItem[]> {
  const allItems: RawNewsItem[] = [];
  const twoDaysAgo = new Date();
  twoDaysAgo.setDate(twoDaysAgo.getDate() - 2);
  twoDaysAgo.setHours(0, 0, 0, 0);

  for (const feed of RSS_FEEDS) {
    try {
      const result = await parser.parseURL(feed.url);
      const items = (result.items || [])
        .filter(item => {
          if (!item.pubDate) return true;
          return new Date(item.pubDate) >= twoDaysAgo;
        })
        .slice(0, 2)
        .map(item => ({
          title: item.title || '',
          link: item.link || '',
          pubDate: item.pubDate || new Date().toISOString(),
          contentSnippet: item.contentSnippet?.slice(0, 300) || item.itunes?.summary?.slice(0, 300) || '',
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

if (require.main === module) {
  fetchNews().then(items => {
    console.log(`Fetched ${items.length} news items`);
    console.log(JSON.stringify(items.slice(0, 5), null, 2));
  });
}
