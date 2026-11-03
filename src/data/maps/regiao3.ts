import { type MapDef, type NPC, type TrainerDef, itemNoChao, treinador, npc, andarilho, casa, centro, loja, estoquePadrao, rivalEquipe } from '../mapkit';
import { inicialJogador } from '../../game/state';

const GRUNT = 'Recruta Eclipse';

/** sala da Elite / Campeão: NPC bloqueia a saída para frente até ser vencido */
function salaLiga(id: string, nome: string, voltar: { to: string; tx: number; ty: number }, frente: { to: string; tx: number; ty: number } | null, chefe: (beaten: boolean) => NPC[]): MapDef {
  return {
    nome, musica: 'liga', borda: '0', interior: true,
    tiles: [
      '############',
      '#####m######',
      '#dddddddddd#',
      '#dJddjjddJd#',
      '#ddddjjdddd#',
      '#dJddjjddJd#',
      '#ddddjjdddd#',
      '#dJddjjddJd#',
      '#ddddjjdddd#',
      '#ddddjjdddd#',
      '#####mm#####',
    ],
    warps: [
      ...(frente ? [{ x: 5, y: 1, ...frente, dir: 'up' as const }] : []),
      { x: 5, y: 10, ...voltar, dir: 'down' as const },
      { x: 6, y: 10, ...voltar, dir: 'down' as const },
    ],
    npcs: [...chefe(false), ...chefe(true)],
  };
}

function eliteNPC(id: string, look: string, falaAntes: string[], def: Omit<TrainerDef, 'flag' | 'intro' | 'depois'>, falaDepois: string): (beaten: boolean) => NPC[] {
  const flag = 'tr_' + id;
  return (beaten) => beaten
    ? [npc(id + '_ok', 4, 2, 'right', look, falaDepois)].map((n) => ({ ...n, showIf: flag }))
    : [{
      id, x: 5, y: 2, dir: 'down', look, hideIf: flag,
      talk: async (w) => {
        await w.say(...falaAntes);
        const venceu = await w.battleTrainer({ ...def, flag, intro: '', depois: '', look }, { musica: 'lider' });
        if (venceu) { w.refresh(); await w.say(falaDepois); }
      },
    }];
}

export const REGIAO3: Record<string, MapDef> = {
  // ===================== CIDADE FAÍSCA =====================
  faisca: {
    nome: 'CIDADE FAÍSCA', musica: 'cidade', borda: 'T',
    cidade: { nome: 'Cidade Faísca', x: 4, y: 12 },
    tiles: [
      'TTTTTTTTTTTTTTTTTTTTTTTTTT',
      'T........................T',
      'T.XXXXXXXXX....OOOOOOO...T',
      'T.XXXXXXXXX....OOOOOOO...T',
      'T.XXXXXXXXX....OOOOOOO...T',
      'T.WWWWDWWWW....WWwDwWW...T',
      'T.....,...........,.......',
      'T.....,,,,,,,,,,,,,,,,,,,,',
      'T..........,.............T',
      'T.CCCCC....,....MMMMM....T',
      'T.CCCCC....,....MMMMM....T',
      'T.WwDwW....,....WwDwW....T',
      'T...,......,......,......T',
      'T...,,,,,,,,,,,,,,,......T',
      'T..........,.............T',
      'T.YYYYY....,....YYYYY....T',
      'T.YYYYY....,....YYYYY....T',
      'T.WwDwW....,....WwDwW....T',
      'T..........,.............T',
      'T..........,.............T',
      'AAAAAAAAAAAEAAAAAAAAAAAAAA',
      'AAAAAAAAAAAAAAAAAAAAAAAAAA',
    ],
    warps: [
      { x: 11, y: 20, to: 'caverna', tx: 18, ty: 2, dir: 'down' },
      { x: 6, y: 5, to: 'usina', tx: 7, ty: 12, dir: 'up' },
      { x: 18, y: 5, to: 'ginasio3', tx: 5, ty: 12, dir: 'up' },
      { x: 4, y: 11, to: 'centro_faisca', tx: 5, ty: 7, dir: 'up' },
      { x: 18, y: 11, to: 'loja_faisca', tx: 4, ty: 6, dir: 'up' },
      { x: 4, y: 17, to: 'casa_f1', tx: 4, ty: 6, dir: 'up' },
      { x: 18, y: 17, to: 'casa_f2', tx: 4, ty: 6, dir: 'up' },
    ],
    conexoes: { e: { map: 'rota4', d: 0 } },
    npcs: [
      {
        id: 'guarda_usina', x: 6, y: 6, dir: 'down', look: 'operario', hideIf: 'insignia_volt',
        talk: async (w) => { await w.say('A usina de energia está fechada para visitas. Só o líder Raí pode autorizar a entrada.'); },
      },
      {
        id: 'grunt_saida1', x: 24, y: 6, dir: 'left', look: 'eclipse', hideIf: 'usina_limpa',
        talk: async (w) => { await w.say('A saída da cidade está bloqueada pela EQUIPE ECLIPSE! Ordens da Comandante Nyx!'); },
      },
      {
        id: 'grunt_saida2', x: 24, y: 7, dir: 'left', look: 'eclipse', hideIf: 'usina_limpa',
        talk: async (w) => { await w.say('Ninguém sai até a Comandante Nyx terminar o trabalho na usina! Hehehe...'); },
      },
      andarilho('cientista_f', 14, 8, 'cientista', 'Toda a energia de Aurora vem da usina desta cidade. Se ela parar, a região inteira fica no escuro!'),
      andarilho('garoto_f', 8, 14, 'garoto', 'O líder Raí é fera em ELÉTRICO. Feras de TERRA não levam dano de golpes elétricos!'),
      itemNoChao('faisca_i1', 24, 18, 'hiperpocao'),
    ],
  },
  centro_faisca: centro('faisca', 4, 11),
  loja_faisca: loja('faisca', 18, 11, estoquePadrao),
  casa_f1: casa('faisca', 4, 17, [
    {
      id: 'presente_socao', x: 6, y: 5, dir: 'left', look: 'karateca',
      talk: async (w) => {
        if (w.flag('presente_socao')) { await w.say('Treine o Socão todos os dias. Ele vai ficar invencível!'); return; }
        await w.say('Sou mestre de artes marciais. Meu aluno Socão quer conhecer o mundo. Leve-o com você?');
        if (await w.ask('Ficar com o Socão?')) { if (await w.giveMon('socao', 22)) w.set('presente_socao'); }
      },
    },
  ], 2),
  casa_f2: casa('faisca', 18, 17, [
    npc('menina_f', 3, 4, 'right', 'garota', 'Quando falta luz, eu fico com medo dos Vultinhos que aparecem no escuro...'),
  ], 1),

  ginasio3: {
    nome: 'GINÁSIO DE FAÍSCA', musica: 'interior', borda: '0', interior: true,
    tiles: [
      '############',
      '############',
      '#iiiiiiiiii#',
      '#ieiiiiiiei#',
      '#iiieiieiii#',
      '#iiiiiiiiii#',
      '#eeeiiiieee#',
      '#iiiiiiiiii#',
      '#iiieeeeiii#',
      '#iiiiiiiiii#',
      '#eiiiiiiiie#',
      '#iiiiiiiiii#',
      '#iiiiiiiiii#',
      '#####mm#####',
    ],
    warps: [{ x: 5, y: 13, to: 'faisca', tx: 18, ty: 6, dir: 'down' }, { x: 6, y: 13, to: 'faisca', tx: 18, ty: 6, dir: 'down' }],
    npcs: [
      npc('guia3', 8, 12, 'left', 'campista', 'Raí usa ELÉTRICO. Feras de TERRA são imunes! Pedra também aguenta bem.'),
      treinador('gin3_t1', 2, 9, 'right', 'cientista', {
        classe: 'Cientista', nome: 'Elton', equipe: [['zapito', 22], ['zapito', 22]], premio: 440, visao: 4,
        intro: 'Minhas pesquisas mostram que vou vencer em 99%!',
        derrota: 'Erro de cálculo!', depois: 'Preciso revisar meus dados.',
      }),
      treinador('gin3_t2', 9, 5, 'left', 'operario', {
        classe: 'Eletricista', nome: 'Volta', equipe: [['zapito', 23], ['mariluz', 23]], premio: 460, visao: 4,
        intro: 'Cuidado com o choque!',
        derrota: 'Curto-circuito!', depois: 'Raí é o mais rápido de Aurora.',
      }),
      {
        id: 'rai', x: 5, y: 2, dir: 'down', look: 'rai',
        talk: async (w) => {
          if (w.flag('insignia_volt')) {
            if (!w.flag('usina_limpa')) { await w.say('Raí: A Equipe Eclipse invadiu a usina! Liberei a entrada para você. Por favor, detenha a Comandante Nyx!'); return; }
            await w.say('Raí: Graças a você, a energia de Aurora voltou! A saída leste da cidade está livre. Siga para a Vila Neblina!');
            return;
          }
          await w.say('Raí: E aí! Sou Raí, o líder mais rápido de Aurora! Minhas feras correm na velocidade da luz!');
          const venceu = await w.battleTrainer({
            classe: 'Líder', nome: 'Raí', equipe: [['zapito', 25], ['mariluz', 25], ['voltorrao', 28]], premio: 2800, lider: true, look: 'rai',
            intro: '', derrota: 'Raí: Fui mais lento que você?! Que choque!', depois: '', flag: 'tr_rai',
          }, { musica: 'lider' });
          if (!venceu) return;
          w.set('insignia_volt');
          await w.jingle('insignia');
          await w.say('{nome} recebeu a INSÍGNIA VOLT!');
          await w.shake(30);
          await w.say('Raí: O que foi isso?! A luz piscou... Isso veio da usina!');
          await w.say('Raí: Só pode ser a Equipe Eclipse! Eles querem roubar a energia da região. Liberei a entrada da usina. Conto com você!');
          await w.giveItem('hiperpocao', 2);
          w.refresh();
        },
      },
    ],
  },

  usina: {
    nome: 'USINA DE FAÍSCA', musica: 'eclipse', borda: '0', interior: true, escuro: true,
    tiles: [
      '################',
      '################',
      '#iiiiiiiiiiiiii#',
      '#ieeiiiiiiiieei#',
      '#ieeiiiiiiiieei#',
      '#iiiiieeeeiiiii#',
      '#iiiiiiiiiiiiii#',
      '#eeeeiiiiiieeee#',
      '#iiiiiiiiiiiiii#',
      '#iieeeeiiiiieei#',
      '#iiiiiiiiiiiiii#',
      '#eeiiiiiiiiiiee#',
      '#iiiiiiiiiiiiii#',
      '#######mm#######',
    ],
    warps: [{ x: 7, y: 13, to: 'faisca', tx: 6, ty: 6, dir: 'down' }, { x: 8, y: 13, to: 'faisca', tx: 6, ty: 6, dir: 'down' }],
    npcs: [
      treinador('usina_g1', 3, 10, 'right', 'eclipse', {
        classe: GRUNT, nome: 'Recruta', equipe: [['toxinho', 23], ['morcegote', 23], ['gatuno', 24]], premio: 480, visao: 5,
        intro: 'A Comandante Nyx está drenando a energia! Ninguém vai atrapalhar!',
        derrota: 'Essa não...', depois: 'Com essa energia, vamos ativar o Projeto Eclipse!',
      }),
      treinador('usina_g2', 12, 8, 'left', 'eclipse', {
        classe: GRUNT, nome: 'Recruta', equipe: [['vampirao', 24], ['cogumelinho', 23]], premio: 480, visao: 5,
        intro: 'Você de novo?! Desta vez não escapa!',
        derrota: 'Fui eclipsado...', depois: 'A Comandante está no fundo da usina.',
      }),
      treinador('usina_g3', 7, 6, 'down', 'corvo', {
        classe: 'Admin Eclipse', nome: 'Corvo', equipe: [['vampirao', 25], ['toxiboa', 25], ['felinao', 26]], premio: 1500, visao: 3,
        intro: 'Corvo: Você de novo! Não vou perder duas vezes!',
        derrota: 'Corvo: Perdi... de novo...', depois: 'Corvo: A Comandante Nyx é imbatível. Você vai ver.',
      }),
      {
        id: 'nyx', x: 7, y: 2, dir: 'down', look: 'nyx', hideIf: 'usina_limpa',
        talk: async (w) => {
          await w.say('Nyx: Então você é a criança de quem o Corvo tanto reclama.');
          await w.say('Nyx: Sou Nyx, Comandante da EQUIPE ECLIPSE. Com a energia desta usina, vamos criar um eclipse eterno e controlar todas as feras de Aurora!');
          await w.say('Nyx: Ninguém vai me impedir. Muito menos você!');
          const venceu = await w.battleTrainer({
            classe: 'Comandante', nome: 'Nyx', equipe: [['assombrao', 28], ['toxiboa', 28], ['vampirao', 28], ['felinao', 30]], premio: 4000, chefe: true, look: 'nyx',
            intro: '', derrota: 'Nyx: Não... não pode ser! Meu eclipse...', depois: '', flag: 'tr_nyx',
          }, { musica: 'lider' });
          if (!venceu) return;
          await w.say('Nyx: Hmpf. Você venceu desta vez. Mas a escuridão sempre volta...');
          await w.say('Nyx: Equipe Eclipse, retirada!');
          await w.flash('#000');
          w.set('usina_limpa');
          w.refresh();
          await w.shake(20);
          await w.say('A energia da usina voltou ao normal! A Equipe Eclipse fugiu de Aurora.');
          await w.say('Raí (pelo rádio): Você conseguiu! A cidade inteira está iluminada de novo! Obrigado, campeão!');
          await w.giveItem('capsulaaurora');
          await w.say('Você encontrou uma CÁPSULA AURORA largada pela Equipe Eclipse. Dizem que ela captura qualquer fera sem falhar...');
        },
      },
      itemNoChao('usina_i1', 14, 12, 'reviver'),
      itemNoChao('usina_i2', 1, 2, 'elixir'),
    ],
  },

  // ===================== ROTA 4 =====================
  rota4: {
    nome: 'ROTA 4', musica: 'rota', borda: 'T',
    tiles: [
      'TTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTT',
      'TT"""""""....TTTTTT.....""""""TTTT',
      'TT"""""""....TTTTTT..r..""""""TTTT',
      'TT...........TTTTTT.....""""""..TT',
      'TT.....S........................TT',
      'TTLLLLLLLL.....LLLLLLLL.....LLLLTT',
      '..................................',
      ',,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,',
      'TT............""""""""""........TT',
      'TT..""""""....""""""""""..r.....TT',
      'TT..""""""....................*.TT',
      'TT..""""""..TTTT......TTTT......TT',
      'TTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTT',
      'TTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTT',
    ],
    warps: [],
    conexoes: { w: { map: 'faisca', d: 0 }, e: { map: 'neblina', d: 4 } },
    placas: [{ x: 7, y: 4, texto: 'ROTA 4\n← Cidade Faísca     Vila Neblina →' }],
    encontros: { taxa: 10, lista: [['socao', 24, 27, 15], ['toxinho', 24, 26, 15], ['gatuno', 24, 26, 10], ['ventor', 25, 27, 15], ['zapito', 24, 27, 10], ['mentalis', 25, 27, 15], ['toupeco', 24, 27, 15], ['vultinho', 25, 27, 5]] },
    npcs: [
      treinador('r4_t1', 13, 8, 'up', 'karateca', {
        classe: 'Faixa-preta', nome: 'Hugo', equipe: [['socao', 26], ['punhoforte', 28]], premio: 560, visao: 2,
        intro: 'HAAA! Mostre sua força!',
        derrota: 'Que golpe!', depois: 'Punhoforte é a evolução do Socão.',
      }),
      treinador('r4_t2', 25, 8, 'up', 'medium', {
        classe: 'Médium', nome: 'Íngrid', equipe: [['mentalis', 26], ['vultinho', 26], ['mentalis', 27]], premio: 540, visao: 2,
        intro: 'Eu já previ esta batalha. E o resultado também...',
        derrota: 'Minha bola de cristal mentiu!', depois: 'Na Vila Neblina, os fantasmas são fortes.',
      }),
      treinador('r4_t3', 9, 10, 'up', 'garoto', {
        classe: 'Treinador', nome: 'Léo', equipe: [['ventor', 27], ['saltarao', 27]], premio: 540, visao: 3,
        intro: 'Quero ser campeão da Liga Aurora! Começando por você!',
        derrota: 'Ainda falta muito treino...', depois: 'Vou chegar lá um dia!',
      }),
      itemNoChao('r4_i1', 19, 1, 'ultracapsula', 2),
      itemNoChao('r4_i2', 31, 3, 'elixir'),
      itemNoChao('r4_i3', 31, 10, 'hiperpocao'),
    ],
    aoPisar: async (w, x, y) => {
      if (x === 16 && (y === 6 || y === 7) && !w.flag('rival3')) {
        w.set('rival3');
        await w.say('{rival}: {nome}! Fiquei sabendo que você expulsou a Equipe Eclipse da usina. Nada mal...');
        await w.say('{rival}: Mas eu também consegui três insígnias! E minhas feras evoluíram. Prepare-se!');
        await w.battleTrainer({
          classe: 'Rival', nome: '{rival}', equipe: rivalEquipe(inicialJogador(), 2), intro: '', premio: 1500, look: 'rival',
          derrota: '{rival}: De novo?! Como você ficou tão forte?', depois: '', flag: 'tr_rival3',
        }, { podePerder: true });
        await w.say('{rival}: Te vejo na Liga Aurora. Lá vai ser diferente!');
        return true;
      }
      return false;
    },
  },

  // ===================== VILA NEBLINA =====================
  neblina: {
    nome: 'VILA NEBLINA', musica: 'vila', borda: 'A',
    cidade: { nome: 'Vila Neblina', x: 4, y: 16 },
    tiles: [
      'AAAAAAAAAAAAAAAAAAAAAA',
      'AAAEAAAAAAEAAAAAAAAAAA',
      'T..,......,..........T',
      'T..,......,..........T',
      'T..,,,,,,,,,,,,......T',
      'T.OOOOOOO.....YYYYY..T',
      'T.OOOOOOO.....YYYYY..T',
      'T.OOOOOOO.....WwDwW..T',
      'T.WWwDwWW.......,....T',
      'T....,..........,....T',
      '.....,,,,,,,,,,,,....T',
      ',,,,,,.......,.......T',
      'T............,.......T',
      'T.CCCCC......,.MMMMM.T',
      'T.CCCCC......,.MMMMM.T',
      'T.WwDwW......,.WwDwW.T',
      'T...,........,...,...T',
      'T...,,,,,,,,,,,,,,...T',
      'T....................T',
      'TTTTTTTTTTTTTTTTTTTTTT',
    ],
    warps: [
      { x: 3, y: 1, to: 'santuario', tx: 6, ty: 10, dir: 'up' },
      { x: 10, y: 1, to: 'estrada', tx: 9, ty: 19, dir: 'up' },
      { x: 5, y: 8, to: 'ginasio4', tx: 5, ty: 12, dir: 'up' },
      { x: 16, y: 7, to: 'casa_n1', tx: 4, ty: 6, dir: 'up' },
      { x: 4, y: 15, to: 'centro_neblina', tx: 5, ty: 7, dir: 'up' },
      { x: 17, y: 15, to: 'loja_neblina', tx: 4, ty: 6, dir: 'up' },
    ],
    conexoes: { w: { map: 'rota4', d: -4 } },
    placas: [],
    npcs: [
      {
        id: 'guarda_estrada', x: 10, y: 2, dir: 'down', look: 'guarda', hideIf: 'quatro_insignias',
        talk: async (w) => {
          if (w.insignias() >= 4) { w.set('quatro_insignias'); w.refresh(); await w.say('Quatro insígnias! Pode passar. A Estrada da Vitória leva até a Liga Aurora. Boa sorte!'); return; }
          await w.say(`Esta é a entrada da Estrada da Vitória. Só treinadores com as QUATRO insígnias podem passar. Você tem ${w.insignias()}.`);
        },
      },
      npc('guarda_ok', 11, 2, 'down', 'guarda', 'A Liga Aurora fica do outro lado da Estrada da Vitória. Prepare bem suas feras!'),
      {
        id: 'anciã', x: 3, y: 2, dir: 'down', look: 'velho', hideIf: 'campeao',
        talk: async (w) => { await w.say('Esta caverna leva ao Santuário da Aurora. Só o campeão de Aurora pode entrar lá...'); },
      },
      andarilho('moca_n', 12, 12, 'medium', 'A neblina daqui nunca vai embora. Dizem que são os espíritos das feras antigas.'),
      itemNoChao('neblina_i1', 20, 18, 'pocaomax'),
    ],
  },
  centro_neblina: centro('neblina', 4, 15),
  loja_neblina: loja('neblina', 17, 15, estoquePadrao),
  casa_n1: casa('neblina', 16, 7, [
    {
      id: 'presente_mentalis', x: 6, y: 4, dir: 'left', look: 'medium',
      talk: async (w) => {
        if (w.flag('presente_mentalis')) { await w.say('Mentalis já sabia que você voltaria. Ele sempre sabe.'); return; }
        await w.say('Meu Mentalis previu que um treinador forte viria buscá-lo hoje. Acho que é você.');
        if (await w.ask('Ficar com o Mentalis?')) { if (await w.giveMon('mentalis', 28)) w.set('presente_mentalis'); }
      },
    },
  ], 2),

  ginasio4: {
    nome: 'GINÁSIO DE NEBLINA', musica: 'interior', borda: '0', interior: true,
    tiles: [
      '############',
      '############',
      '#dddddddddd#',
      '#dJddddddJd#',
      '#dddJddJddd#',
      '#dddddddddd#',
      '#JJdddddJJJ#',
      '#dddddddddd#',
      '#ddJJJJdddd#',
      '#dddddddddd#',
      '#JddddddddJ#',
      '#dddddddddd#',
      '#dddddddddd#',
      '#####mm#####',
    ],
    warps: [{ x: 5, y: 13, to: 'neblina', tx: 5, ty: 9, dir: 'down' }, { x: 6, y: 13, to: 'neblina', tx: 5, ty: 9, dir: 'down' }],
    npcs: [
      npc('guia4', 8, 12, 'left', 'campista', 'Selene usa FANTASMA. Golpes NORMAIS e de LUTADOR não fazem nada! Golpes de FANTASMA são super eficazes contra elas.'),
      treinador('gin4_t1', 2, 9, 'right', 'medium', {
        classe: 'Médium', nome: 'Odete', equipe: [['vultinho', 30], ['vultinho', 30]], premio: 600, visao: 4,
        intro: 'Sinta o frio dos espíritos...',
        derrota: 'Os espíritos se calaram.', depois: 'Selene fala com os fantasmas desde criança.',
      }),
      treinador('gin4_t2', 9, 5, 'left', 'medium', {
        classe: 'Médium', nome: 'Abel', equipe: [['mentalis', 30], ['assombrao', 31]], premio: 620, visao: 4,
        intro: 'Você não deveria ter vindo aqui...',
        derrota: 'Buuu... perdi.', depois: 'Boa sorte com a líder.',
      }),
      {
        id: 'selene', x: 5, y: 2, dir: 'down', look: 'selene',
        talk: async (w) => {
          if (w.flag('insignia_bruma')) { await w.say('Selene: Com quatro insígnias, a Estrada da Vitória está aberta para você. Os espíritos torcem por você.'); return; }
          await w.say('Selene: A neblina me contou que você viria. Sou Selene, e minhas feras vivem entre este mundo e o outro.');
          const venceu = await w.battleTrainer({
            classe: 'Líder', nome: 'Selene', equipe: [['vultinho', 32], ['vampirao', 33], ['oraculum', 33], ['assombrao', 35]], premio: 3500, lider: true, look: 'selene',
            intro: '', derrota: 'Selene: A neblina se dissipou... você brilhou mais forte.', depois: '', flag: 'tr_selene',
          }, { musica: 'lider' });
          if (!venceu) return;
          w.set('insignia_bruma');
          await w.jingle('insignia');
          await w.say('{nome} recebeu a INSÍGNIA BRUMA!');
          await w.say('Selene: Agora você tem as quatro insígnias de Aurora. Siga pela Estrada da Vitória, ao norte da vila, até a Liga Aurora.');
          await w.giveItem('pocaomax', 2);
        },
      },
    ],
  },

  // ===================== ESTRADA DA VITÓRIA =====================
  estrada: {
    nome: 'ESTRADA DA VITÓRIA', musica: 'caverna', borda: 'K', caverna: true,
    tiles: [
      'KKKKKKKKKKKKKKKKKKKK',
      'KKKKKKKKKEKKKKKKKKKK',
      'KK::::::::::::::::KK',
      'KK::KKKKKK::KKKK::KK',
      'KK::K::::K::K::K::KK',
      'KK::K::::K::K::K::KK',
      'KK::K::KKK::KKKK::KK',
      'KK::::::::::::::::KK',
      'KKKKKKKK::::KKKKKKKK',
      'KK::::::::::::::::KK',
      'KK::KKKKKKKKKKKK::KK',
      'KK::K::::::::::K::KK',
      'KK::K::KKKKKK::K::KK',
      'KK::::::::::::::::KK',
      'KKKKKKKKK::KKKKKKKKK',
      'KK::::::::::::::::KK',
      'KK::KK::KKKK::KK::KK',
      'KK::::::::::::::::KK',
      'KKKKKKKKK::KKKKKKKKK',
      'KKKKKKKKK::KKKKKKKKK',
      'KKKKKKKKKEEKKKKKKKKK',
      'KKKKKKKKKKKKKKKKKKKK',
    ],
    warps: [
      { x: 9, y: 20, to: 'neblina', tx: 10, ty: 2, dir: 'down' },
      { x: 10, y: 20, to: 'neblina', tx: 10, ty: 2, dir: 'down' },
      { x: 9, y: 1, to: 'liga_entrada', tx: 7, ty: 10, dir: 'up' },
    ],
    encontros: { taxa: 9, lista: [['rochedao', 32, 35, 20], ['escavadao', 32, 35, 20], ['vampirao', 32, 35, 20], ['punhoforte', 33, 35, 15], ['toxiboa', 33, 35, 15], ['vulcanor', 34, 36, 10]] },
    npcs: [
      treinador('est_t1', 16, 15, 'left', 'veterano', {
        classe: 'Veterano', nome: 'Saulo', equipe: [['rochedao', 34], ['escavadao', 35]], premio: 900, visao: 4,
        intro: 'Só os melhores chegam até aqui. Vamos ver se você é um deles!',
        derrota: 'Você é dos bons.', depois: 'A Liga Aurora está logo adiante.',
      }),
      treinador('est_t2', 3, 11, 'down', 'moca', {
        classe: 'Veterana', nome: 'Clara', equipe: [['silvarca', 35], ['marlamina', 35]], premio: 900, visao: 2,
        intro: 'Treinei anos para chegar aqui!',
        derrota: 'Ainda não foi desta vez...', depois: 'Dê o seu melhor na liga!',
      }),
      treinador('est_t3', 14, 7, 'left', 'karateca', {
        classe: 'Faixa-preta', nome: 'Kaito', equipe: [['punhoforte', 35], ['besourao', 36]], premio: 920, visao: 4,
        intro: 'Meus punhos são a última barreira antes da liga!',
        derrota: 'Fui nocauteado...', depois: 'A Elite Tito também usa LUTADOR. Prepare-se!',
      }),
      treinador('est_t4', 3, 4, 'down', 'veterano', {
        classe: 'Veterano', nome: 'Armando', equipe: [['voltorrao', 36], ['vulcanor', 36], ['oraculum', 36]], premio: 940, visao: 3,
        intro: 'Último desafio antes da glória!',
        derrota: 'Você merece chegar à liga.', depois: 'Vá, futuro campeão!',
      }),
      itemNoChao('est_i1', 7, 4, 'pocaomax'),
      itemNoChao('est_i2', 17, 9, 'ultracapsula', 3),
      itemNoChao('est_i3', 6, 11, 'reviver', 2),
    ],
  },

  // ===================== LIGA AURORA =====================
  liga_entrada: {
    nome: 'LIGA AURORA', musica: 'liga', borda: 'A',
    tiles: [
      'TTTTTTTTTTTTTTTT',
      'T..............T',
      'T..YYYYYYYYYY..T',
      'T..YYYYYYYYYY..T',
      'T..YYYYYYYYYY..T',
      'T..WWWwDDwWWW..T',
      'T......,,......T',
      'T.*....,,....*.T',
      'T......,,......T',
      'T.S....,,......T',
      'T......,,......T',
      'AAAAAAAEEAAAAAAA',
      'AAAAAAAAAAAAAAAA',
    ],
    warps: [
      { x: 7, y: 11, to: 'estrada', tx: 9, ty: 2, dir: 'down' },
      { x: 8, y: 11, to: 'estrada', tx: 9, ty: 2, dir: 'down' },
      { x: 7, y: 5, to: 'liga_lobby', tx: 6, ty: 7, dir: 'up' },
      { x: 8, y: 5, to: 'liga_lobby', tx: 7, ty: 7, dir: 'up' },
    ],
    placas: [{ x: 2, y: 9, texto: 'LIGA AURORA\nOnde nascem os campeões.' }],
    npcs: [],
  },

  liga_lobby: {
    nome: 'LIGA AURORA', musica: 'liga', borda: '0', interior: true,
    tiles: [
      '##############',
      '######mm######',
      '#____________#',
      '#_cc______cc_#',
      '#____________#',
      '#x__________x#',
      '#____________#',
      '#____________#',
      '######mm######',
    ],
    warps: [
      { x: 6, y: 8, to: 'liga_entrada', tx: 7, ty: 6, dir: 'down' },
      { x: 7, y: 8, to: 'liga_entrada', tx: 8, ty: 6, dir: 'down' },
      { x: 6, y: 1, to: 'elite1', tx: 5, ty: 9, dir: 'up' },
      { x: 7, y: 1, to: 'elite1', tx: 5, ty: 9, dir: 'up' },
    ],
    npcs: [
      {
        id: 'enfermeira_liga', x: 2, y: 2, dir: 'down', look: 'enfermeira',
        talk: async (w) => {
          if (await w.ask('Bem-vindo à Liga Aurora! Quer que eu cure suas feras?')) { await w.heal(); await w.say('Pronto! Boa sorte, desafiante!'); }
        },
      },
      {
        id: 'vendedor_liga', x: 11, y: 2, dir: 'down', look: 'vendedor',
        talk: async (w) => { await w.shop(['ultracapsula', 'hiperpocao', 'pocaomax', 'curatotal', 'reviver', 'elixir', 'superrepelente']); },
      },
      npc('guarda_liga', 9, 5, 'left', 'guarda', 'Atrás daquela porta estão a Elite Tito, a Elite Íris e o Campeão. Você vai enfrentar os três seguidos!', 'Cure suas feras e compre itens antes de entrar.'),
    ],
  },

  elite1: salaLiga('elite1', 'SALA DE TITO', { to: 'liga_lobby', tx: 6, ty: 2 }, { to: 'elite2', tx: 5, ty: 9 },
    eliteNPC('tito', 'tito', ['Tito: Bem-vindo à Liga Aurora! Sou Tito, da Elite.', 'Tito: Meus punhos derrubaram centenas de desafiantes. Você será o próximo!'],
      { classe: 'Elite', nome: 'Tito', equipe: [['punhoforte', 40], ['besourao', 40], ['labaredor', 41], ['punhoforte', 42]], premio: 5000, chefe: true, derrota: 'Tito: Que força! Você merece seguir em frente.' },
      'Tito: Siga em frente. A Elite Íris espera por você na próxima sala.')),

  elite2: salaLiga('elite2', 'SALA DE ÍRIS', { to: 'elite1', tx: 5, ty: 2 }, { to: 'campeao', tx: 5, ty: 9 },
    eliteNPC('iris', 'iris', ['Íris: Eu já sabia que você venceria o Tito. Eu leio mentes, sabia?', 'Íris: Mas o que vai acontecer agora... nem eu consigo prever.'],
      { classe: 'Elite', nome: 'Íris', equipe: [['oraculum', 42], ['mariluz', 41], ['assombrao', 42], ['oraculum', 44]], premio: 5500, chefe: true, derrota: 'Íris: Minha visão falhou. O futuro é seu.' },
      'Íris: O Campeão está na sala seguinte. Acho que você já sabe quem é...')),

  campeao: salaLiga('campeao', 'SALA DO CAMPEÃO', { to: 'elite2', tx: 5, ty: 2 }, null, (beaten) => beaten ? [] : [{
    id: 'rival_campeao', x: 5, y: 2, dir: 'down', look: 'rival', hideIf: 'campeao',
    talk: async (w) => {
      await w.say('{rival}: Finalmente, {nome}! Eu cheguei aqui primeiro. Venci a Elite e me tornei o CAMPEÃO de Aurora!');
      await w.say('{rival}: Desde o dia em que escolhemos nossas feras no laboratório, eu esperei por este momento.');
      await w.say('{rival}: Agora vamos decidir de uma vez quem é o melhor treinador de Aurora!');
      const venceu = await w.battleTrainer({
        classe: 'Campeão', nome: '{rival}', equipe: rivalEquipe(inicialJogador(), 3), intro: '', premio: 10000, chefe: true, look: 'rival',
        derrota: '{rival}: ... Eu perdi. Você é mesmo incrível, {nome}.', depois: '', flag: 'tr_campeao',
      }, { musica: 'lider' });
      if (!venceu) return;
      await w.say('{rival}: Parabéns, {nome}. Você é o novo CAMPEÃO da Liga Aurora!');
      await w.say('Prof. Ipê: {nome}! {rival}! Vim correndo assim que soube!');
      await w.say('Prof. Ipê: {rival}, você treinou muito, mas esqueceu de confiar nas suas feras como amigas. {nome} nunca esqueceu.');
      await w.say('Prof. Ipê: {nome}, venha comigo. Vamos registrar você e suas feras no Hall da Fama!');
      w.set('campeao');
      await w.credits();
    },
  }]),

  santuario: {
    nome: 'SANTUÁRIO DA AURORA', musica: 'caverna', borda: 'K', interior: true,
    tiles: [
      'KKKKKKKKKKKKKK',
      'KKKKKKKKKKKKKK',
      'KK::::::::::KK',
      'KK::::::::::KK',
      'KK::K::::K::KK',
      'KK::::::::::KK',
      'KK::K::::K::KK',
      'KK::::::::::KK',
      'KK::::::::::KK',
      'KK::::::::::KK',
      'KK::::::::::KK',
      'KKKKKKEKKKKKKK',
    ],
    warps: [{ x: 6, y: 11, to: 'neblina', tx: 3, ty: 2, dir: 'down' }],
    npcs: [
      {
        id: 'aurorix', x: 6, y: 3, dir: 'down', obj: 'fera', sp: 'aurorix', hideIf: 'aurorix_fim',
        talk: async (w) => {
          await w.say('Uma luz colorida dança no ar... A lendária fera AURORIX olha fixamente para você!');
          await w.flash('#c8f8f0');
          await w.say('Aurorix: Kiiiaaah!');
          const r = await w.battleWild('aurorix', 50);
          if (r === 'caught') { w.set('aurorix_fim'); w.refresh(); }
          else if (r === 'win') await w.say('Aurorix recuperou as forças em um brilho de luz... Ele ainda espera por um treinador digno.');
        },
      },
    ],
    aoEntrar: async (w) => {
      if (!w.flag('campeao')) { await w.say('Uma força misteriosa impede você de entrar...'); await w.warp('neblina', 3, 2, 'down'); }
    },
  },
};
