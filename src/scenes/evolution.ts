import { Scene } from '../engine/scene';
import { audio } from '../engine/audio';
import { W, H, ctx, rect, text, wrap } from '../engine/screen';
import { input } from '../engine/input';
import { box } from '../ui/draw';
import { creatureSprites } from '../gfx/creatures';
import { silhouette } from '../gfx/pixel';
import { evoluir, nomeDe, type Mon } from '../game/mon';
import { marcarCapturado } from '../game/state';
import { SPECIES } from '../data/species';
import { L } from '../i18n';

export class EvolutionScene extends Scene<void> {
  private t = 0;
  private phase = 0; // 0 intro, 1 piscando, 2 fim
  private msg: string;
  private velho: string;
  constructor(private m: Mon, private para: string) {
    super();
    this.velho = nomeDe(m);
    this.msg = L(`O quê? ${this.velho} está evoluindo!`, `What? ${this.velho} is evolving!`);
  }
  onEnter() { audio.music(null); }
  update() {
    this.t++;
    if (this.phase === 0 && this.t > 90) { this.phase = 1; this.t = 0; }
    else if (this.phase === 1 && this.t > 200) {
      this.phase = 2; this.t = 0;
      evoluir(this.m, this.para);
      marcarCapturado(this.para);
      audio.jingle('captura');
      this.msg = L(`Parabéns! ${this.velho} evoluiu para ${SPECIES[this.para].nome}!`, `Congratulations! ${this.velho} evolved into ${SPECIES[this.para].nome}!`);
    } else if (this.phase === 2 && this.t > 60 && (input.pressed('a') || input.pressed('b') || this.t > 240)) {
      this.finish();
    }
    if (this.phase === 1 && this.t % 12 === 0) audio.sfx('blip');
  }
  draw() {
    rect(0, 0, W, H, '#202838');
    for (let i = 0; i < 12; i++) {
      const a = (this.t * 0.02 + i * (Math.PI / 6));
      ctx.fillStyle = 'rgba(120,160,255,0.08)';
      ctx.beginPath(); ctx.moveTo(120, 56);
      ctx.arc(120, 56, 200, a, a + 0.2); ctx.fill();
    }
    const antes = creatureSprites(this.m.sp === this.para ? this.para : this.m.sp).front;
    const depois = creatureSprites(this.para).front;
    let spr = antes;
    if (this.phase === 1) {
      const speed = Math.max(3, 24 - Math.floor(this.t / 10));
      const showNew = Math.floor(this.t / speed) % 2 === 1;
      spr = silhouette(showNew ? depois : antes, '#ffffff');
    } else if (this.phase === 2) spr = depois;
    ctx.drawImage(spr, 120 - 48, 56 - 48, 96, 96);
    box(2, H - 46, W - 4, 44);
    wrap(this.msg, W - 28, 11).slice(0, 2).forEach((l, i) => text(l, 12, H - 38 + i * 16, { size: 11 }));
  }
}
