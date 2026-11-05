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
  repelente?: number; // passos restantes
  hallDaFama?: { equipe: { sp: string; nivel: number; nome: string }[]; tempo: number }[];
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

// ---------------- saves: 3 espaços + configurações globais ----------------
export const SLOTS = 3;
const KEY_ANTIGA = 'aurora-feras-save-v1';
const slotKey = (n: number) => `aurora-feras-slot-${n}`;
const CFG_KEY = 'aurora-feras-config';

/** espaço de save em uso (1 a 3) */
export let slotAtual = 1;
export function setSlot(n: number) { slotAtual = n; }

export type Config = { idioma: 'pt' | 'en'; texto: 'normal' | 'rapido'; autosave: boolean; som: boolean; ultimoSlot: number };
export let CFG: Config = { idioma: 'pt', texto: 'normal', autosave: true, som: true, ultimoSlot: 1 };
export function carregarConfig() {
  try { CFG = { ...CFG, ...JSON.parse(localStorage.getItem(CFG_KEY) ?? '{}') }; } catch { /* padrão */ }
  // migra o save antigo (versão sem espaços) para o espaço 1
  try {
    const antigo = localStorage.getItem(KEY_ANTIGA);
    if (antigo && !localStorage.getItem(slotKey(1))) localStorage.setItem(slotKey(1), antigo);
    if (antigo) localStorage.removeItem(KEY_ANTIGA);
  } catch { /* sem armazenamento */ }
}
export function salvarConfig() { try { localStorage.setItem(CFG_KEY, JSON.stringify(CFG)); } catch { /* ignora */ } }

export function salvar(): boolean {
  try {
    (S as GameState & { salvoEm?: number }).salvoEm = Date.now();
    localStorage.setItem(slotKey(slotAtual), JSON.stringify(S));
    CFG.ultimoSlot = slotAtual; salvarConfig();
    return true;
  } catch {
    return false;
  }
}

/** salvamento automático (só se o jogo já começou e a opção estiver ligada) */
export let ultimoAutoSave = 0;
export function autoSalvar() {
  if (!CFG.autosave || !S.flags.inicial) return;
  if (salvar()) ultimoAutoSave = performance.now();
}

export type Resumo = { slot: number; nome: string; insignias: number; capturados: number; tempo: number; mapa: string; salvoEm?: number };
export function resumoSlot(n: number): Resumo | null {
  try {
    const raw = localStorage.getItem(slotKey(n));
    if (!raw) return null;
    const d = JSON.parse(raw) as GameState & { salvoEm?: number };
    const ins = ['insignia_rocha', 'insignia_mare', 'insignia_volt', 'insignia_bruma'].filter((f) => d.flags?.[f]).length;
    return { slot: n, nome: d.nome, insignias: ins, capturados: d.capturados?.length ?? 0, tempo: d.tempo ?? 0, mapa: MAPS[d.mapa]?.nome ?? '?', salvoEm: d.salvoEm };
  } catch { return null; }
}
export function temSave(): boolean {
  for (let n = 1; n <= SLOTS; n++) if (resumoSlot(n)) return true;
  return false;
}
export function apagarSlot(n: number) { try { localStorage.removeItem(slotKey(n)); } catch { /* ignora */ } }

function validar(data: unknown): GameState | null {
  const raw = data as Partial<GameState> | null;
  if (!raw || typeof raw !== 'object' || typeof raw.mapa !== 'string' || !Array.isArray(raw.equipe) || typeof raw.flags !== 'object' || typeof raw.nome !== 'string') return null;
  const st = { ...novoEstado(), ...(data as GameState) };
  const monOk = (m: Mon) => m && SPECIES[m.sp] && Array.isArray(m.golpes) && typeof m.nivel === 'number';
  if (!MAPS[st.mapa] || !Array.isArray(st.equipe) || !Array.isArray(st.caixa) || !st.equipe.every(monOk) || !st.caixa.every(monOk) || typeof st.flags !== 'object') return null;
  if (!MAPS[st.ultimaCura?.mapa]) st.ultimaCura = { mapa: 'casa1', x: 5, y: 4 };
  return st;
}

export function carregar(n = slotAtual): boolean {
  try {
    const raw = localStorage.getItem(slotKey(n));
    if (!raw) return false;
    const st = validar(JSON.parse(raw));
    if (!st) return false;
    S = st;
    slotAtual = n;
    CFG.ultimoSlot = n; salvarConfig();
    syncUid([...S.equipe, ...S.caixa]);
    return true;
  } catch {
    return false;
  }
}

/** texto do arquivo de save para exportar */
export function exportarSlot(n: number): string | null {
  try { const raw = localStorage.getItem(slotKey(n)); return raw ? JSON.stringify({ jogo: 'aurora-feras', versao: 1, save: JSON.parse(raw) }) : null; } catch { return null; }
}
/** importa um arquivo de save para um espaço; devolve false se o arquivo for inválido */
export function importarParaSlot(texto: string, n: number): boolean {
  try {
    const obj = JSON.parse(texto);
    const st = validar(obj?.jogo === 'aurora-feras' ? obj.save : obj);
    if (!st) return false;
    localStorage.setItem(slotKey(n), JSON.stringify(st));
    return true;
  } catch { return false; }
}

export function addItem(id: string, n = 1) {
  S.bolsa[id] = (S.bolsa[id] ?? 0) + n;
}
export function removeItem(id: string, n = 1) {
  S.bolsa[id] = (S.bolsa[id] ?? 0) - n;
  if (S.bolsa[id] <= 0) delete S.bolsa[id];
}
/** fera inicial escolhida pelo jogador (lida das flags) */
export function inicialJogador(): string | undefined {
  return S.inicial ?? Object.keys(S.flags).find((k) => k.startsWith('inicial_'))?.slice(8);
}

export function marcarVisto(sp: string) { if (!S.vistos.includes(sp)) S.vistos.push(sp); }
export function marcarCapturado(sp: string) { marcarVisto(sp); if (!S.capturados.includes(sp)) S.capturados.push(sp); }
