import { Scene, stack } from '../engine/scene';
import { input } from '../engine/input';
import { audio } from '../engine/audio';
import { W, H, ctx, rect, text } from '../engine/screen';
import { box, cursor } from '../ui/draw';
import { creatureSprites } from '../gfx/creatures';
import { personSprites, LOOKS } from '../gfx/people';
import { S, CFG, SLOTS, temSave, carregar, novoEstado, setState, setSlot, resumoSlot, apagarSlot, exportarSlot, importarParaSlot, type Resumo } from '../game/state';
import { L } from '../i18n';
import { openOptions } from './menus';
import { choose as escolher } from '../game/game';
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
    if (!this.nome) text(L(`(vazio = ${this.sugestao})`, `(empty = ${this.sugestao})`), 228, 27, { size: 8, align: 'right', color: '#8888a0', shadow: null });
    box(4, 48, W - 8, 108);
    const c = this.chars();
    c.forEach((ch, i) => {
      const x = 22 + (i % 10) * 21, y = 56 + Math.floor(i / 10) * 18;
      text(ch, x, y, { size: 12, align: 'center' });
      if (i === this.idx) { ctx.strokeStyle = '#e05848'; ctx.lineWidth = 1; ctx.strokeRect(x - 8.5, y - 1.5, 17, 17); }
    });
    const acts = [this.lower ? 'ABC' : 'abc', L('APAGAR', 'DELETE'), 'OK'];
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
  await say(L('Olá! Seja bem-vindo ao mundo das feras!', 'Hello! Welcome to the world of beasts!'), L('Meu nome é Ipê. As pessoas me chamam de Professor das Feras.', 'My name is Ipê. People call me the Beast Professor.'));
  bg.show = 'fera';
  audio.sfx('throw');
  await say(L('Este mundo é habitado por criaturas chamadas FERAS!', 'This world is inhabited by creatures called BEASTS!'), L('Algumas pessoas vivem com elas como amigas. Outras batalham com elas como parceiras.', 'Some people live with them as friends. Others battle alongside them as partners.'), L('Eu dedico minha vida a estudar as feras da região de AURORA.', 'I have devoted my life to studying the beasts of the AURORA region.'));
  bg.show = 'player';
  await say(L('Mas me conte um pouco sobre você. Qual é o seu nome?', 'But tell me about yourself. What is your name?'));
  S.nome = await stack.push(new NamingScene(L('Qual é o seu nome?', 'What is your name?'), 'Léo', 'player'));
  await say(L('Certo! Então seu nome é {nome}!', 'Right! So your name is {nome}!'));
  bg.show = 'rival';
  await say(L('Este é seu vizinho. Vocês são rivais desde pequenos. Hum... qual era o nome dele mesmo?', 'This is your neighbor. You two have been rivals since you were little. Hmm... what was his name again?'));
  S.rival = await stack.push(new NamingScene(L('Nome do seu rival?', 'Your rival\'s name?'), 'Caio', 'rival'));
  await say(L('Isso mesmo! O nome dele é {rival}!', 'That\'s right! His name is {rival}!'));
  bg.show = 'player';
  await say(L('{nome}! Sua própria história com as feras está prestes a começar!', '{nome}! Your very own beast story is about to begin!'), L('Um mundo de sonhos e aventuras com feras espera por você. Vamos lá!', 'A world of dreams and adventures with beasts awaits. Let\'s go!'));
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
  private montarMenu() {
    this.opts = [];
    if (temSave()) this.opts.push('continuar', 'carregar');
    this.opts.push('novo', 'importar', 'opcoes');
    this.idx = 0;
  }
  private rotulo(op: string) {
    return ({ continuar: L('CONTINUAR', 'CONTINUE'), carregar: L('CARREGAR JOGO', 'LOAD GAME'), novo: L('NOVO JOGO', 'NEW GAME'), importar: L('IMPORTAR SAVE', 'IMPORT SAVE'), opcoes: L('OPÇÕES', 'OPTIONS') } as Record<string, string>)[op];
  }
  update() {
    this.t++;
    if (this.busy) return;
    if (!this.menu) {
      if (input.pressed('a') || input.pressed('start')) {
        audio.sfx('save');
        this.menu = true;
        this.montarMenu();
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
      const atual = this.idx;
      this.choose(this.opts[this.idx]).finally(() => {
        this.busy = false;
        if (this.menu) { this.montarMenu(); this.idx = Math.min(atual, this.opts.length - 1); }
      });
    }
  }
  private async jogar(slot: number) {
    if (!carregar(slot)) { await say(L('Não foi possível carregar este save.', 'Could not load this save.')); return; }
    await fadeOut(20);
    startWorld();
    await fadeIn(20);
  }
  private async choose(op: string) {
    if (op === 'continuar') {
      const slot = resumoSlot(CFG.ultimoSlot) ? CFG.ultimoSlot : [1, 2, 3].find((n) => resumoSlot(n)) ?? 1;
      await this.jogar(slot);
      return;
    }
    if (op === 'carregar') {
      const slot = await stack.push(new SlotScene(L('CARREGAR JOGO', 'LOAD GAME'), false));
      if (slot < 0) return;
      const a = await escolher(null, [L('JOGAR', 'PLAY'), L('EXPORTAR SAVE', 'EXPORT SAVE'), L('APAGAR', 'DELETE'), L('VOLTAR', 'BACK')]);
      if (a === 0) await this.jogar(slot);
      else if (a === 1) await exportar(slot);
      else if (a === 2 && await ask(L(`Apagar o save do espaço ${slot}? Isso não pode ser desfeito.`, `Delete the save in slot ${slot}? This cannot be undone.`))) {
        apagarSlot(slot);
        await say(L('Save apagado.', 'Save deleted.'));
      }
      return;
    }
    if (op === 'novo') {
      const slot = await stack.push(new SlotScene(L('ESCOLHA UM ESPAÇO', 'CHOOSE A SLOT'), true));
      if (slot < 0) return;
      if (resumoSlot(slot) && !(await ask(L(`O espaço ${slot} já tem um jogo salvo. Começar por cima dele?`, `Slot ${slot} already has a saved game. Overwrite it?`)))) return;
      setSlot(slot);
      await fadeOut(20);
      await novoJogoIntro();
      return;
    }
    if (op === 'importar') {
      const texto = await escolherArquivo();
      if (texto === null) return;
      const slot = await stack.push(new SlotScene(L('IMPORTAR PARA QUAL ESPAÇO?', 'IMPORT TO WHICH SLOT?'), true));
      if (slot < 0) return;
      if (resumoSlot(slot) && !(await ask(L(`Substituir o save do espaço ${slot}?`, `Replace the save in slot ${slot}?`)))) return;
      if (importarParaSlot(texto, slot)) await say(L(`Save importado para o espaço ${slot}!`, `Save imported to slot ${slot}!`));
      else await say(L('Esse arquivo não é um save válido do Aurora.', 'That file is not a valid Aurora save.'));
      return;
    }
    if (op === 'opcoes') await openOptions();
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
    text(L('Caçadores de Feras', 'Beast Hunters'), W / 2, 52, { size: 12, align: 'center', color: '#ffffff', shadow: '#283860' });
    // iniciais
    const b = (k: number) => Math.round(Math.sin(this.t / 15 + k) * 2);
    ctx.drawImage(creatureSprites('brasilho').front, 36, 92 + b(0));
    ctx.drawImage(creatureSprites('pingolim').front, 96, 98 + b(1));
    ctx.drawImage(creatureSprites('folhito').front, 156, 92 + b(2));
    if (!this.menu) {
      if (Math.floor(this.t / 30) % 2 === 0) text(L('APERTE START', 'PRESS START'), W / 2, 74, { size: 11, align: 'center', color: '#ffffff', shadow: '#283860', bold: true });
    } else {
      const h = this.opts.length * 15 + 10;
      box(62, 68, 116, h);
      this.opts.forEach((o, i) => {
        text(this.rotulo(o), 82, 73 + i * 15, { size: 10 });
        if (i === this.idx) cursor(72, 76 + i * 15);
      });
    }
    text('v1.1', W - 4, H - 10, { size: 8, align: 'right', color: '#8898c8', shadow: null });
  }
}

// ======================= ESPAÇOS DE SAVE =======================
class SlotScene extends Scene<number> {
  idx = 0;
  private resumos: (Resumo | null)[] = [];
  constructor(private titulo: string, private aceitaVazio: boolean) {
    super();
    for (let n = 1; n <= SLOTS; n++) this.resumos.push(resumoSlot(n));
    this.idx = Math.max(0, Math.min(SLOTS - 1, CFG.ultimoSlot - 1));
  }
  update() {
    if (input.repeat('up')) { this.idx = (this.idx + SLOTS - 1) % SLOTS; audio.sfx('blip'); }
    if (input.repeat('down')) { this.idx = (this.idx + 1) % SLOTS; audio.sfx('blip'); }
    if (input.pressed('b')) { audio.sfx('blip'); this.finish(-1); return; }
    if (input.pressed('a')) {
      if (!this.aceitaVazio && !this.resumos[this.idx]) { audio.sfx('error'); return; }
      audio.sfx('blip');
      this.finish(this.idx + 1);
    }
  }
  draw() {
    rect(0, 0, W, H, '#1c2848');
    ctx.fillStyle = '#243458';
    for (let y = 0; y < H; y += 8) for (let x = (y / 8) % 2 ? 0 : 8; x < W; x += 16) ctx.fillRect(x, y, 8, 8);
    text(this.titulo, W / 2, 6, { size: 11, bold: true, align: 'center', color: '#f8d048', shadow: '#102040' });
    this.resumos.forEach((r, i) => {
      const y = 24 + i * 42;
      const sel = i === this.idx;
      box(sel ? 10 : 6, y, W - 16, 38, sel ? 'azul' : 'normal');
      const x = sel ? 18 : 14;
      text(`${L('ESPAÇO', 'SLOT')} ${i + 1}`, x, y + 5, { size: 8, color: '#6878a0', shadow: null, bold: true });
      if (!r) { text(L('— vazio —', '— empty —'), x, y + 17, { size: 10, color: '#8888a0' }); return; }
      const h = Math.floor(r.tempo / 3600), m = Math.floor((r.tempo % 3600) / 60);
      text(r.nome, x + 48, y + 3, { size: 10, bold: true });
      text(`${r.insignias}/4 ${L('insígnias', 'badges')} · ${r.capturados} ${L('feras', 'beasts')} · ${h}:${String(m).padStart(2, '0')}`, x, y + 17, { size: 8, shadow: null, color: '#585860' });
      text(r.mapa, x, y + 27, { size: 8, shadow: null, color: '#585860' });
      if (r.salvoEm) text(new Date(r.salvoEm).toLocaleDateString(CFG.idioma === 'en' ? 'en-US' : 'pt-BR'), W - 22, y + 27, { size: 8, align: 'right', shadow: null, color: '#8888a0' });
    });
    text(L('A: escolher   B: voltar', 'A: select   B: back'), W / 2, H - 12, { size: 8, align: 'center', color: '#a8b8e0', shadow: null });
  }
}

const nativo = () => !!(window as unknown as { Capacitor?: { isNativePlatform?: () => boolean } }).Capacitor?.isNativePlatform?.();

async function exportar(slot: number) {
  const dados = exportarSlot(slot);
  if (!dados) return;
  const nome = `aurora-save-${slot}-${new Date().toISOString().slice(0, 10)}.json`;
  if (nativo()) {
    try {
      await navigator.clipboard.writeText(dados);
      await say(L('Save copiado para a área de transferência. Cole em um arquivo de texto para guardar.', 'Save copied to the clipboard. Paste it into a text file to keep it.'));
    } catch { await say(L('Não foi possível exportar neste aparelho.', 'Could not export on this device.')); }
    return;
  }
  const url = URL.createObjectURL(new Blob([dados], { type: 'application/json' }));
  const a = document.createElement('a');
  a.href = url; a.download = nome;
  document.body.append(a); a.click(); a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 2000);
  await say(L(`Save exportado como ${nome}.`, `Save exported as ${nome}.`));
}

/** abre o seletor de arquivo e devolve o texto, ou null se cancelado */
function escolherArquivo(): Promise<string | null> {
  return new Promise((resolve) => {
    const inp = document.createElement('input');
    inp.type = 'file';
    inp.accept = '.json,application/json,text/plain';
    let feito = false;
    const fim = (v: string | null) => { if (!feito) { feito = true; resolve(v); } };
    inp.addEventListener('change', async () => {
      const f = inp.files?.[0];
      if (!f) return fim(null);
      fim(f.size > 2_000_000 ? null : await f.text());
    });
    inp.addEventListener('cancel', () => fim(null));
    // reserva: se a janela voltar ao foco sem arquivo escolhido, considera cancelado
    window.addEventListener('focus', () => setTimeout(() => { if (!inp.files?.length) fim(null); }, 1000), { once: true });
    inp.click();
  });
}
