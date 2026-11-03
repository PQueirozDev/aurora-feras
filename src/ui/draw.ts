import { ctx, rect, text } from '../engine/screen';

/** caixa de janela estilo portátil clássico */
export function box(x: number, y: number, w: number, h: number, style: 'normal' | 'azul' | 'escuro' = 'normal') {
  const border = style === 'azul' ? '#3858a8' : style === 'escuro' ? '#282830' : '#486890';
  const inner = style === 'escuro' ? '#383848' : '#f8f8f8';
  const mid = style === 'azul' ? '#88a8e0' : style === 'escuro' ? '#585868' : '#a8c0d8';
  rect(x + 1, y, w - 2, h, border);
  rect(x, y + 1, w, h - 2, border);
  rect(x + 1, y + 1, w - 2, h - 2, mid);
  rect(x + 3, y + 3, w - 6, h - 6, inner);
}

export function cursor(x: number, y: number, color = '#383840') {
  ctx.fillStyle = color;
  for (let i = 0; i < 4; i++) ctx.fillRect(x + i, y + i, 1, 7 - i * 2);
}

export function arrowDown(x: number, y: number, t: number) {
  const o = Math.floor(t / 15) % 2;
  ctx.fillStyle = '#e04848';
  for (let i = 0; i < 4; i++) ctx.fillRect(x + i, y + o + i, 7 - i * 2, 1);
}

export function hpBar(x: number, y: number, w: number, frac: number) {
  frac = Math.max(0, Math.min(1, frac));
  rect(x, y, w + 14, 5, '#404848');
  text('PV', x + 1, y - 2.5, { size: 7, color: '#f8b030', shadow: null, bold: true });
  rect(x + 13, y + 1, w, 3, '#506058');
  const col = frac > 0.5 ? '#58d080' : frac > 0.2 ? '#f8c838' : '#f05848';
  rect(x + 13, y + 1, Math.ceil(w * frac), 3, col);
}

export function xpBar(x: number, y: number, w: number, frac: number) {
  frac = Math.max(0, Math.min(1, frac));
  rect(x, y, w, 3, '#404848');
  rect(x + 1, y + 1, w - 2, 1, '#506058');
  rect(x + 1, y + 1, Math.floor((w - 2) * frac), 1, '#48a8f8');
}

export function typeBadge(tipo: string, x: number, y: number, color: string) {
  rect(x, y, 36, 9, color);
  rect(x, y + 8, 36, 1, 'rgba(0,0,0,0.3)');
  text(tipo.toUpperCase(), x + 18, y + 0.5, { size: 7, color: '#ffffff', shadow: 'rgba(0,0,0,0.4)', align: 'center', bold: true });
}

export const STATUS_TXT: Record<string, [string, string]> = {
  brn: ['QUE', '#e86838'],
  psn: ['ENV', '#a050a0'],
  par: ['PAR', '#d8b820'],
  slp: ['DOR', '#8888a0'],
};
export function statusBadge(s: string | null, x: number, y: number) {
  if (!s) return;
  const [t, c] = STATUS_TXT[s];
  rect(x, y, 18, 8, c);
  text(t, x + 9, y, { size: 7, color: '#fff', shadow: null, align: 'center', bold: true });
}
