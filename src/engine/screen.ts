export const W = 240;
export const H = 160;

export let canvas: HTMLCanvasElement;
export let ctx: CanvasRenderingContext2D;
export let scale = 1;

export const FONT_FAMILY = '"Pixelify Sans", "Segoe UI", sans-serif';

export function initScreen() {
  canvas = document.getElementById('game') as HTMLCanvasElement;
  ctx = canvas.getContext('2d', { alpha: false })!;
  const resize = () => {
    const wrap = document.getElementById('screen-wrap')!;
    const dpr = window.devicePixelRatio || 1;
    const availW = wrap.clientWidth * dpr;
    const availH = wrap.clientHeight * dpr;
    // escala inteira para manter a pixel art perfeita
    scale = Math.max(1, Math.floor(Math.min(availW / W, availH / H)));
    canvas.width = W * scale;
    canvas.height = H * scale;
    canvas.style.width = `${(W * scale) / dpr}px`;
    canvas.style.height = `${(H * scale) / dpr}px`;
    ctx.imageSmoothingEnabled = false;
  };
  window.addEventListener('resize', resize);
  window.addEventListener('orientationchange', () => setTimeout(resize, 200));
  resize();
}

export function beginFrame() {
  ctx.setTransform(scale, 0, 0, scale, 0, 0);
  ctx.imageSmoothingEnabled = false;
  ctx.globalAlpha = 1;
}

// ---------- texto ----------
export type TextOpts = { color?: string; shadow?: string | null; size?: number; align?: CanvasTextAlign; bold?: boolean };

export function setFont(size = 10, bold = false) {
  ctx.font = `${bold ? 600 : 400} ${size}px ${FONT_FAMILY}`;
}

/** evita ligaduras da fonte (ex.: "fi" virando um símbolo) */
const noLig = (s: string) => s.replace(/f(?=[filtj])/g, 'f‌');

export function text(str: string, x: number, y: number, o: TextOpts = {}) {
  str = noLig(str);
  const size = o.size ?? 10;
  setFont(size, o.bold);
  ctx.textBaseline = 'top';
  ctx.textAlign = o.align ?? 'left';
  const shadow = o.shadow === undefined ? '#d0d0c8' : o.shadow;
  if (shadow) {
    ctx.fillStyle = shadow;
    ctx.fillText(str, x + 0.6, y + 0.6);
  }
  ctx.fillStyle = o.color ?? '#383840';
  ctx.fillText(str, x, y);
  ctx.textAlign = 'left';
}

export function measure(str: string, size = 10, bold = false) {
  setFont(size, bold);
  return ctx.measureText(noLig(str)).width;
}

/** quebra o texto em linhas que caibam em maxW */
export function wrap(str: string, maxW: number, size = 10): string[] {
  const out: string[] = [];
  for (const para of str.split('\n')) {
    const words = para.split(' ');
    let line = '';
    for (const w of words) {
      const t = line ? line + ' ' + w : w;
      if (measure(t, size) > maxW && line) { out.push(line); line = w; }
      else line = t;
    }
    out.push(line);
  }
  return out;
}

export function rect(x: number, y: number, w: number, h: number, c: string) {
  ctx.fillStyle = c;
  ctx.fillRect(x, y, w, h);
}
