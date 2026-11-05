import { Scene } from '../engine/scene';
import { input } from '../engine/input';
import { audio } from '../engine/audio';
import { W, H, text, wrap, measure } from '../engine/screen';
import { box, arrowDown, cursor } from '../ui/draw';
import { S, CFG } from '../game/state';
import { traduzirFala } from '../i18n';

const LINE_W = W - 28;
const LINES = 2;

/** substitui marcadores no texto */
export function fmt(t: string) {
  return traduzirFala(t).replace(/\{nome\}/g, S.nome).replace(/\{rival\}/g, S.rival);
}

/** Caixa de diálogo com texto digitado. Resolve quando o jogador termina de ler. */
export class Dialog extends Scene<void> {
  overlay = true;
  private pages: string[][] = [];
  private page = 0;
  private chars = 0;
  private t = 0;
  constructor(msg: string, private autoClose = false, private keepOpen = false) {
    super();
    const lines = wrap(fmt(msg), LINE_W, 11);
    for (let i = 0; i < lines.length; i += LINES) this.pages.push(lines.slice(i, i + LINES));
  }
  private get total() { return this.pages[this.page].join('').length; }
  get fullyShown() { return this.page === this.pages.length - 1 && this.chars >= this.total; }
  update() {
    this.t++;
    if (this.chars < this.total) {
      this.chars += input.held('a') || input.held('b') ? 4 : CFG.texto === 'rapido' ? 3.5 : 1.5;
      if (input.pressed('a') || input.pressed('b')) this.chars = this.total;
      return;
    }
    if (this.keepOpen && this.page === this.pages.length - 1) { this.finish(); return; }
    if (this.autoClose && this.page === this.pages.length - 1) {
      if (this.t > 40) this.finish();
      return;
    }
    if (input.pressed('a') || input.pressed('b')) {
      audio.sfx('blip');
      if (this.page < this.pages.length - 1) { this.page++; this.chars = 0; }
      else this.finish();
    }
  }
  draw() { drawDialogBox(this.pages[this.page], Math.floor(this.chars), this.chars >= this.total && !this.keepOpen && !this.autoClose, this.t); }
}

export function drawDialogBox(lines: string[], chars: number, arrow: boolean, t: number) {
  box(2, H - 46, W - 4, 44);
  let left = chars;
  lines.forEach((ln, i) => {
    const vis = ln.slice(0, Math.max(0, left));
    left -= ln.length;
    text(vis, 12, H - 38 + i * 16, { size: 11 });
  });
  if (arrow) arrowDown(W - 20, H - 16, t);
}

/** Menu de escolha em lista. Resolve com o índice escolhido ou -1 se cancelado. */
export class Choice extends Scene<number> {
  overlay = true;
  idx = 0;
  constructor(private opts: string[], private x?: number, private y?: number, private cancel = true, private prompt?: string[]) {
    super();
  }
  update() {
    if (input.repeat('up')) { this.idx = (this.idx + this.opts.length - 1) % this.opts.length; audio.sfx('blip'); }
    if (input.repeat('down')) { this.idx = (this.idx + 1) % this.opts.length; audio.sfx('blip'); }
    if (input.pressed('a')) { audio.sfx('blip'); this.finish(this.idx); }
    else if (input.pressed('b') && this.cancel) { audio.sfx('blip'); this.finish(-1); }
  }
  draw() {
    if (this.prompt) drawDialogBox(this.prompt, 999, false, 0);
    const w = Math.max(...this.opts.map((o) => measure(o, 11))) + 28;
    const h = this.opts.length * 15 + 10;
    const x = this.x ?? W - w - 4;
    const y = this.y ?? (this.prompt ? H - 48 - h : H - h - 4);
    box(x, y, w, h);
    this.opts.forEach((o, i) => {
      text(o, x + 16, y + 6 + i * 15, { size: 11 });
      if (i === this.idx) cursor(x + 8, y + 9 + i * 15);
    });
  }
}
