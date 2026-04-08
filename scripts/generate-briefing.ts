import Groq from 'groq-sdk';
import fs from 'fs';
import path from 'path';
import { fetchNews } from './fetch-news';

const client = new Groq({ apiKey: process.env.GROQ_API_KEY });

const SYSTEM_PROMPT = `You are an expert financial analyst, technology commentator, and geopolitical strategist. Your job is to create a comprehensive daily intelligence briefing from news articles.

You must output a JSON object following this exact structure. All text must be in both Chinese (cn) and English (en).

The briefing should:
1. Select the 6-10 most important news items from the raw feed
2. Assign each to a category: ai, tech, finance, investing, politics, current-affairs
3. Write concise summaries in both CN and EN
4. Provide per-category analysis with key takeaways
5. Write a comprehensive cross-category analysis
6. Provide an ENHANCED investment outlook with specific actionable recommendations (short-term 1-3 months, medium-term 3-12 months), mentioning specific tickers and targets where appropriate

The investment analysis should be the most detailed section. Be specific about:
- Which stocks/ETFs to watch
- Price targets or percentage expectations
- Risk factors
- Key monitoring indicators`;

export async function generateBriefing() {
  const today = new Date().toISOString().split('T')[0];
  console.log(`Generating briefing for ${today}...`);

  const rawNews = await fetchNews();
  console.log(`Fetched ${rawNews.length} raw news items`);

  if (rawNews.length === 0) {
    console.error('No news fetched. Aborting.');
    process.exit(1);
  }

  const userPrompt = `Today is ${today}. Here are the raw news items from the past 24 hours:

${JSON.stringify(rawNews, null, 2)}

Generate the complete daily briefing JSON. The output must be valid JSON matching the DailyBriefing type with fields: date, news (array of NewsItem), categoryAnalyses (array), comprehensiveAnalysis ({cn, en}), investmentOutlook ({cn, en}), podcast ({cn, en} file paths).

For the podcast field, use: { "cn": "/audio/${today}-cn.mp3", "en": "/audio/${today}-en.mp3" }

Each news item needs: id, title {cn, en}, summary {cn, en}, source, url, timestamp, category.
Each categoryAnalysis needs: category, analysis {cn, en}, keyTakeaways (array of {cn, en}).

Output ONLY valid JSON, no markdown fences.`;

  const response = await client.chat.completions.create({
    model: 'llama-3.3-70b-versatile',
    messages: [
      { role: 'system', content: SYSTEM_PROMPT },
      { role: 'user', content: userPrompt },
    ],
    max_tokens: 8000,
    temperature: 0.3,
  });

  const text = response.choices[0]?.message?.content || '';

  let briefing;
  try {
    briefing = JSON.parse(text);
  } catch {
    const match = text.match(/\{[\s\S]*\}/);
    if (match) {
      briefing = JSON.parse(match[0]);
    } else {
      throw new Error('Failed to parse briefing JSON from Groq response');
    }
  }

  const outputPath = path.join(process.cwd(), 'src/data/briefings', `${today}.json`);
  fs.writeFileSync(outputPath, JSON.stringify(briefing, null, 2));
  console.log(`Briefing saved to ${outputPath}`);

  return briefing;
}

if (require.main === module) {
  generateBriefing().catch(console.error);
}
