import { makeCanvas, shade } from './pixel';

export const TS = 16;

/** Tiles: caractere -> propriedades */
export const SOLID = new Set(['T', '~', 'f', 'S', 'R', 'B', 'O', 'Y', 'C', 'M', 'W', 'w', 'r', '#', 'c', 'p', 'h', 'b', 't', 'k', 'x', 'v', '0', 'q', 'X', 'Q']);
export const OUTDOOR_GROUND = '.';

function rnd(x: number, y: number, k = 0) {
  let n = x * 374761393 + y * 668265263 + k * 2147483647;
  n = (n ^ (n >>> 13)) * 1274126177;
  return ((n ^ (n >>> 16)) >>> 0) / 4294967295;
}

const GRASS = '#88d070';
const GRASS_D = '#68b050';
const GRASS_L = '#a8e088';
const PATH = '#e8d098';
const PATH_D = '#d0b478';

type Get = (x: number, y: number) => string;

function px(c: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, col: string) {
  c.fillStyle = col;
  c.fillRect(x, y, w, h);
}

function grass(c: CanvasRenderingContext2D, X: number, Y: number, tx: number, ty: number) {
  px(c, X, Y, 16, 16, GRASS);
  for (let i = 0; i < 5; i++) {
    const a = Math.floor(rnd(tx, ty, i) * 14) + 1, b = Math.floor(rnd(tx, ty, i + 9) * 14) + 1;
    px(c, X + a, Y + b, 1, 2, GRASS_D);
    px(c, X + a + 1, Y + b, 1, 1, GRASS_D);
  }
  if (rnd(tx, ty, 77) > 0.7) px(c, X + Math.floor(rnd(tx, ty, 3) * 12) + 2, Y + Math.floor(rnd(tx, ty, 4) * 12) + 2, 1, 1, GRASS_L);
}

function path(c: CanvasRenderingContext2D, X: number, Y: number, tx: number, ty: number, get: Get) {
  px(c, X, Y, 16, 16, PATH);
  for (let i = 0; i < 4; i++) {
    px(c, X + Math.floor(rnd(tx, ty, i) * 15), Y + Math.floor(rnd(tx, ty, i + 5) * 15), 1, 1, PATH_D);
  }
  // borda suave com a grama
  const isG = (ch: string) => ch === '.' || ch === '"' || ch === '*' || ch === 'T' || ch === 'L' || ch === 'S' || ch === 'f' || ch === 'r';
  if (isG(get(tx, ty - 1))) px(c, X, Y, 16, 1, GRASS_D);
  if (isG(get(tx, ty + 1))) px(c, X, Y + 15, 16, 1, PATH_D);
  if (isG(get(tx - 1, ty))) px(c, X, Y, 1, 16, PATH_D);
  if (isG(get(tx + 1, ty))) px(c, X + 15, Y, 1, 16, PATH_D);
}

function tree(c: CanvasRenderingContext2D, X: number, Y: number) {
  px(c, X, Y, 16, 16, GRASS);
  // tronco
  px(c, X + 6, Y + 11, 4, 4, '#8a5a30');
  px(c, X + 6, Y + 11, 1, 4, '#6a4020');
  // copa
  const g1 = '#3a8a40', g2 = '#2a6a30', g3 = '#58a858', o = '#1a4020';
  px(c, X + 3, Y + 1, 10, 1, o);
  px(c, X + 2, Y + 2, 12, 1, o);
  px(c, X + 1, Y + 3, 14, 8, o);
  px(c, X + 2, Y + 11, 3, 1, o); px(c, X + 11, Y + 11, 3, 1, o);
  px(c, X + 3, Y + 2, 10, 1, g1);
  px(c, X + 2, Y + 3, 12, 7, g1);
  px(c, X + 3, Y + 10, 10, 1, g2);
  px(c, X + 2, Y + 8, 12, 2, g2);
  px(c, X + 4, Y + 3, 4, 2, g3);
  px(c, X + 3, Y + 5, 2, 1, g3);
  px(c, X + 9, Y + 6, 3, 1, g2);
  px(c, X + 5, Y + 7, 2, 1, g2);
}

function tallGrass(c: CanvasRenderingContext2D, X: number, Y: number) {
  px(c, X, Y, 16, 16, GRASS);
  const d = '#2f8a3a', m = '#48a848', l = '#70c860';
  for (let i = 0; i < 2; i++) for (let j = 0; j < 2; j++) {
    const x = X + i * 8, y = Y + j * 8;
    px(c, x + 1, y + 2, 6, 6, m);
    px(c, x + 1, y + 1, 1, 2, l); px(c, x + 3, y, 1, 3, l); px(c, x + 5, y + 1, 1, 2, l);
    px(c, x + 2, y + 1, 1, 2, m); px(c, x + 4, y + 1, 1, 2, m); px(c, x + 6, y + 2, 1, 1, l);
    px(c, x + 1, y + 6, 6, 2, d);
    px(c, x + 2, y + 4, 1, 2, d); px(c, x + 5, y + 4, 1, 2, d);
  }
}

/** parte de cima da grama alta, desenhada por cima das pernas do personagem */
export const tallGrassOverlay = (() => {
  const [cv, c] = makeCanvas(16, 8);
  const d = '#2f8a3a', m = '#48a848', l = '#70c860';
  for (let i = 0; i < 2; i++) {
    const x = i * 8;
    px(c, x + 1, 1, 6, 5, m);
    px(c, x + 1, 0, 1, 2, l); px(c, x + 3, 0, 1, 2, l); px(c, x + 5, 0, 1, 2, l);
    px(c, x + 1, 5, 6, 3, d);
  }
  return cv;
})();

function water(c: CanvasRenderingContext2D, X: number, Y: number, tx: number, ty: number, get: Get, frame: number) {
  px(c, X, Y, 16, 16, '#4890e0');
  const w = '#78b8f8';
  const o = (frame + tx + ty) % 2 ? 2 : 0;
  px(c, X + 2 + o, Y + 4, 4, 1, w); px(c, X + 9 - o, Y + 10, 4, 1, w);
  px(c, X + 1 + o, Y + 5, 1, 1, w); px(c, X + 8 - o, Y + 11, 1, 1, w);
  const land = (ch: string) => ch !== '~' && ch !== '';
  if (land(get(tx, ty - 1))) { px(c, X, Y, 16, 2, '#e8e0c0'); px(c, X, Y + 2, 16, 1, '#b8d8f8'); }
  if (land(get(tx - 1, ty))) px(c, X, Y, 1, 16, '#3070c0');
  if (land(get(tx + 1, ty))) px(c, X + 15, Y, 1, 16, '#3070c0');
}

function flowers(c: CanvasRenderingContext2D, X: number, Y: number, frame: number) {
  px(c, X, Y, 16, 16, GRASS);
  const cols = ['#f05868', '#f8f8f8'];
  const pos = [[3, 3], [10, 2], [6, 9], [12, 11], [2, 12]];
  pos.forEach(([a, b], i) => {
    const col = cols[i % 2];
    const o = frame % 2 && i % 2 ? 1 : 0;
    px(c, X + a, Y + b - o, 3, 1, col);
    px(c, X + a + 1, Y + b - 1 - o, 1, 3, col);
    px(c, X + a + 1, Y + b - o, 1, 1, '#f8d838');
  });
}

function fence(c: CanvasRenderingContext2D, X: number, Y: number, get: Get, tx: number, ty: number) {
  px(c, X, Y, 16, 16, GRASS);
  const w = '#c89058', d = '#8a5a30';
  px(c, X, Y + 5, 16, 2, w); px(c, X, Y + 10, 16, 2, w);
  px(c, X, Y + 7, 16, 1, d); px(c, X, Y + 12, 16, 1, d);
  px(c, X + 2, Y + 2, 4, 12, w); px(c, X + 10, Y + 2, 4, 12, w);
  px(c, X + 5, Y + 2, 1, 12, d); px(c, X + 13, Y + 2, 1, 12, d);
  px(c, X + 2, Y + 14, 4, 1, d); px(c, X + 10, Y + 14, 4, 1, d);
  void get; void tx; void ty;
}

function sign(c: CanvasRenderingContext2D, X: number, Y: number) {
  px(c, X, Y, 16, 16, GRASS);
  px(c, X + 7, Y + 10, 2, 5, '#6a4020');
  px(c, X + 2, Y + 2, 12, 9, '#5a3818');
  px(c, X + 3, Y + 3, 10, 7, '#c89058');
  px(c, X + 4, Y + 5, 8, 1, '#8a5a30'); px(c, X + 4, Y + 7, 6, 1, '#8a5a30');
}

function rock(c: CanvasRenderingContext2D, X: number, Y: number) {
  px(c, X, Y, 16, 16, GRASS);
  rockOn(c, X, Y);
}
function rockOn(c: CanvasRenderingContext2D, X: number, Y: number) {
  px(c, X + 2, Y + 4, 12, 11, '#404048');
  px(c, X + 3, Y + 3, 10, 11, '#909098');
  px(c, X + 3, Y + 11, 10, 3, '#686870');
  px(c, X + 4, Y + 4, 4, 2, '#c0c0c8');
}

function ledge(c: CanvasRenderingContext2D, X: number, Y: number) {
  px(c, X, Y, 16, 16, GRASS);
  px(c, X, Y + 10, 16, 3, '#a87838');
  px(c, X, Y + 13, 16, 1, '#6a4818');
  px(c, X, Y + 9, 16, 1, GRASS_D);
}

const ROOFS: Record<string, string> = { R: '#d85048', B: '#4878d0', O: '#e08838', Y: '#8a5aa8', C: '#e05868', M: '#4898d8', X: '#8a8a98' };

function roof(c: CanvasRenderingContext2D, X: number, Y: number, ch: string, get: Get, tx: number, ty: number) {
  const base = ROOFS[ch];
  const same = (a: string) => a === ch;
  px(c, X, Y, 16, 16, base);
  for (let i = 0; i < 4; i++) px(c, X, Y + i * 4 + 3, 16, 1, shade(base, -0.18));
  if (!same(get(tx, ty - 1))) { px(c, X, Y, 16, 2, shade(base, 0.3)); }
  if (!same(get(tx, ty + 1))) { px(c, X, Y + 13, 16, 3, shade(base, -0.4)); }
  if (!same(get(tx - 1, ty))) px(c, X, Y, 2, 16, shade(base, -0.35));
  if (!same(get(tx + 1, ty))) px(c, X + 14, Y, 2, 16, shade(base, -0.35));
  // símbolo do Centro (C) e da Loja (M) no meio do telhado
  if ((ch === 'C' || ch === 'M') && !same(get(tx, ty + 1))) {
    // desenha apenas no tile central da última fileira
    let l = tx; while (same(get(l - 1, ty))) l--;
    let r = tx; while (same(get(r + 1, ty))) r++;
    if (tx === Math.floor((l + r) / 2)) {
      px(c, X + 3, Y + 2, 10, 10, '#f8f8f8');
      px(c, X + 4, Y + 3, 8, 8, ch === 'C' ? '#e05868' : '#3878c8');
      if (ch === 'C') { px(c, X + 7, Y + 4, 2, 6, '#fff'); px(c, X + 5, Y + 6, 6, 2, '#fff'); }
      else { px(c, X + 5, Y + 4, 1, 6, '#fff'); px(c, X + 10, Y + 4, 1, 6, '#fff'); px(c, X + 6, Y + 5, 1, 2, '#fff'); px(c, X + 9, Y + 5, 1, 2, '#fff'); px(c, X + 7, Y + 7, 2, 1, '#fff'); }
    }
  }
}

function wall(c: CanvasRenderingContext2D, X: number, Y: number, ch: string, get: Get, tx: number, ty: number) {
  px(c, X, Y, 16, 16, '#f0e0c0');
  px(c, X, Y, 16, 1, '#c8b088');
  px(c, X, Y + 14, 16, 2, '#a89068');
  const isWall = (a: string) => a === 'W' || a === 'w' || a === 'D';
  if (!isWall(get(tx - 1, ty))) px(c, X, Y, 1, 16, '#a89068');
  if (!isWall(get(tx + 1, ty))) px(c, X + 15, Y, 1, 16, '#a89068');
  if (ch === 'w') {
    px(c, X + 3, Y + 3, 10, 8, '#584838');
    px(c, X + 4, Y + 4, 8, 6, '#88c8f0');
    px(c, X + 4, Y + 4, 3, 2, '#c8e8ff');
    px(c, X + 7, Y + 4, 1, 6, '#584838');
  }
}

function door(c: CanvasRenderingContext2D, X: number, Y: number) {
  px(c, X, Y, 16, 16, '#f0e0c0');
  px(c, X + 2, Y + 1, 12, 15, '#584838');
  px(c, X + 3, Y + 2, 10, 14, '#8a6038');
  px(c, X + 3, Y + 2, 10, 2, '#a87848');
  px(c, X + 10, Y + 9, 2, 2, '#f8d838');
}

// ---------- interiores ----------
function floor(c: CanvasRenderingContext2D, X: number, Y: number, tx: number, ty: number) {
  px(c, X, Y, 16, 16, '#d8b080');
  px(c, X, Y + 7, 16, 1, '#b89060');
  px(c, X, Y + 15, 16, 1, '#b89060');
  const o = ty % 2 ? 8 : 0;
  px(c, X + ((4 + o) % 16), Y, 1, 7, '#b89060');
  px(c, X + ((12 + o) % 16), Y + 8, 1, 7, '#b89060');
  void tx;
}

function iwall(c: CanvasRenderingContext2D, X: number, Y: number, get: Get, tx: number, ty: number) {
  const below = get(tx, ty + 1);
  if (below !== '#' && below !== '0' && below !== '') {
    px(c, X, Y, 16, 16, '#e8e0d0');
    for (let i = 0; i < 4; i++) px(c, X + i * 4 + 1, Y, 1, 13, '#d8ccb8');
    px(c, X, Y + 13, 16, 3, '#8a7058');
  } else {
    px(c, X, Y, 16, 16, '#3a3040');
    px(c, X, Y + 15, 16, 1, '#5a4a58');
  }
}

function furniture(c: CanvasRenderingContext2D, X: number, Y: number, ch: string, tx: number, ty: number, get: Get, frame: number) {
  floor(c, X, Y, tx, ty);
  switch (ch) {
    case 'c': // balcão
      px(c, X, Y + 2, 16, 13, '#8a5a38');
      px(c, X, Y + 2, 16, 4, '#c88a58');
      px(c, X, Y + 14, 16, 1, '#5a3a20');
      break;
    case 'p': // computador
      px(c, X + 1, Y + 6, 14, 9, '#a0a0a8');
      px(c, X + 2, Y + 1, 12, 9, '#505860');
      px(c, X + 3, Y + 2, 10, 6, frame % 2 ? '#58c8a8' : '#48b898');
      px(c, X + 4, Y + 3, 4, 1, '#c8f8e8');
      px(c, X + 3, Y + 11, 10, 2, '#d0d0d8');
      break;
    case 'h': // máquina de cura
      px(c, X + 1, Y + 2, 14, 13, '#c8c8d0');
      px(c, X + 1, Y + 2, 14, 2, '#e8e8f0');
      for (let i = 0; i < 3; i++) { px(c, X + 2 + i * 4, Y + 6, 3, 3, '#e04848'); px(c, X + 2 + i * 4, Y + 10, 3, 3, '#e04848'); }
      break;
    case 'b': // estante
      px(c, X, Y, 16, 16, '#6a4020');
      for (let i = 0; i < 3; i++) {
        px(c, X + 1, Y + 1 + i * 5, 14, 4, '#3a2410');
        const cols = ['#d84848', '#4878d0', '#48a858', '#e8c040'];
        for (let j = 0; j < 5; j++) px(c, X + 2 + j * 3, Y + 1 + i * 5, 2, 4, cols[(j + i + tx) % 4]);
      }
      break;
    case 't': // mesa
      px(c, X, Y + 3, 16, 9, '#c88a58');
      px(c, X, Y + 3, 16, 2, '#e8aa78');
      px(c, X, Y + 12, 16, 1, '#6a4020');
      if (get(tx - 1, ty) !== 't') px(c, X + 1, Y + 12, 2, 3, '#6a4020');
      if (get(tx + 1, ty) !== 't') px(c, X + 13, Y + 12, 2, 3, '#6a4020');
      break;
    case 'k': // cama
      px(c, X + 1, Y, 14, 16, '#6a4020');
      px(c, X + 2, Y + 1, 12, 14, '#f0f0f8');
      px(c, X + 2, Y + 6, 12, 9, '#4878d0');
      px(c, X + 3, Y + 2, 10, 3, '#ffffff');
      break;
    case 'x': // vaso de planta
      px(c, X + 4, Y + 10, 8, 5, '#b85a38');
      px(c, X + 3, Y + 2, 10, 9, '#3a8a40');
      px(c, X + 5, Y + 3, 3, 3, '#58b858');
      break;
    case 'v': // TV
      px(c, X + 1, Y + 3, 14, 10, '#383840');
      px(c, X + 2, Y + 4, 12, 8, frame % 2 ? '#7898c8' : '#6888b8');
      px(c, X + 3, Y + 13, 10, 2, '#6a4020');
      break;
    case 'q': // estátua do ginásio
      px(c, X + 3, Y + 11, 10, 4, '#707078');
      px(c, X + 5, Y + 2, 6, 10, '#a8a8b0');
      px(c, X + 6, Y + 1, 4, 3, '#c8c8d0');
      break;
  }
}

function mat(c: CanvasRenderingContext2D, X: number, Y: number, tx: number, ty: number) {
  floor(c, X, Y, tx, ty);
  px(c, X + 1, Y + 2, 14, 12, '#c84848');
  px(c, X + 2, Y + 3, 12, 10, '#e06060');
}

function gymFloor(c: CanvasRenderingContext2D, X: number, Y: number, tx: number, ty: number) {
  px(c, X, Y, 16, 16, '#b0a898');
  px(c, X, Y, 16, 1, '#c8c0b0'); px(c, X, Y, 1, 16, '#c8c0b0');
  px(c, X + 15, Y, 1, 16, '#908878'); px(c, X, Y + 15, 16, 1, '#908878');
  if (rnd(tx, ty) > 0.6) px(c, X + 5, Y + 6, 3, 2, '#9a9080');
}

export function paintTile(c: CanvasRenderingContext2D, ch: string, X: number, Y: number, tx: number, ty: number, get: Get, frame = 0) {
  switch (ch) {
    case '.': grass(c, X, Y, tx, ty); break;
    case ',': path(c, X, Y, tx, ty, get); break;
    case '"': tallGrass(c, X, Y); break;
    case 'T': tree(c, X, Y); break;
    case '~': water(c, X, Y, tx, ty, get, frame); break;
    case '*': flowers(c, X, Y, frame); break;
    case 'f': fence(c, X, Y, get, tx, ty); break;
    case 'S': sign(c, X, Y); break;
    case 'r': rock(c, X, Y); break;
    case 'L': ledge(c, X, Y); break;
    case 'R': case 'B': case 'O': case 'Y': case 'C': case 'M': case 'X': roof(c, X, Y, ch, get, tx, ty); break;
    case 'W': case 'w': wall(c, X, Y, ch, get, tx, ty); break;
    case 'D': door(c, X, Y); break;
    case '_': floor(c, X, Y, tx, ty); break;
    case '#': iwall(c, X, Y, get, tx, ty); break;
    case 'm': mat(c, X, Y, tx, ty); break;
    case 'g': gymFloor(c, X, Y, tx, ty); break;
    case 'Q': gymFloor(c, X, Y, tx, ty); rockOn(c, X, Y); break;
    case 'c': case 'p': case 'h': case 'b': case 't': case 'k': case 'x': case 'v': case 'q':
      furniture(c, X, Y, ch, tx, ty, get, frame); break;
    case '0': default: px(c, X, Y, 16, 16, '#000000');
  }
}

export const ANIMATED = new Set(['~', '*', 'p', 'v']);
