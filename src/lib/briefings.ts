import { DailyBriefing } from './types';
import fs from 'fs';
import path from 'path';

export function getBriefing(date: string): DailyBriefing | null {
  try {
    const filePath = path.join(process.cwd(), 'src/data/briefings', `${date}.json`);
    const data = fs.readFileSync(filePath, 'utf-8');
    return JSON.parse(data) as DailyBriefing;
  } catch {
    return null;
  }
}

export function getLatestBriefingDate(): string {
  const dir = path.join(process.cwd(), 'src/data/briefings');
  try {
    const files = fs.readdirSync(dir)
      .filter(f => f.endsWith('.json'))
      .map(f => f.replace('.json', ''))
      .sort()
      .reverse();
    return files[0] || new Date().toISOString().split('T')[0];
  } catch {
    return new Date().toISOString().split('T')[0];
  }
}

export function getAllBriefingDates(): string[] {
  const dir = path.join(process.cwd(), 'src/data/briefings');
  try {
    return fs.readdirSync(dir)
      .filter(f => f.endsWith('.json'))
      .map(f => f.replace('.json', ''))
      .sort()
      .reverse();
  } catch {
    return [];
  }
}
