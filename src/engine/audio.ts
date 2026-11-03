// Áudio chiptune gerado em tempo real (Web Audio). Todas as músicas são composições originais.

type Track = { bpm: number; ch: { wave: OscillatorType; vol: number; notes: string }[]; loop: boolean };

const NOTE_IDX: Record<string, number> = { C: 0, 'C#': 1, D: 2, 'D#': 3, E: 4, F: 5, 'F#': 6, G: 7, 'G#': 8, A: 9, 'A#': 10, B: 11 };
function freq(n: string) {
  const m = /^([A-G]#?)(\d)$/.exec(n);
  if (!m) return 0;
  const semis = NOTE_IDX[m[1]] + (Number(m[2]) + 1) * 12 - 69;
  return 440 * Math.pow(2, semis / 12);
}

type Ev = { f: number; start: number; len: number };
function parse(notes: string): { evs: Ev[]; steps: number } {
  const toks = notes.trim().split(/\s+/);
  const evs: Ev[] = [];
  let cur: Ev | null = null;
  toks.forEach((t, i) => {
    if (t === '-') { if (cur) cur.len++; return; }
    cur = null;
    if (t === '.') return;
    cur = { f: freq(t), start: i, len: 1 };
    evs.push(cur);
  });
  return { evs, steps: toks.length };
}

const TRACKS: Record<string, Track> = {
  title: {
    bpm: 112, loop: true, ch: [
      { wave: 'square', vol: 0.06, notes: 'C5 - E5 - G5 - - E5 F5 - A5 - G5 - - - E5 - D5 - C5 - D5 - E5 - - - . . . . G4 - C5 - E5 - D5 - C5 - A4 - B4 - C5 - D5 - G4 - - - . . . . E5 - G5 - C6 - - B5 A5 - F5 - A5 - - - G5 - E5 - C5 - D5 - E5 - G5 - - - D5 - - - C5 - - - - - - - . . . .' },
      { wave: 'triangle', vol: 0.12, notes: 'C3 - G3 - C3 - G3 - F3 - C4 - F3 - C4 - C3 - G3 - C3 - G3 - G2 - D3 - G2 - D3 - A2 - E3 - A2 - E3 - F2 - C3 - G2 - D3 - C3 - G3 - C3 - G3 - F3 - C4 - F3 - C4 - C3 - G3 - A2 - E3 - G2 - D3 - G2 - B2 - C3 - G3 - C3 - G3 - C3 - - - . . . .' },
    ],
  },
  vila: {
    bpm: 100, loop: true, ch: [
      { wave: 'square', vol: 0.05, notes: 'E5 - D5 C5 D5 - G4 - C5 - D5 - E5 - - - F5 - E5 D5 E5 - C5 - D5 - - - - - . . E5 - D5 C5 D5 - G4 - C5 - D5 - E5 - G5 - A5 - G5 - E5 - D5 - C5 - - - - - . .' },
      { wave: 'triangle', vol: 0.12, notes: 'C3 - G3 - C3 - G3 - A2 - E3 - A2 - E3 - F2 - C3 - F2 - C3 - G2 - D3 - G2 - D3 - C3 - G3 - C3 - G3 - A2 - E3 - A2 - E3 - F2 - C3 - G2 - D3 - C3 - G3 - C3 - - ' },
    ],
  },
  rota: {
    bpm: 132, loop: true, ch: [
      { wave: 'square', vol: 0.05, notes: 'G4 - C5 - D5 - E5 - - - D5 - C5 - D5 - G4 - - - A4 - B4 - C5 - D5 - E5 - F5 - E5 - - - G4 - C5 - D5 - E5 - - - G5 - E5 - D5 - C5 - - - A4 - C5 - B4 - G4 - C5 - - - - - . .' },
      { wave: 'triangle', vol: 0.12, notes: 'C3 C3 G3 G3 C3 C3 G3 G3 G2 G2 D3 D3 G2 G2 D3 D3 F2 F2 C3 C3 F2 F2 C3 C3 C3 C3 G3 G3 C3 C3 G3 G3 C3 C3 G3 G3 C3 C3 G3 G3 E3 E3 B3 B3 E3 E3 B3 B3 F2 F2 C3 C3 G2 G2 D3 D3 C3 C3 G3 G3 C3 - - - ' },
    ],
  },
  cidade: {
    bpm: 108, loop: true, ch: [
      { wave: 'square', vol: 0.05, notes: 'A4 - C5 - E5 - D5 - C5 - - - B4 - A4 - G4 - A4 - B4 - C5 - - - - - . . A4 - C5 - E5 - G5 - F5 - E5 - D5 - C5 - B4 - G4 - A4 - - - - - - - . .' },
      { wave: 'triangle', vol: 0.12, notes: 'F2 - C3 - F2 - C3 - G2 - D3 - G2 - D3 - E2 - B2 - E2 - B2 - A2 - E3 - A2 - E3 - F2 - C3 - F2 - C3 - G2 - D3 - G2 - D3 - A2 - E3 - A2 - E3 - A2 - - - ' },
    ],
  },
  interior: {
    bpm: 96, loop: true, ch: [
      { wave: 'square', vol: 0.04, notes: 'C5 - E5 - G5 - E5 - F5 - D5 - B4 - G4 - C5 - E5 - A5 - G5 - F5 - E5 - D5 - - - ' },
      { wave: 'triangle', vol: 0.1, notes: 'C3 - - - E3 - - - D3 - - - G2 - - - C3 - - - F3 - - - G2 - - - G2 - - - ' },
    ],
  },
  batalha: {
    bpm: 168, loop: true, ch: [
      { wave: 'square', vol: 0.05, notes: 'A4 A4 C5 A4 D5 A4 E5 D5 C5 A4 C5 A4 G4 A4 B4 G4 A4 A4 C5 A4 D5 A4 E5 G5 F5 E5 D5 C5 B4 C5 D5 B4 F5 - E5 - D5 - C5 - D5 - C5 - B4 - G4 - A4 - B4 - C5 - D5 - E5 - D5 - E5 - G5 - ' },
      { wave: 'triangle', vol: 0.13, notes: 'A2 A3 A2 A3 A2 A3 A2 A3 F2 F3 F2 F3 G2 G3 G2 G3 A2 A3 A2 A3 A2 A3 A2 A3 F2 F3 F2 F3 G2 G3 G2 G3 D2 D3 D2 D3 D2 D3 D2 D3 E2 E3 E2 E3 E2 E3 E2 E3 F2 F3 F2 F3 G2 G3 G2 G3 E2 E3 E2 E3 E2 E3 E2 E3' },
    ],
  },
  lider: {
    bpm: 176, loop: true, ch: [
      { wave: 'square', vol: 0.05, notes: 'E5 E5 . E5 D5 . E5 . G5 - E5 - D5 - C5 - D5 D5 . D5 C5 . D5 . F5 - D5 - C5 - B4 - C5 - E5 - A5 - G5 - F5 - E5 - D5 - C5 - B4 - G4 - B4 - - - - - - - ' },
      { wave: 'triangle', vol: 0.13, notes: 'A2 A3 A2 A3 A2 A3 A2 A3 A2 A3 A2 A3 A2 A3 A2 A3 G2 G3 G2 G3 G2 G3 G2 G3 G2 G3 G2 G3 G2 G3 G2 G3 F2 F3 F2 F3 F2 F3 F2 F3 G2 G3 G2 G3 G2 G3 G2 G3 E2 E3 E2 E3 E2 E3 E2 E3 E2 E3 E2 E3 E2 E3 E2 E3' },
    ],
  },
  vitoria: {
    bpm: 140, loop: true, ch: [
      { wave: 'square', vol: 0.05, notes: 'G4 C5 E5 G5 - - E5 G5 - - - - A5 - G5 - F5 - E5 - D5 - E5 - F5 - - - E5 - D5 - C5 - - - D5 - E5 - G5 - - - ' },
      { wave: 'triangle', vol: 0.12, notes: 'C3 - - - G3 - - - C3 - - - F3 - - - F2 - - - C3 - - - G2 - - - D3 - - - C3 - - - G3 - - - ' },
    ],
  },
};

const JINGLES: Record<string, Track> = {
  cura: { bpm: 150, loop: false, ch: [
    { wave: 'square', vol: 0.06, notes: 'C5 E5 G5 - E5 G5 C6 - - - . .' },
    { wave: 'triangle', vol: 0.12, notes: 'C3 - G3 - C3 - C4 - - - . .' }] },
  nivel: { bpm: 180, loop: false, ch: [
    { wave: 'square', vol: 0.06, notes: 'G4 A4 B4 D5 - G5 - - . .' },
    { wave: 'triangle', vol: 0.1, notes: 'G2 - D3 - - G3 - - . .' }] },
  captura: { bpm: 150, loop: false, ch: [
    { wave: 'square', vol: 0.06, notes: 'C5 . C5 . C5 E5 G5 - E5 - G5 - C6 - - - . .' },
    { wave: 'triangle', vol: 0.12, notes: 'C3 . C3 . C3 - E3 - G3 - G3 - C4 - - - . .' }] },
  insignia: { bpm: 130, loop: false, ch: [
    { wave: 'square', vol: 0.06, notes: 'C5 - G4 - C5 - E5 - G5 - - - E5 - G5 - C6 - - - - - . .' },
    { wave: 'triangle', vol: 0.12, notes: 'C3 - - - G3 - - - C3 - - - G3 - - - C4 - - - - - . .' }] },
};

/** som desligado por pedido do usuário — mude para false para reativar */
export const SOM_DESATIVADO = true;

class AudioManager {
  ctx: AudioContext | null = null;
  master: GainNode | null = null;
  enabled = true;
  private current: string | null = null;
  private timer: number | null = null;
  private seqStart = 0;
  private scheduledUntil = 0;
  private parsed: { wave: OscillatorType; vol: number; evs: Ev[]; steps: number }[] = [];
  private stepDur = 0.25;
  private loopSteps = 0;
  private loopIndex = 0;
  private track: Track | null = null;
  private pendingMusic: string | null = null;
  private jingleUntil = 0;

  unlock() {
    if (SOM_DESATIVADO) return;
    if (this.ctx) { if (this.ctx.state === 'suspended') this.ctx.resume(); return; }
    try {
      this.ctx = new AudioContext();
      this.master = this.ctx.createGain();
      this.master.gain.value = this.enabled ? 0.9 : 0;
      this.master.connect(this.ctx.destination);
      if (this.pendingMusic) { const m = this.pendingMusic; this.pendingMusic = null; this.current = null; this.music(m); }
    } catch { /* sem áudio */ }
  }

  setEnabled(on: boolean) {
    this.enabled = on;
    if (this.master) this.master.gain.value = on ? 0.9 : 0;
  }

  music(name: string | null) {
    if (name === this.current) return;
    this.current = name;
    if (!this.ctx) { this.pendingMusic = name; return; }
    this.stopSeq();
    if (!name) return;
    const t = TRACKS[name];
    if (t) this.startSeq(t);
  }

  /** toca uma vinheta curta e depois retoma a música atual */
  async jingle(name: string): Promise<void> {
    const t = JINGLES[name];
    if (!t || !this.ctx) return new Promise((r) => setTimeout(r, 900));
    const resume = this.current;
    this.stopSeq();
    this.current = null;
    const dur = this.startSeq(t);
    await new Promise((r) => setTimeout(r, dur * 1000 + 100));
    this.stopSeq();
    if (resume) this.music(resume);
  }

  private startSeq(t: Track): number {
    const ctx = this.ctx!;
    this.track = t;
    this.stepDur = 60 / t.bpm / 2;
    this.parsed = t.ch.map((c) => ({ wave: c.wave, vol: c.vol, ...parse(c.notes) }));
    this.loopSteps = Math.max(...this.parsed.map((p) => p.steps));
    this.seqStart = ctx.currentTime + 0.05;
    this.scheduledUntil = this.seqStart;
    this.loopIndex = 0;
    this.tick();
    this.timer = window.setInterval(() => this.tick(), 50);
    return this.loopSteps * this.stepDur;
  }

  private nodes = new Set<OscillatorNode>();
  private stopSeq(kill = true) {
    if (this.timer !== null) clearInterval(this.timer);
    this.timer = null;
    this.track = null;
    if (kill && this.ctx) {
      const now = this.ctx.currentTime;
      for (const o of this.nodes) { try { o.stop(now); o.disconnect(); } catch { /* já parado */ } }
      this.nodes.clear();
    }
  }

  private tick() {
    const ctx = this.ctx;
    if (!ctx || !this.track) return;
    const ahead = ctx.currentTime + 0.25;
    while (this.scheduledUntil < ahead) {
      const loopStart = this.seqStart + this.loopIndex * this.loopSteps * this.stepDur;
      for (const ch of this.parsed) {
        for (const ev of ch.evs) {
          const t0 = loopStart + ev.start * this.stepDur;
          if (t0 >= this.scheduledUntil && t0 < this.scheduledUntil + this.loopSteps * this.stepDur) {
            this.note(ch.wave, ev.f, t0, ev.len * this.stepDur * 0.92, ch.vol);
          }
        }
      }
      this.loopIndex++;
      this.scheduledUntil = this.seqStart + this.loopIndex * this.loopSteps * this.stepDur;
      if (!this.track.loop) { this.stopSeq(false); return; }
    }
  }

  private note(wave: OscillatorType, f: number, t: number, len: number, vol: number) {
    const ctx = this.ctx!;
    if (!f) return;
    const o = ctx.createOscillator();
    const g = ctx.createGain();
    o.type = wave;
    o.frequency.value = f;
    g.gain.setValueAtTime(0, t);
    g.gain.linearRampToValueAtTime(vol, t + 0.01);
    g.gain.setValueAtTime(vol, t + Math.max(0.02, len - 0.04));
    g.gain.linearRampToValueAtTime(0, t + len);
    o.connect(g).connect(this.master!);
    o.start(t);
    o.stop(t + len + 0.02);
    this.nodes.add(o);
    o.onended = () => this.nodes.delete(o);
  }

  sfx(name: 'blip' | 'bump' | 'hit' | 'superhit' | 'weak' | 'faint' | 'shake' | 'door' | 'throw' | 'heal' | 'error' | 'run' | 'save' | 'grass' | 'exclaim') {
    const ctx = this.ctx;
    if (!ctx || !this.master) return;
    const t = ctx.currentTime;
    const tone = (wave: OscillatorType, f0: number, f1: number, dur: number, vol = 0.08, delay = 0) => {
      const o = ctx.createOscillator();
      const g = ctx.createGain();
      o.type = wave;
      o.frequency.setValueAtTime(f0, t + delay);
      o.frequency.exponentialRampToValueAtTime(Math.max(20, f1), t + delay + dur);
      g.gain.setValueAtTime(vol, t + delay);
      g.gain.exponentialRampToValueAtTime(0.001, t + delay + dur);
      o.connect(g).connect(this.master!);
      o.start(t + delay);
      o.stop(t + delay + dur + 0.02);
    };
    const noise = (dur: number, vol = 0.1, delay = 0, hp = 800) => {
      const len = Math.floor(ctx.sampleRate * dur);
      const buf = ctx.createBuffer(1, len, ctx.sampleRate);
      const d = buf.getChannelData(0);
      for (let i = 0; i < len; i++) d[i] = (Math.random() * 2 - 1) * (1 - i / len);
      const s = ctx.createBufferSource();
      s.buffer = buf;
      const f = ctx.createBiquadFilter();
      f.type = 'highpass';
      f.frequency.value = hp;
      const g = ctx.createGain();
      g.gain.value = vol;
      s.connect(f).connect(g).connect(this.master!);
      s.start(t + delay);
    };
    switch (name) {
      case 'blip': tone('square', 1200, 1200, 0.05, 0.05); break;
      case 'bump': tone('square', 120, 80, 0.08, 0.06); break;
      case 'hit': noise(0.15, 0.25, 0, 400); tone('square', 300, 80, 0.12, 0.05); break;
      case 'superhit': noise(0.25, 0.3, 0, 300); tone('sawtooth', 500, 60, 0.25, 0.06); break;
      case 'weak': noise(0.1, 0.15, 0, 1500); break;
      case 'faint': tone('square', 600, 60, 0.6, 0.07); break;
      case 'shake': tone('square', 300, 200, 0.06, 0.06); tone('square', 250, 150, 0.06, 0.06, 0.08); break;
      case 'door': noise(0.12, 0.12, 0, 2000); tone('triangle', 200, 120, 0.15, 0.1); break;
      case 'throw': tone('square', 400, 1200, 0.25, 0.05); break;
      case 'heal': tone('square', 800, 1600, 0.3, 0.05); break;
      case 'error': tone('square', 200, 200, 0.1, 0.06); tone('square', 150, 150, 0.15, 0.06, 0.1); break;
      case 'run': tone('triangle', 300, 900, 0.3, 0.1); break;
      case 'save': tone('square', 900, 900, 0.08, 0.05); tone('square', 1200, 1200, 0.12, 0.05, 0.09); break;
      case 'grass': noise(0.06, 0.06, 0, 3000); break;
      case 'exclaim': tone('square', 1500, 1500, 0.06, 0.05); tone('square', 2000, 2000, 0.1, 0.05, 0.07); break;
    }
  }
}

export const audio = new AudioManager();
