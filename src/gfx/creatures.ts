import { PixelGrid, shade, makeCanvas } from './pixel';
import { SPECIES, type Aparencia, type Detalhe } from '../data/species';

export const SPR = 48;
type Pt = [number, number];
type Anchors = { headTop: Pt; ears: [Pt, Pt]; tail: Pt; eyes: [Pt, Pt]; mouth: Pt | null; back?: Pt };

const FLAME = '#f86830';
const LEAF = '#48b048';

function draw(look: Aparencia, back: boolean): PixelGrid {
  const g = new PixelGrid(SPR, SPR);
  const s = look.tam;
  const T = (x: number, y: number): Pt => [24 + (x - 24) * s, 45 - (45 - y) * s];
  const E = (x: number, y: number, rx: number, ry: number, c: string, shaded = true) => {
    const [a, b] = T(x, y);
    g.ellipse(a, b, Math.max(1, rx * s), Math.max(1, ry * s), c, shaded);
  };
  const P = (pts: Pt[], c: string) => g.poly(pts.map(([x, y]) => T(x, y)), c);
  const R = (x: number, y: number, w: number, h: number, c: string) => {
    const [a, b] = T(x, y);
    g.rect(Math.round(a), Math.round(b), Math.max(1, Math.round(w * s)), Math.max(1, Math.round(h * s)), c);
  };
  const { c1, c2, c3 } = look;
  const d1 = shade(c1, -0.25);
  const has = (d: Detalhe) => look.detalhes.includes(d);

  // ---- detalhes "atrás" do corpo ----
  const behind = (a: Anchors) => {
    const [tx, ty] = a.tail;
    if (has('cauda') || has('caudaFogo') || has('caudaFolha')) {
      P([[tx - 2, ty + 2], [tx + 7, ty - 7], [tx + 10, ty - 5], [tx + 2, ty + 4]], d1);
      if (has('caudaFogo')) {
        P([[tx + 4, ty - 6], [tx + 7, ty - 17], [tx + 9, ty - 11], [tx + 12, ty - 15], [tx + 13, ty - 5]], FLAME);
        P([[tx + 7, ty - 6], [tx + 8, ty - 12], [tx + 11, ty - 6]], c3);
      }
      if (has('caudaFolha')) P([[tx + 6, ty - 6], [tx + 14, ty - 15], [tx + 15, ty - 6], [tx + 10, ty - 3]], LEAF);
    }
    if (has('caudaRaio')) {
      P([[tx - 2, ty + 2], [tx + 5, ty - 3], [tx + 3, ty - 6], [tx + 10, ty - 13], [tx + 13, ty - 11], [tx + 8, ty - 6], [tx + 11, ty - 3], [tx + 1, ty + 4]], shade(c1, -0.1));
    }
    if (has('orelhas')) {
      for (const [ex, ey] of a.ears) {
        P([[ex - 5, ey + 5], [ex, ey - 7], [ex + 5, ey + 5]], c1);
        P([[ex - 2, ey + 4], [ex, ey - 3], [ex + 2, ey + 4]], c3 === '#383848' ? '#383848' : shade(c1, 0.35));
      }
    }
    if (has('orelhasLongas')) {
      for (const [ex, ey] of a.ears) {
        E(ex, ey - 7, 3, 10, c1);
        if (!back) E(ex, ey - 6, 1.5, 7, c3, false);
      }
    }
  };

  // ---- detalhes "na frente" ----
  const front = (a: Anchors) => {
    const [hx, hy] = a.headTop;
    if (has('chamas')) {
      P([[hx - 7, hy + 4], [hx - 4, hy - 7], [hx - 1, hy], [hx + 1, hy - 11], [hx + 4, hy], [hx + 7, hy - 7], [hx + 7, hy + 4]], FLAME);
      P([[hx - 3, hy + 3], [hx, hy - 5], [hx + 3, hy + 3]], c3);
    }
    if (has('folhas')) {
      P([[hx, hy + 2], [hx - 8, hy - 5], [hx - 2, hy - 12], [hx + 2, hy - 3]], LEAF);
      P([[hx + 1, hy + 2], [hx + 7, hy - 6], [hx + 5, hy + 1]], shade(LEAF, -0.2));
      if (look.tam >= 1) { E(hx + 6, hy - 6, 2.5, 2.5, c3, false); E(hx + 6, hy - 6, 1, 1, '#f8f0a0', false); }
    }
    if (has('barbatana')) P([[hx - 5, hy + 4], [hx + 3, hy - 8], [hx + 6, hy + 4]], c3);
    if (has('chifre')) P([[hx - 2, hy + 3], [hx, hy - 7], [hx + 2, hy + 3]], '#f0e8d0');
    if (has('crista')) {
      for (let i = -1; i <= 1; i++) P([[hx + i * 3 - 2, hy + 3], [hx + i * 4, hy - 6 + Math.abs(i) * 2], [hx + i * 3 + 2, hy + 3]], c3);
    }
    if (has('antenas')) {
      for (const sx of [-1, 1]) {
        for (let i = 0; i < 8; i++) R(hx + sx * (2 + i * 0.8), hy - i, 1, 1, '#383040');
        E(hx + sx * 8.5, hy - 9, 2, 2, c3, false);
      }
    }
    if (has('espinhos')) {
      const [bx, by] = a.back ?? a.headTop;
      for (let i = -1; i <= 1; i++) P([[bx + i * 7 - 3, by + 3], [bx + i * 7, by - 5], [bx + i * 7 + 3, by + 3]], c3);
    }
  };

  const eyes = (a: Anchors) => {
    if (back) return;
    for (const [ex, ey] of a.eyes) {
      const [x, y] = T(ex, ey);
      const X = Math.round(x), Y = Math.round(y);
      if (look.olho === 'fofo') {
        g.rect(X - 1, Y - 2, 3, 4, '#202028');
        g.set(X - 1, Y - 2, '#ffffff'); g.set(X, Y - 2, '#ffffff');
      } else if (look.olho === 'bravo') {
        g.rect(X - 1, Y - 1, 3, 3, '#202028');
        g.set(X - 1, Y - 1, '#ffffff');
        // sobrancelha inclinada
        const toCenter = ex < 24 ? 1 : -1;
        g.set(X - 2 * toCenter, Y - 3, '#202028'); g.set(X - toCenter, Y - 3, '#202028'); g.set(X, Y - 2, '#202028'); g.set(X + toCenter, Y - 2, '#202028');
      } else {
        g.rect(X - 1, Y - 2, 2, 3, '#202028');
        g.set(X - 1, Y - 2, '#ffffff');
      }
    }
    if (a.mouth) {
      const [mx, my] = T(a.mouth[0], a.mouth[1]);
      g.rect(Math.round(mx) - 1, Math.round(my), 3, 1, shade(c1, -0.6));
    }
  };

  let a: Anchors;
  switch (look.corpo) {
    case 'bipede':
      a = { headTop: [24, 8], ears: [[16, 10], [32, 10]], tail: [34, 38], eyes: [[19, 17], [29, 17]], mouth: [24, 22] };
      behind(a);
      E(17, 43, 5, 3, d1); E(31, 43, 5, 3, d1);
      E(24, 33, 11, 11, c1);
      if (!back) E(24, 35, 7, 7, c2);
      E(13, 31, 3, 5, c1); E(35, 31, 3, 5, c1);
      E(24, 18, 11, 10, c1);
      break;
    case 'quadrupede':
      a = { headTop: [14, 13], ears: [[8, 15], [19, 14]], tail: [39, 31], eyes: [[10, 21], [17, 21]], mouth: [9, 27], back: [29, 24] };
      behind(a);
      for (const lx of [12, 19, 30, 37]) R(lx - 2, 36, 5, 8, d1);
      E(27, 33, 14, 9, c1);
      if (!back) E(26, 37, 9, 4, c2);
      E(14, 22, 10, 9, c1);
      if (!back) E(9, 26, 4, 3, c2);
      break;
    case 'redondo':
      a = { headTop: [24, 16], ears: [[17, 19], [31, 19]], tail: [37, 37], eyes: [[18, 27], [30, 27]], mouth: [24, 32] };
      behind(a);
      E(16, 43, 5, 3, d1); E(32, 43, 5, 3, d1);
      E(24, 30, 15, 14, c1);
      if (!back) E(24, 35, 9, 7, c2);
      break;
    case 'ave':
      a = { headTop: [17, 10], ears: [[13, 12], [21, 12]], tail: [36, 30], eyes: [[13, 17], [19, 17]], mouth: null };
      R(20, 39, 2, 6, '#e8a030'); R(27, 39, 2, 6, '#e8a030');
      P([[33, 29], [46, 23], [46, 37], [33, 36]], d1);
      if (has('cauda')) P([[33, 31], [46, 31], [44, 40], [33, 37]], c3);
      E(26, 31, 12, 10, c1);
      if (!back) E(23, 34, 7, 6, c2);
      E(30, 29, 7, 6, d1);
      E(17, 18, 8, 8, c1);
      if (!back) P([[10, 17], [3, 20], [10, 23]], '#f0b030');
      break;
    case 'peixe':
      a = { headTop: [24, 16], ears: [[18, 18], [30, 18]], tail: [38, 30], eyes: [[13, 25], [19, 25]], mouth: [9, 31] };
      P([[35, 29], [46, 19], [46, 41]], d1);
      P([[16, 21], [25, 11], [31, 21]], c3 === '#f8f8f8' ? d1 : c3);
      E(24, 30, 15, 11, c1);
      if (!back) E(21, 34, 10, 5, c2);
      E(26, 36, 4, 3, d1);
      break;
    case 'larva':
      a = { headTop: [13, 22], ears: [[9, 24], [17, 24]], tail: [38, 38], eyes: [[10, 30], [16, 30]], mouth: [12, 35] };
      for (const lx of [22, 27, 32, 37]) R(lx, 42, 2, 3, c3);
      E(36, 39, 6, 5, c1);
      if (!back) E(36, 41, 4, 2, c2, false);
      E(26, 37, 7, 7, c1);
      if (!back) E(26, 40, 5, 3, c2, false);
      E(13, 31, 9, 9, c1);
      break;
    case 'borboleta':
      a = { headTop: [24, 10], ears: [[20, 12], [28, 12]], tail: [24, 40], eyes: [[21, 16], [27, 16]], mouth: null };
      E(13, 21, 11, 10, c1); E(35, 21, 11, 10, c1);
      E(15, 34, 8, 7, c3); E(33, 34, 8, 7, c3);
      E(13, 20, 4, 4, c2, false); E(35, 20, 4, 4, c2, false);
      E(24, 30, 4, 11, '#584868');
      E(24, 16, 6, 6, shade(c1, -0.35));
      break;
    case 'pedra':
    default:
      a = { headTop: [24, 11], ears: [[16, 14], [32, 14]], tail: [40, 36], eyes: [[18, 25], [30, 25]], mouth: [24, 31], back: [24, 12] };
      E(6, 32, 4, 5, c3); E(42, 32, 4, 5, c3);
      P([[8, 41], [6, 28], [12, 16], [24, 10], [36, 14], [42, 26], [40, 41], [30, 45], [16, 45]], c1);
      P([[42, 26], [40, 41], [30, 45], [22, 45], [34, 36]], shade(c1, -0.25));
      P([[12, 18], [22, 13], [16, 22]], c2);
      R(33, 18, 1, 5, shade(c1, -0.45)); R(34, 22, 1, 3, shade(c1, -0.45));
      R(12, 33, 4, 1, shade(c1, -0.45));
      break;
  }
  front(a);
  eyes(a);
  g.outline(shade(c1, -0.7));
  return back ? g.mirror() : g;
}

/** grade de pixels da fera (usado também para gerar o ícone do app) */
export function creatureGrid(speciesKey: string, back = false) {
  return draw(SPECIES[speciesKey].look, back);
}

const cache = new Map<string, { front: HTMLCanvasElement; back: HTMLCanvasElement; icon: HTMLCanvasElement }>();

export function creatureSprites(speciesKey: string) {
  const hit = cache.get(speciesKey);
  if (hit) return hit;
  const sp = SPECIES[speciesKey];
  const front = draw(sp.look, false).toCanvas();
  const back = draw(sp.look, true).toCanvas();
  // ícone 24x24 (metade)
  const [icon, ix] = makeCanvas(24, 24);
  ix.imageSmoothingEnabled = false;
  ix.drawImage(front, 0, 0, 24, 24);
  const r = { front, back, icon };
  cache.set(speciesKey, r);
  return r;
}
