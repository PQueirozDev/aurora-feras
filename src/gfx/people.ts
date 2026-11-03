import { spriteFromRows, makeCanvas, shade } from './pixel';

export type Dir = 'up' | 'down' | 'left' | 'right';
export type Look = { hair: string; skin?: string; shirt: string; pants: string; shoes?: string; hat?: boolean };

const HEAD_DOWN = [
  '................',
  '.....oooooo.....',
  '....ohhhhhho....',
  '...ohhhhhhhho...',
  '...ohhhhhhhho...',
  '...ohssssssho...',
  '...osesssseso...',
  '...ossssssssо...',
  '....ossssssо....',
];
const HEAD_UP = [
  '................',
  '.....oooooo.....',
  '....ohhhhhho....',
  '...ohhhhhhhho...',
  '...ohhhhhhhho...',
  '...ohhhhhhhho...',
  '...ohhhhhhhho...',
  '...ohhhhhhhho...',
  '....ossssssо....',
];
const BODY_FRONT = [
  '...occccccccо...',
  '..osccccccccso..',
  '..osccccccccso..',
  '...occccccccо...',
  '...oppppppppo...',
];
const LEGS_FRONT = [
  ['...oppo..oppo...', '...offo..offo...'],
  ['...oppo..oppo...', '...offo...oo....'],
  ['...oppo..oppo...', '....oo...offo...'],
];
const HEAD_SIDE = [
  '................',
  '.....ooooo......',
  '....ohhhhho.....',
  '...ohhhhhhho....',
  '...ohhhhhhho....',
  '...osshhhhho....',
  '...oeshhhhho....',
  '...osssshhho....',
  '....osssso......',
];
const BODY_SIDE = [
  '....occccco.....',
  '....occccco.....',
  '....occscco.....',
  '....occccco.....',
  '....opppppo.....',
];
const LEGS_SIDE = [
  ['....oppppo......', '....offffo......'],
  ['...oppo.oppo....', '...offo.offo....'],
  ['....oppppo......', '....offffo......'],
];

function fix(rows: string[]) {
  // normaliza caracteres "o" acentuados/cirílicos que possam ter entrado
  return rows.map((r) => r.replace(/[оᴏ]/g, 'o'));
}

export type PersonSprites = Record<Dir, HTMLCanvasElement[]>;
const cache = new Map<string, PersonSprites>();

export function personSprites(look: Look): PersonSprites {
  const key = JSON.stringify(look);
  const hit = cache.get(key);
  if (hit) return hit;
  const pal: Record<string, string> = {
    o: '#303038',
    h: look.hair,
    s: look.skin ?? '#f8c8a0',
    e: '#202028',
    c: look.shirt,
    p: look.pants,
    f: look.shoes ?? '#484050',
    w: '#ffffff',
  };
  const build = (head: string[], body: string[], legs: string[], flip: boolean) =>
    spriteFromRows(fix([...head, ...body, ...legs]).map((r) => r.padEnd(16, '.').slice(0, 16)), pal, flip);
  const withHat = (cv: HTMLCanvasElement, dir: Dir) => {
    if (!look.hat) return cv;
    const x = cv.getContext('2d')!;
    // boné: aba na frente
    x.fillStyle = shade(look.hair, -0.25);
    if (dir === 'down') x.fillRect(4, 5, 8, 1);
    else if (dir === 'left') x.fillRect(2, 5, 4, 1);
    else if (dir === 'right') x.fillRect(10, 5, 4, 1);
    return cv;
  };
  const sp: PersonSprites = {
    down: LEGS_FRONT.map((l) => withHat(build(HEAD_DOWN, BODY_FRONT, l, false), 'down')),
    up: LEGS_FRONT.map((l) => withHat(build(HEAD_UP, BODY_FRONT, l, false), 'up')),
    left: LEGS_SIDE.map((l) => withHat(build(HEAD_SIDE, BODY_SIDE, l, false), 'left')),
    right: LEGS_SIDE.map((l) => withHat(build(HEAD_SIDE, BODY_SIDE, l, true), 'right')),
  };
  cache.set(key, sp);
  return sp;
}

/** cápsula de captura (item no chão / batalha): cápsula vertical com anel dourado */
export function capsuleSprite(top = '#38a8b8', size = 12): HTMLCanvasElement {
  const [c, x] = makeCanvas(size, size);
  const w = Math.max(6, Math.round(size * 0.66));
  const x0 = Math.floor((size - w) / 2);
  const mid = Math.floor(size / 2);
  const o = '#303038';
  for (let y = 0; y < size; y++) {
    // cantos arredondados
    const inset = y === 0 || y === size - 1 ? 2 : y === 1 || y === size - 2 ? 1 : 0;
    for (let i = x0 + inset; i < x0 + w - inset; i++) {
      const edge = i === x0 + inset || i === x0 + w - inset - 1 || y === 0 || y === size - 1;
      let col = y < mid ? top : '#f0ece0';
      if (y === mid - 1 || y === mid) col = '#e8b838';
      if (edge) col = o;
      x.fillStyle = col;
      x.fillRect(i, y, 1, 1);
    }
  }
  // brilho e gema
  x.fillStyle = shade(top, 0.45);
  x.fillRect(x0 + 2, 2, 1, Math.max(1, mid - 4));
  x.fillStyle = '#ffffff';
  x.fillRect(x0 + Math.floor(w / 2) - 1, mid - 1, 2, 2);
  return c;
}

export const LOOKS: Record<string, Look> = {
  player: { hair: '#c83838', shirt: '#3870c8', pants: '#383848', hat: true },
  rival: { hair: '#6a4a28', shirt: '#7848a8', pants: '#303040' },
  prof: { hair: '#c8c8c8', shirt: '#f0f0f0', pants: '#6a5a48' },
  mae: { hair: '#8a4a2a', shirt: '#e08898', pants: '#5868a8' },
  enfermeira: { hair: '#f08aa8', shirt: '#ffffff', pants: '#f0b0c0' },
  vendedor: { hair: '#303030', shirt: '#4898d8', pants: '#383848' },
  garoto: { hair: '#202020', shirt: '#e8a030', pants: '#3858a8', hat: true },
  garota: { hair: '#e8c040', shirt: '#e05878', pants: '#5868a8' },
  velho: { hair: '#e0e0e0', shirt: '#6a8a5a', pants: '#5a4a3a' },
  inseteiro: { hair: '#6a5a3a', shirt: '#a8c848', pants: '#6a5a3a', hat: true },
  alpinista: { hair: '#3a3a3a', shirt: '#a86a3a', pants: '#5a5a5a' },
  campista: { hair: '#c86a3a', shirt: '#48a868', pants: '#a88a5a' },
  lider: { hair: '#a8583a', shirt: '#8a7a6a', pants: '#4a4038' },
  pescador: { hair: '#5a5a7a', shirt: '#3a7a9a', pants: '#3a3a4a', hat: true },
  moca: { hair: '#2a2a3a', shirt: '#58b8a8', pants: '#e0e0e0' },
  operario: { hair: '#e8c030', shirt: '#e88830', pants: '#3a4a6a', hat: true },
};
