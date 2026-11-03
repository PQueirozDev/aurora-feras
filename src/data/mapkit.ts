import type { Dir } from '../gfx/people';

export type TrainerDef = {
  classe: string;
  nome: string;
  equipe: [string, number][];
  intro: string;
  derrota: string;
  depois: string;
  premio: number;
  visao?: number;
  lider?: boolean;
  chefe?: boolean; // vilão / elite / campeão
  look?: string;
  flag: string;
};

export interface NpcRef { id: string; x: number; y: number; dir: Dir; hidden: boolean }

export interface WorldAPI {
  say(...m: string[]): Promise<void>;
  ask(m: string): Promise<boolean>;
  choose(m: string | null, opts: string[], cancel?: boolean): Promise<number>;
  flag(f: string): boolean;
  set(f: string, v?: boolean): void;
  npc(id: string): NpcRef | undefined;
  moveNpc(id: string, path: Dir[]): Promise<void>;
  movePlayer(path: Dir[]): Promise<void>;
  face(id: string, dir: Dir | 'player'): void;
  facePlayer(dir: Dir): void;
  emote(id: string): Promise<void>;
  battleTrainer(t: TrainerDef, opts?: { podePerder?: boolean; musica?: string }): Promise<boolean>;
  battleWild(sp: string, lvl: number): Promise<'win' | 'lose' | 'run' | 'caught'>;
  giveMon(sp: string, lvl: number): Promise<boolean>;
  giveItem(id: string, n?: number): Promise<void>;
  heal(): Promise<void>;
  shop(stock: string[]): Promise<void>;
  pc(): Promise<void>;
  warp(map: string, x: number, y: number, dir: Dir): Promise<void>;
  refresh(): void;
  wait(frames: number): Promise<void>;
  music(name: string | null): void;
  jingle(name: string): Promise<void>;
  pos(): { x: number; y: number; dir: Dir };
  shake(frames?: number): Promise<void>;
  flash(color?: string): Promise<void>;
  insignias(): number;
  credits(): Promise<void>;
  travel(): Promise<void>;
}

export type NPC = {
  id: string;
  x: number;
  y: number;
  dir: Dir;
  look?: string;
  obj?: 'capsula' | 'fera' | 'placa';
  sp?: string; // para obj 'fera'
  wander?: boolean;
  hideIf?: string;
  showIf?: string;
  talk?: (w: WorldAPI) => Promise<void>;
  trainer?: TrainerDef;
};

export type Warp = { x: number; y: number; to: string; tx: number; ty: number; dir?: Dir };
export type Conn = { map: string; d: number };

export type MapDef = {
  nome: string;
  tiles: string[];
  musica: string;
  borda: string;
  interior?: boolean;
  /** caverna escura: só enxerga em volta do jogador */
  escuro?: boolean;
  /** encontros em qualquer chão de caverna (':') */
  caverna?: boolean;
  /** cidade com Centro: registra para o táxi aéreo */
  cidade?: { nome: string; x: number; y: number };
  warps: Warp[];
  npcs: NPC[];
  placas?: { x: number; y: number; texto: string }[];
  conexoes?: { n?: Conn; s?: Conn; e?: Conn; w?: Conn };
  encontros?: { taxa: number; lista: [string, number, number, number][] };
  aoPisar?: (w: WorldAPI, x: number, y: number) => Promise<boolean>;
  aoEntrar?: (w: WorldAPI) => Promise<void>;
};

// ---------------- ajudantes ----------------
export function itemNoChao(id: string, x: number, y: number, item: string, n = 1): NPC {
  const flag = 'item_' + id;
  return {
    id, x, y, dir: 'down', obj: 'capsula', hideIf: flag,
    talk: async (w) => { await w.giveItem(item, n); w.set(flag); w.refresh(); },
  };
}

export function treinador(id: string, x: number, y: number, dir: Dir, look: string, t: Omit<TrainerDef, 'flag' | 'look'>): NPC {
  const def: TrainerDef = { ...t, look, flag: 'tr_' + id };
  return {
    id, x, y, dir, look, trainer: def,
    talk: async (w) => {
      if (w.flag(def.flag)) { await w.say(def.depois); return; }
      await w.say(def.intro);
      await w.battleTrainer(def);
    },
  };
}

export function npc(id: string, x: number, y: number, dir: Dir, look: string, ...falas: string[]): NPC {
  return { id, x, y, dir, look, talk: async (w) => { await w.say(...falas); } };
}

export function andarilho(id: string, x: number, y: number, look: string, ...falas: string[]): NPC {
  return { id, x, y, dir: 'down', look, wander: true, talk: async (w) => { await w.say(...falas); } };
}

/** equipe do rival conforme a fera inicial do jogador */
export function rivalEquipe(inicial: string | undefined, fase: number): [string, number][] {
  const contra: Record<string, string[]> = {
    brasilho: ['pingolim', 'marolhao', 'abissal'],
    pingolim: ['folhito', 'bosquerel', 'silvarca'],
    folhito: ['brasilho', 'fornalhao', 'labaredor'],
  };
  const linha = contra[inicial ?? 'brasilho'] ?? contra.brasilho;
  switch (fase) {
    case 1: return [['piui', 9], ['gatuno', 9], [linha[0], 11]];
    case 2: return [['ventor', 26], ['felinao', 27], ['zapito', 26], [linha[1], 29]];
    case 3: return [['ventor', 43], ['felinao', 43], ['voltorrao', 44], ['vulcanor', 44], ['oraculum', 45], [linha[2], 47]];
    default: return [[linha[0], 5]];
  }
}

// ---------------- fábricas de interiores ----------------
const CASA_LAYOUTS = [
  ['#bb__v__k#', '#_______k#', '#__tt____#', '#__tt___x#', '#________#'],
  ['#b__v__bb#', '#________#', '#___tt___#', '#x__tt__x#', '#________#'],
  ['#x_bb__vx#', '#________#', '#_tt_____#', '#_tt___k_#', '#______k_#'],
];

export function casa(destino: string, portaX: number, portaY: number, npcs: NPC[], layout = 0, nome = 'CASA'): MapDef {
  const volta = { to: destino, tx: portaX, ty: portaY + 1, dir: 'down' as Dir };
  return {
    nome, musica: 'interior', borda: '0', interior: true,
    tiles: ['##########', '##########', ...CASA_LAYOUTS[layout % CASA_LAYOUTS.length], '####mm####'],
    warps: [{ x: 4, y: 7, ...volta }, { x: 5, y: 7, ...volta }],
    npcs,
  };
}

export function centro(destino: string, portaX: number, portaY: number, extra: NPC[] = []): MapDef {
  const volta = { to: destino, tx: portaX, ty: portaY + 1, dir: 'down' as Dir };
  return {
    nome: 'CENTRO DE FERAS', musica: 'interior', borda: '0', interior: true,
    tiles: [
      '############',
      '############',
      '#__h__x___p#',
      '#_cccccc___#',
      '#__________#',
      '#x________x#',
      '#__________#',
      '#__________#',
      '#####mm#####',
    ],
    warps: [{ x: 5, y: 8, ...volta }, { x: 6, y: 8, ...volta }],
    npcs: [
      {
        id: 'enfermeira', x: 4, y: 2, dir: 'down', look: 'enfermeira',
        talk: async (w) => {
          await w.say('Olá! Bem-vindo ao Centro de Feras.');
          if (await w.ask('Quer que eu cuide das suas feras?')) {
            await w.say('Certo, vou cuidar delas um pouquinho...');
            await w.heal();
            await w.say('Pronto! Suas feras estão totalmente recuperadas. Volte sempre!');
          } else await w.say('Volte sempre!');
        },
      },
      {
        id: 'piloto', x: 9, y: 6, dir: 'left', look: 'piloto',
        talk: async (w) => {
          if (w.insignias() < 1) { await w.say('Sou piloto do Táxi Aéreo de Aurora. Volte quando tiver pelo menos uma insígnia, aí te levo para qualquer cidade que já visitou!'); return; }
          await w.say('Táxi Aéreo de Aurora! Para onde vamos?');
          await w.travel();
        },
      },
      ...extra,
    ],
  };
}

export function loja(destino: string, portaX: number, portaY: number, estoque: (w: WorldAPI) => string[], extra: NPC[] = []): MapDef {
  const volta = { to: destino, tx: portaX, ty: portaY + 1, dir: 'down' as Dir };
  return {
    nome: 'LOJA DE FERAS', musica: 'interior', borda: '0', interior: true,
    tiles: [
      '##########',
      '##########',
      '#_c____bb#',
      '#_c______#',
      '#_c___bb_#',
      '#cc______#',
      '#______x_#',
      '####mm####',
    ],
    warps: [{ x: 4, y: 7, ...volta }, { x: 5, y: 7, ...volta }],
    npcs: [
      {
        id: 'vendedor', x: 1, y: 3, dir: 'right', look: 'vendedor',
        talk: async (w) => { await w.say('Bem-vindo! Posso ajudar?'); await w.shop(estoque(w)); },
      },
      ...extra,
    ],
  };
}

/** estoque padrão das lojas conforme as insígnias */
export function estoquePadrao(w: WorldAPI): string[] {
  const n = w.insignias();
  const l = ['capsula', 'pocao', 'antidoto', 'antiparalisia', 'despertador', 'pomada'];
  if (n >= 1) l.push('supercapsula', 'superpocao', 'repelente');
  if (n >= 2) l.push('curatotal', 'reviver', 'elixir');
  if (n >= 3) l.push('ultracapsula', 'hiperpocao', 'superrepelente');
  if (n >= 4) l.push('pocaomax');
  return l;
}

/** linha com N repetições de um caractere (para montar mapas) */
export const rep = (ch: string, n: number) => ch.repeat(n);
