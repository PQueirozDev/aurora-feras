import { MAPS } from '../src/data/maps';
const SOLID = new Set(['T','~','f','S','R','B','O','Y','C','M','W','w','r','#','c','p','h','b','t','k','x','v','0','q','X','Q']);
let errs = 0;
const err = (m: string) => { errs++; console.log('ERRO', m); };
for (const [id, m] of Object.entries(MAPS)) {
  const w = m.tiles[0].length;
  m.tiles.forEach((r, y) => { if (r.length !== w) err(`${id} linha ${y} tem ${r.length} (esperado ${w}): ${r}`); });
  const at = (mm: typeof m, x: number, y: number) => mm.tiles[y]?.[x] ?? '?';
  for (const wp of m.warps) {
    const t = MAPS[wp.to];
    if (!t) { err(`${id} warp para mapa inexistente ${wp.to}`); continue; }
    const ch = at(t, wp.tx, wp.ty);
    if (SOLID.has(ch) || ch === '?') err(`${id} warp (${wp.x},${wp.y}) -> ${wp.to} (${wp.tx},${wp.ty}) cai em '${ch}'`);
    const src = at(m, wp.x, wp.y);
    if (src !== 'D' && src !== 'm') err(`${id} warp em (${wp.x},${wp.y}) não é porta/tapete: '${src}'`);
  }
  for (const n of m.npcs) {
    const ch = at(m, n.x, n.y);
    if (SOLID.has(ch) && !(n.obj && ch === 't') && !(ch==='c')) err(`${id} npc ${n.id} em tile sólido '${ch}' (${n.x},${n.y})`);
  }
  for (const p of m.placas ?? []) if (at(m, p.x, p.y) !== 'S') err(`${id} placa em (${p.x},${p.y}) não é 'S'`);
  const c = m.conexoes ?? {};
  const h = m.tiles.length;
  if (c.n) { const t = MAPS[c.n.map]; for (let x = 0; x < w; x++) if (!SOLID.has(at(m,x,0))) { const ch = at(t, x + c.n.d, t.tiles.length-1); if (SOLID.has(ch)||ch==='?') err(`${id} norte x=${x} -> ${c.n.map} '${ch}'`);} }
  if (c.s) { const t = MAPS[c.s.map]; for (let x = 0; x < w; x++) if (!SOLID.has(at(m,x,h-1))) { const ch = at(t, x + c.s.d, 0); if (SOLID.has(ch)||ch==='?') err(`${id} sul x=${x} -> ${c.s.map} '${ch}'`);} }
  if (c.e) { const t = MAPS[c.e.map]; for (let y = 0; y < h; y++) if (!SOLID.has(at(m,w-1,y))) { const ch = at(t, 0, y + c.e.d); if (SOLID.has(ch)||ch==='?') err(`${id} leste y=${y} -> ${c.e.map} '${ch}'`);} }
  if (c.w) { const t = MAPS[c.w.map]; for (let y = 0; y < h; y++) if (!SOLID.has(at(m,0,y))) { const ch = at(t, t.tiles[0].length-1, y + c.w.d); if (SOLID.has(ch)||ch==='?') err(`${id} oeste y=${y} -> ${c.w.map} '${ch}'`);} }
}
console.log(errs ? `${errs} erro(s)` : 'Mapas OK');
