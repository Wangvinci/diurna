/**
 * Vertex AI / Gemini Pro version of the briefing generator.
 * Uses Google Gemini 2.0 Flash — much better Chinese quality + analysis depth vs Groq.
 *
 * Setup: Add GOOGLE_API_KEY to GitHub Actions secrets (from aistudio.google.com → Get API key)
 * Usage: GOOGLE_API_KEY=xxx npx tsx scripts/generate-briefing-vertex.ts
 */

import { GoogleGenerativeAI, SchemaType } from '@google/generative-ai';
import fs from 'fs';
import path from 'path';
import { fetchNews } from './fetch-news';

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY!);

// ─── Model config ─────────────────────────────────────────────────────────────
const model = genAI.getGenerativeModel({
  model: 'gemini-2.0-flash',    // or 'gemini-2.0-pro' for deeper analysis
  generationConfig: {
    temperature: 0.3,
    responseMimeType: 'application/json',  // Forces clean JSON output
    responseSchema: {
      type: SchemaType.OBJECT,
      properties: {
        news: {
          type: SchemaType.ARRAY,
          items: {
            type: SchemaType.OBJECT,
            properties: {
              id:        { type: SchemaType.NUMBER },
              title:     { type: SchemaType.OBJECT, properties: { cn: { type: SchemaType.STRING }, en: { type: SchemaType.STRING } }, required: ['cn', 'en'] },
              summary:   { type: SchemaType.OBJECT, properties: { cn: { type: SchemaType.STRING }, en: { type: SchemaType.STRING } }, required: ['cn', 'en'] },
              source:    { type: SchemaType.STRING },
              url:       { type: SchemaType.STRING },
              timestamp: { type: SchemaType.STRING },
              category:  { type: SchemaType.STRING },
            },
            required: ['id', 'title', 'summary', 'source', 'url', 'timestamp', 'category'],
          },
        },
        categoryAnalyses: {
          type: SchemaType.ARRAY,
          items: {
            type: SchemaType.OBJECT,
            properties: {
              category:     { type: SchemaType.STRING },
              analysis:     { type: SchemaType.OBJECT, properties: { cn: { type: SchemaType.STRING }, en: { type: SchemaType.STRING } }, required: ['cn', 'en'] },
              keyTakeaways: {
                type: SchemaType.ARRAY,
                items: { type: SchemaType.OBJECT, properties: { cn: { type: SchemaType.STRING }, en: { type: SchemaType.STRING } }, required: ['cn', 'en'] },
              },
            },
            required: ['category', 'analysis', 'keyTakeaways'],
          },
        },
        comprehensiveAnalysis: { type: SchemaType.OBJECT, properties: { cn: { type: SchemaType.STRING }, en: { type: SchemaType.STRING } }, required: ['cn', 'en'] },
        investmentOutlook:     { type: SchemaType.OBJECT, properties: { cn: { type: SchemaType.STRING }, en: { type: SchemaType.STRING } }, required: ['cn', 'en'] },
      },
      required: ['news', 'categoryAnalyses', 'comprehensiveAnalysis', 'investmentOutlook'],
    },
  },
  systemInstruction: `你是世界级的财经科技情报分析师，同时精通中英双语写作。
You are a world-class financial technology intelligence analyst, bilingual in Chinese and English.

Your briefings are read by sophisticated investors and technologists. Every insight must be:
- Specific, actionable, and well-reasoned
- Written in professional financial Chinese (简体中文) and precise English
- Free of generic statements — cite real implications

For investment outlook: name specific tickers (e.g. NVDA, MSFT), price dynamics, time horizons, and tail risks.
For Chinese text: use authentic financial Mandarin terminology (e.g. 量化宽松, 宏观对冲, 边际收益递减), not Google-translated English.`,
});

// ─── Main ─────────────────────────────────────────────────────────────────────
export async function generateBriefingVertex() {
  const today = new Date().toLocaleDateString('en-CA', { timeZone: 'Europe/London' });
  console.log(`[Vertex/Gemini] Generating briefing for ${today}...`);

  const rawNews = await fetchNews();
  console.log(`Fetched ${rawNews.length} raw news items`);

  const feed = rawNews.slice(0, 30).map((it, i) =>
    `[${i + 1}] ${it.source} | ${it.category} | ${it.title}` +
    (it.contentSnippet ? ` — ${it.contentSnippet}` : '')
  ).join('\n');

  const prompt = `Today is ${today}. Here are today's news items:

${feed}

Generate a comprehensive bilingual intelligence briefing:
1. Select the 8-10 most significant, diverse stories
2. Write thorough Chinese summaries (100-150字 each) — professional financial Mandarin, not translations
3. Write thorough English summaries (80-100 words each)
4. Category analysis: 3 key takeaways per category present
5. Comprehensive cross-domain synthesis: 400字 / 400 words
6. Investment outlook: 400字 / 400 words with specific stock/ETF tickers, targets, and risk factors

Categories: ai, tech, finance, investing, politics, current-affairs`;

  const result = await model.generateContent(prompt);
  const text = result.response.text();

  const data = JSON.parse(text);

  const briefing = {
    date: today,
    ...data,
    podcast: {
      cn: `/audio/${today}-cn.mp3`,
      en: `/audio/${today}-en.mp3`,
    },
  };

  const outputPath = path.join(process.cwd(), 'src/data/briefings', `${today}.json`);
  fs.writeFileSync(outputPath, JSON.stringify(briefing, null, 2));
  console.log(`[Vertex/Gemini] Briefing saved → ${outputPath}`);
  return briefing;
}

if (require.main === module) {
  if (!process.env.GOOGLE_API_KEY) {
    console.error('❌  GOOGLE_API_KEY not set. Get yours at: https://aistudio.google.com/apikey');
    process.exit(1);
  }
  generateBriefingVertex().catch(console.error);
}
