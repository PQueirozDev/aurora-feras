import { Scene, stack } from '../engine/scene';
import { input } from '../engine/input';
import { audio } from '../engine/audio';
import { W, H, ctx, rect, text, wrap, measure } from '../engine/screen';
import { box, cursor, hpBar, statusBadge, typeBadge } from '../ui/draw';
import { creatureSprites } from '../gfx/creatures';
import { silhouette } from '../gfx/pixel';
import { capsuleSprite } from '../gfx/people';
import { S, CFG, salvar, salvarConfig, removeItem, addItem, slotAtual } from '../game/state';
import { L, isEN, nomeGolpe, nomeItem, descItem, nomeTipo, catFera, textoFera } from '../i18n';
import { maxHp, nomeDe, species, stats, xpParaNivel, type Mon } from '../game/mon';
import { move } from '../data/moves';
import { item } from '../data/items';
import { SPECIES_LIST } from '../data/species';
import { TIPO_COR } from '../data/types';
import { say, ask, choose } from '../game/game';
import { fmt } from './dialog';
import { objetivoAtual, ondeEncontrar } from '../game/progress';

const capIcon = capsuleSprite(undefined, 8);

function bg(c1 = '#88b8e8', c2 = '#6898d0') {
  rect(0, 0, W, H, c1);
  ctx.fillStyle = c2;
  for (let y = 0; y < H; y += 8) for (let x = (y / 8) % 2 ? 0 : 8; x < W; x += 16) ctx.fillRect(x, y, 8, 8);
}

/** linha de mensagem no rodapé */
function footer(t: string) {
  box(2, H - 22, W - 4, 20);
  text(t, 10, H - 17, { size: 10 });
}

// ======================= EQUIPE =======================
export type PartyMode = 'ver' | 'item' | 'troca';

class PartyScene extends Scene<number> {
  idx = 0;
  swapFrom = -1;
  busy = false;
  constructor(private mode: PartyMode, private itemId?: string, private ativo = -1, private forcado = false) {
    super();
    if (ativo >= 0) this.idx = ativo;
  }
  private valid(m: Mon): boolean {
    const it = this.itemId ? item(this.itemId) : null;
    if (!it) return true;
    if (it.tipo === 'cura') return m.hp > 0 && m.hp < maxHp(m);
    if (it.tipo === 'status') return m.hp > 0 && !!m.status && (it.curaStatus === 'all' || it.curaStatus === m.status);
    if (it.tipo === 'reviver') return m.hp <= 0;
    if (it.tipo === 'pp') return m.golpes.some((g) => g.pp < move(g.id).pp);
    return false;
  }
  update() {
    if (this.busy) return;
    const n = S.equipe.length;
    if (input.repeat('up')) { this.idx = (this.idx + n - 1) % n; audio.sfx('blip'); }
    if (input.repeat('down')) { this.idx = (this.idx + 1) % n; audio.sfx('blip'); }
    if (input.pressed('b')) {
      if (this.swapFrom >= 0) { this.swapFrom = -1; return; }
      if (this.forcado) { audio.sfx('error'); return; }
      audio.sfx('blip');
      this.finish(-1);
      return;
    }
    if (!input.pressed('a')) return;
    audio.sfx('blip');
    const m = S.equipe[this.idx];
    if (this.swapFrom >= 0) {
      const a = this.swapFrom; this.swapFrom = -1;
      [S.equipe[a], S.equipe[this.idx]] = [S.equipe[this.idx], S.equipe[a]];
      return;
    }
    this.busy = true;
    this.act(m).finally(() => { this.busy = false; });
  }
  private async act(m: Mon) {
    if (this.mode === 'item') {
      if (!this.valid(m)) { await say(L('Não vai ter efeito.', 'It won\'t have any effect.')); return; }
      this.finish(this.idx);
      return;
    }
    if (this.mode === 'troca') {
      const r = await choose(null, [L('TROCAR', 'SWITCH'), L('RESUMO', 'SUMMARY'), L('CANCELAR', 'CANCEL')]);
      if (r === 1) { await stack.push(new SummaryScene(this.idx)); return; }
      if (r !== 0) return;
      if (m.hp <= 0) { await say(L(`${nomeDe(m)} não tem energia para lutar!`, `${nomeDe(m)} has no energy left to battle!`)); return; }
      if (this.idx === this.ativo) { await say(L(`${nomeDe(m)} já está em batalha!`, `${nomeDe(m)} is already in battle!`)); return; }
      this.finish(this.idx);
      return;
    }
    const r = await choose(null, [L('RESUMO', 'SUMMARY'), L('MOVER', 'MOVE'), L('CANCELAR', 'CANCEL')]);
    if (r === 0) await stack.push(new SummaryScene(this.idx));
    else if (r === 1) this.swapFrom = this.idx;
  }
  draw() {
    bg('#78c070', '#68b060');
    S.equipe.forEach((m, i) => {
      const y = 2 + i * 22;
      const sel = i === this.idx;
      const fainted = m.hp <= 0;
      const style = this.swapFrom === i ? 'azul' : 'normal';
      box(sel ? 6 : 2, y, W - 8, 21, style);
      if (sel) rect(sel ? 9 : 5, y + 3, 3, 15, '#e05848');
      const x = sel ? 6 : 2;
      ctx.globalAlpha = fainted ? 0.5 : 1;
      ctx.drawImage(creatureSprites(m.sp).icon, x + 8, y - 2 + (sel && Math.floor(Date.now() / 250) % 2 ? -1 : 0));
      ctx.globalAlpha = 1;
      text(nomeDe(m), x + 36, y + 4, { size: 10, bold: true });
      text(`${L('Nv', 'Lv')}${m.nivel}`, x + 110, y + 4, { size: 9 });
      statusBadge(m.status, x + 134, y + 5);
      hpBar(x + 156, y + 6, 48, m.hp / maxHp(m));
      text(`${m.hp}/${maxHp(m)}`, x + 218, y + 11, { size: 7, align: 'right', shadow: null });
    });
    const msg = this.swapFrom >= 0 ? L('Mover para onde?', 'Move to where?')
      : this.mode === 'item' ? L('Usar em qual fera?', 'Use on which beast?')
      : this.mode === 'troca' ? (this.forcado ? L('Escolha a próxima fera.', 'Choose the next beast.') : L('Escolha uma fera.', 'Choose a beast.'))
      : L('Escolha uma fera.', 'Choose a beast.');
    footer(msg);
  }
}

export function openParty(mode: PartyMode, itemId?: string, ativo = -1, forcado = false) {
  return stack.push(new PartyScene(mode, itemId, ativo, forcado));
}

// ======================= RESUMO =======================
class SummaryScene extends Scene<void> {
  page = 0;
  constructor(private i: number) { super(); }
  update() {
    if (input.pressed('b') || input.pressed('a')) { audio.sfx('blip'); this.finish(); }
    if (input.repeat('up')) { this.i = (this.i + S.equipe.length - 1) % S.equipe.length; audio.sfx('blip'); }
    if (input.repeat('down')) { this.i = (this.i + 1) % S.equipe.length; audio.sfx('blip'); }
    if (input.repeat('left') || input.repeat('right')) { this.page ^= 1; audio.sfx('blip'); }
  }
  draw() {
    const m = S.equipe[this.i];
    const sp = species(m);
    bg('#f0e0b8', '#e8d4a8');
    box(4, 4, 100, 100);
    rect(7, 7, 94, 94, '#d8f0f8');
    ctx.drawImage(creatureSprites(m.sp).front, 30, 24);
    text(nomeDe(m), 10, 82, { size: 10, bold: true });
    text(`${L('Nv', 'Lv')}${m.nivel}`, 96, 82, { size: 9, align: 'right' });
    sp.tipos.forEach((t, k) => typeBadge(t, 10 + k * 40, 108, TIPO_COR[t]));
    text(`Nº ${String(sp.id).padStart(3, '0')}  ${sp.nome}`, 8, 122, { size: 9 });
    text(`${L('Treinador', 'Trainer')}: ${m.dono ?? S.nome}`, 8, 134, { size: 9 });
    statusBadge(m.status, 84, 134);
    text(this.page === 0 ? L('◀ STATUS ▶', '◀ STATS ▶') : L('◀ GOLPES ▶', '◀ MOVES ▶'), 54, 148, { size: 8, align: 'center', color: '#6a5a40', shadow: null });

    box(108, 4, 128, 152);
    if (this.page === 0) {
      const s = stats(m);
      const rows: [string, string][] = [
        ['PV', `${m.hp}/${s.hp}`], [L('Ataque', 'Attack'), `${s.atk}`], [L('Defesa', 'Defense'), `${s.def}`],
        [L('At. Esp.', 'Sp. Atk'), `${s.spa}`], [L('Def. Esp.', 'Sp. Def'), `${s.spd}`], [L('Velocidade', 'Speed'), `${s.spe}`],
      ];
      rows.forEach(([k, v], j) => {
        text(k, 116, 12 + j * 15, { size: 10 });
        text(v, 228, 12 + j * 15, { size: 10, align: 'right' });
      });
      const prox = xpParaNivel(m.nivel + 1);
      text(L('Exp.', 'Exp.'), 116, 106, { size: 10 });
      text(`${m.xp}`, 228, 106, { size: 10, align: 'right' });
      text(L('Próx. nível', 'Next level'), 116, 121, { size: 9 });
      text(`${Math.max(0, prox - m.xp)}`, 228, 121, { size: 9, align: 'right' });
      hpBar(130, 140, 80, m.hp / s.hp);
    } else {
      m.golpes.forEach((g, j) => {
        const mv = move(g.id);
        const y = 10 + j * 34;
        rect(114, y, 36, 9, TIPO_COR[mv.tipo]);
        text(nomeTipo(mv.tipo).toUpperCase(), 132, y + 0.5, { size: 7, color: '#fff', shadow: 'rgba(0,0,0,.4)', align: 'center', bold: true });
        text(nomeGolpe(g.id), 154, y - 1, { size: 10 });
        text(`PP ${g.pp}/${mv.pp}`, 228, y + 11, { size: 9, align: 'right' });
        text(mv.cat === 'status' ? L('Estado', 'Status') : `${L('Poder', 'Power')} ${mv.poder}`, 116, y + 11, { size: 9 });
      });
    }
  }
}

// ======================= BOLSA =======================
class BagScene extends Scene<string | null> {
  idx = 0;
  top = 0;
  busy = false;
  constructor(private mode: 'campo' | 'batalha') { super(); }
  private items() { return Object.keys(S.bolsa).filter((k) => S.bolsa[k] > 0); }
  update() {
    if (this.busy) return;
    const list = this.items();
    const n = list.length + 1; // + FECHAR
    if (input.repeat('up')) { this.idx = (this.idx + n - 1) % n; audio.sfx('blip'); }
    if (input.repeat('down')) { this.idx = (this.idx + 1) % n; audio.sfx('blip'); }
    if (this.idx < this.top) this.top = this.idx;
    if (this.idx >= this.top + 6) this.top = this.idx - 5;
    if (input.pressed('b')) { audio.sfx('blip'); this.finish(null); return; }
    if (!input.pressed('a')) return;
    audio.sfx('blip');
    if (this.idx >= list.length) { this.finish(null); return; }
    const id = list[this.idx];
    if (this.mode === 'batalha') { this.finish(id); return; }
    this.busy = true;
    this.useField(id).finally(() => { this.busy = false; });
  }
  private async useField(id: string) {
    const it = item(id);
    const r = await choose(null, [L('USAR', 'USE'), L('CANCELAR', 'CANCEL')]);
    if (r !== 0) return;
    if (it.tipo === 'captura') { await say(L('Não dá para usar isso agora.', 'You can\'t use that now.')); return; }
    if (it.tipo === 'chave') { await say(descItem(id)); return; }
    if (it.tipo === 'repelente') {
      if ((S.repelente ?? 0) > 0) { await say(L('Ainda há repelente fazendo efeito.', 'A repel is still active.')); return; }
      removeItem(id);
      S.repelente = it.passos ?? 100;
      audio.sfx('heal');
      await say(L(`{nome} usou ${nomeItem(id)}. As feras selvagens vão ficar longe por ${S.repelente} passos.`, `{nome} used ${nomeItem(id)}. Wild beasts will stay away for ${S.repelente} steps.`));
      return;
    }
    if (!S.equipe.length) { await say(L('Você não tem feras.', 'You have no beasts.')); return; }
    const alvo = await openParty('item', id);
    if (alvo < 0) return;
    const m = S.equipe[alvo];
    removeItem(id);
    audio.sfx('heal');
    if (it.tipo === 'cura') {
      const antes = m.hp;
      m.hp = Math.min(maxHp(m), m.hp + (it.cura ?? 0));
      await say(L(`${nomeDe(m)} recuperou ${m.hp - antes} PV!`, `${nomeDe(m)} recovered ${m.hp - antes} HP!`));
    } else if (it.tipo === 'status') {
      m.status = null; m.sono = 0;
      await say(L(`${nomeDe(m)} está curado!`, `${nomeDe(m)} is cured!`));
    } else if (it.tipo === 'reviver') {
      m.hp = Math.floor(maxHp(m) / 2);
      await say(L(`${nomeDe(m)} foi reanimado!`, `${nomeDe(m)} was revived!`));
    } else if (it.tipo === 'pp') {
      for (const g of m.golpes) g.pp = Math.min(move(g.id).pp, g.pp + 10);
      await say(L(`Os PP de ${nomeDe(m)} foram recuperados!`, `${nomeDe(m)}'s PP was restored!`));
    }
  }
  draw() {
    bg('#e8a858', '#e09848');
    box(4, 4, 80, 96);
    text(L('BOLSA', 'BAG'), 44, 10, { size: 12, bold: true, align: 'center' });
    // desenho simples de mochila
    rect(24, 30, 40, 50, '#a85828'); rect(28, 26, 32, 10, '#c87038'); rect(30, 44, 28, 18, '#c87038'); rect(40, 50, 8, 4, '#f8d838');
    text(`$${S.dinheiro}`, 44, 84, { size: 10, align: 'center' });
    box(88, 4, 148, 108);
    const list = this.items();
    const rows = [...list.map((k) => [nomeItem(k), `x${S.bolsa[k]}`]), [L('FECHAR', 'CLOSE'), '']];
    rows.slice(this.top, this.top + 6).forEach(([n, q], j) => {
      const i = j + this.top;
      const y = 12 + j * 16;
      text(n, 104, y, { size: 10 });
      text(q, 228, y, { size: 10, align: 'right' });
      if (i === this.idx) cursor(96, y + 3);
    });
    box(2, 114, W - 4, 44);
    const id = list[this.idx];
    const desc = id ? descItem(id) : L('Fechar a bolsa.', 'Close the bag.');
    wrap(desc, W - 24, 10).slice(0, 2).forEach((l, i) => text(l, 12, 122 + i * 15, { size: 10 }));
  }
}
export function openBag(mode: 'campo' | 'batalha') { return stack.push(new BagScene(mode)); }

// ======================= FERADEX =======================
class DexScene extends Scene<void> {
  idx = 0; top = 0; detalhe = false;
  update() {
    const n = SPECIES_LIST.length;
    if (this.detalhe) {
      if (input.pressed('b') || input.pressed('a')) { audio.sfx('blip'); this.detalhe = false; }
      return;
    }
    if (input.repeat('up')) { this.idx = (this.idx + n - 1) % n; audio.sfx('blip'); }
    if (input.repeat('down')) { this.idx = (this.idx + 1) % n; audio.sfx('blip'); }
    if (this.idx < this.top) this.top = this.idx;
    if (this.idx >= this.top + 8) this.top = this.idx - 7;
    if (input.pressed('b')) { audio.sfx('blip'); this.finish(); }
    if (input.pressed('a') && S.vistos.includes(SPECIES_LIST[this.idx][0])) { audio.sfx('blip'); this.detalhe = true; }
  }
  draw() {
    bg('#e85858', '#d84848');
    const [key, sp] = SPECIES_LIST[this.idx];
    const visto = S.vistos.includes(key);
    const pego = S.capturados.includes(key);
    if (this.detalhe) {
      box(4, 4, W - 8, 80);
      rect(10, 10, 66, 68, '#e8f0f8');
      ctx.drawImage(creatureSprites(key).front, 19, 20);
      text(`Nº${String(sp.id).padStart(3, '0')}  ${sp.nome}`, 84, 12, { size: 11, bold: true });
      text(catFera(key), 84, 28, { size: 10 });
      sp.tipos.forEach((t, k) => typeBadge(t, 84 + k * 40, 46, TIPO_COR[t]));
      wrap(ondeEncontrar(key), 140, 8).slice(0, 2).forEach((l, i) => text(l, 84, 59 + i * 10, { size: 8, color: '#585860', shadow: null }));
      box(4, 86, W - 8, 70);
      const txt = pego ? textoFera(key) : '...';
      wrap(txt, W - 28, 10).slice(0, 4).forEach((l, i) => text(l, 14, 94 + i * 14, { size: 10 }));
      if (!pego) text(L('Capture para ler a descrição completa.', 'Catch it to read the full entry.'), 14, 108, { size: 9, color: '#787880' });
      return;
    }
    box(4, 4, 92, 120);
    rect(8, 8, 84, 84, '#e8f0f8');
    if (visto) ctx.drawImage(pego ? creatureSprites(key).front : silhouette(creatureSprites(key).front, '#505868'), 26, 26);
    text(`${L('Vistos', 'Seen')}: ${S.vistos.length}`, 12, 96, { size: 9 });
    text(`${L('Capturados', 'Caught')}: ${S.capturados.length}`, 12, 108, { size: 9 });
    box(100, 4, 136, 152);
    SPECIES_LIST.slice(this.top, this.top + 8).forEach(([k, s], j) => {
      const i = j + this.top;
      const y = 10 + j * 18;
      if (S.capturados.includes(k)) ctx.drawImage(capIcon, 112, y + 3);
      text(`${String(s.id).padStart(3, '0')}`, 124, y, { size: 10 });
      text(S.vistos.includes(k) ? s.nome : '----------', 150, y, { size: 10 });
      if (i === this.idx) cursor(105, y + 3);
    });
    box(4, 126, 92, 30);
    text(L('A: ver   B: sair', 'A: view   B: exit'), 50, 135, { size: 9, align: 'center' });
  }
}

// ======================= CARTÃO DO TREINADOR =======================
class CardScene extends Scene<void> {
  update() { if (input.pressed('a') || input.pressed('b')) { audio.sfx('blip'); this.finish(); } }
  draw() {
    bg('#88a8d8', '#7898c8');
    box(10, 8, W - 20, 144);
    text(L('CARTÃO DE TREINADOR', 'TRAINER CARD'), W / 2, 15, { size: 11, bold: true, align: 'center' });
    const h = Math.floor(S.tempo / 3600), mi = Math.floor((S.tempo % 3600) / 60);
    const ins = INSIGNIAS.filter((b) => S.flags[b.flag]).length;
    const rows: [string, string][] = [
      [L('Nome', 'Name'), S.nome], [L('Dinheiro', 'Money'), `$${S.dinheiro}`], [L('Feradex', 'Beastdex'), `${S.capturados.length}/41`],
      [L('Tempo', 'Time'), `${h}:${String(mi).padStart(2, '0')}`], [L('Insígnias', 'Badges'), `${ins}/4`],
    ];
    rows.forEach(([k, v], i) => { text(k, 24, 32 + i * 14, { size: 10 }); text(v, 132, 32 + i * 14, { size: 10, align: 'right' }); });
    if (S.flags.campeao) text(L('★ CAMPEÃO DE AURORA ★', '★ AURORA CHAMPION ★'), 182, 36, { size: 8, align: 'center', color: '#c89018', shadow: null, bold: true });
    INSIGNIAS.forEach((b, i) => {
      const x = 24 + i * 50, y = 108;
      rect(x, y, 36, 36, '#d8d8e0');
      if (S.flags[b.flag]) {
        ctx.fillStyle = b.cor;
        ctx.beginPath(); ctx.moveTo(x + 18, y + 4); ctx.lineTo(x + 32, y + 16); ctx.lineTo(x + 26, y + 32); ctx.lineTo(x + 10, y + 32); ctx.lineTo(x + 4, y + 16); ctx.closePath(); ctx.fill();
        ctx.fillStyle = 'rgba(255,255,255,0.5)'; ctx.fillRect(x + 14, y + 12, 5, 5);
      }
      text(b.nome, x + 18, y + 37, { size: 7, align: 'center', shadow: null });
    });
  }
}

const INSIGNIAS = [
  { flag: 'insignia_rocha', nome: 'ROCHA', cor: '#a89878' },
  { flag: 'insignia_mare', nome: 'MARÉ', cor: '#5898e0' },
  { flag: 'insignia_volt', nome: 'VOLT', cor: '#f0c830' },
  { flag: 'insignia_bruma', nome: 'BRUMA', cor: '#8868b8' },
];

// ======================= LOJA =======================
class QtyScene extends Scene<number> {
  overlay = true;
  q = 1;
  constructor(private preco: number, private max: number) { super(); }
  update() {
    if (input.repeat('up')) { this.q = this.q >= this.max ? 1 : this.q + 1; audio.sfx('blip'); }
    if (input.repeat('down')) { this.q = this.q <= 1 ? this.max : this.q - 1; audio.sfx('blip'); }
    if (input.repeat('right')) { this.q = Math.min(this.max, this.q + 10); audio.sfx('blip'); }
    if (input.repeat('left')) { this.q = Math.max(1, this.q - 10); audio.sfx('blip'); }
    if (input.pressed('a')) { audio.sfx('blip'); this.finish(this.q); }
    if (input.pressed('b')) { audio.sfx('blip'); this.finish(0); }
  }
  draw() {
    box(120, 82, 116, 28);
    text(`x${String(this.q).padStart(2, '0')}`, 132, 89, { size: 11 });
    text(`$${this.q * this.preco}`, 228, 89, { size: 11, align: 'right' });
  }
}

class ShopList extends Scene<void> {
  idx = 0; top = 0; busy = false;
  constructor(private stock: string[], private vender: boolean) { super(); }
  private list() { return this.vender ? Object.keys(S.bolsa).filter((k) => S.bolsa[k] > 0) : this.stock; }
  update() {
    if (this.busy) return;
    const l = this.list();
    const n = l.length + 1;
    if (input.repeat('up')) { this.idx = (this.idx + n - 1) % n; audio.sfx('blip'); }
    if (input.repeat('down')) { this.idx = (this.idx + 1) % n; audio.sfx('blip'); }
    if (this.idx < this.top) this.top = this.idx;
    if (this.idx >= this.top + 5) this.top = this.idx - 4;
    if (input.pressed('b')) { audio.sfx('blip'); this.finish(); return; }
    if (!input.pressed('a')) return;
    audio.sfx('blip');
    if (this.idx >= l.length) { this.finish(); return; }
    this.busy = true;
    this.trade(l[this.idx]).finally(() => { this.busy = false; if (this.idx > this.list().length) this.idx = this.list().length; });
  }
  private async trade(id: string) {
    const it = item(id);
    if (this.vender) {
      const preco = Math.floor(it.preco / 2);
      const q = await stack.push(new QtyScene(preco, S.bolsa[id]));
      if (!q) return;
      if (await ask(L(`Posso pagar $${q * preco} por ${q}x ${nomeItem(id)}. Tudo bem?`, `I can pay $${q * preco} for ${q}x ${nomeItem(id)}. OK?`))) {
        removeItem(id, q);
        S.dinheiro += q * preco;
        audio.sfx('save');
        await say(L(`Você entregou ${q}x ${nomeItem(id)} e recebeu $${q * preco}.`, `You handed over ${q}x ${nomeItem(id)} and got $${q * preco}.`));
      }
      return;
    }
    const max = Math.max(1, Math.min(99, Math.floor(S.dinheiro / it.preco)));
    if (S.dinheiro < it.preco) { await say(L('Você não tem dinheiro suficiente.', 'You don\'t have enough money.')); return; }
    const q = await stack.push(new QtyScene(it.preco, max));
    if (!q) return;
    const total = q * it.preco;
    if (await ask(L(`${q}x ${nomeItem(id)} vai custar $${total}. Tudo bem?`, `${q}x ${nomeItem(id)} will cost $${total}. OK?`))) {
      S.dinheiro -= total;
      addItem(id, q);
      audio.sfx('save');
      await say(L('Aqui está! Obrigado!', 'Here you go! Thank you!'));
      if (id === 'capsula' && q >= 10) { addItem('capsula', 1); await say(L('Ganhou uma Cápsula extra de brinde!', 'You also got a bonus Capsule!')); }
    }
  }
  draw() {
    bg('#78a8e0', '#6898d0');
    box(4, 4, 96, 30);
    text(L('DINHEIRO', 'MONEY'), 12, 8, { size: 8 });
    text(`$${S.dinheiro}`, 92, 18, { size: 11, align: 'right' });
    box(104, 4, 132, 104);
    const l = this.list();
    const rows = [...l.map((k) => [nomeItem(k), this.vender ? `x${S.bolsa[k]}` : `$${item(k).preco}`]), [L('SAIR', 'EXIT'), '']];
    rows.slice(this.top, this.top + 5).forEach(([n, p], j) => {
      const i = j + this.top;
      const y = 12 + j * 18;
      text(n, 120, y, { size: 10 });
      text(p, 228, y, { size: 10, align: 'right' });
      if (i === this.idx) cursor(111, y + 3);
    });
    box(4, 38, 96, 70);
    const id = l[this.idx];
    if (id) text(`${L('Na bolsa', 'In bag')}: ${S.bolsa[id] ?? 0}`, 12, 46, { size: 9 });
    box(2, 112, W - 4, 46);
    const desc = id ? descItem(id) : L('Voltar.', 'Go back.');
    wrap(desc, W - 24, 10).slice(0, 2).forEach((ln, i) => text(ln, 12, 120 + i * 15, { size: 10 }));
  }
}

export async function openShop(stock: string[]) {
  for (;;) {
    const r = await choose(L('O que você deseja?', 'How may I help you?'), [L('COMPRAR', 'BUY'), L('VENDER', 'SELL'), L('SAIR', 'EXIT')]);
    if (r === 0) await stack.push(new ShopList(stock, false));
    else if (r === 1) {
      if (!Object.keys(S.bolsa).length) { await say(L('Você não tem nada para vender.', 'You have nothing to sell.')); continue; }
      await stack.push(new ShopList(stock, true));
    } else break;
  }
  await say(L('Volte sempre!', 'Please come again!'));
}

// ======================= COMPUTADOR =======================
class BoxScene extends Scene<number> {
  idx = 0; top = 0;
  constructor(private lista: Mon[], private titulo: string) { super(); }
  update() {
    const n = this.lista.length + 1;
    if (input.repeat('up')) { this.idx = (this.idx + n - 1) % n; audio.sfx('blip'); }
    if (input.repeat('down')) { this.idx = (this.idx + 1) % n; audio.sfx('blip'); }
    if (this.idx < this.top) this.top = this.idx;
    if (this.idx >= this.top + 7) this.top = this.idx - 6;
    if (input.pressed('b')) { audio.sfx('blip'); this.finish(-1); }
    if (input.pressed('a')) { audio.sfx('blip'); this.finish(this.idx >= this.lista.length ? -1 : this.idx); }
  }
  draw() {
    bg('#a8a8c8', '#9898b8');
    box(4, 4, 96, 120);
    const m = this.lista[this.idx];
    rect(8, 22, 88, 70, '#e8f0f8');
    text(this.titulo, 52, 8, { size: 10, bold: true, align: 'center' });
    if (m) {
      ctx.drawImage(creatureSprites(m.sp).front, 28, 32);
      text(`${nomeDe(m)} Nv${m.nivel}`, 52, 96, { size: 9, align: 'center' });
      text(`PV ${m.hp}/${maxHp(m)}`, 52, 108, { size: 9, align: 'center' });
    }
    box(104, 4, 132, 152);
    const rows = [...this.lista.map((x) => `${nomeDe(x)}  Nv${x.nivel}`), L('VOLTAR', 'BACK')];
    rows.slice(this.top, this.top + 7).forEach((r, j) => {
      const i = j + this.top;
      const y = 12 + j * 20;
      text(r, 120, y, { size: 10 });
      if (i === this.idx) cursor(111, y + 3);
    });
  }
}

export async function openPC() {
  for (;;) {
    const r = await choose(L('Sistema de Armazenamento de Feras. O que deseja fazer?', 'Beast Storage System. What would you like to do?'), [L('RETIRAR FERA', 'WITHDRAW'), L('DEPOSITAR FERA', 'DEPOSIT'), L('DESLIGAR', 'LOG OFF')]);
    if (r === 0) {
      if (!S.caixa.length) { await say(L('Não há feras guardadas.', 'No beasts are stored.')); continue; }
      if (S.equipe.length >= 6) { await say(L('Sua equipe está cheia!', 'Your team is full!')); continue; }
      const i = await stack.push(new BoxScene(S.caixa, L('CAIXA', 'BOX')));
      if (i < 0) continue;
      const [m] = S.caixa.splice(i, 1);
      S.equipe.push(m);
      await say(L(`${nomeDe(m)} foi retirado. Até logo, caixa!`, `${nomeDe(m)} was withdrawn.`));
    } else if (r === 1) {
      if (S.equipe.length <= 1) { await say(L('Você não pode ficar sem nenhuma fera!', 'You can\'t be left with no beasts!')); continue; }
      const i = await stack.push(new BoxScene(S.equipe, L('EQUIPE', 'TEAM')));
      if (i < 0) continue;
      const restantes = S.equipe.filter((_, k) => k !== i);
      if (!restantes.some((m) => m.hp > 0)) { await say(L('Você precisa de pelo menos uma fera em condições de lutar!', 'You need at least one beast that can battle!')); continue; }
      const [m] = S.equipe.splice(i, 1);
      S.caixa.push(m);
      await say(L(`${nomeDe(m)} foi guardado no computador.`, `${nomeDe(m)} was stored in the PC.`));
    } else break;
  }
}

// ======================= OPÇÕES =======================
export async function openOptions() {
  for (;;) {
    const fs = !!document.fullscreenElement;
    const sim = L('SIM', 'ON'), nao = L('NÃO', 'OFF');
    const r = await choose(null, [
      `${L('IDIOMA', 'LANGUAGE')}: ${CFG.idioma === 'en' ? 'ENGLISH' : 'PORTUGUÊS'}`,
      `${L('TEXTO', 'TEXT')}: ${CFG.texto === 'rapido' ? L('RÁPIDO', 'FAST') : 'NORMAL'}`,
      `${L('SALVAR SOZINHO', 'AUTOSAVE')}: ${CFG.autosave ? sim : nao}`,
      `${L('SOM', 'SOUND')}: ${CFG.som ? sim : nao}`,
      `${L('TELA CHEIA', 'FULLSCREEN')}: ${fs ? sim : nao}`,
      L('CONTROLES', 'CONTROLS'),
      L('VOLTAR', 'BACK'),
    ]);
    if (r === 0) { CFG.idioma = CFG.idioma === 'en' ? 'pt' : 'en'; salvarConfig(); continue; }
    if (r === 1) { CFG.texto = CFG.texto === 'rapido' ? 'normal' : 'rapido'; salvarConfig(); continue; }
    if (r === 2) { CFG.autosave = !CFG.autosave; salvarConfig(); continue; }
    if (r === 3) { CFG.som = !CFG.som; salvarConfig(); audio.setEnabled(CFG.som); if (CFG.som) audio.sfx('blip'); continue; }
    if (r === 4) {
      try { if (fs) await document.exitFullscreen(); else await document.documentElement.requestFullscreen(); }
      catch { await say(L('Não foi possível mudar para tela cheia.', 'Could not switch to fullscreen.')); }
      continue;
    }
    if (r === 5) {
      await say(
        L('Teclado: setas para andar, Z para confirmar, X para voltar (segure para correr), Enter para o menu.', 'Keyboard: arrows to move, Z to confirm, X to go back (hold to run), Enter for the menu.'),
        L('Controle: direcional para andar, A confirma, B volta, Start abre o menu. No celular, use os botões na tela.', 'Gamepad: D-pad to move, A confirms, B goes back, Start opens the menu. On phones, use the on-screen buttons.'),
      );
      continue;
    }
    break;
  }
}

// ======================= MENU START =======================
class StartMenu extends Scene<number> {
  overlay = true;
  idx = 0;
  constructor(private opts: string[]) { super(); }
  update() {
    const n = this.opts.length;
    if (input.repeat('up')) { this.idx = (this.idx + n - 1) % n; audio.sfx('blip'); }
    if (input.repeat('down')) { this.idx = (this.idx + 1) % n; audio.sfx('blip'); }
    if (input.pressed('b') || input.pressed('start')) { audio.sfx('blip'); this.finish(-1); }
    if (input.pressed('a')) { audio.sfx('blip'); this.finish(this.idx); }
  }
  draw() {
    const w = Math.max(70, ...this.opts.map((o) => measure(o, 11) + 26));
    const h = this.opts.length * 15 + 10;
    box(W - w - 2, 2, w, h);
    this.opts.forEach((o, i) => {
      text(o, W - w + 14, 8 + i * 15, { size: 11 });
      if (i === this.idx) cursor(W - w + 6, 11 + i * 15);
    });
  }
}

let lastStart = 0;
export async function openStartMenu() {
  for (;;) {
    const opts: string[] = [];
    const acts: (() => Promise<boolean | void>)[] = [];
    opts.push(L('OBJETIVO', 'GOAL')); acts.push(async () => { await say(L('Objetivo: ', 'Goal: ') + objetivoAtual()); });
    if (S.flags.feradex) { opts.push(L('FERADEX', 'BEASTDEX')); acts.push(async () => { await stack.push(new DexScene()); }); }
    if (S.equipe.length) { opts.push(L('FERAS', 'TEAM')); acts.push(async () => { await openParty('ver'); }); }
    opts.push(L('BOLSA', 'BAG')); acts.push(async () => { await openBag('campo'); });
    opts.push(fmt('{nome}').toUpperCase()); acts.push(async () => { await stack.push(new CardScene()); });
    opts.push(L('SALVAR', 'SAVE')); acts.push(async () => {
      if (await ask(L('Deseja salvar o jogo?', 'Save the game?'))) {
        const ok = salvar();
        audio.sfx('save');
        await say(ok ? L(`{nome} salvou o jogo no espaço ${slotAtual}.`, `{nome} saved the game in slot ${slotAtual}.`) : L('Não foi possível salvar!', 'Could not save!'));
      }
      return true;
    });
    opts.push(L('OPÇÕES', 'OPTIONS')); acts.push(async () => { await openOptions(); });
    opts.push(L('FECHAR', 'CLOSE')); acts.push(async () => true);
    const m = new StartMenu(opts);
    m.idx = Math.min(lastStart, opts.length - 1);
    const r = await stack.push(m);
    if (r < 0) return;
    lastStart = r;
    const close = await acts[r]();
    if (close) return;
  }
}
