import { Scene, stack } from '../engine/scene';
import { input } from '../engine/input';
import { audio } from '../engine/audio';
import { W, H, ctx, text, wrap, rect } from '../engine/screen';
import { box, cursor, hpBar, xpBar, statusBadge, arrowDown } from '../ui/draw';
import { creatureSprites } from '../gfx/creatures';
import { capsuleSprite, personSprites, LOOKS } from '../gfx/people';
import { silhouette } from '../gfx/pixel';
import { S, removeItem, marcarVisto, marcarCapturado } from '../game/state';
import { criarMon, maxHp, nomeDe, species, stats, xpParaNivel, golpesNoNivel, podeEvoluir, type Mon } from '../game/mon';
import { move, MOVES, type Move, type MoveId, type Stat } from '../data/moves';
import { efetividade, TIPO_COR, type Tipo } from '../data/types';
import { item } from '../data/items';
import type { TrainerDef } from '../data/maps';
import { fmt } from './dialog';
import { choose, ask } from '../game/game';
import { openParty, openBag } from './menus';
import { EvolutionScene } from './evolution';
import { Fx } from './battlefx';

export type BattleResult = 'win' | 'lose' | 'run' | 'caught';

type Side = 'p' | 'f';
type BMon = { m: Mon; st: Record<Stat, number>; flinch: boolean };
type Action = { k: 'move'; idx: number } | { k: 'item'; id: string; alvo?: number } | { k: 'switch'; idx: number } | { k: 'run' };

const STRUGGLE: Move = { nome: 'Esforço', tipo: 'Normal', cat: 'fis', poder: 50, prec: 0, pp: 1, ef: { k: 'recoil' }, desc: '' };
const STAT_NOME: Record<Stat, string> = { atk: 'Ataque', def: 'Defesa', spa: 'Ataque Especial', spd: 'Defesa Especial', spe: 'Velocidade' };
const STATUS_MSG = { brn: 'foi queimado', psn: 'foi envenenado', par: 'ficou paralisado', slp: 'adormeceu' } as const;

interface Waiter { update(): boolean; draw?(): void }

const stageMul = (n: number) => (n >= 0 ? (2 + n) / 2 : 2 / (2 - n));
const rnd = (n: number) => Math.floor(Math.random() * n);

export class BattleScene extends Scene<BattleResult> {
  private foe: Mon[];
  private fi = 0;
  private pi = 0;
  private P!: BMon;
  private F!: BMon;
  private participantes = new Set<number>();
  private waiter: Waiter | null = null;
  private resolveWaiter: (() => void) | null = null;
  private t = 0;
  // estado visual
  private hpShown: Record<Side, number> = { p: 0, f: 0 };
  private xpShown = 0;
  private vis: Record<Side, boolean> = { p: false, f: false };
  private off: Record<Side, [number, number]> = { p: [0, 0], f: [0, 0] };
  private blink: Record<Side, number> = { p: 0, f: 0 };
  private sink: Record<Side, number> = { p: 0, f: 0 };
  private flash: Record<Side, number> = { p: 0, f: 0 };
  private shrink = 0; // captura
  private ball: { x: number; y: number; shakeT: number; open: boolean } | null = null;
  private trainerSpr: HTMLCanvasElement | null = null;
  private trainerX = 300;
  private intro = 0;
  private msgText: string[] = [];
  private fuga = 0;
  private outcome: BattleResult = 'win';
  private evolucoes = new Set<number>();
  private ballSpr = capsuleSprite(undefined, 10);
  private fx = new Fx();
  private grow: Record<Side, number> = { p: 1, f: 1 };
  private vsT = 0;
  private centro(s: Side): [number, number] { return s === 'f' ? [176, 40] : [64, 90]; }

  constructor(private opts: { wild?: { sp: string; lvl: number }; trainer?: TrainerDef; musica?: string }) {
    super();
    if (opts.wild) this.foe = [criarMon(opts.wild.sp, opts.wild.lvl)];
    else this.foe = opts.trainer!.equipe.map(([sp, lv]) => criarMon(sp, lv));
    if (opts.trainer) {
      const look = LOOKS[opts.trainer.look ?? guessLook(opts.trainer)] ?? LOOKS.garoto;
      this.trainerSpr = personSprites(look).down[0];
    }
  }

  onEnter() {
    audio.music(this.opts.musica ?? (this.opts.trainer ? 'lider' : 'batalha'));
    if (this.opts.trainer && !this.opts.musica && !this.opts.trainer.lider) audio.music('batalha');
    this.run().then((r) => this.finish(r));
  }

  // ===================== infraestrutura de espera =====================
  private wait(w: Waiter): Promise<void> {
    this.waiter = w;
    return new Promise((r) => (this.resolveWaiter = r));
  }
  private frames(n: number, each?: (i: number) => void) {
    let i = 0;
    return this.wait({ update: () => { each?.(i); return ++i >= n; } });
  }
  /** mensagem na caixa inferior; avança sozinha ou com A */
  private msg(t: string, manual = false) {
    const lines = wrap(fmt(t), W - 24, 11);
    const pages: string[][] = [];
    for (let i = 0; i < lines.length; i += 2) pages.push(lines.slice(i, i + 2));
    let page = 0, chars = 0, hold = 0;
    return this.wait({
      update: () => {
        const total = pages[page].join('').length;
        this.msgText = [];
        let left = Math.floor(chars);
        for (const ln of pages[page]) { this.msgText.push(ln.slice(0, Math.max(0, left))); left -= ln.length; }
        if (chars < total) {
          chars += input.held('a') || input.held('b') ? 4 : 1.6;
          if (input.pressed('a')) chars = total;
          return false;
        }
        hold++;
        const last = page === pages.length - 1;
        if (input.pressed('a') || input.pressed('b') || (!manual && hold > (last ? 50 : 70))) {
          if (input.pressed('a') || input.pressed('b')) audio.sfx('blip');
          if (!last) { page++; chars = 0; hold = 0; return false; }
          return true;
        }
        return false;
      },
      draw: () => { if (manual && chars >= pages[page].join('').length) arrowDown(W - 18, H - 14, this.t); },
    });
  }
  private async animHp() {
    await this.wait({
      update: () => {
        let done = true;
        for (const s of ['p', 'f'] as Side[]) {
          const b = s === 'p' ? this.P : this.F;
          if (!b) continue;
          const target = b.m.hp;
          const step = Math.max(0.35, maxHp(b.m) / 45);
          if (Math.abs(this.hpShown[s] - target) > 0.01) {
            done = false;
            this.hpShown[s] += Math.sign(target - this.hpShown[s]) * Math.min(step, Math.abs(target - this.hpShown[s]));
          }
        }
        return done;
      },
    });
  }

  update() {
    this.t++;
    for (const s of ['p', 'f'] as Side[]) {
      if (this.blink[s] > 0) this.blink[s]--;
      if (this.flash[s] > 0) this.flash[s]--;
      if (this.grow[s] < 1) this.grow[s] = Math.min(1, this.grow[s] + 1 / 12);
    }
    if (this.vsT > 0) this.vsT--;
    this.fx.update();
    if (this.waiter && this.waiter.update()) {
      this.waiter = null;
      const r = this.resolveWaiter; this.resolveWaiter = null;
      r?.();
    }
  }

  // ===================== fluxo principal =====================
  private bm(m: Mon): BMon { return { m, st: { atk: 0, def: 0, spa: 0, spd: 0, spe: 0 }, flinch: false }; }

  private async run(): Promise<BattleResult> {
    // transição: flashes + barras
    await this.frames(40, (i) => { this.intro = i; if (i % 8 === 0) audio.sfx('blip'); });
    this.intro = 99;
    this.F = this.bm(this.foe[0]);
    this.hpShown.f = this.F.m.hp;
    marcarVisto(this.F.m.sp);
    this.pi = S.equipe.findIndex((m) => m.hp > 0);
    if (this.opts.wild) {
      this.vis.f = true;
      this.off.f = [120, 0];
      await this.frames(30, (i) => (this.off.f = [Math.round(120 * (1 - (i + 1) / 30)), 0]));
      await this.msg(`Um ${nomeDe(this.F.m)} selvagem apareceu!`);
    } else {
      const tr = this.opts.trainer!;
      if (tr.lider || tr.chefe) { this.vsT = 90; await this.frames(90); }
      this.trainerX = 260;
      await this.frames(30, (i) => (this.trainerX = Math.round(260 - (260 - 172) * ((i + 1) / 30))));
      await this.msg(`${tr.classe} ${tr.nome} quer lutar!`);
      await this.frames(16, (i) => (this.trainerX = 172 + i * 6));
      this.trainerX = 400;
      await this.msg(`${tr.classe} ${tr.nome} enviou ${nomeDe(this.F.m)}!`);
      await this.sendOut('f');
    }
    await this.msg(`Vai, ${nomeDe(S.equipe[this.pi])}!`);
    this.P = this.bm(S.equipe[this.pi]);
    this.hpShown.p = this.P.m.hp;
    this.xpShown = this.xpFrac(this.P.m);
    this.participantes.add(this.P.m.uid);
    await this.sendOut('p');

    // loop de turnos
    for (;;) {
      const act = await this.chooseAction();
      const r = await this.turn(act);
      if (r) { this.outcome = r; break; }
    }
    await this.endBattle();
    return this.outcome;
  }

  private async sendOut(s: Side) {
    this.vis[s] = true;
    this.sink[s] = 0;
    this.off[s] = [0, 0];
    this.flash[s] = 14;
    this.grow[s] = 0;
    audio.sfx('throw');
    const [cx, cy] = this.centro(s);
    this.fx.brilho(cx, cy + 10, '#ffffff');
    await this.frames(18);
  }

  private xpFrac(m: Mon) {
    const a = xpParaNivel(m.nivel), b = xpParaNivel(m.nivel + 1);
    return (m.xp - a) / (b - a);
  }

  // ===================== escolha de ação =====================
  private uiMode: 'none' | 'acao' | 'golpe' = 'none';
  private cur = 0;
  private curMove = 0;

  private async chooseAction(): Promise<Action> {
    for (;;) {
      this.msgText = [];
      this.uiMode = 'acao';
      const choice = await new Promise<number>((res) => {
        this.wait({
          update: () => {
            if (input.repeat('left') || input.repeat('right')) { this.cur ^= 1; audio.sfx('blip'); }
            if (input.repeat('up') || input.repeat('down')) { this.cur ^= 2; audio.sfx('blip'); }
            if (input.pressed('a')) { audio.sfx('blip'); res(this.cur); return true; }
            return false;
          },
        });
      });
      this.uiMode = 'none';
      if (choice === 0) {
        const pp = this.P.m.golpes.some((g) => g.pp > 0);
        if (!pp) { await this.msg(`${nomeDe(this.P.m)} não tem mais PP!`); return { k: 'move', idx: -1 }; }
        const idx = await this.chooseMove();
        if (idx >= 0) return { k: 'move', idx };
      } else if (choice === 1) {
        const id = await openBag('batalha');
        if (!id) continue;
        const it = item(id);
        if (it.tipo === 'chave' || it.tipo === 'repelente') { await this.msg('Não dá para usar isso em batalha!'); continue; }
        if (it.tipo === 'captura') {
          if (this.opts.trainer) { await this.msg('Não dá para capturar a fera de outro treinador!'); continue; }
          return { k: 'item', id };
        }
        const alvo = await openParty('item', id);
        if (alvo < 0) continue;
        return { k: 'item', id, alvo };
      } else if (choice === 2) {
        const idx = await openParty('troca', undefined, this.pi);
        if (idx < 0 || idx === this.pi) continue;
        return { k: 'switch', idx };
      } else {
        if (this.opts.trainer) { await this.msg('Não dá para fugir de uma batalha contra treinador!'); continue; }
        return { k: 'run' };
      }
    }
  }

  private async chooseMove(): Promise<number> {
    this.uiMode = 'golpe';
    const g = this.P.m.golpes;
    if (this.curMove >= g.length) this.curMove = 0;
    const r = await new Promise<number>((res) => {
      this.wait({
        update: () => {
          const n = g.length;
          if (input.repeat('left') || input.repeat('right')) { const c = this.curMove ^ 1; if (c < n) { this.curMove = c; audio.sfx('blip'); } }
          if (input.repeat('up') || input.repeat('down')) { const c = this.curMove ^ 2; if (c < n) { this.curMove = c; audio.sfx('blip'); } }
          if (input.pressed('b')) { audio.sfx('blip'); res(-1); return true; }
          if (input.pressed('a')) {
            if (g[this.curMove].pp <= 0) { audio.sfx('error'); return false; }
            audio.sfx('blip'); res(this.curMove); return true;
          }
          return false;
        },
      });
    });
    this.uiMode = 'none';
    return r;
  }

  private foeChoose(): number {
    const m = this.F.m;
    const opts = m.golpes.map((g, i) => ({ g, i })).filter((o) => o.g.pp > 0);
    if (!opts.length) return -1;
    if (this.opts.wild) return opts[rnd(opts.length)].i;
    // IA simples de treinador
    let best = opts[0].i, bestScore = -1;
    for (const { g, i } of opts) {
      const mv = move(g.id);
      let score: number;
      if (mv.cat === 'status') {
        const ef = mv.ef;
        if (ef?.k === 'status') score = this.P.m.status ? 0 : 55;
        else if (ef?.k === 'heal') score = m.hp < maxHp(m) / 2 ? 80 : 0;
        else score = 25;
      } else {
        score = mv.poder * efetividade(mv.tipo, species(this.P.m).tipos) * (species(m).tipos.includes(mv.tipo) ? 1.5 : 1);
      }
      score *= 0.75 + Math.random() * 0.5;
      if (score > bestScore) { bestScore = score; best = i; }
    }
    return best;
  }

  // ===================== turno =====================
  private speed(b: BMon) {
    let s = stats(b.m).spe * stageMul(b.st.spe);
    if (b.m.status === 'par') s /= 4;
    return s;
  }

  private async turn(act: Action): Promise<BattleResult | null> {
    const foeIdx = this.foeChoose();
    this.P.flinch = false; this.F.flinch = false;

    // ações que não são golpes acontecem primeiro
    if (act.k === 'run') {
      this.fuga++;
      const ps = this.speed(this.P), fs = this.speed(this.F);
      const f = ps >= fs ? 256 : Math.min(256, Math.floor((ps * 128) / fs + 30 * this.fuga));
      if (ps >= fs || rnd(256) < f) {
        audio.sfx('run');
        await this.msg('Você fugiu sem problemas!');
        return 'run';
      }
      await this.msg('Não conseguiu fugir!');
    } else if (act.k === 'switch') {
      await this.msg(`Volte, ${nomeDe(this.P.m)}!`);
      this.vis.p = false;
      await this.frames(10);
      this.pi = act.idx;
      this.P = this.bm(S.equipe[this.pi]);
      this.hpShown.p = this.P.m.hp;
      this.xpShown = this.xpFrac(this.P.m);
      this.participantes.add(this.P.m.uid);
      await this.msg(`Vai, ${nomeDe(this.P.m)}!`);
      await this.sendOut('p');
    } else if (act.k === 'item') {
      const it = item(act.id);
      removeItem(act.id);
      if (it.tipo === 'captura') {
        const r = await this.throwBall(it.bonus ?? 1);
        if (r) return 'caught';
      } else {
        const alvo = S.equipe[act.alvo!];
        await this.msg(`{nome} usou ${it.nome}.`);
        await this.applyItem(alvo, act.id);
      }
    }

    if (act.k === 'move') {
      const pPrio = act.idx >= 0 ? move(this.P.m.golpes[act.idx].id).prio ?? 0 : 0;
      const fPrio = foeIdx >= 0 ? move(this.F.m.golpes[foeIdx].id).prio ?? 0 : 0;
      let pFirst = pPrio !== fPrio ? pPrio > fPrio : this.speed(this.P) !== this.speed(this.F) ? this.speed(this.P) > this.speed(this.F) : Math.random() < 0.5;
      const order: Side[] = pFirst ? ['p', 'f'] : ['f', 'p'];
      for (const s of order) {
        const r = await this.doMove(s, s === 'p' ? act.idx : foeIdx, s === order[0]);
        if (r !== undefined) return r;
      }
    } else {
      const r = await this.doMove('f', foeIdx, false);
      if (r !== undefined) return r;
    }

    // fim do turno: dano de status
    for (const s of ['p', 'f'] as Side[]) {
      const b = s === 'p' ? this.P : this.F;
      if (b.m.hp <= 0) continue;
      if (b.m.status === 'brn' || b.m.status === 'psn') {
        const d = Math.max(1, Math.floor(maxHp(b.m) / 8));
        b.m.hp = Math.max(0, b.m.hp - d);
        this.blink[s] = 12;
        audio.sfx('weak');
        await this.animHp();
        await this.msg(`${this.nomeLado(s)} sofre com ${b.m.status === 'brn' ? 'a queimadura' : 'o veneno'}!`);
        const r = await this.checkFaint(s);
        if (r !== undefined) return r;
      }
    }
    return null;
  }

  private nomeLado(s: Side) {
    const b = s === 'p' ? this.P : this.F;
    if (s === 'p') return nomeDe(b.m);
    return this.opts.wild ? `${nomeDe(b.m)} selvagem` : `${nomeDe(b.m)} inimigo`;
  }

  /** executa o golpe; devolve resultado se a batalha terminou, null se só um lado desmaiou e continua, undefined se nada */
  private async doMove(s: Side, idx: number, first: boolean): Promise<BattleResult | null | undefined> {
    const A = s === 'p' ? this.P : this.F;
    const D = s === 'p' ? this.F : this.P;
    const ds: Side = s === 'p' ? 'f' : 'p';
    if (A.m.hp <= 0 || D.m.hp <= 0) return undefined;
    const an = this.nomeLado(s), dn = this.nomeLado(ds);

    if (A.flinch) { await this.msg(`${an} hesitou e não atacou!`); return undefined; }
    if (A.m.status === 'slp') {
      if (A.m.sono > 0) { A.m.sono--; await this.msg(`${an} está dormindo profundamente.`); return undefined; }
      A.m.status = null;
      await this.msg(`${an} acordou!`);
    }
    if (A.m.status === 'par' && Math.random() < 0.25) { await this.msg(`${an} está paralisado! Não consegue se mover!`); return undefined; }

    let mv: Move;
    if (idx < 0) mv = STRUGGLE;
    else { const g = A.m.golpes[idx]; g.pp = Math.max(0, g.pp - 1); mv = move(g.id); }
    await this.msg(`${an} usou ${mv.nome}!`);

    // precisão
    const alvoEhOutro = !(mv.cat === 'status' && mv.ef && ((mv.ef.k === 'stat' && mv.ef.alvo === 'self') || mv.ef.k === 'stat2' || mv.ef.k === 'heal'));
    if (alvoEhOutro && mv.prec > 0 && Math.random() * 100 >= mv.prec) {
      await this.msg(`${an} errou o ataque!`);
      return undefined;
    }

    if (mv.cat !== 'status') {
      // animação de investida
      const dir = s === 'p' ? 1 : -1;
      await this.frames(10, (i) => (this.off[s] = [dir * (i < 5 ? i * 2 : (10 - i) * 2), 0]));
      this.off[s] = [0, 0];
      const eff = efetividade(mv.tipo, species(D.m).tipos);
      if (eff === 0) { await this.msg(`Não afeta ${dn}...`); return undefined; }
      const [fxX, fxY] = this.centro(ds);
      await this.frames(this.fx.golpe(mv.tipo, fxX, fxY));
      const critChance = mv.ef?.k === 'crit' ? 0.25 : 1 / 16;
      const crit = Math.random() < critChance;
      const dmg = mv.ef?.k === 'fixo' ? A.m.nivel : this.damage(A, D, mv, eff, crit);
      this.fx.shake(eff > 1 || crit ? 14 : 8, eff > 1 || crit ? 4 : 2);
      audio.sfx(eff > 1 ? 'superhit' : eff < 1 ? 'weak' : 'hit');
      this.blink[ds] = 16;
      const dealt = Math.min(D.m.hp, dmg);
      D.m.hp = Math.max(0, D.m.hp - dmg);
      await this.animHp();
      if (crit && eff > 0) await this.msg('Um golpe crítico!');
      if (eff > 1) await this.msg('Foi super eficaz!');
      else if (eff < 1 && eff > 0) await this.msg('Não foi muito eficaz...');
      // efeitos secundários
      const ef = mv.ef;
      if (ef?.k === 'drain' && A.m.hp > 0) {
        const h = Math.max(1, Math.floor(dealt / 2));
        A.m.hp = Math.min(maxHp(A.m), A.m.hp + h);
        await this.animHp();
        await this.msg(`${dn} teve a energia drenada!`);
      }
      if (ef?.k === 'recoil') {
        const r = Math.max(1, Math.floor(dealt / 4));
        A.m.hp = Math.max(0, A.m.hp - r);
        this.blink[s] = 10;
        await this.animHp();
        await this.msg(`${an} também se machucou com o impacto!`);
      }
      if (D.m.hp > 0) {
        if (ef?.k === 'flinch' && first && Math.random() * 100 < ef.chance) D.flinch = true;
        if (ef?.k === 'status' && Math.random() * 100 < (ef.chance ?? 100)) await this.tryStatus(D, ds, ef.s, true);
        if (ef?.k === 'stat' && Math.random() * 100 < (ef.chance ?? 100)) await this.changeStat(ef.alvo === 'self' ? A : D, ef.alvo === 'self' ? s : ds, ef.stat, ef.n);
      }
      // desmaios
      const r1 = await this.checkFaint(ds);
      if (r1 === 'win' && A.m.hp <= 0 && s === 'p') {
        await this.checkFaint('p').catch(() => undefined);
        if (!S.equipe.some((m) => m.hp > 0)) return 'lose';
      }
      if (r1) return r1;
      const r2 = await this.checkFaint(s);
      if (r2) return r2;
      if (r1 === null || r2 === null) return null;
      return undefined;
    }

    // golpes de status
    const ef = mv.ef!;
    const alvoSelf = (ef.k === 'stat' && ef.alvo === 'self') || ef.k === 'stat2' || ef.k === 'heal';
    if (!alvoSelf) { const [fx2, fy2] = this.centro(ds); await this.frames(Math.min(30, this.fx.golpe(mv.tipo, fx2, fy2))); }
    if (ef.k === 'stat2') { for (const st of ef.stats) await this.changeStat(A, s, st, ef.n); }
    else if (ef.k === 'stat') await this.changeStat(ef.alvo === 'self' ? A : D, ef.alvo === 'self' ? s : ds, ef.stat, ef.n);
    else if (ef.k === 'status') await this.tryStatus(D, ds, ef.s, false);
    else if (ef.k === 'heal') {
      if (A.m.hp >= maxHp(A.m)) await this.msg('Mas os PV já estão cheios!');
      else {
        A.m.hp = Math.min(maxHp(A.m), A.m.hp + Math.floor(maxHp(A.m) / 2));
        audio.sfx('heal');
        const [hx, hy] = this.centro(s); this.fx.brilho(hx, hy);
        await this.animHp();
        await this.msg(`${an} recuperou energia!`);
      }
    }
    return undefined;
  }

  private damage(A: BMon, D: BMon, mv: Move, eff: number, crit: boolean) {
    if (eff === 0) return 0;
    const sa = stats(A.m), sd = stats(D.m);
    const fis = mv.cat === 'fis';
    let atkStage = fis ? A.st.atk : A.st.spa;
    let defStage = fis ? D.st.def : D.st.spd;
    if (crit) { atkStage = Math.max(0, atkStage); defStage = Math.min(0, defStage); }
    let a = (fis ? sa.atk : sa.spa) * stageMul(atkStage);
    const d = (fis ? sd.def : sd.spd) * stageMul(defStage);
    if (fis && A.m.status === 'brn') a /= 2;
    const L = A.m.nivel;
    let dmg = Math.floor(Math.floor(((2 * L) / 5 + 2) * mv.poder * a / d) / 50) + 2;
    if (species(A.m).tipos.includes(mv.tipo as Tipo)) dmg = Math.floor(dmg * 1.5);
    dmg = Math.floor(dmg * eff);
    if (crit) dmg = Math.floor(dmg * 1.5);
    dmg = Math.floor((dmg * (85 + rnd(16))) / 100);
    return Math.max(1, dmg);
  }

  private async tryStatus(D: BMon, ds: Side, st: 'brn' | 'psn' | 'par' | 'slp', secundario: boolean) {
    const tipos = species(D.m).tipos;
    const imune = (st === 'brn' && tipos.includes('Fogo')) || (st === 'par' && tipos.includes('Elétrico'));
    if (D.m.status || imune) {
      if (!secundario) await this.msg(D.m.status ? `${this.nomeLado(ds)} já está com um problema de estado!` : 'Não teve efeito...');
      return;
    }
    D.m.status = st;
    if (st === 'slp') D.m.sono = 1 + rnd(3);
    this.flash[ds] = 10;
    await this.msg(`${this.nomeLado(ds)} ${STATUS_MSG[st]}!`);
  }

  private async changeStat(b: BMon, side: Side, stat: Stat, n: number) {
    const before = b.st[stat];
    b.st[stat] = Math.max(-6, Math.min(6, before + n));
    const nome = this.nomeLado(side);
    if (b.st[stat] === before) { await this.msg(`${STAT_NOME[stat]} de ${nome} não pode ${n > 0 ? 'subir' : 'cair'} mais!`); return; }
    this.flash[side] = 12;
    audio.sfx(n > 0 ? 'heal' : 'weak');
    const [sx, sy] = this.centro(side);
    this.fx.setas(sx, sy, n > 0);
    await this.frames(20);
    const muito = Math.abs(n) >= 2 ? ' muito' : '';
    await this.msg(`${STAT_NOME[stat]} de ${nome}${muito} ${n > 0 ? 'aumentou' : 'diminuiu'}!`);
  }

  // ===================== desmaio / xp =====================
  private async checkFaint(s: Side): Promise<BattleResult | null | undefined> {
    const b = s === 'p' ? this.P : this.F;
    if (b.m.hp > 0) return undefined;
    audio.sfx('faint');
    await this.frames(20, (i) => (this.sink[s] = (i + 1) / 20));
    this.vis[s] = false;
    await this.msg(`${this.nomeLado(s)} desmaiou!`);
    if (s === 'f') {
      await this.giveXp();
      this.fi++;
      if (this.fi >= this.foe.length) return 'win';
      const tr = this.opts.trainer!;
      this.F = this.bm(this.foe[this.fi]);
      this.hpShown.f = this.F.m.hp;
      marcarVisto(this.F.m.sp);
      this.participantes = new Set([this.P.m.uid]);
      await this.msg(`${tr.classe} ${tr.nome} enviou ${nomeDe(this.F.m)}!`);
      await this.sendOut('f');
      return null;
    }
    // jogador
    if (!S.equipe.some((m) => m.hp > 0)) return 'lose';
    const idx = await openParty('troca', undefined, -1, true);
    this.pi = idx;
    this.P = this.bm(S.equipe[idx]);
    this.hpShown.p = this.P.m.hp;
    this.xpShown = this.xpFrac(this.P.m);
    this.participantes.add(this.P.m.uid);
    await this.msg(`Vai, ${nomeDe(this.P.m)}!`);
    await this.sendOut('p');
    return null;
  }

  private async giveXp() {
    const f = this.F.m;
    const vivos = S.equipe.filter((m) => m.hp > 0 && this.participantes.has(m.uid));
    if (!vivos.length) return;
    const base = Math.floor((species(f).xpBase * f.nivel) / 7 * (this.opts.trainer ? 1.5 : 1));
    const cada = Math.max(1, Math.floor(base / vivos.length));
    for (const m of vivos) {
      await this.msg(`${nomeDe(m)} ganhou ${cada} pontos de experiência!`);
      await this.addXp(m, cada);
    }
    if (S.flags.compartilhador) {
      const resto = S.equipe.filter((m) => m.hp > 0 && !this.participantes.has(m.uid));
      if (resto.length) {
        const metade = Math.max(1, Math.floor(base / 2 / resto.length));
        await this.msg(`O resto da equipe ganhou ${metade} pontos de experiência pelo Compartilhador XP!`);
        for (const m of resto) await this.addXp(m, metade);
      }
    }
  }

  private async addXp(m: Mon, qtd: number) {
    let restante = qtd;
    while (restante > 0 && m.nivel < 100) {
      const prox = xpParaNivel(m.nivel + 1);
      const falta = prox - m.xp;
      const ganho = Math.min(falta, restante);
      m.xp += ganho;
      restante -= ganho;
      if (m === this.P.m) {
        const alvo = this.xpFrac(m);
        await this.frames(20, (i) => (this.xpShown = this.xpShown + (alvo - this.xpShown) * ((i + 1) / 20)));
      }
      if (m.xp >= prox) {
        const antes = maxHp(m);
        m.nivel++;
        m.hp += maxHp(m) - antes;
        if (m === this.P.m) { this.hpShown.p = m.hp; this.xpShown = 0; }
        audio.jingle('nivel');
        await this.msg(`${nomeDe(m)} subiu para o nível ${m.nivel}!`, true);
        for (const id of golpesNoNivel(m, m.nivel)) await this.learnMove(m, id);
        if (podeEvoluir(m)) this.evolucoes.add(m.uid);
      }
    }
  }

  private async learnMove(m: Mon, id: MoveId) {
    if (m.golpes.some((g) => g.id === id)) return;
    const mv = MOVES[id];
    if (m.golpes.length < 4) {
      m.golpes.push({ id, pp: mv.pp });
      await this.msg(`${nomeDe(m)} aprendeu ${mv.nome}!`, true);
      return;
    }
    await this.msg(`${nomeDe(m)} quer aprender ${mv.nome}, mas já conhece 4 golpes.`, true);
    const opts = [...m.golpes.map((g) => move(g.id).nome), `Não aprender`];
    const r = await choose(`Esquecer qual golpe para aprender ${mv.nome}?`, opts, true);
    if (r < 0 || r === 4) { await this.msg(`${nomeDe(m)} não aprendeu ${mv.nome}.`, true); return; }
    const velho = move(m.golpes[r].id).nome;
    m.golpes[r] = { id, pp: mv.pp };
    await this.msg(`1, 2 e... Pronto! ${nomeDe(m)} esqueceu ${velho} e aprendeu ${mv.nome}!`, true);
  }

  // ===================== captura =====================
  private async throwBall(bonus: number): Promise<boolean> {
    await this.msg(`{nome} jogou uma ${bonus > 1 ? 'Supercápsula' : 'Cápsula'}!`);
    audio.sfx('throw');
    // voo da cápsula
    const x0 = 40, y0 = 100, x1 = 172, y1 = 40;
    this.ball = { x: x0, y: y0, shakeT: 0, open: false };
    await this.frames(24, (i) => {
      const k = (i + 1) / 24;
      this.ball!.x = x0 + (x1 - x0) * k;
      this.ball!.y = y0 + (y1 - y0) * k - Math.sin(k * Math.PI) * 40;
    });
    // fera entra na cápsula
    this.ball.open = true;
    await this.frames(14, (i) => (this.shrink = (i + 1) / 14));
    this.vis.f = false;
    this.ball.open = false;
    await this.frames(14, (i) => (this.ball!.y = y1 + Math.min(i, 10) * 2));
    // cálculo
    const m = this.F.m;
    const max = maxHp(m);
    const statusB = m.status === 'slp' ? 2 : m.status ? 1.5 : 1;
    const a = Math.floor(((3 * max - 2 * m.hp) * species(m).captura * bonus) / (3 * max)) * statusB;
    let sacudidas = 0;
    let pego = false;
    if (a >= 255) { pego = true; sacudidas = 3; }
    else {
      const b = 1048560 / Math.sqrt(Math.sqrt(16711680 / Math.max(1, a)));
      let ok = 0;
      for (let i = 0; i < 4; i++) { if (rnd(65536) < b) ok++; else break; }
      pego = ok === 4;
      sacudidas = Math.min(3, ok);
    }
    for (let i = 0; i < sacudidas; i++) {
      await this.frames(24, (k) => (this.ball!.shakeT = k < 12 ? Math.sin((k / 12) * Math.PI * 2) * 3 : 0));
      audio.sfx('shake');
      await this.frames(10);
    }
    if (pego) {
      this.fx.estrelas(this.ball.x + 5, this.ball.y);
      await audio.jingle('captura');
      await this.msg(`Peguei! ${nomeDe(m)} foi capturado!`, true);
      m.dono = S.nome;
      const novo = !S.capturados.includes(m.sp);
      marcarCapturado(m.sp);
      if (novo) await this.msg(`Os dados de ${nomeDe(m)} foram registrados na Feradex!`, true);
      if (await ask(`Quer dar um apelido para ${nomeDe(m)}?`)) {
        const { NamingScene } = await import('./title');
        const ap = await stack.push(new NamingScene(`Apelido para ${nomeDe(m)}?`, nomeDe(m), 'player'));
        if (ap && ap !== nomeDe(m)) m.apelido = ap;
      }
      if (S.equipe.length < 6) S.equipe.push(m);
      else { S.caixa.push(m); await this.msg(`A equipe está cheia. ${nomeDe(m)} foi enviado para o computador.`, true); }
      this.ball = null;
      return true;
    }
    // escapou
    this.ball = null;
    this.vis.f = true;
    this.shrink = 0;
    this.flash.f = 10;
    audio.sfx('door');
    const frases = ['Ah não! A fera escapou!', 'Droga! Parecia que tinha pegado!', 'Argh! Quase!', 'Puxa! Foi por pouco!'];
    await this.msg(frases[Math.min(3, sacudidas)]);
    return false;
  }

  private async applyItem(m: Mon, id: string) {
    const it = item(id);
    const isActive = m === this.P.m;
    if (it.tipo === 'cura') {
      const antes = m.hp;
      m.hp = Math.min(maxHp(m), m.hp + (it.cura ?? 0));
      audio.sfx('heal');
      if (isActive) await this.animHp();
      await this.msg(`${nomeDe(m)} recuperou ${m.hp - antes} PV!`);
    } else if (it.tipo === 'status') {
      m.status = null; m.sono = 0;
      audio.sfx('heal');
      await this.msg(`${nomeDe(m)} está curado!`);
    } else if (it.tipo === 'reviver') {
      m.hp = Math.floor(maxHp(m) / 2);
      audio.sfx('heal');
      await this.msg(`${nomeDe(m)} foi reanimado!`);
    } else if (it.tipo === 'pp') {
      for (const g of m.golpes) g.pp = Math.min(move(g.id).pp, g.pp + 10);
      audio.sfx('heal');
      await this.msg(`Os PP de ${nomeDe(m)} foram recuperados!`);
    }
    if (isActive) { const [hx, hy] = this.centro('p'); this.fx.brilho(hx, hy); }
  }

  // ===================== fim =====================
  private async endBattle() {
    if (this.outcome === 'win' && this.opts.trainer) {
      const tr = this.opts.trainer;
      audio.music('vitoria');
      this.trainerX = 260;
      await this.frames(24, (i) => (this.trainerX = Math.round(260 - (260 - 172) * ((i + 1) / 24))));
      await this.msg(`{nome} derrotou ${tr.classe} ${tr.nome}!`);
      if (tr.derrota) await this.msg(tr.derrota, true);
      S.dinheiro += tr.premio;
      await this.msg(`{nome} ganhou $${tr.premio} pela vitória!`, true);
    } else if (this.outcome === 'win') {
      audio.music('vitoria');
      await this.frames(30);
    }
    if (this.outcome === 'lose' && this.opts.trainer && !this.opts.trainer.lider && this.opts.trainer.flag === 'rivalLab') {
      await this.msg(`${this.opts.trainer.nome}: Viu só? Eu sou demais!`, true);
    }
    // evoluções
    for (const m of S.equipe) {
      if (!this.evolucoes.has(m.uid) || m.hp <= 0) continue;
      const para = podeEvoluir(m);
      if (para) await stack.push(new EvolutionScene(m, para));
    }
  }

  // ===================== desenho =====================
  draw() {
    const [shx, shy] = this.fx.offset();
    ctx.save();
    ctx.translate(shx, shy);
    // fundo
    rect(-4, -4, W + 8, H + 8, '#f8f0d8');
    const sky = ctx.createLinearGradient(0, 0, 0, 112);
    const lider = this.opts.trainer?.lider || this.opts.trainer?.chefe;
    sky.addColorStop(0, lider ? '#d8c8f0' : '#c8e8f8'); sky.addColorStop(1, lider ? '#f8e8f0' : '#f0f8e0');
    ctx.fillStyle = sky; ctx.fillRect(-4, -4, W + 8, 116);
    // nuvens ao fundo
    ctx.fillStyle = 'rgba(255,255,255,0.7)';
    for (let i = 0; i < 3; i++) { const cx = ((this.t * 0.15 + i * 90) % (W + 60)) - 30; ctx.fillRect(Math.round(cx), 14 + i * 9, 26, 4); ctx.fillRect(Math.round(cx) + 5, 11 + i * 9, 14, 3); }
    this.fx.drawBack();
    // plataformas
    ellipse(176, 62, 44, 9, '#a8c878'); ellipse(176, 61, 40, 7, '#c0dc90');
    ellipse(64, 110, 52, 10, '#a8c878'); ellipse(64, 109, 48, 8, '#c0dc90');

    // treinador inimigo
    if (this.trainerSpr && this.trainerX < 300) {
      ctx.drawImage(this.trainerSpr, this.trainerX - 16, 8, 32, 32 * 1.0 + 0);
    }
    // fera inimiga
    if (this.F && this.vis.f) this.drawMon('f', creatureSprites(this.F.m.sp).front, 152, 14);
    // fera do jogador
    if (this.P && this.vis.p) this.drawMon('p', creatureSprites(this.P.m.sp).back, 40, 64);
    // cápsula
    if (this.ball) {
      const bx = Math.round(this.ball.x + this.ball.shakeT), by = Math.round(this.ball.y);
      if (this.ball.open) { ctx.fillStyle = 'rgba(255,255,255,0.8)'; ctx.fillRect(bx - 6, by - 6, 22, 22); }
      ctx.drawImage(this.ballSpr, bx, by);
    }
    this.fx.draw();
    ctx.restore();
    // caixas de info
    if (this.F && this.intro >= 99 && (this.vis.f || this.ball)) this.drawFoeBox();
    if (this.P && this.vis.p) this.drawPlayerBox();

    // caixa inferior
    rect(0, 112, W, 48, '#283040');
    box(2, 114, W - 4, 44, 'escuro');
    if (this.uiMode === 'acao') {
      text(`O que ${nomeDe(this.P.m)}`, 12, 122, { size: 11, color: '#fff', shadow: '#5a5a6a' });
      text('vai fazer?', 12, 138, { size: 11, color: '#fff', shadow: '#5a5a6a' });
      box(122, 114, 116, 44);
      const ops = ['LUTAR', 'BOLSA', 'FERAS', 'FUGIR'];
      ops.forEach((o, i) => {
        const x = 136 + (i % 2) * 52, y = 121 + Math.floor(i / 2) * 16;
        text(o, x, y, { size: 11 });
        if (i === this.cur) cursor(x - 8, y + 3);
      });
    } else if (this.uiMode === 'golpe') {
      box(2, 114, 156, 44);
      const g = this.P.m.golpes;
      for (let i = 0; i < 4; i++) {
        const x = 16 + (i % 2) * 70, y = 121 + Math.floor(i / 2) * 16;
        text(g[i] ? move(g[i].id).nome : '-', x, y, { size: 10 });
        if (i === this.curMove) cursor(x - 8, y + 3);
      }
      box(156, 114, 82, 44);
      const sel = g[this.curMove];
      if (sel) {
        const mv = move(sel.id);
        text('PP', 164, 121, { size: 10 });
        text(`${sel.pp}/${mv.pp}`, 228, 121, { size: 10, align: 'right', color: sel.pp === 0 ? '#e04848' : '#383840' });
        rect(164, 139, 66, 11, TIPO_COR[mv.tipo]);
        text(mv.tipo.toUpperCase(), 197, 139.5, { size: 9, color: '#fff', shadow: 'rgba(0,0,0,.35)', align: 'center', bold: true });
      }
    } else {
      this.msgText.forEach((ln, i) => text(ln, 12, 122 + i * 16, { size: 11, color: '#fff', shadow: '#5a5a6a' }));
    }
    this.waiter?.draw?.();

    // apresentação de líder / chefe
    if (this.vsT > 0) this.drawVs();
    // transição de entrada
    if (this.intro < 99) {
      const i = this.intro;
      if (i < 24) {
        if (Math.floor(i / 4) % 2 === 0) { ctx.fillStyle = '#000'; ctx.fillRect(0, 0, W, H); }
        else { ctx.fillStyle = '#fff'; ctx.fillRect(0, 0, W, H); }
      } else {
        const k = (i - 24) / 16;
        ctx.fillStyle = '#000';
        for (let b = 0; b < 8; b++) {
          const w = W * (1 - k);
          if (b % 2) ctx.fillRect(W - w, b * 20, w, 20);
          else ctx.fillRect(0, b * 20, w, 20);
        }
      }
    }
  }

  private drawMon(s: Side, spr: HTMLCanvasElement, x: number, y: number) {
    if (this.blink[s] > 0 && Math.floor(this.blink[s] / 2) % 2 === 0) return;
    const [ox, oy] = this.off[s];
    const sink = this.sink[s];
    const px = x + ox, py = y + oy;
    if (s === 'f' && this.shrink > 0) {
      const k = 1 - this.shrink;
      const w = Math.max(1, Math.round(48 * k));
      ctx.drawImage(silhouette(spr, '#ffffff'), px + (48 - w) / 2, py + (48 - w) / 2, w, w);
      return;
    }
    if (sink > 0) {
      const visH = Math.round(48 * (1 - sink));
      if (visH <= 0) return;
      ctx.drawImage(spr, 0, 0, 48, visH, px, py + 48 - visH, 48, visH);
      return;
    }
    const bob = this.uiMode !== 'none' ? Math.round(Math.sin(this.t / (s === 'p' ? 14 : 18)) * 1) : 0;
    const g = this.grow[s];
    if (g < 1) {
      const e = 1 - Math.pow(1 - g, 3);
      const w = Math.max(1, Math.round(48 * e));
      ctx.drawImage(silhouette(spr, '#ffffff'), px + (48 - w) / 2, py + 48 - w, w, w);
      return;
    }
    ctx.drawImage(spr, px, py + bob, 48, 48);
    if (this.flash[s] > 0 && this.flash[s] % 4 < 2) ctx.drawImage(silhouette(spr, 'rgba(255,255,255,0.85)'), px, py);
  }

  private drawVs() {
    const tr = this.opts.trainer!;
    const k = this.vsT > 75 ? (90 - this.vsT) / 15 : this.vsT < 12 ? this.vsT / 12 : 1;
    ctx.fillStyle = 'rgba(16,10,32,0.85)';
    ctx.fillRect(0, 0, W, H);
    const bandH = Math.round(70 * k);
    const g = ctx.createLinearGradient(0, 0, W, 0);
    g.addColorStop(0, tr.chefe ? '#5a1838' : '#283c88'); g.addColorStop(1, tr.chefe ? '#a83858' : '#4878d8');
    ctx.fillStyle = g;
    ctx.fillRect(0, 80 - bandH / 2, W, bandH);
    // listras animadas
    ctx.fillStyle = 'rgba(255,255,255,0.12)';
    for (let i = 0; i < 8; i++) { const x = ((this.t * 4 + i * 40) % (W + 40)) - 40; ctx.fillRect(x, 80 - bandH / 2, 14, bandH); }
    if (k >= 1 && this.trainerSpr) {
      const slide = Math.max(0, (this.vsT - 60) * 6);
      ctx.drawImage(this.trainerSpr, 24 - slide, 56, 48, 48);
      text(tr.classe.toUpperCase(), 92 + slide, 60, { size: 10, color: '#f8d048', shadow: '#201030', bold: true });
      text(fmt(tr.nome), 92 + slide, 74, { size: 18, color: '#ffffff', shadow: '#201030', bold: true });
      text('VS', W - 34, 62, { size: 22, color: '#f8f8f8', shadow: '#e04848', bold: true });
    }
  }

  private drawFoeBox() {
    const m = this.F.m;
    box(6, 8, 108, 34);
    text(nomeDe(m), 14, 12, { size: 10, bold: true });
    text(`Nv${m.nivel}`, 106, 12, { size: 9, align: 'right' });
    statusBadge(m.status, 14, 25);
    hpBar(42, 28, 56, this.hpShown.f / maxHp(m));
    if (S.capturados.includes(m.sp) && this.opts.wild) { ctx.drawImage(this.ballSpr, 33, 25, 8, 8); }
  }

  private drawPlayerBox() {
    const m = this.P.m;
    box(124, 68, 112, 42);
    text(nomeDe(m), 132, 72, { size: 10, bold: true });
    text(`Nv${m.nivel}`, 228, 72, { size: 9, align: 'right' });
    statusBadge(m.status, 132, 85);
    hpBar(160, 86, 56, this.hpShown.p / maxHp(m));
    text(`${Math.ceil(this.hpShown.p)}/${maxHp(m)}`, 228, 91, { size: 9, align: 'right' });
    xpBar(132, 104, 96, this.xpShown);
  }
}

function ellipse(cx: number, cy: number, rx: number, ry: number, c: string) {
  ctx.fillStyle = c;
  ctx.beginPath();
  ctx.ellipse(cx, cy, rx, ry, 0, 0, Math.PI * 2);
  ctx.fill();
}

function guessLook(t: TrainerDef): string {
  const c = t.classe.toLowerCase();
  if (c.includes('rival')) return 'rival';
  if (c.includes('líder')) return 'lider';
  if (c.includes('garota') || c.includes('menina')) return 'garota';
  if (c.includes('inseteiro')) return 'inseteiro';
  if (c.includes('alpinista')) return 'alpinista';
  if (c.includes('campista')) return 'campista';
  if (c.includes('pescador')) return 'pescador';
  return 'garoto';
}

export function startWildBattle(sp: string, lvl: number) {
  return stack.push(new BattleScene({ wild: { sp, lvl } }));
}
export function startTrainerBattle(t: TrainerDef, musica?: string) {
  return stack.push(new BattleScene({ trainer: { ...t, nome: fmt(t.nome) }, musica }));
}
