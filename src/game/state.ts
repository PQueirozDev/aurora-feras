import { syncUid, type Mon } from './mon';
import { MAPS } from '../data/maps';
import { SPECIES } from '../data/species';
import type { Dir } from '../gfx/people';

export type GameState = {
  nome: string;
  rival: string;
  mapa: string;
  x: number;
  y: number;
  dir: Dir;
  equipe: Mon[];
  caixa: Mon[];
  bolsa: Record<string, number>;
  dinheiro: number;
  flags: Record<string, boolean>;
  vistos: string[];
  capturados: string[];
  insignias: string[];
  ultimaCura: { mapa: string; x: number; y: number };
  tempo: number; // segundos jogados
  inicial?: string;
};

export function novoEstado(): GameState {
  return {
    nome: 'Léo',
    rival: 'Caio',
    mapa: 'casa1',
    x: 5,
    y: 4,
    dir: 'down',
    equipe: [],
    caixa: [],
    bolsa: { pocao: 1 },
    dinheiro: 3000,
    flags: {},
    vistos: [],
    capturados: [],
    insignias: [],
    ultimaCura: { mapa: 'casa1', x: 5, y: 4 },
    tempo: 0,
  };
}

export let S: GameState = novoEstado();
export function setState(s: GameState) { S = s; }

const KEY = 'aurora-feras-save-v1';

export function salvar(): boolean {
  try {
    localStorage.setItem(KEY, JSON.stringify(S));
    return true;
  } catch {
    return false;
  }
}

export function temSave(): boolean {
  try { return !!localStorage.getItem(KEY); } catch { return false; }
}

export function carregar(): boolean {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return false;
    const data = JSON.parse(raw) as GameState;
    const st = { ...novoEstado(), ...data };
    const monOk = (m: Mon) => m && SPECIES[m.sp] && Array.isArray(m.golpes) && typeof m.nivel === 'number';
    if (!MAPS[st.mapa] || !Array.isArray(st.equipe) || !Array.isArray(st.caixa) || !st.equipe.every(monOk) || !st.caixa.every(monOk)) return false;
    if (!MAPS[st.ultimaCura?.mapa]) st.ultimaCura = { mapa: 'casa1', x: 5, y: 4 };
    S = st;
    syncUid([...S.equipe, ...S.caixa]);
    return true;
  } catch {
    return false;
  }
}

export function addItem(id: string, n = 1) {
  S.bolsa[id] = (S.bolsa[id] ?? 0) + n;
}
export function removeItem(id: string, n = 1) {
  S.bolsa[id] = (S.bolsa[id] ?? 0) - n;
  if (S.bolsa[id] <= 0) delete S.bolsa[id];
}
export function marcarVisto(sp: string) { if (!S.vistos.includes(sp)) S.vistos.push(sp); }
export function marcarCapturado(sp: string) { marcarVisto(sp); if (!S.capturados.includes(sp)) S.capturados.push(sp); }
