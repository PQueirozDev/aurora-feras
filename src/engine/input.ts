export type Btn = 'up' | 'down' | 'left' | 'right' | 'a' | 'b' | 'start' | 'select';
const ALL: Btn[] = ['up', 'down', 'left', 'right', 'a', 'b', 'start', 'select'];

const KEYMAP: Record<string, Btn> = {
  ArrowUp: 'up', ArrowDown: 'down', ArrowLeft: 'left', ArrowRight: 'right',
  KeyW: 'up', KeyS: 'down', KeyA: 'left', KeyD: 'right',
  KeyZ: 'a', Space: 'a', KeyJ: 'a',
  KeyX: 'b', Backspace: 'b', KeyK: 'b', ShiftLeft: 'b', ShiftRight: 'b',
  Enter: 'start', Escape: 'start', KeyP: 'start',
  Tab: 'select', KeyQ: 'select',
};

class InputManager {
  private keys = new Set<Btn>();
  private latch = new Set<Btn>();
  private touch = new Set<Btn>();
  private pad = new Set<Btn>();
  private cur = new Set<Btn>();
  private prev = new Set<Btn>();
  private heldFrames: Record<string, number> = {};
  /** botões pressionados recentemente: usado para destravar o áudio */
  onAnyPress: (() => void) | null = null;
  usingTouch = false;
  /** quando true (tela de nome), letras do teclado não viram botões */
  textMode = false;

  init() {
    window.addEventListener('keydown', (e) => {
      if (e.code === 'F11') return;
      if (this.textMode && (e.key.length === 1 || e.code === 'Backspace' || e.code === 'Enter')) return;
      const b = KEYMAP[e.code];
      if (b) {
        e.preventDefault();
        this.keys.add(b);
        this.latch.add(b);
        this.onAnyPress?.();
      }
    });
    window.addEventListener('keyup', (e) => {
      const b = KEYMAP[e.code];
      if (b) this.keys.delete(b);
    });
    window.addEventListener('blur', () => this.keys.clear());
    this.initTouch();
  }

  private initTouch() {
    const isTouch = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
    if (isTouch) {
      this.usingTouch = true;
      document.body.classList.add('touch');
    }
    // Botões A/B/Start/Select
    document.querySelectorAll<HTMLElement>('[data-btn]').forEach((el) => {
      const b = el.dataset.btn as Btn;
      const down = (e: Event) => { e.preventDefault(); this.touch.add(b); this.latch.add(b); el.classList.add('on'); this.onAnyPress?.(); };
      const up = (e: Event) => { e.preventDefault(); this.touch.delete(b); el.classList.remove('on'); };
      el.addEventListener('pointerdown', down);
      el.addEventListener('pointerup', up);
      el.addEventListener('pointercancel', up);
      el.addEventListener('pointerleave', up);
    });
    // D-pad: direção calculada pela posição do dedo (permite deslizar)
    const dpad = document.getElementById('dpad');
    if (!dpad) return;
    const parts: Record<string, HTMLElement | null> = {
      up: dpad.querySelector('.up'), down: dpad.querySelector('.down'),
      left: dpad.querySelector('.left'), right: dpad.querySelector('.right'),
    };
    let activeId: number | null = null;
    const setDir = (d: Btn | null) => {
      for (const k of ['up', 'down', 'left', 'right'] as Btn[]) {
        if (k === d) { if (!this.touch.has(k)) this.latch.add(k); this.touch.add(k); parts[k]?.classList.add('on'); }
        else { this.touch.delete(k); parts[k]?.classList.remove('on'); }
      }
    };
    const fromEvent = (e: PointerEvent) => {
      const r = dpad.getBoundingClientRect();
      const dx = e.clientX - (r.left + r.width / 2);
      const dy = e.clientY - (r.top + r.height / 2);
      if (Math.hypot(dx, dy) < r.width * 0.12) return null;
      if (Math.abs(dx) > Math.abs(dy)) return dx > 0 ? 'right' : 'left';
      return dy > 0 ? 'down' : 'up';
    };
    dpad.addEventListener('pointerdown', (e) => {
      e.preventDefault();
      activeId = e.pointerId;
      dpad.setPointerCapture(e.pointerId);
      setDir(fromEvent(e));
      this.onAnyPress?.();
    });
    dpad.addEventListener('pointermove', (e) => { if (e.pointerId === activeId) setDir(fromEvent(e)); });
    const end = (e: PointerEvent) => { if (e.pointerId === activeId) { activeId = null; setDir(null); } };
    dpad.addEventListener('pointerup', end);
    dpad.addEventListener('pointercancel', end);
  }

  private pollGamepad() {
    this.pad.clear();
    const pads = navigator.getGamepads ? navigator.getGamepads() : [];
    for (const gp of pads) {
      if (!gp) continue;
      const bt = (i: number) => !!gp.buttons[i]?.pressed;
      if (bt(0)) this.pad.add('a');
      if (bt(1) || bt(2)) this.pad.add('b');
      if (bt(9)) this.pad.add('start');
      if (bt(8) || bt(3)) this.pad.add('select');
      if (bt(12) || (gp.axes[1] ?? 0) < -0.5) this.pad.add('up');
      if (bt(13) || (gp.axes[1] ?? 0) > 0.5) this.pad.add('down');
      if (bt(14) || (gp.axes[0] ?? 0) < -0.5) this.pad.add('left');
      if (bt(15) || (gp.axes[0] ?? 0) > 0.5) this.pad.add('right');
    }
  }

  /** Chamado uma vez por frame, antes da lógica do jogo */
  update() {
    this.pollGamepad();
    this.prev = this.cur;
    this.cur = new Set<Btn>([...this.keys, ...this.latch, ...this.touch, ...this.pad]);
    this.latch.clear();
    for (const b of ALL) {
      if (this.cur.has(b)) this.heldFrames[b] = (this.heldFrames[b] ?? 0) + 1;
      else this.heldFrames[b] = 0;
    }
    if (this.pad.size && [...this.pad].some((b) => !this.prev.has(b))) this.onAnyPress?.();
  }

  /** simula um toque rápido num botão (ex.: botão voltar do Android) */
  virtualPress(b: Btn) { this.latch.add(b); }
  held(b: Btn) { return this.cur.has(b); }
  pressed(b: Btn) { return this.cur.has(b) && !this.prev.has(b); }
  /** pressionado com repetição automática (menus) */
  repeat(b: Btn) {
    const f = this.heldFrames[b] ?? 0;
    return f === 1 || (f > 18 && f % 5 === 0);
  }
  /** limpa estado para evitar que um aperto "vaze" para a próxima tela */
  consume() { this.prev = new Set(this.cur); for (const b of ALL) if (this.heldFrames[b]) this.heldFrames[b] = 2; }
  heldDir(): 'up' | 'down' | 'left' | 'right' | null {
    for (const d of ['up', 'down', 'left', 'right'] as const) if (this.cur.has(d)) return d;
    return null;
  }
}

export const input = new InputManager();
