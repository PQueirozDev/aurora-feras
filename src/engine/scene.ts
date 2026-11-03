import { input } from './input';

/** Uma cena é uma "tela" na pilha. Cenas podem devolver um resultado (Promise) ao serem finalizadas. */
export abstract class Scene<R = void> {
  /** se true, a cena de baixo continua sendo desenhada (diálogos, menus) */
  overlay = false;
  private _resolve!: (r: R) => void;
  readonly result: Promise<R>;
  closed = false;
  constructor() {
    this.result = new Promise<R>((res) => (this._resolve = res));
  }
  abstract update(): void;
  abstract draw(): void;
  onEnter(): void {}
  finish(r: R) {
    if (this.closed) return;
    this.closed = true;
    stack.remove(this);
    input.consume();
    this._resolve(r);
  }
}

class SceneStack {
  scenes: Scene<any>[] = [];
  push<R>(s: Scene<R>): Promise<R> {
    this.scenes.push(s);
    input.consume();
    s.onEnter();
    return s.result;
  }
  remove(s: Scene<any>) {
    const i = this.scenes.indexOf(s);
    if (i >= 0) this.scenes.splice(i, 1);
  }
  top() { return this.scenes[this.scenes.length - 1]; }
  update() {
    const t = this.top();
    if (t) t.update();
  }
  draw() {
    let start = this.scenes.length - 1;
    while (start > 0 && this.scenes[start].overlay) start--;
    for (let i = Math.max(0, start); i < this.scenes.length; i++) this.scenes[i].draw();
  }
  clear() { this.scenes = []; }
}

export const stack = new SceneStack();

/** espera N frames (útil em scripts) */
let frameWaiters: { n: number; r: () => void }[] = [];
export function wait(frames: number): Promise<void> {
  return new Promise((r) => frameWaiters.push({ n: frames, r }));
}
export function tickWaiters() {
  const done: (() => void)[] = [];
  frameWaiters = frameWaiters.filter((w) => {
    w.n--;
    if (w.n <= 0) { done.push(w.r); return false; }
    return true;
  });
  done.forEach((r) => r());
}
