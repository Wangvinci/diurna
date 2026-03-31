import nodemailer from 'nodemailer';
import fs from 'fs';
import path from 'path';
import type { DailyBriefing } from '../src/lib/types';

const CATEGORY_COLORS: Record<string, string> = {
  ai: '#a855f7',
  tech: '#3b82f6',
  finance: '#22c55e',
  investing: '#f59e0b',
  politics: '#ef4444',
  'current-affairs': '#06b6d4',
};

function generateEmailHTML(briefing: DailyBriefing, siteUrl: string): string {
  const newsHtml = briefing.news.map(item => `
    <div style="margin-bottom: 16px; padding: 16px; background: #1a1a2e; border-radius: 8px; border-left: 3px solid ${CATEGORY_COLORS[item.category] || '#666'};">
      <div style="font-size: 12px; color: ${CATEGORY_COLORS[item.category]}; margin-bottom: 4px;">${item.category.toUpperCase()} | ${item.source}</div>
      <div style="display: flex; gap: 24px;">
        <div style="flex: 1;">
          <h3 style="margin: 0 0 8px; font-size: 14px; color: #fff;">${item.title.cn}</h3>
          <p style="margin: 0; font-size: 13px; color: #999; line-height: 1.5;">${item.summary.cn}</p>
        </div>
        <div style="flex: 1;">
          <h3 style="margin: 0 0 8px; font-size: 14px; color: #fff;">${item.title.en}</h3>
          <p style="margin: 0; font-size: 13px; color: #999; line-height: 1.5;">${item.summary.en}</p>
        </div>
      </div>
    </div>
  `).join('');

  return `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"></head>
<body style="margin: 0; padding: 0; background: #0a0a1a; color: #eee; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
  <div style="max-width: 700px; margin: 0 auto; padding: 24px;">
    <div style="text-align: center; margin-bottom: 24px;">
      <h1 style="margin: 0; font-size: 24px; background: linear-gradient(to right, #a855f7, #3b82f6); -webkit-background-clip: text; -webkit-text-fill-color: transparent;">
        Daily Pulse / 每日脉搏
      </h1>
      <p style="margin: 4px 0; font-size: 14px; color: #666;">${briefing.date}</p>
    </div>

    <div style="margin-bottom: 24px; padding: 16px; background: linear-gradient(135deg, rgba(168,85,247,0.15), rgba(59,130,246,0.15)); border: 1px solid rgba(168,85,247,0.3); border-radius: 12px; text-align: center;">
      <p style="margin: 0 0 8px; font-size: 14px; color: #a78bfa;">🎧 Listen to today's podcast / 收听今日播客</p>
      <a href="${siteUrl}" style="display: inline-block; padding: 8px 24px; background: #a855f7; color: white; text-decoration: none; border-radius: 20px; font-size: 13px;">Open Daily Pulse / 打开每日脉搏</a>
    </div>

    <h2 style="font-size: 16px; color: #a78bfa; border-bottom: 1px solid #333; padding-bottom: 8px;">Top News / 今日要闻</h2>
    ${newsHtml}

    <h2 style="font-size: 16px; color: #f59e0b; border-bottom: 1px solid #333; padding-bottom: 8px; margin-top: 32px;">Investment Outlook / 投资展望</h2>
    <div style="display: flex; gap: 24px;">
      <div style="flex: 1; padding: 16px; background: rgba(245,158,11,0.1); border: 1px solid rgba(245,158,11,0.2); border-radius: 8px;">
        <p style="font-size: 13px; color: #ccc; line-height: 1.6; white-space: pre-line;">${briefing.investmentOutlook.cn.replace(/[#*]/g, '').slice(0, 800)}</p>
      </div>
      <div style="flex: 1; padding: 16px; background: rgba(245,158,11,0.1); border: 1px solid rgba(245,158,11,0.2); border-radius: 8px;">
        <p style="font-size: 13px; color: #ccc; line-height: 1.6; white-space: pre-line;">${briefing.investmentOutlook.en.replace(/[#*]/g, '').slice(0, 800)}</p>
      </div>
    </div>

    <div style="text-align: center; margin-top: 32px; padding-top: 16px; border-top: 1px solid #333;">
      <a href="${siteUrl}" style="color: #a78bfa; text-decoration: none; font-size: 13px;">Read full briefing on Daily Pulse / 在每日脉搏查看完整简报 →</a>
      <p style="margin-top: 12px; font-size: 11px; color: #555;">Daily Pulse - AI-powered intelligence briefing | Delivered at 01:00 UK time</p>
    </div>
  </div>
</body>
</html>`;
}

export async function sendBriefingEmail(date: string) {
  const briefingPath = path.join(process.cwd(), 'src/data/briefings', `${date}.json`);
  if (!fs.existsSync(briefingPath)) {
    console.error(`Briefing not found: ${briefingPath}`);
    return;
  }

  const briefing: DailyBriefing = JSON.parse(fs.readFileSync(briefingPath, 'utf-8'));
  const siteUrl = process.env.SITE_URL || 'https://daily-pulse.vercel.app';

  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: parseInt(process.env.SMTP_PORT || '587'),
    secure: false,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });

  const html = generateEmailHTML(briefing, siteUrl);

  await transporter.sendMail({
    from: `"Daily Pulse 每日脉搏" <${process.env.SMTP_USER}>`,
    to: process.env.EMAIL_TO,
    subject: `Daily Pulse ${date} | 每日脉搏 - AI/Tech/Finance/Investing`,
    html,
  });

  console.log(`Email sent to ${process.env.EMAIL_TO}`);
}

if (require.main === module) {
  const date = process.argv[2] || new Date().toISOString().split('T')[0];
  sendBriefingEmail(date).catch(console.error);
}
