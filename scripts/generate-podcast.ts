import { exec } from 'child_process';
import { promisify } from 'util';
import fs from 'fs';
import path from 'path';
import type { DailyBriefing } from '../src/lib/types';

const execAsync = promisify(exec);

function generatePodcastScript(briefing: DailyBriefing, lang: 'cn' | 'en'): string {
  const isCn = lang === 'cn';
  const lines: string[] = [];

  if (isCn) {
    lines.push(`每日脉搏，${briefing.date}。`);
    lines.push('以下是今日最重要的新闻和分析。');
  } else {
    lines.push(`Daily Pulse, ${briefing.date}.`);
    lines.push("Here are today's most important news and analysis.");
  }

  // Top news
  for (const item of briefing.news.slice(0, 6)) {
    lines.push(item.title[lang] + '. ' + item.summary[lang]);
  }

  // Comprehensive analysis
  const analysis = briefing.comprehensiveAnalysis[lang]
    .replace(/##\s*/g, '')
    .replace(/\*\*/g, '')
    .replace(/\n+/g, ' ');
  lines.push(analysis);

  // Investment outlook
  const outlook = briefing.investmentOutlook[lang]
    .replace(/##\s*/g, '')
    .replace(/###\s*/g, '')
    .replace(/\*\*/g, '')
    .replace(/- /g, '')
    .replace(/\n+/g, ' ');
  lines.push(outlook);

  if (isCn) {
    lines.push('以上就是今日的每日脉搏简报。感谢收听。');
  } else {
    lines.push("That's today's Daily Pulse briefing. Thanks for listening.");
  }

  return lines.join('\n\n');
}

export async function generatePodcast(date: string) {
  const briefingPath = path.join(process.cwd(), 'src/data/briefings', `${date}.json`);
  if (!fs.existsSync(briefingPath)) {
    console.error(`Briefing not found: ${briefingPath}`);
    process.exit(1);
  }

  const briefing: DailyBriefing = JSON.parse(fs.readFileSync(briefingPath, 'utf-8'));
  const audioDir = path.join(process.cwd(), 'public/audio');
  fs.mkdirSync(audioDir, { recursive: true });

  // Generate Chinese podcast
  const cnScript = generatePodcastScript(briefing, 'cn');
  const cnScriptPath = path.join(audioDir, `${date}-cn.txt`);
  const cnAudioPath = path.join(audioDir, `${date}-cn.mp3`);
  fs.writeFileSync(cnScriptPath, cnScript);

  try {
    await execAsync(`edge-tts --voice zh-CN-XiaoxiaoNeural --text "${cnScript.replace(/"/g, '\\"').slice(0, 3000)}" --write-media "${cnAudioPath}"`);
    console.log(`Chinese podcast saved: ${cnAudioPath}`);
  } catch (err) {
    console.error('Failed to generate Chinese podcast:', err);
  }

  // Generate English podcast
  const enScript = generatePodcastScript(briefing, 'en');
  const enScriptPath = path.join(audioDir, `${date}-en.txt`);
  const enAudioPath = path.join(audioDir, `${date}-en.mp3`);
  fs.writeFileSync(enScriptPath, enScript);

  try {
    await execAsync(`edge-tts --voice en-GB-SoniaNeural --text "${enScript.replace(/"/g, '\\"').slice(0, 3000)}" --write-media "${enAudioPath}"`);
    console.log(`English podcast saved: ${enAudioPath}`);
  } catch (err) {
    console.error('Failed to generate English podcast:', err);
  }
}

if (require.main === module) {
  const date = process.argv[2] || new Date().toISOString().split('T')[0];
  generatePodcast(date).catch(console.error);
}
