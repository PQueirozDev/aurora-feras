import { Scene, stack } from '../engine/scene';
import { input } from '../engine/input';
import { audio } from '../engine/audio';
import { W, H, ctx, rect, text } from '../engine/screen';
import { box, cursor } from '../ui/draw';
import { creatureSprites } from '../gfx/creatures';
import { personSprites, LOOKS } from '../gfx/people';
import { S, temSave, carregar, novoEstado, setState } from '../game/state';
import { say, ask, fadeOut, fadeIn } from '../game/game';
import { startWorld } from './world';

// ======================= TELA DE NOME =======================
const UP = 'ABCDEFGHIJKLMNOPQRSTUVWXYZÁÂÃÉÊÍÓÔÕÚÇ-';
export class NamingScene extends Scene<string> {
  nome = '';
  idx = 0;
  lower = false;
  private onKey = (e: KeyboardEvent) => {
    if (e.key === 'Backspace') { this.nome = this.nome.slice(0, -1); audio.sfx('blip'); e.preventDefault(); }
    else if (e.key === 'Enter') { this.confirm(); e.preventDefault(); }
    else if (e.key.length === 1 && /[\p{L}\- ]/u.test(e.key) && this.nome.length < 8) { this.nome += e.key; audio.sfx('blip'); }
  };
  constructor(private titulo: string, private sugestao: string, private look: string) { super(); }
  onEnter() { input.textMode = true; window.addEventListener('keydown', this.onKey); }
  private confirm() {
    const n = this.nome.trim() || this.sugestao;
    input.textMode = false;
    window.removeEventListener('keydown', this.onKey);
    audio.sfx('save');
    this.finish(n);
  }
  private chars() { return [...(this.lower ? UP.toLowerCase() : UP)]; }
  update() {
    const c = this.chars();
    const total = c.length + 3; // aA, APAGAR, OK
    const cols = 10;
    if (input.repeat('right')) { this.idx = (this.idx + 1) % total; audio.sfx('blip'); }
    if (input.repeat('left')) { this.idx = (this.idx + total - 1) % total; audio.sfx('blip'); }
    if (input.repeat('down')) { this.idx = this.idx < c.length ? Math.min(total - 1, this.idx + cols) : this.idx; audio.sfx('blip'); }
    if (input.repeat('up')) { this.idx = this.idx >= c.length ? Math.max(0, c.length - 10 + (this.idx - c.length) * 3) : Math.max(0, this.idx - cols); audio.sfx('blip'); }
    if (input.pressed('b')) { this.nome = this.nome.slice(0, -1); audio.sfx('blip'); }
    if (input.pressed('start')) { this.confirm(); return; }
    if (input.pressed('a')) {
      audio.sfx('blip');
      if (this.idx < c.length) { if (this.nome.length < 8) this.nome += c[this.idx]; }
      else if (this.idx === c.length) this.lower = !this.lower;
      else if (this.idx === c.length + 1) this.nome = this.nome.slice(0, -1);
      else this.confirm();
    }
  }
  draw() {
    rect(0, 0, W, H, '#5878b8');
    box(4, 4, W - 8, 40);
    ctx.drawImage(personSprites(LOOKS[this.look]).down[0], 12, 14);
    text(this.titulo, 36, 9, { size: 10 });
    const shown = this.nome + (Math.floor(Date.now() / 400) % 2 ? '_' : ' ');
    text(shown, 36, 24, { size: 13, bold: true });
    if (!this.nome) text(`(vazio = ${this.sugestao})`, 228, 27, { size: 8, align: 'right', color: '#8888a0', shadow: null });
    box(4, 48, W - 8, 108);
    const c = this.chars();
    c.forEach((ch, i) => {
      const x = 22 + (i % 10) * 21, y = 56 + Math.floor(i / 10) * 18;
      text(ch, x, y, { size: 12, align: 'center' });
      if (i === this.idx) { ctx.strokeStyle = '#e05848'; ctx.lineWidth = 1; ctx.strokeRect(x - 8.5, y - 1.5, 17, 17); }
    });
    const acts = [this.lower ? 'ABC' : 'abc', 'APAGAR', 'OK'];
    acts.forEach((a, k) => {
      const x = 40 + k * 70, y = 134;
      text(a, x, y, { size: 11, align: 'center', bold: true });
      if (this.idx === c.length + k) cursor(x - 34, y + 3);
    });
  }
}

// ======================= INTRODUÇÃO =======================
class IntroBg extends Scene<void> {
  show: 'prof' | 'fera' | 'player' | 'rival' = 'prof';
  t = 0;
  update() { this.t++; }
  draw() {
    const g = ctx.createLinearGradient(0, 0, 0, H);
    g.addColorStop(0, '#203050'); g.addColorStop(1, '#4868a0');
    ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
    ctx.fillStyle = 'rgba(255,255,255,0.08)';
    ctx.beginPath(); ctx.ellipse(120, 96, 70, 14, 0, 0, Math.PI * 2); ctx.fill();
    const bob = Math.round(Math.sin(this.t / 20) * 1.5);
    if (this.show === 'fera') {
      ctx.drawImage(creatureSprites('pulim').front, 120 - 48, 96 - 88 + bob, 96, 96);
    } else {
      const look = this.show === 'prof' ? LOOKS.prof : this.show === 'player' ? LOOKS.player : LOOKS.rival;
      ctx.drawImage(personSprites(look).down[0], 120 - 24, 96 - 66 + bob, 48, 48);
    }
  }
}

async function novoJogoIntro() {
  setState(novoEstado());
  const bg = new IntroBg();
  stack.clear();
  stack.push(bg);
  audio.music('interior');
  await fadeIn(20);
  await say('Olá! Seja bem-vindo ao mundo das feras!', 'Meu nome é Ipê. As pessoas me chamam de Professor das Feras.');
  bg.show = 'fera';
  audio.sfx('throw');
  await say('Este mundo é habitado por criaturas chamadas FERAS!', 'Algumas pessoas vivem com elas como amigas. Outras batalham com elas como parceiras.', 'Eu dedico minha vida a estudar as feras da região de AURORA.');
  bg.show = 'player';
  await say('Mas me conte um pouco sobre você. Qual é o seu nome?');
  S.nome = await stack.push(new NamingScene('Qual é o seu nome?', 'Léo', 'player'));
  await say('Certo! Então seu nome é {nome}!');
  bg.show = 'rival';
  await say('Este é seu vizinho. Vocês são rivais desde pequenos. Hum... qual era o nome dele mesmo?');
  S.rival = await stack.push(new NamingScene('Nome do seu rival?', 'Caio', 'rival'));
  await say('Isso mesmo! O nome dele é {rival}!');
  bg.show = 'player';
  await say('{nome}! Sua própria história com as feras está prestes a começar!', 'Um mundo de sonhos e aventuras com feras espera por você. Vamos lá!');
  await fadeOut(30, '#fff');
  S.mapa = 'casa1'; S.x = 5; S.y = 4; S.dir = 'down';
  S.ultimaCura = { mapa: 'casa1', x: 5, y: 4 };
  startWorld();
  await fadeIn(30);
}

// ======================= TÍTULO =======================
export class TitleScene extends Scene<void> {
  t = 0;
  menu = false;
  idx = 0;
  busy = false;
  opts: string[] = [];
  onEnter() { audio.music('title'); }
  update() {
    this.t++;
    if (this.busy) return;
    if (!this.menu) {
      if (input.pressed('a') || input.pressed('start')) {
        audio.sfx('save');
        this.menu = true;
        this.opts = temSave() ? ['CONTINUAR', 'NOVO JOGO'] : ['NOVO JOGO'];
      }
      return;
    }
    const n = this.opts.length;
    if (input.repeat('up')) { this.idx = (this.idx + n - 1) % n; audio.sfx('blip'); }
    if (input.repeat('down')) { this.idx = (this.idx + 1) % n; audio.sfx('blip'); }
    if (input.pressed('b')) { this.menu = false; return; }
    if (input.pressed('a')) {
      audio.sfx('blip');
      this.busy = true;
      this.choose(this.opts[this.idx]).finally(() => { this.busy = false; });
    }
  }
  private async choose(op: string) {
    if (op === 'CONTINUAR') {
      if (!carregar()) { await say('Não foi possível carregar o jogo salvo.'); return; }
      audio.setEnabled(!S.flags.semSom);
      await fadeOut(20);
      startWorld();
      await fadeIn(20);
      return;
    }
    if (temSave() && !(await ask('Já existe um jogo salvo. Começar um novo vai apagar o progresso quando você salvar. Continuar?'))) return;
    await fadeOut(20);
    await novoJogoIntro();
  }
  draw() {
    const g = ctx.createLinearGradient(0, 0, 0, H);
    g.addColorStop(0, '#182848'); g.addColorStop(0.6, '#3858a0'); g.addColorStop(1, '#e88858');
    ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
    // estrelas / aurora
    for (let i = 0; i < 40; i++) {
      const x = (i * 53) % W, y = (i * 37) % 70;
      ctx.fillStyle = (this.t + i * 7) % 60 < 30 ? '#ffffff' : '#8898c8';
      ctx.fillRect(x, y, 1, 1);
    }
    ctx.globalAlpha = 0.25;
    for (let k = 0; k < 3; k++) {
      ctx.fillStyle = ['#58f0a8', '#58c8f0', '#a878f0'][k];
      ctx.beginPath();
      for (let x = 0; x <= W; x += 8) {
        const y = 30 + k * 8 + Math.sin(x / 30 + this.t / 40 + k) * 8;
        if (x === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
      }
      ctx.lineTo(W, 0); ctx.lineTo(0, 0); ctx.fill();
    }
    ctx.globalAlpha = 1;
    // montanhas
    ctx.fillStyle = '#283860';
    ctx.beginPath(); ctx.moveTo(0, 130); ctx.lineTo(40, 100); ctx.lineTo(80, 122); ctx.lineTo(130, 90); ctx.lineTo(180, 118); ctx.lineTo(240, 96); ctx.lineTo(240, 160); ctx.lineTo(0, 160); ctx.fill();
    ctx.fillStyle = '#1c2848';
    ctx.fillRect(0, 140, W, 20);
    // logo
    text('AURORA', W / 2 + 2, 14 + 2, { size: 34, bold: true, align: 'center', color: '#182040', shadow: null });
    text('AURORA', W / 2, 14, { size: 34, bold: true, align: 'center', color: '#f8d048', shadow: '#c06028' });
    text('Caçadores de Feras', W / 2, 52, { size: 12, align: 'center', color: '#ffffff', shadow: '#283860' });
    // iniciais
    const b = (k: number) => Math.round(Math.sin(this.t / 15 + k) * 2);
    ctx.drawImage(creatureSprites('brasilho').front, 36, 92 + b(0));
    ctx.drawImage(creatureSprites('pingolim').front, 96, 98 + b(1));
    ctx.drawImage(creatureSprites('folhito').front, 156, 92 + b(2));
    if (!this.menu) {
      if (Math.floor(this.t / 30) % 2 === 0) text('APERTE START', W / 2, 74, { size: 11, align: 'center', color: '#ffffff', shadow: '#283860', bold: true });
    } else {
      const h = this.opts.length * 16 + 10;
      box(70, 70, 100, h);
      this.opts.forEach((o, i) => {
        text(o, 92, 76 + i * 16, { size: 11 });
        if (i === this.idx) cursor(82, 79 + i * 16);
      });
    }
    text('v0.1', W - 4, H - 10, { size: 8, align: 'right', color: '#8898c8', shadow: null });
  }
}
