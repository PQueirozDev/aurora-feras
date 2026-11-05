import '@fontsource/pixelify-sans/400.css';
import '@fontsource/pixelify-sans/600.css';
import './style.css';
import { initScreen, beginFrame, ctx, W, H, text } from './engine/screen';
import { input } from './engine/input';
import { audio } from './engine/audio';
import { stack, tickWaiters } from './engine/scene';
import { drawBlackout } from './game/game';
import { S, setState, novoEstado, carregarConfig, autoSalvar, CFG } from './game/state';
import { criarMon } from './game/mon';
import * as worldMod from './scenes/world';
import { WorldScene, world } from './scenes/world';
import { startWildBattle, startTrainerBattle } from './scenes/battle';
import { openStartMenu, openShop, openPC } from './scenes/menus';
import { TitleScene } from './scenes/title';
import { ask } from './game/game';
import { L } from './i18n';

async function boot() {
  carregarConfig();
  audio.setEnabled(CFG.som);
  initScreen();
  input.init();
  input.onAnyPress = () => audio.unlock();
  window.addEventListener('pointerdown', () => audio.unlock(), { once: false });

  // carrega a fonte antes de desenhar texto
  try {
    await Promise.race([
      Promise.all([document.fonts.load('400 10px "Pixelify Sans"'), document.fonts.load('600 10px "Pixelify Sans"')]),
      new Promise((r) => setTimeout(r, 2500)),
    ]);
  } catch { /* usa fonte reserva */ }

  WorldScene.hooks = {
    battleWild: (sp, lvl) => startWildBattle(sp, lvl),
    battleTrainer: (t, musica) => startTrainerBattle(t, musica),
    startMenu: () => openStartMenu(),
    shop: (stock) => openShop(stock),
    pc: () => openPC(),
  };

  stack.push(new TitleScene());

  // salva sozinho quando o app vai para o segundo plano (celular) ou a janela fecha
  const salvarAoSair = () => { if (world && stack.scenes.includes(world)) autoSalvar(); };
  document.addEventListener('visibilitychange', () => { if (document.hidden) salvarAoSair(); });
  window.addEventListener('pagehide', salvarAoSair);

  // botão "voltar" do Android: funciona como o botão B; no mapa, pergunta se quer sair
  const cap = (window as unknown as { Capacitor?: { isNativePlatform?: () => boolean } }).Capacitor;
  if (cap?.isNativePlatform?.()) {
    const { App } = await import('@capacitor/app');
    let perguntando = false;
    App.addListener('backButton', async () => {
      const topo = stack.top();
      if (topo instanceof TitleScene) { App.exitApp(); return; }
      if (world && topo === world && !world.busy && !perguntando) {
        perguntando = true;
        world.busy = true;
        const sair = await ask(L('Salvar e sair do jogo?', 'Save and quit the game?'));
        world.busy = false;
        perguntando = false;
        if (sair) { autoSalvar(); App.exitApp(); }
        return;
      }
      input.virtualPress('b');
    });
  }

  // ganchos de depuração (só no modo de desenvolvimento)
  if (import.meta.env.DEV) {
    (window as any).__dbg = { get S() { return S; }, setState, novoEstado, criarMon, stack, worldMod };
  }

  // loop com passo fixo de 60 quadros por segundo
  const STEP = 1000 / 60;
  let last = performance.now();
  let acc = 0;
  let tempoAcc = 0;
  const frame = (now: number) => {
    acc += Math.min(250, now - last);
    last = now;
    let steps = 0;
    while (acc >= STEP && steps < 5) {
      input.update();
      try {
        stack.update();
      } catch (e) {
        console.error(e);
      }
      tickWaiters();
      if (world && stack.scenes.includes(world)) {
        tempoAcc += STEP;
        if (tempoAcc >= 1000) { S.tempo++; tempoAcc -= 1000; }
      }
      acc -= STEP;
      steps++;
    }
    beginFrame();
    try {
      stack.draw();
      drawBlackout();
    } catch (e) {
      console.error(e);
      ctx.fillStyle = '#400'; ctx.fillRect(0, 0, W, H);
      text('Erro: ' + String(e).slice(0, 60), 4, 4, { color: '#fff', shadow: null, size: 8 });
    }
    requestAnimationFrame(frame);
  };
  requestAnimationFrame(frame);
}

boot();
