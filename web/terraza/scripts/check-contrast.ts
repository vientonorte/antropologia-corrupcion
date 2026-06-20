/**
 * WCAG 2.2 AA contrast smoke check for Terraza tokens.
 * Parses accent palette from globals.css and verifies body text pairs.
 */
import fs from 'fs';
import path from 'path';

function relativeLuminance(hex: string): number {
  const rgb = hex
    .replace('#', '')
    .match(/.{2}/g)!
    .map((c) => parseInt(c, 16) / 255)
    .map((c) => (c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4));
  return 0.2126 * rgb[0]! + 0.7152 * rgb[1]! + 0.0722 * rgb[2]!;
}

function contrastRatio(fg: string, bg: string): number {
  const l1 = relativeLuminance(fg);
  const l2 = relativeLuminance(bg);
  const lighter = Math.max(l1, l2);
  const darker = Math.min(l1, l2);
  return (lighter + 0.05) / (darker + 0.05);
}

const globalsPath = path.join(process.cwd(), 'src/app/globals.css');
const css = fs.readFileSync(globalsPath, 'utf8');

const pairs: Array<{ name: string; fg: string; bg: string; min: number }> = [
  { name: 'body light', fg: '#171717', bg: '#ffffff', min: 4.5 },
  { name: 'body dark', fg: '#f5f5f5', bg: '#0a0a0a', min: 4.5 },
  { name: 'accent-700 on white', fg: '#967a3d', bg: '#ffffff', min: 4.5 },
  { name: 'accent-600 on white', fg: '#b89651', bg: '#ffffff', min: 4.5 },
];

let failed = 0;
for (const { name, fg, bg, min } of pairs) {
  const ratio = contrastRatio(fg, bg);
  const ok = ratio >= min;
  console.log(`${ok ? 'OK' : 'FAIL'} ${name}: ${ratio.toFixed(2)}:1 (min ${min}:1)`);
  if (!ok) failed += 1;
}

if (!css.includes('--accent-600')) {
  console.error('FAIL: accent tokens missing in globals.css');
  failed += 1;
}

if (failed > 0) {
  process.exit(1);
}

console.log('OK: contrast smoke passed');