// Executa todos os scripts de NPCs e gatilhos com um mundo simulado (sempre vence, sempre "sim").
import { MAPS, type WorldAPI } from '../src/data/maps';
import { S, setState, novoEstado } from '../src/game/state';
import { SPECIES } from '../src/data/species';
import { ITEMS } from '../src/data/items';

setState(novoEstado());
let erros = 0;
const npcs = new Map<string, { id: string; x: number; y: number; dir: any; hidden: boolean }>();
const w: WorldAPI = {
  say: async () => {}, ask: async () => true, choose: async () => 0,
  flag: (f) => !!S.flags[f], set: (f, v = true) => { S.flags[f] = v; },
  npc: (id) => npcs.get(id), moveNpc: async () => {}, movePlayer: async () => {},
  face: () => {}, facePlayer: () => {}, emote: async () => {},
  battleTrainer: async (t) => {
    for (const [sp, lv] of t.equipe) { if (!SPECIES[sp]) throw new Error('espécie inválida ' + sp); if (lv < 1 || lv > 100) throw new Error('nível inválido'); }
    S.flags[t.flag] = true; return true;
  },
  battleWild: async (sp) => { if (!SPECIES[sp]) throw new Error('espécie ' + sp); return 'caught'; },
  giveMon: async (sp) => { if (!SPECIES[sp]) throw new Error('espécie ' + sp); return true; },
  giveItem: async (id) => { if (!(id in ITEMS)) throw new Error('item inválido ' + id); },
  heal: async () => {}, shop: async (st) => { for (const i of st) if (!(i in ITEMS)) throw new Error('item de loja ' + i); },
  pc: async () => {}, warp: async (m) => { if (!MAPS[m]) throw new Error('warp ' + m); },
  refresh: () => {}, wait: async () => {}, music: () => {}, jingle: async () => {},
  pos: () => ({ x: 0, y: 0, dir: 'down' }), shake: async () => {}, flash: async () => {},
  insignias: () => ['insignia_rocha', 'insignia_mare', 'insignia_volt', 'insignia_bruma'].filter((f) => S.flags[f]).length,
  credits: async () => {}, travel: async () => {},
};
for (const pass of [0, 1, 2]) {
  for (const [id, m] of Object.entries(MAPS)) {
    npcs.clear();
    m.npcs.forEach((n) => npcs.set(n.id, { id: n.id, x: n.x, y: n.y, dir: n.dir, hidden: false }));
    for (const e of m.encontros?.lista ?? []) if (!SPECIES[e[0]]) { erros++; console.log(`ERRO ${id}: encontro com espécie ${e[0]}`); }
    for (const n of m.npcs) {
      if (n.obj === 'fera' && n.sp && !SPECIES[n.sp]) { erros++; console.log('ERRO espécie', n.sp); }
      if (!n.talk) continue;
      try { await n.talk(w); } catch (e) { erros++; console.log(`ERRO ${id}/${n.id} (passada ${pass}):`, (e as Error).message); }
    }
    for (const [x, y] of [[0, 0], [1, 17], [16, 6], [9, 1], [2, 17]]) {
      try { await m.aoPisar?.(w, x, y); } catch (e) { erros++; console.log(`ERRO ${id} aoPisar:`, (e as Error).message); }
    }
    try { await m.aoEntrar?.(w); } catch (e) { erros++; console.log(`ERRO ${id} aoEntrar:`, (e as Error).message); }
  }
  if (pass === 0) S.flags.labIntro = true;
}
const ins = w.insignias();
console.log(erros ? `${erros} erro(s)` : `História OK — insígnias: ${ins}, campeão: ${!!S.flags.campeao}, flags: ${Object.keys(S.flags).length}`);
