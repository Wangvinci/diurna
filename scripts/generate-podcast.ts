import { exec } from 'child_process';
import { promisify } from 'util';
import fs from 'fs';
import path from 'path';
import type { DailyBriefing } from '../src/lib/types';

const execAsync = promisify(exec);

function generateCnScript(briefing: DailyBriefing): string {
  const lines: string[] = [];

  lines.push(`您好，欢迎收听每日脉搏。今天是${briefing.date.replace(/-/g, '年').replace(/-/, '月').replace(/$/, '日')}。`);
  lines.push('以下是今日最重要的资讯，由人工智能为您整理。');
  lines.push('');

  for (const item of briefing.news.slice(0, 6)) {
    const title = item.title.cn.replace(/[【】《》]/g, '').trim();
    const summary = item.summary.cn
      .replace(/[#*\[\]]/g, '')
      .replace(/https?:\/\/\S+/g, '')
      .trim();
    lines.push(title + '。');
    lines.push(summary);
    lines.push('');
  }

  const analysis = briefing.comprehensiveAnalysis.cn
    .replace(/##\s*/g, '')
    .replace(/\*\*/g, '')
    .replace(/- /g, '')
    .replace(/https?:\/\/\S+/g, '')
    .replace(/\n{2,}/g, '\n')
    .trim()
    .slice(0, 500);
  lines.push('综合分析。');
  lines.push(analysis);
  lines.push('');

  const outlook = briefing.investmentOutlook.cn
    .replace(/##\s*/g, '')
    .replace(/###\s*/g, '')
    .replace(/\*\*/g, '')
    .replace(/- /g, '')
    .replace(/https?:\/\/\S+/g, '')
    .replace(/\n{2,}/g, '\n')
    .trim()
    .slice(0, 400);
  lines.push('投资展望。');
  lines.push(outlook);
  lines.push('');

  lines.push('以上是今日的每日脉搏简报，感谢您的收听，明天见。');

  return lines.join('\n');
}

function generateEnScript(briefing: DailyBriefing): string {
  const lines: string[] = [];

  lines.push(`Welcome to Diurna, your daily intelligence briefing. Today is ${new Date(briefing.date + 'T12:00:00').toLocaleDateString('en-GB', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}.`);
  lines.push("Here are today's most important stories.");
  lines.push('');

  for (const item of briefing.news.slice(0, 6)) {
    const title = item.title.en.trim();
    const summary = item.summary.en
      .replace(/[#*\[\]]/g, '')
      .replace(/https?:\/\/\S+/g, '')
      .trim();
    lines.push(title + '.');
    lines.push(summary);
    lines.push('');
  }

  const analysis = briefing.comprehensiveAnalysis.en
    .replace(/##\s*/g, '')
    .replace(/\*\*/g, '')
    .replace(/- /g, '')
    .replace(/https?:\/\/\S+/g, '')
    .replace(/\n{2,}/g, '\n')
    .trim()
    .slice(0, 500);
  lines.push('Comprehensive analysis.');
  lines.push(analysis);
  lines.push('');

  const outlook = briefing.investmentOutlook.en
    .replace(/##\s*/g, '')
    .replace(/###\s*/g, '')
    .replace(/\*\*/g, '')
    .replace(/- /g, '')
    .replace(/https?:\/\/\S+/g, '')
    .replace(/\n{2,}/g, '\n')
    .trim()
    .slice(0, 400);
  lines.push('Investment outlook.');
  lines.push(outlook);
  lines.push('');

  lines.push("That's your Diurna briefing for today. Stay informed, and we'll see you tomorrow.");

  return lines.join('\n');
}

async function generateAudio(scriptPath: string, audioPath: string, voice: string): Promise<void> {
  const commands = [
    `python3 -m edge_tts --voice ${voice} --file "${scriptPath}" --write-media "${audioPath}" --rate="-5%" --volume="+10%"`,
    `edge-tts --voice ${voice} --file "${scriptPath}" --write-media "${audioPath}" --rate="-5%" --volume="+10%"`,
  ];
  for (const cmd of commands) {
    try {
      await execAsync(cmd, { timeout: 180000 });
      if (fs.existsSync(audioPath) && fs.statSync(audioPath).size > 0) return;
    } catch { /* try next */ }
  }
  throw new Error(`All TTS commands failed for ${audioPath}`);
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

  // Chinese — 云希 (male, warm, clear)
  const cnScript = generateCnScript(briefing);
  const cnScriptPath = path.join(audioDir, `${date}-cn.txt`);
  const cnAudioPath = path.join(audioDir, `${date}-cn.mp3`);
  fs.writeFileSync(cnScriptPath, cnScript, 'utf-8');
  try {
    await generateAudio(cnScriptPath, cnAudioPath, 'zh-CN-YunxiNeural');
    console.log(`Chinese podcast saved: ${cnAudioPath}`);
  } catch (err) {
    console.error('Failed to generate Chinese podcast:', err);
  }

  // English — Ryan (British male, warm)
  const enScript = generateEnScript(briefing);
  const enScriptPath = path.join(audioDir, `${date}-en.txt`);
  const enAudioPath = path.join(audioDir, `${date}-en.mp3`);
  fs.writeFileSync(enScriptPath, enScript, 'utf-8');
  try {
    await generateAudio(enScriptPath, enAudioPath, 'en-GB-RyanNeural');
    console.log(`English podcast saved: ${enAudioPath}`);
  } catch (err) {
    console.error('Failed to generate English podcast:', err);
  }
}

if (require.main === module) {
  const date = process.argv[2] || new Date().toLocaleDateString('en-CA', { timeZone: 'Europe/London' });
  generatePodcast(date).catch(console.error);
}
