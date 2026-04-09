import { Resend } from 'resend';
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

function clean(text: string, limit = 600) {
  return text.replace(/[#*]/g, '').replace(/\n{3,}/g, '\n\n').trim().slice(0, limit);
}

function generateEmailHTML(briefing: DailyBriefing, siteUrl: string): string {
  const newsRows = briefing.news.map(item => `
    <tr>
      <td style="padding: 0 0 16px 0;">
        <div style="background: #111827; border-radius: 10px; border-left: 3px solid ${CATEGORY_COLORS[item.category] || '#666'}; overflow: hidden;">
          <div style="padding: 8px 14px; background: rgba(255,255,255,0.03); border-bottom: 1px solid rgba(255,255,255,0.05);">
            <span style="font-size: 10px; font-weight: 700; letter-spacing: 0.1em; color: ${CATEGORY_COLORS[item.category]};">${item.category.toUpperCase()}</span>
            <span style="font-size: 10px; color: #4b5563; margin-left: 8px;">${item.source}</span>
          </div>
          <table width="100%" cellpadding="0" cellspacing="0">
            <tr>
              <td width="50%" style="padding: 12px 14px; vertical-align: top; border-right: 1px solid rgba(255,255,255,0.05);">
                <div style="font-size: 9px; font-weight: 700; letter-spacing: 0.1em; color: rgba(168,85,247,0.7); margin-bottom: 6px;">中文</div>
                <div style="font-size: 13px; font-weight: 600; color: #f9fafb; margin-bottom: 6px; line-height: 1.4;">${item.title.cn}</div>
                <div style="font-size: 12px; color: #9ca3af; line-height: 1.6;">${item.summary.cn}</div>
              </td>
              <td width="50%" style="padding: 12px 14px; vertical-align: top;">
                <div style="font-size: 9px; font-weight: 700; letter-spacing: 0.1em; color: rgba(59,130,246,0.7); margin-bottom: 6px;">ENGLISH</div>
                <div style="font-size: 13px; font-weight: 600; color: #f9fafb; margin-bottom: 6px; line-height: 1.4;">${item.title.en}</div>
                <div style="font-size: 12px; color: #9ca3af; line-height: 1.6;">${item.summary.en}</div>
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
<body style="margin: 0; padding: 0; background: #030712; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;">
<div style="max-width: 680px; margin: 0 auto; padding: 24px 16px;">

  <!-- Header -->
  <div style="display: flex; align-items: center; gap: 10px; margin-bottom: 24px;">
    <div style="width: 32px; height: 32px; border-radius: 8px; background: linear-gradient(135deg, #a855f7, #3b82f6); display: flex; align-items: center; justify-content: center; flex-shrink: 0;">
      <span style="color: white; font-weight: 800; font-size: 14px;">D</span>
    </div>
    <div>
      <div style="font-size: 15px; font-weight: 700; color: white;">Diurna</div>
      <div style="font-size: 11px; color: #4b5563;">${briefing.date} · Daily Intelligence Briefing</div>
    </div>
  </div>

  <!-- CTA -->
  <div style="background: linear-gradient(135deg, rgba(168,85,247,0.12), rgba(59,130,246,0.12)); border: 1px solid rgba(168,85,247,0.2); border-radius: 12px; padding: 16px; text-align: center; margin-bottom: 28px;">
    <div style="font-size: 12px; color: #a78bfa; margin-bottom: 10px;">🎙 今日播客已生成 · Today's podcast is ready</div>
    <a href="${siteUrl}" style="display: inline-block; padding: 9px 28px; background: linear-gradient(to right, #a855f7, #3b82f6); color: white; text-decoration: none; border-radius: 20px; font-size: 13px; font-weight: 600;">打开 Diurna · Open Diurna</a>
  </div>

  <!-- News -->
  <div style="font-size: 11px; font-weight: 700; letter-spacing: 0.12em; color: #6b7280; text-transform: uppercase; margin-bottom: 12px;">今日要闻 · Top Stories</div>
  <table width="100%" cellpadding="0" cellspacing="0">
    ${newsRows}
  </table>

  <!-- Analysis -->
  <div style="margin-top: 8px;">
    <div style="font-size: 11px; font-weight: 700; letter-spacing: 0.12em; color: #6b7280; text-transform: uppercase; margin-bottom: 12px;">综合分析 · Comprehensive Analysis</div>
    <div style="background: #111827; border-radius: 10px; border-left: 3px solid #a855f7; overflow: hidden;">
      <table width="100%" cellpadding="0" cellspacing="0">
        <tr>
          <td width="50%" style="padding: 14px; vertical-align: top; border-right: 1px solid rgba(255,255,255,0.05);">
            <div style="font-size: 9px; font-weight: 700; letter-spacing: 0.1em; color: rgba(168,85,247,0.7); margin-bottom: 8px;">中文</div>
            <div style="font-size: 12px; color: #9ca3af; line-height: 1.7; white-space: pre-line;">${clean(briefing.comprehensiveAnalysis.cn)}</div>
          </td>
          <td width="50%" style="padding: 14px; vertical-align: top;">
            <div style="font-size: 9px; font-weight: 700; letter-spacing: 0.1em; color: rgba(59,130,246,0.7); margin-bottom: 8px;">ENGLISH</div>
            <div style="font-size: 12px; color: #9ca3af; line-height: 1.7; white-space: pre-line;">${clean(briefing.comprehensiveAnalysis.en)}</div>
          </td>
        </tr>
      </table>
    </div>
  </div>

  <!-- Investment Outlook -->
  <div style="margin-top: 16px;">
    <div style="font-size: 11px; font-weight: 700; letter-spacing: 0.12em; color: #6b7280; text-transform: uppercase; margin-bottom: 12px;">投资展望 · Investment Outlook</div>
    <div style="background: #111827; border-radius: 10px; border-left: 3px solid #f59e0b; overflow: hidden;">
      <table width="100%" cellpadding="0" cellspacing="0">
        <tr>
          <td width="50%" style="padding: 14px; vertical-align: top; border-right: 1px solid rgba(255,255,255,0.05);">
            <div style="font-size: 9px; font-weight: 700; letter-spacing: 0.1em; color: rgba(168,85,247,0.7); margin-bottom: 8px;">中文</div>
            <div style="font-size: 12px; color: #9ca3af; line-height: 1.7; white-space: pre-line;">${clean(briefing.investmentOutlook.cn, 800)}</div>
          </td>
          <td width="50%" style="padding: 14px; vertical-align: top;">
            <div style="font-size: 9px; font-weight: 700; letter-spacing: 0.1em; color: rgba(59,130,246,0.7); margin-bottom: 8px;">ENGLISH</div>
            <div style="font-size: 12px; color: #9ca3af; line-height: 1.7; white-space: pre-line;">${clean(briefing.investmentOutlook.en, 800)}</div>
          </td>
        </tr>
      </table>
    </div>
  </div>

  <!-- Footer -->
  <div style="text-align: center; margin-top: 32px; padding-top: 20px; border-top: 1px solid rgba(255,255,255,0.05);">
    <a href="${siteUrl}" style="color: #6b7280; text-decoration: none; font-size: 12px;">查看完整简报 · Read full briefing on Diurna →</a>
    <p style="margin: 10px 0 0; font-size: 10px; color: #374151;">Diurna · AI-powered intelligence · 01:00 UK time daily</p>
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

  const { error } = await resend.emails.send({
    from: 'Diurna <onboarding@resend.dev>',
    to: process.env.EMAIL_TO || 'wangst1994@gmail.com',
    subject: `Diurna ${date} | 每日简报 · Daily Briefing`,
    html,
  });

  if (error) throw new Error(`Resend error: ${JSON.stringify(error)}`);
  console.log(`Email sent to ${process.env.EMAIL_TO || 'wangst1994@gmail.com'}`);
}

if (require.main === module) {
  const date = process.argv[2] || new Date().toISOString().split('T')[0];
  sendBriefingEmail(date).catch(console.error);
}
