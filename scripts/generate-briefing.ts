import Groq from 'groq-sdk';
import fs from 'fs';
import path from 'path';
import { fetchNews } from './fetch-news';

const client = new Groq({ apiKey: process.env.GROQ_API_KEY });

async function callGroq(system: string, user: string, maxTokens: number, retries = 3): Promise<string> {
  for (let attempt = 0; attempt < retries; attempt++) {
    try {
      const res = await client.chat.completions.create({
        model: 'llama-3.3-70b-versatile',
        messages: [
          { role: 'system', content: system },
          { role: 'user', content: user },
        ],
        max_tokens: maxTokens,
        temperature: 0.3,
      });
      const text = res.choices[0]?.message?.content || '';
      if (text.trim()) return text;
    } catch (err: unknown) {
      const e = err as { status?: number; message?: string };
      const wait = e?.status === 429 ? (attempt + 1) * 75000 : 5000;
      console.error(`Groq attempt ${attempt + 1} failed:`, e?.message);
      if (attempt < retries - 1) await new Promise(r => setTimeout(r, wait));
    }
  }
  throw new Error('All Groq retries failed');
}

function parseJSON(text: string): unknown {
  // Try direct parse, then extract JSON block
  try { return JSON.parse(text); } catch { /* */ }
  const m = text.match(/\{[\s\S]*\}|\[[\s\S]*\]/);
  if (m) return JSON.parse(m[0]);
  throw new Error('No valid JSON found in response');
}

// ─── Phase 1: Select & write news items ──────────────────────────────────────
async function generateNewsItems(rawItems: Array<{
  title: string; link: string; pubDate: string;
  contentSnippet?: string; source: string; category: string;
}>) {
  // Compact input — no JSON bloat
  const feed = rawItems.slice(0, 30).map((it, i) =>
    `[${i + 1}] ${it.source} | ${it.category} | ${it.title}` +
    (it.contentSnippet ? ` — ${it.contentSnippet}` : '')
  ).join('\n');

  const system = `You are an expert intelligence analyst. Select the 8-10 most significant and diverse stories from the feed below and write bilingual (CN + EN) news items.

Output ONLY a JSON array. Each element:
{
  "id": number,
  "title": { "cn": "中文标题（15-25字）", "en": "English title" },
  "summary": { "cn": "中文摘要（60-100字，专业准确）", "en": "English summary (50-80 words)" },
  "source": "source name",
  "url": "article url",
  "timestamp": "ISO timestamp",
  "category": "ai|tech|finance|investing|politics|current-affairs"
}

Rules:
- Chinese titles must be complete, professional translations — NOT just the brand name
- Chinese summaries must be full sentences in fluent Mandarin
- Pick a balanced mix across categories
- Prefer original reporting over podcast episode blurbs`;

  const user = `Today's news feed:\n${feed}\n\nOutput the JSON array of 8-10 selected news items.`;

  const text = await callGroq(system, user, 4000);
  const arr = parseJSON(text);
  if (!Array.isArray(arr)) throw new Error('Expected array from news phase');

  // Validate — reject items with empty/too-short CN fields
  return arr.filter((item: { title?: { cn?: string }; summary?: { cn?: string } }) => {
    const cnTitle = item?.title?.cn || '';
    const cnSummary = item?.summary?.cn || '';
    return cnTitle.length > 5 && cnSummary.length > 20;
  });
}

// ─── Phase 2: Generate analyses ──────────────────────────────────────────────
async function generateAnalyses(newsItems: Array<{
  id: number; title: { cn: string; en: string };
  summary: { cn: string; en: string }; category: string;
}>) {
  const digest = newsItems.map(it =>
    `[${it.category.toUpperCase()}] ${it.title.en}: ${it.summary.en}`
  ).join('\n');

  const system = `You are a senior financial and geopolitical analyst. Based on today's news digest, produce a structured JSON analysis object.

Output ONLY this JSON structure:
{
  "categoryAnalyses": [
    {
      "category": "ai|tech|finance|investing|politics|current-affairs",
      "analysis": { "cn": "150字分析", "en": "150-word analysis" },
      "keyTakeaways": [
        { "cn": "要点（20字）", "en": "Takeaway (15 words)" }
      ]
    }
  ],
  "comprehensiveAnalysis": {
    "cn": "300字跨领域综合分析，关注宏观影响",
    "en": "300-word cross-domain synthesis"
  },
  "investmentOutlook": {
    "cn": "300字投资展望，含具体标的、短期中期建议、风险提示",
    "en": "300-word investment outlook with specific tickers, timeframes, risks"
  }
}

Rules:
- Only include categories that appear in the news
- keyTakeaways: 3 per category
- Investment outlook must name specific stocks/ETFs with rationale
- Chinese must be fluent, professional financial Mandarin`;

  const user = `Today's news digest:\n${digest}\n\nGenerate the analysis JSON.`;

  const text = await callGroq(system, user, 5000);
  return parseJSON(text) as {
    categoryAnalyses: Array<{
      category: string;
      analysis: { cn: string; en: string };
      keyTakeaways: Array<{ cn: string; en: string }>;
    }>;
    comprehensiveAnalysis: { cn: string; en: string };
    investmentOutlook: { cn: string; en: string };
  };
}

// ─── Main ─────────────────────────────────────────────────────────────────────
export async function generateBriefing() {
  const today = new Date().toLocaleDateString('en-CA', { timeZone: 'Europe/London' });
  console.log(`Generating briefing for ${today}...`);

  const rawNews = await fetchNews();
  console.log(`Fetched ${rawNews.length} raw news items`);
  if (rawNews.length === 0) { console.error('No news fetched. Aborting.'); process.exit(1); }

  // Phase 1: News items (4000 tokens out)
  console.log('Phase 1: selecting & writing news items...');
  const newsItems = await generateNewsItems(rawNews);
  console.log(`Selected ${newsItems.length} news items`);

  // Small pause to respect rate limits
  await new Promise(r => setTimeout(r, 3000));

  // Phase 2: Analyses (5000 tokens out)
  console.log('Phase 2: generating analyses...');
  const analyses = await generateAnalyses(newsItems);

  const briefing = {
    date: today,
    news: newsItems,
    categoryAnalyses: analyses.categoryAnalyses,
    comprehensiveAnalysis: analyses.comprehensiveAnalysis,
    investmentOutlook: analyses.investmentOutlook,
    podcast: {
      cn: `/audio/${today}-cn.mp3`,
      en: `/audio/${today}-en.mp3`,
    },
  };

  const outputPath = path.join(process.cwd(), 'src/data/briefings', `${today}.json`);
  fs.writeFileSync(outputPath, JSON.stringify(briefing, null, 2));
  console.log(`Briefing saved to ${outputPath}`);
  return briefing;
}

if (require.main === module) {
  generateBriefing().catch(console.error);
}
