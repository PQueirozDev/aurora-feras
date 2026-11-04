import { Scene } from '../engine/scene';
import { input } from '../engine/input';
import { audio } from '../engine/audio';
import { W, H, ctx, text } from '../engine/screen';
import { creatureSprites } from '../gfx/creatures';
import { S } from '../game/state';
import { nomeDe } from '../game/mon';

const LINHAS = [
  'AURORA', 'Caçadores de Feras', '',
  'Uma aventura original', 'feita do zero', '',
  '— IDEIA E DIREÇÃO —', 'Pedro Queiroz', '',
  '— PROGRAMAÇÃO —', 'Pedro Queiroz', 'com Claude', '',
  '— ARTE EM PIXEL —', '41 feras desenhadas por código', '',
  '— LÍDERES DE GINÁSIO —', 'Bruna · Marina · Raí · Selene', '',
  '— LIGA AURORA —', 'Elite Tito · Elite Íris', '',
  '— EQUIPE ECLIPSE —', 'Corvo · Nyx', '',
  '— AGRADECIMENTO ESPECIAL —', 'Prof. Ipê', 'e você, treinador!', '',
  '', 'OBRIGADO POR JOGAR!',
];

export class CreditsScene extends Scene<void> {
  private t = 0;
  private fase: 'hall' | 'rolagem' | 'fim' = 'hall';
  onEnter() { audio.music('vitoria'); }
  update() {
    this.t++;
    if (this.fase === 'hall' && (this.t > 360 || (this.t > 90 && input.pressed('a')))) { this.fase = 'rolagem'; this.t = 0; }
    else if (this.fase === 'rolagem' && (this.t > LINHAS.length * 18 + 260 || input.pressed('start'))) { this.fase = 'fim'; this.t = 0; }
    else if (this.fase === 'fim' && this.t > 60 && (input.pressed('a') || input.pressed('start'))) this.finish();
  }
  private fundo() {
    const g = ctx.createLinearGradient(0, 0, 0, H);
    g.addColorStop(0, '#0c1430'); g.addColorStop(1, '#283868');
    ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
    ctx.globalAlpha = 0.22;
    for (let k = 0; k < 3; k++) {
      ctx.fillStyle = ['#58f0a8', '#58c8f0', '#a878f0'][k];
      ctx.beginPath();
      for (let x = 0; x <= W; x += 8) { const y = 26 + k * 10 + Math.sin(x / 26 + this.t / 30 + k) * 10; if (x === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y); }
      ctx.lineTo(W, 0); ctx.lineTo(0, 0); ctx.fill();
    }
    ctx.globalAlpha = 1;
    for (let i = 0; i < 40; i++) { ctx.fillStyle = (this.t + i * 11) % 50 < 25 ? '#fff' : '#6878a8'; ctx.fillRect((i * 61) % W, (i * 23) % H, 1, 1); }
  }
  draw() {
    this.fundo();
    if (this.fase === 'hall') {
      text('HALL DA FAMA', W / 2, 10, { size: 16, bold: true, align: 'center', color: '#f8d048', shadow: '#603010' });
      text(`Campeão: ${S.nome}`, W / 2, 30, { size: 11, align: 'center', color: '#fff', shadow: '#102040' });
      const eq = S.equipe;
      eq.forEach((m, i) => {
        const col = i % 3, row = Math.floor(i / 3);
        const x = 20 + col * 72, y = 46 + row * 54;
        const k = Math.min(1, Math.max(0, (this.t - i * 20) / 20));
        if (k <= 0) return;
        ctx.globalAlpha = k;
        ctx.drawImage(creatureSprites(m.sp).front, x + 4, y + Math.round((1 - k) * 10) + Math.round(Math.sin(this.t / 14 + i) * 1.5));
        text(nomeDe(m), x + 28, y + 40, { size: 8, align: 'center', color: '#fff', shadow: null });
        text(`Nv${m.nivel}`, x + 28, y + 48, { size: 7, align: 'center', color: '#a8b8e8', shadow: null });
        ctx.globalAlpha = 1;
      });
      return;
    }
    if (this.fase === 'rolagem') {
      const off = H - this.t * 0.75;
      LINHAS.forEach((l, i) => {
        const y = off + i * 18;
        if (y < -20 || y > H) return;
        const titulo = i === 0;
        text(l, W / 2, y, { size: titulo ? 22 : l.startsWith('—') ? 9 : 11, bold: titulo || l.startsWith('—'), align: 'center', color: titulo ? '#f8d048' : l.startsWith('—') ? '#88c8f8' : '#ffffff', shadow: '#102040' });
      });
      // a equipe desfila embaixo
      S.equipe.forEach((m, i) => {
        const x = ((this.t * 0.8 + i * 44) % (W + 60)) - 50;
        ctx.drawImage(creatureSprites(m.sp).icon, Math.round(x), H - 26 + (Math.floor(this.t / 8 + i) % 2));
      });
      return;
    }
    text('FIM', W / 2, 60, { size: 26, bold: true, align: 'center', color: '#f8d048', shadow: '#603010' });
    if (this.t > 60 && Math.floor(this.t / 30) % 2 === 0) text('Aperte A', W / 2, 110, { size: 10, align: 'center', color: '#ffffff', shadow: null });
  }
}
