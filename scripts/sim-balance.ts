// Simula a experiência acumulada ao longo da história e o nível esperado em cada marco.
import { MAPS } from '../src/data/maps';
import { SPECIES } from '../src/data/species';

const xpTrainer = (sp: string, lv: number) => Math.floor((SPECIES[sp].xpBase * lv) / 5 * 1.5);
const xpWild = (sp: string, lv: number) => Math.floor((SPECIES[sp].xpBase * lv) / 5);
const nivelDe = (xp: number) => { let n = 5; while ((n + 1) ** 3 <= xp) n++; return n; };

// trechos da história na ordem, com quantas batalhas selvagens um jogador comum faz em cada mapa
const trechos: [string, string[], number][] = [
  ['Bruna (ginásio 1)', ['rota1', 'ventania', 'ginasio1'], 10],
  ['Marina (ginásio 2)', ['rota2', 'bosque', 'porto', 'armazem', 'ginasio2'], 8],
  ['Raí (ginásio 3)', ['rota3', 'caverna', 'faisca', 'ginasio3'], 8],
  ['Nyx (usina)', ['usina'], 0],
  ['Selene (ginásio 4)', ['rota4', 'neblina', 'ginasio4'], 8],
  ['Liga (Elite + Campeão)', ['estrada', 'liga_entrada', 'liga_lobby'], 10],
];
let xp = 125; // fera inicial no nível 5
for (const [marco, mapas, selvagens] of trechos) {
  for (const id of mapas) {
    const m = MAPS[id];
    for (const n of m.npcs) for (const [sp, lv] of n.trainer?.equipe ?? []) xp += xpTrainer(sp, lv);
    const enc = m.encontros?.lista ?? [];
    if (enc.length) for (let i = 0; i < selvagens; i++) { const e = enc[i % enc.length]; xp += xpWild(e[0], Math.round((e[1] + e[2]) / 2)); }
  }
  // chefes que não ficam no campo trainer (líderes / vilões), aproximados pelo nível máximo do marco
  console.log(`${marco.padEnd(24)} nível esperado da fera principal: ${nivelDe(xp)}`);
}
