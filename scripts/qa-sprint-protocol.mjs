#!/usr/bin/env node
/**
 * @deprecated Usar: node scripts/qa-design-thinking.mjs --protocol
 * Alias de compatibilidad para protocolo manual DT.
 */
import { spawnSync } from 'node:child_process';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const script = path.join(path.dirname(fileURLToPath(import.meta.url)), 'qa-design-thinking.mjs');
const args = ['--protocol', ...process.argv.slice(2).filter((a) => a !== '--protocol')];
const r = spawnSync(process.execPath, [script, ...args], { stdio: 'inherit', encoding: 'utf8' });
process.exit(r.status ?? 1);