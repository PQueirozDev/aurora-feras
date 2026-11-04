// Monta o site final em site-dist/: páginas do site + o jogo (dist/) dentro de /jogar.
import { cpSync, rmSync, existsSync, writeFileSync } from 'node:fs';
const out = 'site-dist';
if (existsSync(out)) rmSync(out, { recursive: true });
cpSync('site', out, { recursive: true });
cpSync('dist', `${out}/jogar`, { recursive: true });
writeFileSync(`${out}/.nojekyll`, '');
console.log('site montado em', out);
