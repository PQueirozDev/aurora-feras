import { SPECIES, type Species } from '../data/species';
import { MOVES, move, type MoveId, type Status } from '../data/moves';

export type MonMove = { id: MoveId; pp: number };
export type Mon = {
  uid: number;
  sp: string; // chave da espécie
  apelido?: string;
  nivel: number;
  xp: number;
  hp: number;
  golpes: MonMove[];
  status: Status | null;
  sono: number;
  ivs: [number, number, number, number, number, number];
  dono?: string;
};

let uidSeed = Date.now() % 100000;
/** garante que novos IDs não repitam os de um jogo carregado */
export function syncUid(mons: Mon[]) {
  for (const m of mons) if (m.uid >= uidSeed) uidSeed = m.uid + 1;
}

export const species = (m: Mon): Species => SPECIES[m.sp];
export const nomeDe = (m: Mon) => m.apelido ?? species(m).nome;

export function xpParaNivel(n: number) {
  return n <= 1 ? 0 : n * n * n;
}

export function stats(m: Mon) {
  const b = species(m).base;
  const [ih, ia, id, isa, isd, ise] = m.ivs;
  const L = m.nivel;
  const st = (base: number, iv: number) => Math.floor(((2 * base + iv) * L) / 100) + 5;
  return {
    hp: Math.floor(((2 * b.hp + ih) * L) / 100) + L + 10,
    atk: st(b.atk, ia),
    def: st(b.def, id),
    spa: st(b.spa, isa),
    spd: st(b.spd, isd),
    spe: st(b.spe, ise),
  };
}
export const maxHp = (m: Mon) => stats(m).hp;

/** golpes que a espécie conhece até o nível dado (os 4 mais recentes) */
function golpesIniciais(sp: Species, nivel: number): MonMove[] {
  const ids: MoveId[] = [];
  for (const [lv, id] of sp.golpes) {
    if (lv > nivel) continue;
    if (!ids.includes(id)) ids.push(id);
  }
  return ids.slice(-4).map((id) => ({ id, pp: MOVES[id].pp }));
}

export function criarMon(spKey: string, nivel: number): Mon {
  const sp = SPECIES[spKey];
  if (!sp) throw new Error('espécie desconhecida: ' + spKey);
  const r = () => Math.floor(Math.random() * 16);
  const m: Mon = {
    uid: ++uidSeed,
    sp: spKey,
    nivel,
    xp: xpParaNivel(nivel),
    hp: 1,
    golpes: golpesIniciais(sp, nivel),
    status: null,
    sono: 0,
    ivs: [r(), r(), r(), r(), r(), r()],
  };
  m.hp = maxHp(m);
  return m;
}

export function curarTotal(m: Mon) {
  m.hp = maxHp(m);
  m.status = null;
  m.sono = 0;
  for (const g of m.golpes) g.pp = move(g.id).pp;
}

/** golpes aprendidos exatamente ao atingir esse nível */
export function golpesNoNivel(m: Mon, nivel: number): MoveId[] {
  return species(m).golpes.filter(([lv]) => lv === nivel).map(([, id]) => id);
}

export function podeEvoluir(m: Mon): string | null {
  const ev = species(m).evolui;
  if (ev && m.nivel >= ev.nivel) return ev.para;
  return null;
}

export function evoluir(m: Mon, para: string) {
  const antes = maxHp(m);
  m.sp = para;
  const depois = maxHp(m);
  m.hp = Math.min(depois, m.hp + (depois - antes));
}
