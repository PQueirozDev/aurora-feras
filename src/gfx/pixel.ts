export function makeCanvas(w: number, h: number): [HTMLCanvasElement, CanvasRenderingContext2D] {
  const c = document.createElement('canvas');
  c.width = w;
  c.height = h;
  const x = c.getContext('2d')!;
  x.imageSmoothingEnabled = false;
  return [c, x];
}

export function hexToRgb(h: string): [number, number, number] {
  const n = parseInt(h.slice(1), 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}
export function rgbToHex(r: number, g: number, b: number) {
  const c = (v: number) => Math.max(0, Math.min(255, Math.round(v))).toString(16).padStart(2, '0');
  return `#${c(r)}${c(g)}${c(b)}`;
}
/** clareia (amt>0) ou escurece (amt<0) uma cor */
export function shade(h: string, amt: number) {
  const [r, g, b] = hexToRgb(h);
  if (amt >= 0) return rgbToHex(r + (255 - r) * amt, g + (255 - g) * amt, b + (255 - b) * amt);
  return rgbToHex(r * (1 + amt), g * (1 + amt), b * (1 + amt));
}

/** desenha um sprite definido por linhas de texto + paleta */
export function spriteFromRows(rows: string[], pal: Record<string, string>, flip = false): HTMLCanvasElement {
  const h = rows.length;
  const w = Math.max(...rows.map((r) => r.length));
  const [c, x] = makeCanvas(w, h);
  rows.forEach((row, y) => {
    for (let i = 0; i < row.length; i++) {
      const col = pal[row[i]];
      if (!col) continue;
      x.fillStyle = col;
      x.fillRect(flip ? w - 1 - i : i, y, 1, 1);
    }
  });
  return c;
}

/** Grade de pixels para desenhar criaturas sem antialiasing */
export class PixelGrid {
  px: (string | null)[];
  constructor(public w: number, public h: number) {
    this.px = new Array(w * h).fill(null);
  }
  set(x: number, y: number, c: string | null) {
    x = Math.round(x); y = Math.round(y);
    if (x < 0 || y < 0 || x >= this.w || y >= this.h) return;
    this.px[y * this.w + x] = c;
  }
  get(x: number, y: number) {
    if (x < 0 || y < 0 || x >= this.w || y >= this.h) return null;
    return this.px[y * this.w + x];
  }
  /** elipse com sombreamento: lado inferior-direito mais escuro, brilho no topo-esquerdo */
  ellipse(cx: number, cy: number, rx: number, ry: number, c: string, shaded = true) {
    const dark = shade(c, -0.22);
    const light = shade(c, 0.35);
    for (let y = Math.floor(cy - ry); y <= Math.ceil(cy + ry); y++) {
      for (let x = Math.floor(cx - rx); x <= Math.ceil(cx + rx); x++) {
        const nx = (x + 0.5 - cx) / rx;
        const ny = (y + 0.5 - cy) / ry;
        const d = nx * nx + ny * ny;
        if (d > 1) continue;
        let col = c;
        if (shaded) {
          if (nx * 0.55 + ny * 0.85 > 0.5) col = dark;
          else if (nx < -0.2 && ny < -0.35 && d > 0.3 && d < 0.7) col = light;
        }
        this.set(x, y, col);
      }
    }
  }
  rect(x0: number, y0: number, w: number, h: number, c: string) {
    for (let y = y0; y < y0 + h; y++) for (let x = x0; x < x0 + w; x++) this.set(x, y, c);
  }
  /** polígono preenchido */
  poly(pts: [number, number][], c: string) {
    const minY = Math.floor(Math.min(...pts.map((p) => p[1])));
    const maxY = Math.ceil(Math.max(...pts.map((p) => p[1])));
    const minX = Math.floor(Math.min(...pts.map((p) => p[0])));
    const maxX = Math.ceil(Math.max(...pts.map((p) => p[0])));
    for (let y = minY; y <= maxY; y++) {
      for (let x = minX; x <= maxX; x++) {
        if (inPoly(x + 0.5, y + 0.5, pts)) this.set(x, y, c);
      }
    }
  }
  /** contorno escuro em volta de tudo que foi desenhado */
  outline(c = '#282830') {
    const add: [number, number][] = [];
    for (let y = 0; y < this.h; y++) for (let x = 0; x < this.w; x++) {
      if (this.get(x, y)) continue;
      if (this.get(x + 1, y) || this.get(x - 1, y) || this.get(x, y + 1) || this.get(x, y - 1)) add.push([x, y]);
    }
    for (const [x, y] of add) this.set(x, y, c);
  }
  mirror() {
    const out = new PixelGrid(this.w, this.h);
    for (let y = 0; y < this.h; y++) for (let x = 0; x < this.w; x++) out.set(this.w - 1 - x, y, this.get(x, y));
    return out;
  }
  toCanvas(): HTMLCanvasElement {
    const [c, x] = makeCanvas(this.w, this.h);
    for (let y = 0; y < this.h; y++) for (let i = 0; i < this.w; i++) {
      const col = this.px[y * this.w + i];
      if (!col) continue;
      x.fillStyle = col;
      x.fillRect(i, y, 1, 1);
    }
    return c;
  }
}

function inPoly(x: number, y: number, pts: [number, number][]) {
  let inside = false;
  for (let i = 0, j = pts.length - 1; i < pts.length; j = i++) {
    const [xi, yi] = pts[i];
    const [xj, yj] = pts[j];
    if (yi > y !== yj > y && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi) inside = !inside;
  }
  return inside;
}

/** silhueta branca de um sprite (para efeitos de flash) */
export function silhouette(src: HTMLCanvasElement, color: string) {
  const [c, x] = makeCanvas(src.width, src.height);
  x.drawImage(src, 0, 0);
  x.globalCompositeOperation = 'source-in';
  x.fillStyle = color;
  x.fillRect(0, 0, c.width, c.height);
  return c;
}
