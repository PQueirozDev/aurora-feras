// Idioma do jogo: L('texto em português', 'English text') devolve o texto no idioma escolhido.
import { CFG } from './game/state';
export const L = (pt: string, en: string) => (CFG.idioma === 'en' ? en : pt);
export const isEN = () => CFG.idioma === 'en';

// ---------- dados traduzidos ----------
import { MOVES, type Move, type MoveId } from './data/moves';
import { item as itemPt } from './data/items';
import { SPECIES } from './data/species';
import type { Tipo } from './data/types';
import { MOVE_EN, ITEM_EN, FERA_EN, TIPO_EN } from './data/en';

const idDoGolpe = new Map<Move, string>(Object.entries(MOVES).map(([k, v]) => [v as Move, k]));
export function nomeGolpe(mv: Move | MoveId): string {
  const m = typeof mv === 'string' ? (MOVES[mv] as Move) : mv;
  const id = typeof mv === 'string' ? mv : idDoGolpe.get(mv);
  if (isEN()) return id ? MOVE_EN[id]?.[0] ?? m.nome : m.nome === 'Esforço' ? 'Struggle' : m.nome;
  return m.nome;
}
export function descGolpe(id: MoveId): string { return isEN() ? MOVE_EN[id]?.[1] ?? MOVES[id].desc : MOVES[id].desc; }
export function nomeItem(id: string): string { return isEN() ? ITEM_EN[id]?.[0] ?? itemPt(id).nome : itemPt(id).nome; }
export function descItem(id: string): string { return isEN() ? ITEM_EN[id]?.[1] ?? itemPt(id).desc : itemPt(id).desc; }
export function nomeTipo(t: Tipo): string { return isEN() ? TIPO_EN[t] : t; }
export function catFera(k: string): string { return isEN() ? FERA_EN[k]?.[0] ?? SPECIES[k].cat : SPECIES[k].cat; }
export function textoFera(k: string): string { return isEN() ? FERA_EN[k]?.[1] ?? SPECIES[k].texto : SPECIES[k].texto; }

// ---------- falas da história ----------
import { STORY_EN } from './data/story-en';
let padroes: [RegExp, string][] | null = null;
/** traduz uma fala da história para o idioma atual (sem tradução, devolve o original) */
export function traduzirFala(pt: string): string {
  if (!isEN() || !pt) return pt;
  const direto = STORY_EN[pt];
  if (direto !== undefined) return direto;
  padroes ??= Object.entries(STORY_EN).filter(([k]) => k.includes('*')).map(([k, v]) => [
    new RegExp('^' + k.split('*').map((p) => p.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('(.+?)') + '$'),
    v,
  ]);
  for (const [re, en] of padroes) {
    const m = re.exec(pt);
    if (m) { let i = 1; return en.replace(/\*/g, () => m[i++] ?? ''); }
  }
  return pt;
}
