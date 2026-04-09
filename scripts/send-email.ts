import { Resend } from 'resend';
import fs from 'fs';
import path from 'path';
import type { DailyBriefing } from '../src/lib/types';

const CATEGORY_LABELS: Record<string, string> = {
  ai: 'AI',
  tech: 'TECH',
  finance: 'FINANCE',
  investing: 'INVESTING',
  politics: 'POLITICS',
  'current-affairs': 'CURRENT AFFAIRS',
};

function clean(text: string, limit = 600) {
  return text.replace(/[#*]/g, '').replace(/\n{3,}/g, '\n\n').trim().slice(0, limit);
}

function generateEmailHTML(briefing: DailyBriefing, siteUrl: string): string {
  const weekday = new Date(briefing.date + 'T12:00:00').toLocaleDateString('en-GB', { weekday: 'long' });
  const dateFormatted = new Date(briefing.date + 'T12:00:00').toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });

  const newsRows = briefing.news.map(item => `
    <tr>
      <td style="padding: 0 0 0 0; border-top: 1px solid rgba(196,163,90,0.14);">
        <div style="padding: 16px 0;">
          <div style="margin-bottom: 10px;">
            <span style="font-size: 9px; font-weight: 500; letter-spacing: 0.18em; color: #c8a96e; text-transform: uppercase;">${CATEGORY_LABELS[item.category] || item.category}</span>
            <span style="font-size: 9px; color: #5a5752; margin-left: 8px; letter-spacing: 0.1em; text-transform: uppercase;">${item.source}</span>
          </div>
          <table width="100%" cellpadding="0" cellspacing="0">
            <tr>
              <td width="50%" style="vertical-align: top; padding-right: 20px; border-right: 1px solid rgba(196,163,90,0.14);">
                <div style="font-size: 8px; letter-spacing: 0.2em; color: #5a5752; margin-bottom: 6px;">中文</div>
                <div style="font-size: 14px; font-weight: 400; color: #ede9e0; margin-bottom: 6px; line-height: 1.4;">${item.title.cn}</div>
                <div style="font-size: 11px; color: #9c9790; line-height: 1.7;">${item.summary.cn}</div>
              </td>
              <td width="50%" style="vertical-align: top; padding-left: 20px;">
                <div style="font-size: 8px; letter-spacing: 0.2em; color: #5a5752; margin-bottom: 6px;">ENGLISH</div>
                <div style="font-size: 14px; font-weight: 400; color: #ede9e0; margin-bottom: 6px; line-height: 1.4;">${item.title.en}</div>
                <div style="font-size: 11px; color: #9c9790; line-height: 1.7;">${item.summary.en}</div>
              </td>
            </tr>
          </table>
        </div>
      </td>
    </tr>
  `).join('');

  return `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"></head>
<body style="margin: 0; padding: 0; background: #141210; font-family: 'Courier New', Courier, monospace;">
<div style="max-width: 680px; margin: 0 auto; padding: 32px 24px;">

  <!-- Masthead -->
  <div style="border-bottom: 1px solid rgba(196,163,90,0.14); padding-bottom: 28px; margin-bottom: 28px;">
    <div style="display: flex; align-items: center; margin-bottom: 20px;">
      <div style="font-size: 9px; letter-spacing: 0.3em; color: #5a5752; text-transform: uppercase;">Daily Intelligence Briefing</div>
      <div style="flex: 1; height: 1px; background: rgba(196,163,90,0.14); margin: 0 16px;"></div>
      <div style="font-size: 9px; letter-spacing: 0.2em; color: #5a5752;">${briefing.date}</div>
    </div>
    <div style="font-size: 52px; font-weight: 300; color: #ede9e0; line-height: 1; letter-spacing: -0.02em; margin-bottom: 8px; font-family: Georgia, serif;">${weekday}</div>
    <div style="font-size: 16px; color: #5a5752; font-weight: 300; font-family: Georgia, serif;">${dateFormatted}</div>
    <div style="display: flex; gap: 28px; margin-top: 20px; padding-top: 20px; border-top: 1px solid rgba(196,163,90,0.14);">
      <div><div style="font-size: 28px; font-weight: 300; color: #c8a96e; font-family: Georgia, serif;">${briefing.news.length}</div><div style="font-size: 9px; letter-spacing: 0.15em; color: #5a5752; text-transform: uppercase; margin-top: 2px;">Stories</div></div>
      <div style="width: 1px; background: rgba(196,163,90,0.14);"></div>
      <div><div style="font-size: 28px; font-weight: 300; color: #c8a96e; font-family: Georgia, serif;">${briefing.categoryAnalyses.length}</div><div style="font-size: 9px; letter-spacing: 0.15em; color: #5a5752; text-transform: uppercase; margin-top: 2px;">Sectors</div></div>
      <div style="width: 1px; background: rgba(196,163,90,0.14);"></div>
      <div><div style="font-size: 28px; font-weight: 300; color: #c8a96e; font-family: Georgia, serif;">2</div><div style="font-size: 9px; letter-spacing: 0.15em; color: #5a5752; text-transform: uppercase; margin-top: 2px;">Languages</div></div>
    </div>
  </div>

  <!-- CTA -->
  <div style="border: 1px solid rgba(196,163,90,0.14); padding: 16px 20px; margin-bottom: 32px; text-align: center;">
    <div style="font-size: 10px; letter-spacing: 0.15em; color: #9c9790; margin-bottom: 12px; text-transform: uppercase;">今日播客已附件发送 · Audio attached below</div>
    <a href="${siteUrl}" style="display: inline-block; padding: 8px 28px; border: 1px solid rgba(196,163,90,0.4); color: #c8a96e; text-decoration: none; font-size: 11px; letter-spacing: 0.15em; text-transform: uppercase;">打开 Diurna · Open Briefing →</a>
  </div>

  <!-- News -->
  <div style="font-size: 9px; letter-spacing: 0.25em; color: #c8a96e; text-transform: uppercase; margin-bottom: 4px;">今日要闻</div>
  <div style="font-size: 9px; letter-spacing: 0.15em; color: #5a5752; margin-bottom: 16px;">Top Stories</div>
  <table width="100%" cellpadding="0" cellspacing="0">
    ${newsRows}
  </table>

  <!-- Analysis -->
  <div style="margin-top: 32px; border-top: 1px solid rgba(196,163,90,0.14); padding-top: 24px;">
    <div style="font-size: 9px; letter-spacing: 0.25em; color: #c8a96e; text-transform: uppercase; margin-bottom: 4px;">综合分析</div>
    <div style="font-size: 9px; letter-spacing: 0.15em; color: #5a5752; margin-bottom: 16px;">Comprehensive Analysis</div>
    <table width="100%" cellpadding="0" cellspacing="0">
      <tr>
        <td width="50%" style="vertical-align: top; padding-right: 20px; border-right: 1px solid rgba(196,163,90,0.14);">
          <div style="font-size: 8px; letter-spacing: 0.2em; color: #5a5752; margin-bottom: 8px;">中文</div>
          <div style="font-size: 11px; color: #9c9790; line-height: 1.8; white-space: pre-line;">${clean(briefing.comprehensiveAnalysis.cn)}</div>
        </td>
        <td width="50%" style="vertical-align: top; padding-left: 20px;">
          <div style="font-size: 8px; letter-spacing: 0.2em; color: #5a5752; margin-bottom: 8px;">ENGLISH</div>
          <div style="font-size: 11px; color: #9c9790; line-height: 1.8; white-space: pre-line;">${clean(briefing.comprehensiveAnalysis.en)}</div>
        </td>
      </tr>
    </table>
  </div>

  <!-- Investment Outlook -->
  <div style="margin-top: 24px; border-top: 1px solid rgba(196,163,90,0.14); padding-top: 24px;">
    <div style="font-size: 9px; letter-spacing: 0.25em; color: #c8a96e; text-transform: uppercase; margin-bottom: 4px;">投资展望</div>
    <div style="font-size: 9px; letter-spacing: 0.15em; color: #5a5752; margin-bottom: 16px;">Investment Outlook</div>
    <table width="100%" cellpadding="0" cellspacing="0">
      <tr>
        <td width="50%" style="vertical-align: top; padding-right: 20px; border-right: 1px solid rgba(196,163,90,0.14);">
          <div style="font-size: 8px; letter-spacing: 0.2em; color: #5a5752; margin-bottom: 8px;">中文</div>
          <div style="font-size: 11px; color: #9c9790; line-height: 1.8; white-space: pre-line;">${clean(briefing.investmentOutlook.cn, 800)}</div>
        </td>
        <td width="50%" style="vertical-align: top; padding-left: 20px;">
          <div style="font-size: 8px; letter-spacing: 0.2em; color: #5a5752; margin-bottom: 8px;">ENGLISH</div>
          <div style="font-size: 11px; color: #9c9790; line-height: 1.8; white-space: pre-line;">${clean(briefing.investmentOutlook.en, 800)}</div>
        </td>
      </tr>
    </table>
  </div>

  <!-- Footer -->
  <div style="margin-top: 40px; padding-top: 20px; border-top: 1px solid rgba(196,163,90,0.14); display: flex; justify-content: space-between; align-items: center;">
    <span style="font-size: 13px; font-weight: 300; letter-spacing: 0.15em; color: #5a5752; font-family: Georgia, serif;">DIURNA</span>
    <span style="font-size: 9px; letter-spacing: 0.1em; color: #5a5752; text-transform: uppercase;">Updated daily · 01:00 UK</span>
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
  const siteUrl = process.env.SITE_URL || 'https://diurna-datvince.vercel.app';

  const resend = new Resend(process.env.RESEND_API_KEY);
  const html = generateEmailHTML(briefing, siteUrl);

  // Attach audio files if they exist
  const attachments: Array<{ filename: string; content: string }> = [];
  const cnAudio = path.join(process.cwd(), 'public', 'audio', `${date}-cn.mp3`);
  const enAudio = path.join(process.cwd(), 'public', 'audio', `${date}-en.mp3`);
  if (fs.existsSync(cnAudio)) {
    attachments.push({ filename: `${date}-cn.mp3`, content: fs.readFileSync(cnAudio).toString('base64') });
  }
  if (fs.existsSync(enAudio)) {
    attachments.push({ filename: `${date}-en.mp3`, content: fs.readFileSync(enAudio).toString('base64') });
  }

  const { error } = await resend.emails.send({
    from: 'Diurna <onboarding@resend.dev>',
    to: process.env.EMAIL_TO || 'wangst1994@gmail.com',
    subject: `Diurna ${date} | 每日简报 · Daily Briefing`,
    html,
    attachments,
  });

  if (error) throw new Error(`Resend error: ${JSON.stringify(error)}`);
  console.log(`Email sent to ${process.env.EMAIL_TO || 'wangst1994@gmail.com'}`);
}

if (require.main === module) {
  const date = process.argv[2] || new Date().toISOString().split('T')[0];
  sendBriefingEmail(date).catch(console.error);
}
