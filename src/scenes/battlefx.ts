// Efeitos visuais das batalhas: partículas por tipo de golpe, tremor de tela e escurecimento.
import { ctx, W, H } from '../engine/screen';
import type { Tipo } from '../data/types';

type Kind = 'dot' | 'rect' | 'leaf' | 'ring' | 'line' | 'arrow' | 'star' | 'bolt';
type P = {
  kind: Kind; x: number; y: number; vx: number; vy: number; g: number;
  life: number; max: number; size: number; color: string;
  // órbita (folhas / fantasma)
  orbit?: { cx: number; cy: number; r: number; a: number; va: number; vr: number };
  x2?: number; y2?: number; up?: boolean;
};

const R = (a: number, b: number) => a + Math.random() * (b - a);
const pick = <T,>(l: T[]) => l[Math.floor(Math.random() * l.length)];

export class Fx {
  parts: P[] = [];
  shakeT = 0;
  shakeMag = 0;
  darken = 0;
  flashT = 0;
  flashColor = '#fff';

  shake(frames: number, mag = 3) { this.shakeT = Math.max(this.shakeT, frames); this.shakeMag = Math.max(this.shakeMag, mag); }
  flash(frames = 6, color = '#fff') { this.flashT = frames; this.flashColor = color; }

  private add(p: Partial<P> & { x: number; y: number }) {
    this.parts.push({ kind: 'dot', vx: 0, vy: 0, g: 0, life: 0, max: 30, size: 2, color: '#fff', ...p });
  }

  /** efeito do golpe sobre o alvo em (x,y); devolve a duração em quadros */
  golpe(tipo: Tipo, x: number, y: number): number {
    switch (tipo) {
      case 'Fogo':
        for (let i = 0; i < 26; i++) this.add({ x: x + R(-16, 16), y: y + R(4, 18), vx: R(-0.3, 0.3), vy: R(-1.8, -0.8), max: R(18, 32), size: R(2, 4), color: pick(['#f86830', '#f8a838', '#f8e048', '#e84020']), life: -Math.floor(R(0, 10)) });
        return 34;
      case 'Água':
        for (let i = 0; i < 22; i++) { const a = R(0, Math.PI * 2), v = R(1, 2.6); this.add({ x, y, vx: Math.cos(a) * v, vy: Math.sin(a) * v - 1, g: 0.12, max: R(18, 28), size: R(2, 3), color: pick(['#68a8f8', '#a8d8ff', '#ffffff']) }); }
        this.add({ kind: 'ring', x, y, max: 18, size: 4, color: '#a8d8ff' });
        return 28;
      case 'Planta':
        for (let i = 0; i < 12; i++) this.add({ kind: 'leaf', x, y, max: 30, size: 3, color: pick(['#58c048', '#88e068', '#3a9a38']), orbit: { cx: x, cy: y, r: R(18, 26), a: (i / 12) * Math.PI * 2, va: 0.18, vr: -0.7 } });
        return 32;
      case 'Elétrico':
        for (let i = 0; i < 3; i++) this.add({ kind: 'bolt', x: x + R(-14, 14), y: y - 40, x2: x + R(-6, 6), y2: y + 6, max: 14, size: 1, color: '#f8f070', life: -i * 5 });
        for (let i = 0; i < 12; i++) { const a = R(0, Math.PI * 2); this.add({ x, y, vx: Math.cos(a) * 2, vy: Math.sin(a) * 2, max: 14, size: 2, color: '#f8e048', life: -8 }); }
        this.flash(5, 'rgba(255,250,180,0.6)');
        return 28;
      case 'Pedra':
        for (let i = 0; i < 9; i++) this.add({ kind: 'rect', x: x + R(-18, 18), y: y - R(40, 70), vy: R(2, 3), g: 0.15, max: 24, size: R(3, 6), color: pick(['#a08868', '#887050', '#c0a888']), life: -Math.floor(R(0, 10)) });
        this.shake(14, 3);
        return 30;
      case 'Terra':
        for (let i = 0; i < 26; i++) { const a = R(Math.PI, Math.PI * 2); this.add({ x: x + R(-10, 10), y: y + 16, vx: Math.cos(a) * R(1, 2.5), vy: Math.sin(a) * R(1, 2), g: 0.1, max: 26, size: R(2, 4), color: pick(['#c8a060', '#a07840', '#e0c080']) }); }
        this.shake(26, 4);
        return 30;
      case 'Inseto':
        for (let i = 0; i < 16; i++) { const a = R(0, Math.PI * 2), r = R(24, 34); this.add({ x: x + Math.cos(a) * r, y: y + Math.sin(a) * r, vx: -Math.cos(a) * r / 18, vy: -Math.sin(a) * r / 18, max: 18, size: 2, color: pick(['#a8c830', '#d8f060']) }); }
        return 22;
      case 'Voador':
        for (let i = 0; i < 10; i++) this.add({ kind: 'line', x: x - 50 - R(0, 30), y: y + R(-18, 18), vx: R(5, 7), max: 20, size: R(10, 18), color: 'rgba(255,255,255,0.85)', life: -Math.floor(R(0, 8)) });
        return 26;
      case 'Lutador':
        this.add({ kind: 'star', x, y, max: 14, size: 18, color: '#f8e048' });
        this.add({ kind: 'star', x: x + 6, y: y - 4, max: 14, size: 12, color: '#ffffff', life: -4 });
        this.shake(12, 4);
        return 20;
      case 'Fantasma':
        this.darken = 40;
        for (let i = 0; i < 8; i++) this.add({ x, y, max: 36, size: 4, color: pick(['#a878e8', '#7848b8', '#d8b8ff']), orbit: { cx: x, cy: y, r: 30, a: (i / 8) * Math.PI * 2, va: 0.12, vr: -0.8 } });
        return 38;
      case 'Psíquico':
        for (let i = 0; i < 4; i++) this.add({ kind: 'ring', x, y, max: 22, size: 3, color: pick(['#f878b8', '#f8a8d8']), life: -i * 5 });
        return 34;
      case 'Venenoso':
        for (let i = 0; i < 16; i++) this.add({ kind: 'ring', x: x + R(-14, 14), y: y + R(0, 16), vy: R(-1, -0.4), max: R(18, 30), size: R(2, 4), color: pick(['#b058c8', '#d888e8', '#8838a0']), life: -Math.floor(R(0, 10)) });
        return 32;
      case 'Normal':
      default:
        this.add({ kind: 'star', x, y, max: 12, size: 14, color: '#ffffff' });
        for (let i = 0; i < 6; i++) { const a = (i / 6) * Math.PI * 2; this.add({ x, y, vx: Math.cos(a) * 2.2, vy: Math.sin(a) * 2.2, max: 12, size: 2, color: '#f8f0c0' }); }
        return 16;
    }
  }

  setas(x: number, y: number, sobe: boolean) {
    for (let i = 0; i < 8; i++) this.add({ kind: 'arrow', x: x + R(-18, 18), y: y + (sobe ? 14 : -14) + R(-6, 6), vy: sobe ? -1.2 : 1.2, max: 26, size: 4, up: sobe, color: sobe ? '#58a8f8' : '#f05858', life: -Math.floor(R(0, 12)) });
  }

  brilho(x: number, y: number, color = '#78f088') {
    for (let i = 0; i < 14; i++) this.add({ kind: 'star', x: x + R(-16, 16), y: y + R(-6, 18), vy: -0.8, max: 24, size: 3, color, life: -Math.floor(R(0, 12)) });
  }

  estrelas(x: number, y: number) {
    for (let i = 0; i < 5; i++) { const a = -Math.PI / 2 + (i - 2) * 0.5; this.add({ kind: 'star', x, y, vx: Math.cos(a) * 1.6, vy: Math.sin(a) * 1.6, g: 0.05, max: 34, size: 4, color: '#f8e048' }); }
  }

  get ativo() { return this.parts.length > 0 || this.shakeT > 0; }

  update() {
    if (this.shakeT > 0) this.shakeT--; else this.shakeMag = 0;
    if (this.darken > 0) this.darken--;
    if (this.flashT > 0) this.flashT--;
    for (const p of this.parts) {
      p.life++;
      if (p.life <= 0) continue;
      if (p.orbit) {
        const o = p.orbit;
        o.a += o.va; o.r = Math.max(0, o.r + o.vr);
        p.x = o.cx + Math.cos(o.a) * o.r; p.y = o.cy + Math.sin(o.a) * o.r * 0.6;
      } else {
        p.vy += p.g; p.x += p.vx; p.y += p.vy;
      }
    }
    this.parts = this.parts.filter((p) => p.life < p.max);
  }

  offset(): [number, number] {
    if (this.shakeT <= 0) return [0, 0];
    const m = this.shakeMag * (this.shakeT > 6 ? 1 : this.shakeT / 6);
    return [Math.round(R(-m, m)), Math.round(R(-m / 2, m / 2))];
  }

  drawBack() {
    if (this.darken > 0) { ctx.fillStyle = `rgba(20,0,40,${Math.min(0.45, this.darken / 60)})`; ctx.fillRect(0, 0, W, 112); }
  }

  draw() {
    for (const p of this.parts) {
      if (p.life <= 0) continue;
      const k = p.life / p.max;
      ctx.globalAlpha = k > 0.7 ? 1 - (k - 0.7) / 0.3 : 1;
      ctx.fillStyle = p.color;
      ctx.strokeStyle = p.color;
      const x = Math.round(p.x), y = Math.round(p.y);
      switch (p.kind) {
        case 'dot': ctx.fillRect(x, y, Math.ceil(p.size), Math.ceil(p.size)); break;
        case 'rect': ctx.fillRect(x, y, p.size, p.size); ctx.fillStyle = 'rgba(0,0,0,.25)'; ctx.fillRect(x, y + p.size - 1, p.size, 1); break;
        case 'leaf': ctx.fillRect(x, y, 3, 2); ctx.fillRect(x + 1, y - 1, 1, 1); break;
        case 'ring': {
          ctx.lineWidth = 1;
          ctx.beginPath(); ctx.arc(x, y, p.size + k * 22 * (p.vy ? 0.2 : 1), 0, Math.PI * 2); ctx.stroke();
          break;
        }
        case 'line': ctx.fillRect(x, y, p.size, 1); break;
        case 'arrow': {
          const s = p.up ? -1 : 1;
          ctx.fillRect(x, y, 1, 5);
          ctx.fillRect(x - 1, y + (s < 0 ? 1 : 3), 3, 1);
          ctx.fillRect(x - 2, y + (s < 0 ? 2 : 2), 5, 1);
          break;
        }
        case 'star': {
          const r = p.size * (p.kind === 'star' && p.max <= 14 ? 0.5 + k : 1);
          ctx.fillRect(x - Math.round(r), y, Math.round(r) * 2 + 1, 1);
          ctx.fillRect(x, y - Math.round(r), 1, Math.round(r) * 2 + 1);
          const d = Math.round(r * 0.55);
          for (let i = 1; i <= d; i++) { ctx.fillRect(x - i, y - i, 1, 1); ctx.fillRect(x + i, y - i, 1, 1); ctx.fillRect(x - i, y + i, 1, 1); ctx.fillRect(x + i, y + i, 1, 1); }
          break;
        }
        case 'bolt': {
          ctx.lineWidth = 2;
          ctx.beginPath();
          const steps = 6;
          ctx.moveTo(p.x, p.y);
          for (let i = 1; i <= steps; i++) {
            const t = i / steps;
            const bx = p.x + (p.x2! - p.x) * t + (i < steps ? R(-6, 6) : 0);
            const by = p.y + (p.y2! - p.y) * t;
            ctx.lineTo(bx, by);
          }
          ctx.stroke();
          break;
        }
      }
    }
    ctx.globalAlpha = 1;
    if (this.flashT > 0) { ctx.fillStyle = this.flashColor; ctx.fillRect(0, 0, W, H); }
  }
}
