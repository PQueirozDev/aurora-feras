// Monta o site final em site-dist/: páginas do site + o jogo (dist/) dentro de /jogar.
import { cpSync, rmSync, existsSync, writeFileSync, mkdirSync } from 'node:fs';
const out = 'site-dist';
if (existsSync(out)) rmSync(out, { recursive: true });
cpSync('site', out, { recursive: true });
cpSync('dist', `${out}/jogar`, { recursive: true });
writeFileSync(`${out}/.nojekyll`, '');
// APK do Android (gerado em release/) fica disponível para download direto no site
if (existsSync('release/AuroraFeras.apk')) { mkdirSync(`${out}/downloads`, { recursive: true }); cpSync('release/AuroraFeras.apk', `${out}/downloads/AuroraFeras.apk`); }
// site estático já pronto: a Vercel só publica, sem build
writeFileSync(`${out}/vercel.json`, JSON.stringify({
  framework: null, buildCommand: '', installCommand: '', outputDirectory: '.',
  headers: [{ source: '/downloads/(.*)', headers: [{ key: 'Content-Disposition', value: 'attachment' }] }],
}, null, 2));
console.log('site montado em', out);
