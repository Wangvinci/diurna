/**
 * Daily Briefing Pipeline
 * Runs at midnight UK time to:
 * 1. Fetch news from RSS feeds
 * 2. Generate analysis with Claude API
 * 3. Generate TTS podcast audio
 * 4. Send email at 01:00 UK time
 *
 * Usage: npx tsx scripts/daily-run.ts
 * Env vars needed: ANTHROPIC_API_KEY, SMTP_USER, SMTP_PASS, EMAIL_TO, SITE_URL
 */

import { generateBriefing } from './generate-briefing';
import { generateBriefingVertex } from './generate-briefing-vertex';
import { generatePodcast } from './generate-podcast';
import { sendBriefingEmail } from './send-email';

async function main() {
  // Use UK time (GMT/BST) for the date
  const today = new Date().toLocaleDateString('en-CA', { timeZone: 'Europe/London' });
  console.log(`=== Daily Pulse Pipeline - ${today} ===`);

  // Step 1: Generate briefing — prefer Vertex/Gemini if key available, fallback to Groq
  const useVertex = !!process.env.GOOGLE_API_KEY;
  console.log(`\n[1/3] Generating briefing (${useVertex ? 'Gemini/Vertex' : 'Groq'})...`);
  try {
    if (useVertex) await generateBriefingVertex();
    else await generateBriefing();
    console.log('Briefing generated successfully.');
  } catch (err) {
    console.error('Failed to generate briefing:', err);
    process.exit(1);
  }

  // Step 2: Generate podcast audio
  console.log('\n[2/3] Generating podcast audio...');
  try {
    await generatePodcast(today);
    console.log('Podcast generated successfully.');
  } catch (err) {
    console.error('Failed to generate podcast:', err);
    // Continue even if podcast fails
  }

  // Step 3: Send email
  console.log('\n[3/3] Sending email...');
  try {
    await sendBriefingEmail(today);
    console.log('Email sent successfully.');
  } catch (err) {
    console.error('Failed to send email:', err);
  }

  console.log(`\n=== Pipeline complete for ${today} ===`);
}

main().catch(console.error);
