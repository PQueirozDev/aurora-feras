// Monta o site final em site-dist/: páginas do site + o jogo (dist/) dentro de /jogar.
import { cpSync, rmSync, existsSync, writeFileSync, mkdirSync } from 'node:fs';
const out = 'site-dist';
if (existsSync(out)) rmSync(out, { recursive: true });
cpSync('site', out, { recursive: true });
cpSync('dist', `${out}/jogar`, { recursive: true });
writeFileSync(`${out}/.nojekyll`, '');
// APK mais recente gerado localmente substitui o que está em site/downloads
if (existsSync('release/AuroraFeras.apk')) { mkdirSync(`${out}/downloads`, { recursive: true }); cpSync('release/AuroraFeras.apk', `${out}/downloads/AuroraFeras.apk`); }
console.log('site montado em', out);
