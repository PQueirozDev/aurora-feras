import { Scene, stack } from '../engine/scene';
import { W, H, ctx, wrap } from '../engine/screen';
import { Dialog, Choice } from '../scenes/dialog';
import { fmt } from '../scenes/dialog';

export async function say(...msgs: string[]) {
  for (const m of msgs) await stack.push(new Dialog(m));
}

function lastPage(msg: string) {
  const all = wrap(fmt(msg), W - 28, 11);
  return all.slice(Math.floor((all.length - 1) / 2) * 2);
}

/** pergunta com Sim/Não; texto fica visível enquanto escolhe */
export async function ask(msg: string): Promise<boolean> {
  await stack.push(new Dialog(msg, false, true));
  const lines = lastPage(msg);
  const r = await stack.push(new Choice(['SIM', 'NÃO'], undefined, undefined, true, lines));
  return r === 0;
}

export async function choose(msg: string | null, opts: string[], cancel = true): Promise<number> {
  let lines: string[] | undefined;
  if (msg) {
    await stack.push(new Dialog(msg, false, true));
    lines = lastPage(msg);
  }
  return stack.push(new Choice(opts, undefined, undefined, cancel, lines));
}

/** escurece/clareia a tela */
class Fade extends Scene<void> {
  overlay = true;
  t = 0;
  constructor(private out: boolean, private frames: number, private color: string) { super(); }
  update() {
    this.t++;
    if (this.t >= this.frames) {
      if (this.out) { blackout.on = true; blackout.color = this.color; }
      this.finish();
    }
  }
  draw() {
    const a = this.out ? this.t / this.frames : 1 - this.t / this.frames;
    ctx.globalAlpha = Math.max(0, Math.min(1, a));
    ctx.fillStyle = this.color;
    ctx.fillRect(0, 0, W, H);
    ctx.globalAlpha = 1;
  }
}

/** quando a tela está "apagada" entre um fade-out e um fade-in */
export const blackout = { on: false, color: '#000' };

export async function fadeOut(frames = 16, color = '#000') {
  await stack.push(new Fade(true, frames, color));
}
export async function fadeIn(frames = 16) {
  const c = blackout.color;
  blackout.on = false;
  await stack.push(new Fade(false, frames, c));
}

export function drawBlackout() {
  if (!blackout.on) return;
  ctx.fillStyle = blackout.color;
  ctx.fillRect(0, 0, W, H);
}
