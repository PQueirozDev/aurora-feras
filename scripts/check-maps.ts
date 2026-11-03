// Valida todos os mapas: larguras, portas, conexões e se tudo é alcançável a pé.
import { MAPS } from '../src/data/maps';
import { SOLID } from '../src/gfx/solid';

let errs = 0;
const err = (m: string) => { errs++; console.log('ERRO', m); };
const at = (id: string, x: number, y: number) => MAPS[id]?.tiles[y]?.[x] ?? '';
const walk = (id: string, x: number, y: number) => { const c = at(id, x, y); return c !== '' && !SOLID.has(c); };

// pontos de chegada em cada mapa (vindos de portas ou conexões)
const entradas: Record<string, [number, number][]> = {};
const addE = (id: string, x: number, y: number) => (entradas[id] ??= []).push([x, y]);

for (const [id, m] of Object.entries(MAPS)) {
  const w = m.tiles[0].length, h = m.tiles.length;
  m.tiles.forEach((r, y) => { if (r.length !== w) err(`${id} linha ${y} tem ${r.length} (esperado ${w}): ${r}`); });
  for (const wp of m.warps) {
    const t = MAPS[wp.to];
    if (!t) { err(`${id} porta para mapa inexistente ${wp.to}`); continue; }
    if (!walk(wp.to, wp.tx, wp.ty)) err(`${id} porta (${wp.x},${wp.y}) -> ${wp.to} (${wp.tx},${wp.ty}) cai em '${at(wp.to, wp.tx, wp.ty)}'`);
    const src = at(id, wp.x, wp.y);
    if (!['D', 'm', 'E'].includes(src)) err(`${id} porta em (${wp.x},${wp.y}) não é porta/tapete/caverna: '${src}'`);
    addE(wp.to, wp.tx, wp.ty);
  }
  for (const n of m.npcs) {
    const ch = at(id, n.x, n.y);
    if (SOLID.has(ch) && !(n.obj && ch === 't') && ch !== 'c') err(`${id} npc ${n.id} em tile sólido '${ch}' (${n.x},${n.y})`);
  }
  for (const p of m.placas ?? []) if (at(id, p.x, p.y) !== 'S') err(`${id} placa em (${p.x},${p.y}) não é 'S'`);
  const c = m.conexoes ?? {};
  const check = (lado: string, cx: number, cy: number, alvo: string, tx: number, ty: number) => {
    if (!MAPS[alvo]) { err(`${id} conexão ${lado} para mapa inexistente ${alvo}`); return; }
    if (!walk(alvo, tx, ty)) err(`${id} ${lado} (${cx},${cy}) -> ${alvo} (${tx},${ty}) '${at(alvo, tx, ty)}'`);
    else addE(alvo, tx, ty);
  };
  if (c.n) for (let x = 0; x < w; x++) if (walk(id, x, 0)) check('norte', x, 0, c.n.map, x + c.n.d, MAPS[c.n.map].tiles.length - 1);
  if (c.s) for (let x = 0; x < w; x++) if (walk(id, x, h - 1)) check('sul', x, h - 1, c.s.map, x + c.s.d, 0);
  if (c.e) for (let y = 0; y < h; y++) if (walk(id, w - 1, y)) check('leste', w - 1, y, c.e.map, 0, y + c.e.d);
  if (c.w) for (let y = 0; y < h; y++) if (walk(id, 0, y)) check('oeste', 0, y, c.w.map, MAPS[c.w.map].tiles[0].length - 1, y + c.w.d);
  // bordas abertas sem conexão
  for (let x = 0; x < w; x++) { if (walk(id, x, 0) && !c.n && !m.interior) err(`${id} borda norte aberta em x=${x} sem conexão`); if (walk(id, x, h - 1) && !c.s && !m.interior) err(`${id} borda sul aberta em x=${x} sem conexão`); }
  for (let y = 0; y < h; y++) { if (walk(id, 0, y) && !c.w && !m.interior) err(`${id} borda oeste aberta em y=${y} sem conexão`); if (walk(id, w - 1, y) && !c.e && !m.interior) err(`${id} borda leste aberta em y=${y} sem conexão`); }
}

// alcance a pé (saltos de beirada contam como caminho)
for (const [id, m] of Object.entries(MAPS)) {
  const starts = entradas[id] ?? [];
  if (!starts.length) { if (id !== 'casa1') err(`${id} não tem nenhuma entrada`); continue; }
  const seen = new Set<string>();
  const q = [...starts];
  starts.forEach(([x, y]) => seen.add(x + ',' + y));
  while (q.length) {
    const [x, y] = q.shift()!;
    for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
      let nx = x + dx, ny = y + dy;
      if (at(id, nx, ny) === 'L') { if (dy !== 1) continue; ny++; }
      const k = nx + ',' + ny;
      if (seen.has(k) || !walk(id, nx, ny)) continue;
      seen.add(k); q.push([nx, ny]);
    }
  }
  const ok = (x: number, y: number) => seen.has(x + ',' + y);
  const vizinho = (x: number, y: number) => [[1, 0], [-1, 0], [0, 1], [0, -1]].some(([dx, dy]) => ok(x + dx, y + dy) || (at(id, x + dx, y + dy) === 'c' && ok(x + 2 * dx, y + 2 * dy)));
  for (const wp of m.warps) if (!ok(wp.x, wp.y)) err(`${id} porta (${wp.x},${wp.y}) inalcançável`);
  for (const n of m.npcs) if (n.talk && !vizinho(n.x, n.y) && !ok(n.x, n.y)) err(`${id} npc ${n.id} (${n.x},${n.y}) inalcançável`);
  for (const p of m.placas ?? []) if (!vizinho(p.x, p.y)) err(`${id} placa (${p.x},${p.y}) inalcançável`);
}
console.log(errs ? `${errs} erro(s)` : `Mapas OK (${Object.keys(MAPS).length} mapas)`);
