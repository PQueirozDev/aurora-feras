import { Scene, stack, wait } from '../engine/scene';
import { input } from '../engine/input';
import { audio } from '../engine/audio';
import { W, H, ctx, text, measure } from '../engine/screen';
import { makeCanvas } from '../gfx/pixel';
import { paintTile, SOLID, TS, ANIMATED, tallGrassOverlay } from '../gfx/tiles';
import { personSprites, capsuleSprite, LOOKS, type Dir, type PersonSprites } from '../gfx/people';
import { MAPS, type MapDef, type NPC, type TrainerDef, type WorldAPI, type NpcRef } from '../data/maps';
import { S, addItem, marcarCapturado, autoSalvar, ultimoAutoSave } from '../game/state';
import { criarMon, curarTotal, nomeDe } from '../game/mon';
import { item } from '../data/items';
import { say, ask, choose, fadeOut, fadeIn } from '../game/game';
import { fmt } from './dialog';
import { box } from '../ui/draw';
import { isEN, L, nomeItem } from '../i18n';
import { creatureSprites } from '../gfx/creatures';
import { CreditsScene } from './credits';

const DX: Record<Dir, number> = { up: 0, down: 0, left: -1, right: 1 };
const DY: Record<Dir, number> = { up: -1, down: 1, left: 0, right: 0 };
const OPP: Record<Dir, Dir> = { up: 'down', down: 'up', left: 'right', right: 'left' };

type Actor = {
  id: string;
  x: number; y: number; // tile atual (destino quando em movimento)
  fx: number; fy: number; // tile de origem do movimento
  prog: number; // 0..1 progresso do passo
  moving: boolean;
  jump: boolean;
  dir: Dir;
  speed: number;
  sprites: PersonSprites | null;
  obj: HTMLCanvasElement | null;
  hidden: boolean;
  queue: Dir[];
  onIdle: (() => void)[];
  stepCount: number;
  def?: NPC;
  wanderT: number;
  homeX: number; homeY: number;
};

const capSprite = capsuleSprite();

function mkActor(id: string, x: number, y: number, dir: Dir, look?: string, obj?: boolean): Actor {
  return {
    id, x, y, fx: x, fy: y, prog: 1, moving: false, jump: false, dir, speed: 1 / 8,
    sprites: look ? personSprites(LOOKS[look] ?? LOOKS.garoto) : null,
    obj: obj ? capSprite : null,
    hidden: false, queue: [], onIdle: [], stepCount: 0, wanderT: 60 + Math.random() * 120,
    homeX: x, homeY: y,
  };
}

export class WorldScene extends Scene<void> implements WorldAPI {
  mapId = '';
  map!: MapDef;
  mw = 0; mh = 0;
  layer!: HTMLCanvasElement;
  layerCtx!: CanvasRenderingContext2D;
  animTiles: [number, number, string][] = [];
  borderTile!: HTMLCanvasElement;
  player!: Actor;
  npcs: Actor[] = [];
  busy = false;
  t = 0;
  animFrame = 0;
  namePopup = 0;
  emoteOn: { id: string; t: number } | null = null;
  turnDelay = 0;
  bumpCd = 0;
  /** callbacks externos (menus/batalha) para evitar import circular */
  static hooks: {
    battleWild?: (sp: string, lvl: number) => Promise<'win' | 'lose' | 'run' | 'caught'>;
    battleTrainer?: (t: TrainerDef, musica?: string) => Promise<'win' | 'lose' | 'run' | 'caught'>;
    startMenu?: (w: WorldScene) => Promise<void>;
    shop?: (stock: string[]) => Promise<void>;
    pc?: () => Promise<void>;
  } = {};

  constructor() {
    super();
    this.player = mkActor('player', S.x, S.y, S.dir, 'player');
    this.loadMap(S.mapa, S.x, S.y, S.dir);
  }

  // ---------------- mapa ----------------
  tileAt(x: number, y: number): string {
    if (y < 0 || y >= this.mh || x < 0 || x >= this.mw) return '';
    return this.map.tiles[y][x];
  }

  loadMap(id: string, x: number, y: number, dir: Dir) {
    this.mapId = id;
    this.map = MAPS[id];
    this.mh = this.map.tiles.length;
    this.mw = this.map.tiles[0].length;
    const [c, cx] = makeCanvas(this.mw * TS, this.mh * TS);
    this.layer = c;
    this.layerCtx = cx;
    this.animTiles = [];
    const get = (a: number, b: number) => this.tileAt(a, b);
    for (let ty = 0; ty < this.mh; ty++) for (let tx = 0; tx < this.mw; tx++) {
      const ch = this.map.tiles[ty][tx];
      paintTile(cx, ch, tx * TS, ty * TS, tx, ty, get, 0);
      if (ANIMATED.has(ch)) this.animTiles.push([tx, ty, ch]);
    }
    const [bt, bx] = makeCanvas(TS, TS);
    paintTile(bx, this.map.borda, 0, 0, 0, 0, () => this.map.borda, 0);
    this.borderTile = bt;
    Object.assign(this.player, { x, y, fx: x, fy: y, prog: 1, moving: false, dir, queue: [] });
    this.npcs = this.map.npcs.map((n) => {
      const a = mkActor(n.id, n.x, n.y, n.dir, n.look, n.obj === 'capsula');
      if (n.obj === 'fera' && n.sp) a.obj = creatureSprites(n.sp).front;
      a.def = n;
      return a;
    });
    this.refresh();
    S.mapa = id; S.x = x; S.y = y; S.dir = dir;
    if (this.map.cidade) S.flags['visit_' + id] = true;
    audio.music(this.map.musica);
    if (this.map.cidade) autoSalvar();
    this.namePopup = this.map.interior ? 0 : 120;
  }

  refresh() {
    for (const a of this.npcs) {
      const d = a.def!;
      let hidden = false;
      if (d.hideIf && S.flags[d.hideIf]) hidden = true;
      if (d.showIf && !S.flags[d.showIf]) hidden = true;
      a.hidden = hidden;
    }
  }

  actorAt(x: number, y: number): Actor | undefined {
    return this.npcs.find((a) => !a.hidden && ((a.x === x && a.y === y) || (a.moving && a.fx === x && a.fy === y)));
  }

  blocked(x: number, y: number, self?: Actor): boolean {
    const ch = this.tileAt(x, y);
    if (ch === '' || SOLID.has(ch)) return true;
    const a = this.actorAt(x, y);
    if (a && a !== self) return true;
    if (self !== this.player && this.player.x === x && this.player.y === y) return true;
    return false;
  }

  // ---------------- movimento ----------------
  private startStep(a: Actor, dir: Dir): boolean {
    a.dir = dir;
    let nx = a.x + DX[dir], ny = a.y + DY[dir];
    let jump = false;
    const ch = this.tileAt(nx, ny);
    if (ch === 'L') {
      if (dir !== 'down' || this.blocked(nx, ny + 1, a)) return false;
      ny += 1;
      jump = true;
    } else if (this.blocked(nx, ny, a)) {
      // saída pela borda do mapa (conexões)
      if (a === this.player && ch === '' && this.connectionFor(nx, ny)) {
        // permitido: trata no fim do passo
      } else return false;
    }
    a.fx = a.x; a.fy = a.y;
    a.x = nx; a.y = ny;
    a.prog = 0;
    a.moving = true;
    a.jump = jump;
    a.stepCount++;
    if (jump) audio.sfx('bump');
    if (a === this.player && this.tileAt(nx, ny) === '"') this.puff(nx, ny, 'grama');
    return true;
  }

  private connectionFor(x: number, y: number) {
    const c = this.map.conexoes;
    if (!c) return null;
    if (y < 0 && c.n) return { side: 'n' as const, ...c.n };
    if (y >= this.mh && c.s) return { side: 's' as const, ...c.s };
    if (x >= this.mw && c.e) return { side: 'e' as const, ...c.e };
    if (x < 0 && c.w) return { side: 'w' as const, ...c.w };
    return null;
  }

  private updateActor(a: Actor) {
    if (a.moving) {
      const sp = a.jump ? a.speed / 2 : a.speed;
      a.prog = Math.min(1, a.prog + sp);
      if (a.prog >= 1) {
        a.moving = false;
        if (a.jump && a === this.player) this.puff(a.x, a.y, 'poeira');
        a.jump = false;
        if (a === this.player) this.onPlayerStepEnd();
      }
    }
    if (!a.moving) {
      if (a.queue.length) {
        const d = a.queue.shift()!;
        if (!this.startStep(a, d)) {
          // caminho bloqueado: tenta de novo no próximo frame
          a.queue.unshift(d);
        }
      } else if (a.onIdle.length) {
        const cbs = a.onIdle; a.onIdle = [];
        cbs.forEach((f) => f());
      }
    }
  }

  private async onPlayerStepEnd() {
    const p = this.player;
    // conexão para outro mapa
    if (p.x < 0 || p.y < 0 || p.x >= this.mw || p.y >= this.mh) {
      const c = this.connectionFor(p.x, p.y)!;
      const target = MAPS[c.map];
      let nx = p.x, ny = p.y;
      if (c.side === 'n') { nx = p.x + c.d; ny = target.tiles.length - 1; }
      if (c.side === 's') { nx = p.x + c.d; ny = 0; }
      if (c.side === 'e') { nx = 0; ny = p.y + c.d; }
      if (c.side === 'w') { nx = target.tiles[0].length - 1; ny = p.y + c.d; }
      this.loadMap(c.map, nx, ny, p.dir);
      return;
    }
    S.x = p.x; S.y = p.y; S.dir = p.dir;
    if (this.busy) return;
    const ch = this.tileAt(p.x, p.y);
    // portas
    const wp = this.map.warps.find((w) => w.x === p.x && w.y === p.y);
    if (wp) {
      this.busy = true;
      audio.sfx('door');
      await this.warp(wp.to, wp.tx, wp.ty, wp.dir ?? p.dir);
      this.busy = false;
      return;
    }
    // gatilhos do mapa
    if (this.map.aoPisar) {
      this.busy = true;
      const handled = await this.map.aoPisar(this, p.x, p.y);
      this.busy = false;
      if (handled) return;
    }
    // treinadores
    if (await this.checkTrainers()) return;
    // grama alta
    if (S.repelente && S.repelente > 0) {
      S.repelente--;
      if (S.repelente === 0) { this.busy = true; await say(L('O efeito do repelente acabou.', 'The repel wore off.')); this.busy = false; }
    }
    if (ch === '"' || (this.map.caverna && ch === ':')) {
      if (ch === '"') audio.sfx('grass');
      const enc = this.map.encontros;
      const repel = (S.repelente ?? 0) > 0;
      if (enc && !repel && S.equipe.some((m) => m.hp > 0) && Math.random() * 100 < enc.taxa) {
        const total = enc.lista.reduce((s, e) => s + e[3], 0);
        let r = Math.random() * total;
        let pick = enc.lista[0];
        for (const e of enc.lista) { r -= e[3]; if (r <= 0) { pick = e; break; } }
        const lvl = pick[1] + Math.floor(Math.random() * (pick[2] - pick[1] + 1));
        this.busy = true;
        const res = await WorldScene.hooks.battleWild!(pick[0], lvl);
        await this.afterBattle(res, false);
        this.busy = false;
      }
    }
  }

  private async checkTrainers(): Promise<boolean> {
    const p = this.player;
    for (const a of this.npcs) {
      const t = a.def?.trainer;
      if (!t || a.hidden || S.flags[t.flag]) continue;
      const v = t.visao ?? 3;
      let x = a.x, y = a.y, seen = false;
      for (let i = 1; i <= v; i++) {
        x += DX[a.dir]; y += DY[a.dir];
        if (x === p.x && y === p.y) { seen = true; break; }
        const ch = this.tileAt(x, y);
        if (ch === '' || SOLID.has(ch) || this.actorAt(x, y)) break;
      }
      if (!seen) continue;
      this.busy = true;
      audio.music(null);
      await this.emote(a.id);
      // anda até ficar ao lado do jogador
      const path: Dir[] = [];
      const dist = Math.abs(p.x - a.x) + Math.abs(p.y - a.y);
      for (let i = 1; i < dist; i++) path.push(a.dir);
      await this.moveNpc(a.id, path);
      this.player.dir = OPP[a.dir];
      await say(t.intro);
      await this.battleTrainer(t);
      this.busy = false;
      return true;
    }
    return false;
  }

  private async afterBattle(res: 'win' | 'lose' | 'run' | 'caught', podePerder: boolean) {
    if (res === 'lose' && !podePerder) {
      await say(L('{nome} não tem mais feras em condições de lutar!', '{nome} has no beasts left that can battle!'), L('{nome} desmaiou e foi levado para um lugar seguro...', '{nome} blacked out and was taken somewhere safe...'));
      await fadeOut(30);
      S.dinheiro = Math.floor(S.dinheiro / 2);
      S.equipe.forEach(curarTotal);
      const u = S.ultimaCura;
      this.loadMap(u.mapa, u.x, u.y, 'up');
      await fadeIn(30);
      await say(L('Suas feras foram curadas. Tome mais cuidado da próxima vez!', 'Your beasts were healed. Be more careful next time!'));
    } else if (res === 'lose') {
      S.equipe.forEach(curarTotal);
      audio.music(this.map.musica);
    } else {
      audio.music(this.map.musica);
    }
  }

  // ---------------- interação ----------------
  private async interact() {
    const p = this.player;
    let tx = p.x + DX[p.dir], ty = p.y + DY[p.dir];
    let target = this.actorAt(tx, ty);
    const ch = this.tileAt(tx, ty);
    if (!target && ch === 'c') { tx += DX[p.dir]; ty += DY[p.dir]; target = this.actorAt(tx, ty); }
    if (target?.def?.talk) {
      this.busy = true;
      if (target.sprites) target.dir = OPP[p.dir];
      await target.def.talk(this);
      this.refresh();
      this.busy = false;
      return;
    }
    const placa = this.map.placas?.find((s) => s.x === tx && s.y === ty);
    if (placa) {
      this.busy = true;
      await say(placa.texto);
      this.busy = false;
      return;
    }
    if (ch === 'p') {
      this.busy = true;
      await say(L('{nome} ligou o computador.', '{nome} turned on the PC.'));
      await this.pc();
      this.busy = false;
      return;
    }
    if (ch === 'b') { this.busy = true; await say(L('Está cheio de livros sobre feras.', 'It is full of books about beasts.')); this.busy = false; return; }
    if (ch === 'v') { this.busy = true; await say(L('Está passando um programa sobre treinadores famosos de Aurora!', 'A show about famous Aurora trainers is on!')); this.busy = false; return; }
    if (ch === 'h') { this.busy = true; await say(L('Uma máquina que cura feras.', 'A machine that heals beasts.')); this.busy = false; return; }
  }

  // ---------------- loop ----------------
  update() {
    this.t++;
    if (this.shakeT > 0) this.shakeT--;
    for (const pt of this.parts) { pt.x += pt.vx; pt.y += pt.vy; pt.vy += 0.08; pt.life--; }
    this.parts = this.parts.filter((pt) => pt.life > 0);
    if (this.t % 30 === 0) this.repaintAnimated();
    if (this.namePopup > 0) this.namePopup--;
    if (this.emoteOn && --this.emoteOn.t <= 0) this.emoteOn = null;
    if (this.bumpCd > 0) this.bumpCd--;

    const p = this.player;
    if (!this.busy && !p.moving && p.queue.length === 0) {
      if (input.pressed('start')) {
        audio.sfx('blip');
        this.busy = true;
        WorldScene.hooks.startMenu!(this).then(() => { this.busy = false; });
      } else if (input.pressed('a')) {
        this.interact();
      } else {
        const d = input.heldDir();
        if (d) {
          if (d !== p.dir && this.turnDelay === 0) {
            p.dir = d;
            this.turnDelay = 5;
          } else if (this.turnDelay > 1 && d === p.dir) {
            this.turnDelay--;
          } else {
            this.turnDelay = 0;
            p.speed = input.held('b') ? 1 / 4 : 1 / 8;
            if (!this.startStep(p, d)) {
              if (this.bumpCd === 0) { audio.sfx('bump'); this.bumpCd = 18; }
            }
          }
        } else this.turnDelay = 0;
      }
    }
    this.updateActor(p);
    for (const a of this.npcs) {
      if (a.hidden) continue;
      if (a.def?.wander && !this.busy && !a.moving && !a.queue.length) {
        if (--a.wanderT <= 0) {
          a.wanderT = 90 + Math.random() * 160;
          const dirs: Dir[] = ['up', 'down', 'left', 'right'];
          const d = dirs[Math.floor(Math.random() * 4)];
          const nx = a.x + DX[d], ny = a.y + DY[d];
          if (Math.abs(nx - a.homeX) <= 2 && Math.abs(ny - a.homeY) <= 2 && !this.blocked(nx, ny, a) && this.tileAt(nx, ny) !== 'L') {
            a.speed = 1 / 10;
            this.startStep(a, d);
          } else a.dir = d;
        }
      }
      this.updateActor(a);
    }
  }

  private repaintAnimated() {
    this.animFrame++;
    const get = (a: number, b: number) => this.tileAt(a, b);
    for (const [tx, ty, ch] of this.animTiles) paintTile(this.layerCtx, ch, tx * TS, ty * TS, tx, ty, get, this.animFrame);
  }

  private actorPos(a: Actor): [number, number, number] {
    const k = a.prog;
    const x = (a.fx + (a.x - a.fx) * k) * TS;
    const y = (a.fy + (a.y - a.fy) * k) * TS;
    const lift = a.jump ? Math.sin(k * Math.PI) * 8 : 0;
    return [x, y, lift];
  }

  draw() {
    const [ppx, ppy] = this.actorPos(this.player);
    const sh = this.shakeT > 0 ? Math.round((Math.random() - 0.5) * 6) : 0;
    const camX = Math.round(ppx + 8 - W / 2) + sh;
    const camY = Math.round(ppy + 8 - H / 2) + (this.shakeT > 0 ? Math.round((Math.random() - 0.5) * 3) : 0);
    ctx.fillStyle = '#000';
    ctx.fillRect(0, 0, W, H);
    // borda
    if (!this.map.interior) {
      const x0 = Math.floor(camX / TS) - 1, y0 = Math.floor(camY / TS) - 1;
      for (let ty = y0; ty < y0 + 13; ty++) for (let tx = x0; tx < x0 + 17; tx++) {
        if (tx >= 0 && ty >= 0 && tx < this.mw && ty < this.mh) continue;
        ctx.drawImage(this.borderTile, tx * TS - camX, ty * TS - camY);
      }
    }
    ctx.drawImage(this.layer, -camX, -camY);
    // atores ordenados por y
    const all = [...this.npcs.filter((a) => !a.hidden), this.player];
    all.sort((a, b) => this.actorPos(a)[1] - this.actorPos(b)[1]);
    for (const a of all) {
      const [x, y, lift] = this.actorPos(a);
      const sx = Math.round(x - camX), sy = Math.round(y - camY);
      if (sx < -16 || sy < -24 || sx > W || sy > H + 8) continue;
      if (a.obj && a.obj.width > 16) {
        // fera lendária no mapa: flutua e brilha
        const bob = Math.round(Math.sin(this.t / 15) * 2);
        ctx.globalAlpha = 0.25 + Math.sin(this.t / 10) * 0.1;
        ctx.fillStyle = '#c8f8f0';
        ctx.beginPath(); ctx.ellipse(sx + 8, sy + 10, 20, 6, 0, 0, Math.PI * 2); ctx.fill();
        ctx.globalAlpha = 1;
        ctx.drawImage(a.obj, sx - 16, sy - 30 + bob);
        continue;
      }
      if (a.obj) { ctx.drawImage(a.obj, sx + 2, sy + 2 + (Math.floor(this.t / 40) % 2)); continue; }
      if (!a.sprites) continue;
      // sombra
      if (a.jump) { ctx.fillStyle = 'rgba(0,0,0,0.25)'; ctx.fillRect(sx + 3, sy + 12, 10, 3); }
      const frames = a.sprites[a.dir];
      let fi = 0;
      if (a.moving) {
        const half = a.prog > 0.25 && a.prog < 0.75;
        fi = half ? (a.stepCount % 2 ? 1 : 2) : 0;
      }
      ctx.drawImage(frames[fi], sx, sy - 4 - Math.round(lift));
      // grama alta por cima das pernas
      const tx = Math.round(x / TS), ty = Math.round(y / TS);
      if (!a.moving && this.tileAt(tx, ty) === '"') ctx.drawImage(tallGrassOverlay, sx, sy + 8);
      else if (a.moving && a.prog > 0.5 && this.tileAt(a.x, a.y) === '"') ctx.drawImage(tallGrassOverlay, sx, sy + 8);
    }
    // partículas (grama / poeira)
    for (const pt of this.parts) {
      ctx.globalAlpha = Math.min(1, pt.life / 10);
      ctx.fillStyle = pt.c;
      ctx.fillRect(Math.round(pt.x - camX), Math.round(pt.y - camY), 2, 2);
    }
    ctx.globalAlpha = 1;
    // escuridão de caverna: só a área em volta do jogador fica visível
    if (this.map.escuro) {
      const cxp = ppx + 8 - camX, cyp = ppy + 4 - camY;
      const raio = 44 + Math.sin(this.t / 20) * 2;
      const g = ctx.createRadialGradient(cxp, cyp, raio * 0.45, cxp, cyp, raio);
      g.addColorStop(0, 'rgba(0,0,0,0)');
      g.addColorStop(1, 'rgba(4,2,10,0.94)');
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, W, H);
    }
    // emote "!"
    if (this.emoteOn) {
      const a = this.emoteOn.id === 'player' ? this.player : this.npcs.find((n) => n.id === this.emoteOn!.id);
      if (a) {
        const [x, y] = this.actorPos(a);
        const sx = Math.round(x - camX), sy = Math.round(y - camY) - 20;
        ctx.fillStyle = '#303038'; ctx.fillRect(sx + 3, sy - 1, 10, 13);
        ctx.fillStyle = '#ffffff'; ctx.fillRect(sx + 4, sy, 8, 11);
        ctx.fillStyle = '#e04848'; ctx.fillRect(sx + 7, sy + 1, 2, 6); ctx.fillRect(sx + 7, sy + 8, 2, 2);
      }
    }
    // ícone de salvamento automático
    const desde = performance.now() - ultimoAutoSave;
    if (ultimoAutoSave && desde < 1800) {
      ctx.globalAlpha = desde > 1300 ? (1800 - desde) / 500 : 1;
      box(W - 58, H - 20, 56, 18);
      text(isEN() ? 'saving...' : 'salvando...', W - 30, H - 16, { size: 8, align: 'center', shadow: null });
      ctx.globalAlpha = 1;
    }
    // nome do mapa
    if (this.namePopup > 0) {
      const nome = fmt(this.map.nome);
      const w = Math.max(80, measure(nome, 10) + 20);
      const slide = this.namePopup > 105 ? (120 - this.namePopup) / 15 : this.namePopup < 15 ? this.namePopup / 15 : 1;
      const y = Math.round(-24 + 28 * slide);
      box(4, y, w, 22);
      text(nome, 4 + w / 2, y + 5, { size: 10, align: 'center' });
    }
  }

  // ---------------- API para scripts ----------------
  say(...m: string[]) { return say(...m); }
  ask(m: string) { return ask(m); }
  choose(m: string | null, opts: string[], cancel = true) { return choose(m, opts, cancel); }
  flag(f: string) { return !!S.flags[f]; }
  set(f: string, v = true) { S.flags[f] = v; }
  npc(id: string): NpcRef | undefined {
    const a = this.npcs.find((n) => n.id === id);
    return a ? { id: a.id, x: a.x, y: a.y, dir: a.dir, hidden: a.hidden } : undefined;
  }
  moveNpc(id: string, path: Dir[]): Promise<void> {
    const a = this.npcs.find((n) => n.id === id);
    if (!a || !path.length) return Promise.resolve();
    a.speed = 1 / 8;
    a.queue.push(...path);
    return new Promise((r) => a.onIdle.push(r));
  }
  movePlayer(path: Dir[]): Promise<void> {
    if (!path.length) return Promise.resolve();
    this.player.speed = 1 / 8;
    this.player.queue.push(...path);
    return new Promise((r) => this.player.onIdle.push(r));
  }
  face(id: string, dir: Dir | 'player') {
    const a = this.npcs.find((n) => n.id === id);
    if (!a) return;
    if (dir === 'player') {
      const dx = this.player.x - a.x, dy = this.player.y - a.y;
      a.dir = Math.abs(dx) > Math.abs(dy) ? (dx > 0 ? 'right' : 'left') : dy > 0 ? 'down' : 'up';
    } else a.dir = dir;
  }
  facePlayer(dir: Dir) { this.player.dir = dir; }
  async emote(id: string) {
    audio.sfx('exclaim');
    this.emoteOn = { id, t: 40 };
    await wait(40);
  }
  async battleTrainer(t: TrainerDef, opts: { podePerder?: boolean; musica?: string } = {}): Promise<boolean> {
    if (!S.equipe.some((m) => m.hp > 0)) {
      await this.afterBattle('lose', !!opts.podePerder);
      return false;
    }
    const res = await WorldScene.hooks.battleTrainer!(t, opts.musica);
    const won = res === 'win';
    if (won) { S.flags[t.flag] = true; autoSalvar(); }
    await this.afterBattle(res, !!opts.podePerder);
    return won;
  }
  async giveMon(sp: string, lvl: number): Promise<boolean> {
    const m = criarMon(sp, lvl);
    m.dono = S.nome;
    marcarCapturado(sp);
    if (S.equipe.length < 6) {
      S.equipe.push(m);
      await audio.jingle('captura');
      await say(L(`{nome} recebeu ${nomeDe(m)}!`, `{nome} received ${nomeDe(m)}!`));
    } else {
      S.caixa.push(m);
      await audio.jingle('captura');
      await say(L(`{nome} recebeu ${nomeDe(m)}!`, `{nome} received ${nomeDe(m)}!`), L(`A equipe está cheia. ${nomeDe(m)} foi enviado para o computador.`, `Your team is full. ${nomeDe(m)} was sent to the PC.`));
    }
    return true;
  }
  async giveItem(id: string, n = 1) {
    addItem(id, n);
    audio.sfx('heal');
    await say(L(`{nome} obteve ${n > 1 ? n + 'x ' : ''}${nomeItem(id)}!`, `{nome} got ${n > 1 ? n + 'x ' : ''}${nomeItem(id)}!`));
  }
  async heal() {
    S.equipe.forEach(curarTotal);
    S.ultimaCura = { mapa: this.mapId, x: this.player.x, y: this.player.y };
    await audio.jingle('cura');
    autoSalvar();
  }
  shop(stock: string[]) { return WorldScene.hooks.shop!(stock); }
  pc() { return WorldScene.hooks.pc!(); }
  async warp(map: string, x: number, y: number, dir: Dir) {
    await fadeOut(12);
    this.loadMap(map, x, y, dir);
    await fadeIn(12);
    if (this.map.aoEntrar) await this.map.aoEntrar(this);
  }
  wait(frames: number) { return wait(frames); }
  music(name: string | null) { audio.music(name); }
  jingle(name: string) { return audio.jingle(name); }
  battleWild(sp: string, lvl: number) { return WorldScene.hooks.battleWild!(sp, lvl).then(async (r) => { await this.afterBattle(r, false); return r; }); }
  async shake(frames = 20) { this.shakeT = frames; audio.sfx('superhit'); await wait(frames); }
  private shakeT = 0;
  private parts: { x: number; y: number; vx: number; vy: number; life: number; c: string }[] = [];
  private puff(tx: number, ty: number, tipo: 'grama' | 'poeira') {
    for (let i = 0; i < 6; i++) {
      this.parts.push({
        x: tx * TS + 8 + (Math.random() - 0.5) * 10, y: ty * TS + 12,
        vx: (Math.random() - 0.5) * 1.2, vy: -Math.random() * 1.4 - 0.4, life: 18 + Math.random() * 8,
        c: tipo === 'grama' ? (Math.random() < 0.5 ? '#48a848' : '#78c860') : '#d8c8a0',
      });
    }
  }
  async flash(_color = '#fff') { await fadeOut(6, _color); await fadeIn(6); }
  insignias() { return ['insignia_rocha', 'insignia_mare', 'insignia_volt', 'insignia_bruma'].filter((f) => S.flags[f]).length; }
  async credits() {
    await fadeOut(40, '#fff');
    S.hallDaFama = [...(S.hallDaFama ?? []), { equipe: S.equipe.map((m) => ({ sp: m.sp, nivel: m.nivel, nome: nomeDe(m) })), tempo: S.tempo }];
    const creditos = stack.push(new CreditsScene());
    await fadeIn(30);
    await creditos;
    await fadeOut(30);
    this.loadMap('casa1', 5, 4, 'down');
    S.equipe.forEach(curarTotal);
    S.ultimaCura = { mapa: 'casa1', x: 5, y: 4 };
    await fadeIn(40);
    await say('Mãe: {nome}! Que bom que voltou! Toda a vila está falando do novo campeão de Aurora!', 'Mãe: Dizem que algo brilha no alto da caverna da Vila Neblina... Mas descanse um pouco antes, viu?');
  }
  async travel() {
    const cidades = Object.entries(MAPS).filter(([id, m]) => m.cidade && S.flags['visit_' + id]);
    const r = await choose(null, [...cidades.map(([, m]) => m.cidade!.nome.toUpperCase()), 'CANCELAR']);
    if (r < 0 || r >= cidades.length) return;
    const [id, m] = cidades[r];
    await this.warp(id, m.cidade!.x, m.cidade!.y, 'down');
  }
  pos(): { x: number; y: number; dir: Dir } { return { x: this.player.x, y: this.player.y, dir: this.player.dir }; }
}

export let world: WorldScene | null = null;
export function startWorld() {
  stack.clear();
  world = new WorldScene();
  stack.push(world);
  return world;
}
