import { exec } from 'child_process';
import { promisify } from 'util';
import fs from 'fs';
import path from 'path';
import Groq from 'groq-sdk';
import type { DailyBriefing } from '../src/lib/types';

const execAsync = promisify(exec);

// Voices for two-host dialogue
const VOICES = {
  cn: {
    host1: 'zh-CN-YunxiNeural',    // Male host
    host2: 'zh-CN-XiaoxiaoNeural', // Female host
  },
  en: {
    host1: 'en-GB-RyanNeural',     // Male host
    host2: 'en-GB-SoniaNeural',    // Female host
  },
};

async function generateDialogueScript(briefing: DailyBriefing, lang: 'cn' | 'en'): Promise<string> {
  const client = new Groq({ apiKey: process.env.GROQ_API_KEY });

  const newsSnippet = briefing.news.slice(0, 8).map(item => {
    const t = lang === 'cn' ? item.title.cn : item.title.en;
    const s = lang === 'cn' ? item.summary.cn : item.summary.en;
    return `[${item.category}] ${t}: ${s}`;
  }).join('\n');

  const analysis = lang === 'cn'
    ? briefing.comprehensiveAnalysis.cn.slice(0, 800)
    : briefing.comprehensiveAnalysis.en.slice(0, 800);

  const outlook = lang === 'cn'
    ? briefing.investmentOutlook.cn.slice(0, 600)
    : briefing.investmentOutlook.en.slice(0, 600);

  const prompt = lang === 'cn'
    ? `你是一个专业的财经科技新闻播客节目的编剧。请根据以下新闻内容，写一段5-8分钟的双主持对话播客脚本（中文）。

要求：
- 两个主持人：A（男，沉稳专业）和 B（女，机敏活泼）
- 格式严格按照：A: [对话内容] 和 B: [对话内容] 交替出现
- 开头欢迎听众，结尾告别
- 内容覆盖今日主要新闻、综合分析和投资展望
- 对话自然流畅，有互动感，5-8分钟朗读时长（约1500-2000字）
- 不要用括号注释，不要用 ** 等markdown格式，只写对话文字

今日新闻（${briefing.date}）：
${newsSnippet}

综合分析：
${analysis}

投资展望：
${outlook}`
    : `You are a professional podcast scriptwriter for a finance and tech news show. Write a 5-8 minute two-host dialogue podcast script in English based on the following news.

Requirements:
- Two hosts: A (male, authoritative and calm) and B (female, sharp and engaging)
- Strictly alternate format: A: [dialogue] and B: [dialogue]
- Open with a welcome and close with a goodbye
- Cover today's major news, comprehensive analysis, and investment outlook
- Natural conversational flow, 5-8 minutes reading time (~800-1000 words)
- Plain text only, no markdown, no stage directions in parentheses

Today's news (${briefing.date}):
${newsSnippet}

Comprehensive analysis:
${analysis}

Investment outlook:
${outlook}`;

  const response = await client.chat.completions.create({
    model: 'llama-3.3-70b-versatile',
    messages: [{ role: 'user', content: prompt }],
    max_tokens: 3000,
    temperature: 0.6,
  });

  return response.choices[0]?.message?.content || '';
}

// Parse script into [{speaker, text}] lines — handles multiple label formats
function parseDialogue(script: string): Array<{ speaker: 'A' | 'B'; text: string }> {
  const lines: Array<{ speaker: 'A' | 'B'; text: string }> = [];
  for (const line of script.split('\n')) {
    const m = line.match(/^(?:(A|Host\s*1|主持人?A|主持1)[：:\s]+|(B|Host\s*2|主持人?B|主持2)[：:\s]+)(.+)/i);
    if (!m) continue;
    const text = (m[3] || '').trim();
    if (!text) continue;
    const speaker: 'A' | 'B' = m[1] ? 'A' : 'B';
    lines.push({ speaker, text });
  }
  return lines;
}

async function ttsLine(text: string, voice: string, outputPath: string): Promise<void> {
  const tempScript = outputPath.replace('.mp3', '.txt');
  fs.writeFileSync(tempScript, text, 'utf-8');
  const commands = [
    `python3 -m edge_tts --voice ${voice} --file "${tempScript}" --write-media "${outputPath}" --rate="-3%" --volume="+8%"`,
    `edge-tts --voice ${voice} --file "${tempScript}" --write-media "${outputPath}" --rate="-3%" --volume="+8%"`,
  ];
  for (const cmd of commands) {
    try {
      await execAsync(cmd, { timeout: 60000 });
      if (fs.existsSync(outputPath) && fs.statSync(outputPath).size > 0) return;
    } catch { /* try next */ }
  }
  throw new Error(`TTS failed for line: ${text.slice(0, 50)}`);
}

async function generateDialogueAudio(
  script: string,
  outputPath: string,
  voices: { host1: string; host2: string },
  tmpDir: string,
): Promise<void> {
  const lines = parseDialogue(script);
  if (lines.length === 0) throw new Error('No dialogue lines parsed');

  const clipPaths: string[] = [];
  for (let i = 0; i < lines.length; i++) {
    const { speaker, text } = lines[i];
    const voice = speaker === 'A' ? voices.host1 : voices.host2;
    const clipPath = path.join(tmpDir, `clip_${i.toString().padStart(3, '0')}.mp3`);
    await ttsLine(text, voice, clipPath);
    if (fs.existsSync(clipPath) && fs.statSync(clipPath).size > 0) {
      clipPaths.push(clipPath);
    }
  }

  if (clipPaths.length === 0) throw new Error('No clips generated');

  // Concat with ffmpeg
  const listFile = path.join(tmpDir, 'concat_list.txt');
  fs.writeFileSync(listFile, clipPaths.map(p => `file '${p}'`).join('\n'));
  await execAsync(`ffmpeg -y -f concat -safe 0 -i "${listFile}" -c copy "${outputPath}"`, { timeout: 120000 });
}

// Simple fallback: single-voice reading (no Groq, no ffmpeg needed)
async function generateSimpleAudio(briefing: DailyBriefing, audioPath: string, lang: 'cn' | 'en'): Promise<void> {
  const lines: string[] = [];
  if (lang === 'cn') {
    lines.push(`您好，欢迎收听Diurna每日简报。今天是${briefing.date}。`);
    for (const item of briefing.news.slice(0, 6)) {
      lines.push(item.title.cn + '。' + item.summary.cn.replace(/[#*]/g, ''));
    }
    lines.push(briefing.comprehensiveAnalysis.cn.replace(/[#*\[\]]/g, '').slice(0, 400));
    lines.push('感谢收听，明天见。');
  } else {
    lines.push(`Welcome to Diurna, your daily intelligence briefing. Today is ${briefing.date}.`);
    for (const item of briefing.news.slice(0, 6)) {
      lines.push(item.title.en + '. ' + item.summary.en.replace(/[#*]/g, ''));
    }
    lines.push(briefing.comprehensiveAnalysis.en.replace(/[#*\[\]]/g, '').slice(0, 400));
    lines.push("That's your Diurna briefing. Stay informed, and we'll see you tomorrow.");
  }

  const scriptPath = audioPath.replace('.mp3', '-fallback.txt');
  fs.writeFileSync(scriptPath, lines.join('\n'), 'utf-8');
  const voice = lang === 'cn' ? VOICES.cn.host1 : VOICES.en.host1;
  await ttsLine(lines.join('\n'), voice, audioPath);
}

export async function generatePodcast(date: string) {
  const briefingPath = path.join(process.cwd(), 'src/data/briefings', `${date}.json`);
  if (!fs.existsSync(briefingPath)) {
    console.error(`Briefing not found: ${briefingPath}`);
    return;
  }

  const briefing: DailyBriefing = JSON.parse(fs.readFileSync(briefingPath, 'utf-8'));
  const audioDir = path.join(process.cwd(), 'public/audio');
  fs.mkdirSync(audioDir, { recursive: true });

  for (const lang of ['cn', 'en'] as const) {
    const audioPath = path.join(audioDir, `${date}-${lang}.mp3`);
    const tmpDir = path.join(audioDir, `tmp-${lang}-${date}`);

    try {
      // Try dialogue first
      console.log(`Generating ${lang.toUpperCase()} dialogue script...`);
      const script = await generateDialogueScript(briefing, lang);
      fs.mkdirSync(tmpDir, { recursive: true });
      fs.writeFileSync(audioPath.replace('.mp3', '.txt'), script, 'utf-8');
      await generateDialogueAudio(script, audioPath, VOICES[lang], tmpDir);
      fs.rmSync(tmpDir, { recursive: true, force: true });
      console.log(`${lang.toUpperCase()} dialogue podcast saved.`);
    } catch (err) {
      console.error(`Dialogue failed for ${lang}, falling back to simple mode:`, err);
      fs.rmSync(tmpDir, { recursive: true, force: true });
      try {
        await generateSimpleAudio(briefing, audioPath, lang);
        console.log(`${lang.toUpperCase()} simple podcast saved (fallback).`);
      } catch (e2) {
        console.error(`Simple mode also failed for ${lang}:`, e2);
      }
    }

    // Small delay between CN and EN to respect rate limits
    if (lang === 'cn') await new Promise(r => setTimeout(r, 5000));
  }
}

if (require.main === module) {
  const date = process.argv[2] || new Date().toLocaleDateString('en-CA', { timeZone: 'Europe/London' });
  generatePodcast(date).catch(console.error);
}
