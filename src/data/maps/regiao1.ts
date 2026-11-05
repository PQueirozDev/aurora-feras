import type { Dir } from '../../gfx/people';
import { type MapDef, type NPC, itemNoChao, treinador, npc, andarilho, casa, centro, loja, estoquePadrao, rivalEquipe } from '../mapkit';

const INICIAIS: Record<string, { rival: string; desc: string; nome: string }> = {
  brasilho: { rival: 'pingolim', desc: 'Fagulin, a fera de FOGO', nome: 'Fagulin' },
  pingolim: { rival: 'folhito', desc: 'Gotim, a fera de ÁGUA', nome: 'Gotim' },
  folhito: { rival: 'brasilho', desc: 'Brotin, a fera de PLANTA', nome: 'Brotin' },
};

function capsulaInicial(sp: string, x: number): NPC {
  return {
    id: 'cap_' + sp, x, y: 4, dir: 'down', obj: 'capsula', hideIf: 'pego_' + sp,
    talk: async (w) => {
      if (!w.flag('labIntro')) { await w.say('São cápsulas com feras dentro. Melhor falar com o Prof. Ipê primeiro.'); return; }
      if (w.flag('inicial')) { await w.say('É a fera que o Prof. Ipê guardou para pesquisa.'); return; }
      const info = INICIAIS[sp];
      const ok = await w.ask(`Prof. Ipê: Você escolhe ${info.desc}?`);
      if (!ok) return;
      w.set('inicial');
      w.set('inicial_' + sp);
      w.set('pego_' + sp);
      w.refresh();
      await w.giveMon(sp, 5);
      const rsp = info.rival;
      await w.say('{rival}: Então eu fico com esta aqui!');
      const r = w.npc('rival_lab')!;
      const alvoX = rsp === 'brasilho' ? 5 : rsp === 'pingolim' ? 6 : 7;
      const path: Dir[] = [];
      for (let i = r.x; i < alvoX; i++) path.push('right');
      for (let i = r.x; i > alvoX; i--) path.push('left');
      for (let i = r.y; i > 5; i--) path.push('up');
      await w.moveNpc('rival_lab', path);
      w.face('rival_lab', 'up');
      w.set('pego_' + rsp);
      w.refresh();
      await w.say(`{rival} recebeu ${INICIAIS[rsp].nome}!`);
      await w.say('Prof. Ipê: Ótimo! Agora tome isto também: a FERADEX, que registra cada fera que você encontrar, e algumas cápsulas para capturar feras selvagens.');
      w.set('feradex');
      await w.giveItem('capsula', 5);
      await w.say('Prof. Ipê: Existem feras por toda a região de Aurora. Capture, treine e conquiste as quatro insígnias para desafiar a Liga Aurora!');
      w.face('rival_lab', 'player');
      await w.say('{rival}: Ei, {nome}! Vamos testar nossas feras agora mesmo!');
      await w.battleTrainer({
        classe: 'Rival', nome: '{rival}', equipe: [[rsp, 5]], intro: '', premio: 120, look: 'rival',
        derrota: '{rival}: O quê?! Eu escolhi a fera com vantagem e perdi?!', depois: '', flag: 'rivalLab',
      }, { podePerder: true });
      await w.say('{rival}: Vou treinar muito e da próxima vez eu ganho! Até mais!');
      const r2 = w.npc('rival_lab')!;
      const sair: Dir[] = [];
      for (let i = r2.y; i < 8; i++) sair.push('down');
      if (r2.x < 5) for (let i = r2.x; i < 5; i++) sair.push('right');
      if (r2.x > 6) for (let i = r2.x; i > 6; i--) sair.push('left');
      sair.push('down');
      await w.moveNpc('rival_lab', sair);
      w.set('rivalSaiu');
      w.refresh();
    },
  };
}

export const REGIAO1: Record<string, MapDef> = {
  // ===================== VILA ORVALHO =====================
  vila: {
    nome: 'VILA ORVALHO', musica: 'vila', borda: 'T',
    cidade: { nome: 'Vila Orvalho', x: 4, y: 6 },
    tiles: [
      'TTTTTTTTT,,TTTTTTTTT',
      'TTTTTTTTT,,TTTTTTTTT',
      'T........,,........T',
      'T.RRRRR..,,..BBBBB.T',
      'T.RRRRR..,,..BBBBB.T',
      'T.WwDwW..,,..WwDwW.T',
      'T...,....,,....,...T',
      'T.S.,,,,,,,,,,,,...T',
      'T.......,..........T',
      'T*..*...,XXXXXXX..*T',
      'T.......,XXXXXXX...T',
      'T..fffff,WwwDwwW...T',
      'T..f***f,...,....S.T',
      'T..fffff,...,......T',
      'T.......,,,,,......T',
      'T~~~~~~~~~~~~~~~~~~T',
      'T~~~~~~~~~~~~~~~~~~T',
      'TTTTTTTTTTTTTTTTTTTT',
    ],
    warps: [
      { x: 4, y: 5, to: 'casa1', tx: 4, ty: 6, dir: 'up' },
      { x: 15, y: 5, to: 'casa2', tx: 4, ty: 6, dir: 'up' },
      { x: 12, y: 11, to: 'lab', tx: 5, ty: 8, dir: 'up' },
    ],
    conexoes: { n: { map: 'rota1', d: 0 } },
    placas: [
      { x: 2, y: 7, texto: 'VILA ORVALHO\nOnde o orvalho brilha ao amanhecer.' },
      { x: 17, y: 12, texto: 'LABORATÓRIO DE FERAS\nProf. Ipê' },
    ],
    npcs: [
      andarilho('menina_vila', 6, 8, 'garota', 'Dizem que as feras da grama alta pulam em quem passa por lá. Que medo!'),
      npc('velho_vila', 14, 13, 'left', 'velho', 'Antigamente eu era um grande caçador de feras. Hoje só gosto de olhar o lago.', 'Ouvi dizer que no alto do Monte Neblina vive uma fera lendária que brilha como a aurora...'),
    ],
    aoPisar: async (w, _x, y) => {
      if (y <= 1 && !w.flag('inicial')) {
        await w.say('???: Ei! Espere aí! Não entre na grama alta sem uma fera!');
        await w.wait(10);
        await w.say('Prof. Ipê: Ufa, cheguei a tempo! Feras selvagens podem aparecer a qualquer momento. Venha comigo até o laboratório!');
        await w.warp('lab', 6, 5, 'up');
        w.set('labIntro');
        w.refresh();
        await w.say('Prof. Ipê: Aqui estamos. Este é o meu laboratório, onde estudo as feras da região de Aurora.');
        await w.say('{rival}: Professor! Eu estava esperando faz horas! Ah, oi {nome}.');
        await w.say('Prof. Ipê: Calma, {rival}. Na mesa estão três cápsulas, cada uma com uma fera. {nome}, você escolhe primeiro!');
        return true;
      }
      return false;
    },
  },

  casa1: {
    nome: 'CASA DE {nome}', musica: 'interior', borda: '0', interior: true,
    tiles: ['##########', '##########', '#bb__v__k#', '#_______k#', '#__tt____#', '#__tt___x#', '#________#', '####mm####'],
    warps: [{ x: 4, y: 7, to: 'vila', tx: 4, ty: 6, dir: 'down' }, { x: 5, y: 7, to: 'vila', tx: 4, ty: 6, dir: 'down' }],
    npcs: [
      {
        id: 'mae', x: 6, y: 5, dir: 'left', look: 'mae',
        talk: async (w) => {
          if (!w.flag('inicial')) {
            await w.say('Mãe: Bom dia, {nome}! O Prof. Ipê passou aqui mais cedo. Acho que ele tem algo especial para você!');
            return;
          }
          if (w.flag('campeao')) await w.say('Mãe: Meu filho, o campeão de Aurora! Estou tão orgulhosa!');
          else await w.say('Mãe: {nome}, você parece cansado. Descanse um pouco!');
          await w.heal();
          await w.say('Mãe: Pronto! Você e suas feras estão novinhos em folha. Boa sorte na jornada!');
        },
      },
    ],
  },

  casa2: casa('vila', 15, 5, [
    {
      id: 'irma', x: 3, y: 4, dir: 'right', look: 'moca',
      talk: async (w) => {
        if (!w.flag('presente_irma') && w.flag('inicial')) {
          await w.say('Lúcia: Oi, {nome}! Meu irmão {rival} saiu correndo para a Rota 1. Leve isto, vai ser útil.');
          await w.giveItem('pocao', 2);
          w.set('presente_irma');
          return;
        }
        await w.say('Lúcia: Meu irmão {rival} vive dizendo que vai ser o melhor treinador de Aurora...');
      },
    },
  ], 1, 'CASA DE {rival}'),

  lab: {
    nome: 'LABORATÓRIO', musica: 'interior', borda: '0', interior: true,
    tiles: [
      '############',
      '############',
      '#bbbb__bbbb#',
      '#__________#',
      '#____ttt___#',
      '#__________#',
      '#x________x#',
      '#__________#',
      '#__________#',
      '#####mm#####',
    ],
    warps: [{ x: 5, y: 9, to: 'vila', tx: 12, ty: 12, dir: 'down' }, { x: 6, y: 9, to: 'vila', tx: 12, ty: 12, dir: 'down' }],
    npcs: [
      {
        id: 'prof', x: 6, y: 3, dir: 'down', look: 'prof',
        talk: async (w) => {
          if (!w.flag('labIntro')) { await w.say('Prof. Ipê: Olá, {nome}! Hoje é um grande dia. Mas antes, que tal dar uma volta lá fora?'); return; }
          if (!w.flag('inicial')) { await w.say('Prof. Ipê: Escolha uma das três cápsulas na mesa!'); return; }
          const n = w.insignias();
          if (w.flag('campeao')) {
            await w.say('Prof. Ipê: O novo campeão de Aurora! Agora que a liga está em paz, dizem que algo brilha no topo do Monte Neblina... vá investigar!');
            return;
          }
          if (n >= 1 && !w.flag('compartilhador')) {
            await w.say('Prof. Ipê: Uma insígnia! Que orgulho, {nome}. Tome esta invenção minha, vai ajudar muito no treino.');
            await w.giveItem('compartilhador');
            w.set('compartilhador');
            await w.say('Prof. Ipê: Com o COMPARTILHADOR XP, as feras da sua equipe que não lutaram também ganham metade da experiência!');
            return;
          }
          const dicas = [
            'Siga para o norte pela Rota 1 até a Cidade Ventania. Lá existe um ginásio de feras do tipo PEDRA. Feras de ÁGUA e PLANTA têm vantagem!',
            'A Rota 2 leva ao Bosque Sussurro e depois ao Porto Maré. Cuidado: ouvi falar de uma tal Equipe Eclipse roubando feras por lá!',
            'Ao norte do Porto Maré fica a Caverna Brasa. Atravesse-a para chegar à Cidade Faísca, a cidade da eletricidade.',
            'A leste da Cidade Faísca fica a Vila Neblina. A última insígnia está lá. Depois, só a Liga Aurora!',
            'Com quatro insígnias você pode atravessar a Estrada da Vitória e desafiar a Liga Aurora. Boa sorte!',
          ];
          await w.say('Prof. Ipê: ' + dicas[Math.min(n, 4)]);
        },
      },
      {
        id: 'rival_lab', x: 4, y: 6, dir: 'up', look: 'rival', showIf: 'labIntro', hideIf: 'rivalSaiu',
        talk: async (w) => { await w.say('{rival}: Anda logo e escolhe, {nome}!'); },
      },
      npc('assistente', 9, 7, 'left', 'cientista', 'Assistente: O professor estuda como as feras evoluem. Quando sobem de nível, algumas mudam de forma!', 'Assistente: Algumas feras evoluem duas vezes! Os iniciais, por exemplo.'),
      capsulaInicial('brasilho', 5),
      capsulaInicial('pingolim', 6),
      capsulaInicial('folhito', 7),
    ],
  },

  // ===================== ROTA 1 =====================
  rota1: {
    nome: 'ROTA 1', musica: 'rota', borda: 'T',
    tiles: [
      'TTTTTTTTT,,TTTTTTTTT',
      'TT.......,,.......TT',
      'TT.""""..,,..""""".T',
      'TT.""""..,,..""""".T',
      'TT.""""..,,..""""".T',
      'TT.......,,.......TT',
      'TTLLLLLL.,,.LLLLLLTT',
      'TT.......,,.......TT',
      'TT..S....,,....r..TT',
      'TT.......,,,,,,...TT',
      'TT""""""....,,""""TT',
      'TT""""""....,,""""TT',
      'TT""""""....,,""""TT',
      'TT..........,,....TT',
      'TTTTTT......,,....TT',
      'TTTTTT..,,,,,,....TT',
      'TT......,,........TT',
      'TT."""""",,.""""""TT',
      'TT.""""",,.""""""".T',
      'TT.""""",,.""""""".T',
      'TT......,,........TT',
      'TT**....,,,....**.TT',
      'TTLLLLLL.,,LLLLLLLTT',
      'TT.......,,.......TT',
      'TT."""".,,...""""TTT',
      'TT.......,,.......TT',
      'TTTTTTTTT,,TTTTTTTTT',
      'TTTTTTTTT,,TTTTTTTTT',
    ],
    warps: [],
    conexoes: { s: { map: 'vila', d: 0 }, n: { map: 'ventania', d: 0 } },
    placas: [{ x: 4, y: 8, texto: 'ROTA 1\nVila Orvalho ↓   Cidade Ventania ↑' }],
    encontros: { taxa: 10, lista: [['pulim', 2, 4, 40], ['piui', 2, 4, 35], ['larvito', 2, 3, 15], ['gatuno', 3, 4, 10]] },
    npcs: [
      treinador('davi', 15, 13, 'left', 'garoto', {
        classe: 'Garoto', nome: 'Davi', equipe: [['pulim', 3]], premio: 48, visao: 4,
        intro: 'Ei! Nossos olhos se cruzaram! Isso significa batalha!',
        derrota: 'Ahh! Minha fera perdeu...', depois: 'Vou capturar mais feras e treinar de novo!',
      }),
      treinador('ana', 3, 16, 'right', 'garota', {
        classe: 'Menina', nome: 'Ana', equipe: [['piui', 3], ['larvito', 3]], premio: 60, visao: 5,
        intro: 'Você também é treinador? Vamos lutar!',
        derrota: 'Puxa, você é forte!', depois: 'Feras de tipos diferentes têm vantagens diferentes. Preste atenção nisso!',
      }),
      andarilho('garoto_r1', 10, 20, 'campista', 'Se suas feras ficarem cansadas, volte para casa ou vá a um Centro de Feras para curá-las!', 'Segure o botão B para correr!'),
      itemNoChao('r1_pocao', 17, 1, 'pocao'),
      itemNoChao('r1_capsula', 3, 20, 'capsula', 2),
    ],
  },

  // ===================== CIDADE VENTANIA =====================
  ventania: {
    nome: 'CIDADE VENTANIA', musica: 'cidade', borda: 'T',
    cidade: { nome: 'Cidade Ventania', x: 4, y: 12 },
    tiles: [
      'TTTTTTTTTTTTTTTTTTTTTTTT',
      'T......................T',
      'T.OOOOOOO......YYYYY...T',
      'T.OOOOOOO......YYYYY...T',
      'T.OOOOOOO......WwDwW...T',
      'T.WWwDwWW........,.....T',
      'T....,...........,.....T',
      'T....,,,,,,,,,,,,,.....T',
      'T.S.......,............T',
      'T.CCCCC...,....MMMMM...T',
      'T.CCCCC...,....MMMMM...T',
      'T.WwDwW...,....WwDwW...T',
      'T...,.....,......,......',
      'T...,,,,,,,,,,,,,,,,,,,,',
      'T.........,............T',
      'T..YYYYY..,..fffffff...T',
      'T..YYYYY..,..f*****f...T',
      'T..WwDwW..,..fffffff...T',
      'T....,....,............T',
      'T....,,,,,,.....S......T',
      'TTTTTTTTT,,TTTTTTTTTTTTT',
      'TTTTTTTTT,,TTTTTTTTTTTTT',
    ],
    warps: [
      { x: 5, y: 5, to: 'ginasio1', tx: 5, ty: 12, dir: 'up' },
      { x: 17, y: 4, to: 'casa_v1', tx: 4, ty: 6, dir: 'up' },
      { x: 4, y: 11, to: 'centro_ventania', tx: 5, ty: 7, dir: 'up' },
      { x: 17, y: 11, to: 'loja_ventania', tx: 4, ty: 6, dir: 'up' },
      { x: 5, y: 17, to: 'casa_v2', tx: 4, ty: 6, dir: 'up' },
    ],
    conexoes: { s: { map: 'rota1', d: 0 }, e: { map: 'rota2', d: -6 } },
    placas: [
      { x: 2, y: 8, texto: 'CIDADE VENTANIA\nOnde o vento sopra forte o ano inteiro.' },
      { x: 16, y: 19, texto: 'GINÁSIO DE VENTANIA\nLíder: Bruna — a muralha inabalável!\n(fica no norte da cidade)' },
    ],
    npcs: [
      andarilho('moca_v', 12, 8, 'moca', 'O Centro de Feras tem o telhado vermelho. A loja tem o telhado azul. Fácil de lembrar!'),
      andarilho('garoto_v', 8, 14, 'garoto', 'A líder Bruna usa feras de PEDRA. Ataques normais quase não fazem efeito nelas!'),
      {
        id: 'velho_v', x: 20, y: 7, dir: 'left', look: 'velho',
        talk: async (w) => {
          if (!w.flag('dica_v')) { await w.say('Sabia que você pode capturar feras mais facilmente quando elas estão com pouca vida ou dormindo?'); w.set('dica_v'); return; }
          await w.say('Na Rota 2, a leste, dá para encontrar o raro Zapito!');
        },
      },
    ],
  },

  centro_ventania: centro('ventania', 4, 11, [
    andarilho('moco_c', 8, 5, 'campista', 'Use o computador ali no canto para guardar ou retirar feras. Você só pode levar 6 na equipe.'),
  ]),
  loja_ventania: loja('ventania', 17, 11, estoquePadrao, [
    npc('cliente', 6, 5, 'up', 'garota', 'Quanto mais insígnias você tiver, mais itens a loja passa a vender!'),
  ]),
  casa_v1: casa('ventania', 17, 4, [
    {
      id: 'sabio', x: 6, y: 4, dir: 'left', look: 'velho',
      talk: async (w) => {
        await w.say('Vou te contar um segredo dos tipos:');
        await w.say('FOGO vence PLANTA e INSETO. ÁGUA vence FOGO, PEDRA e TERRA. PLANTA vence ÁGUA, PEDRA e TERRA.');
        await w.say('ELÉTRICO vence ÁGUA e VOADOR, mas não faz nada contra TERRA. PEDRA vence FOGO, VOADOR e INSETO.');
        await w.say('LUTADOR vence NORMAL e PEDRA. FANTASMA não sofre golpes NORMAIS nem de LUTADOR. PSÍQUICO vence LUTADOR e VENENOSO.');
      },
    },
  ], 1),
  casa_v2: casa('ventania', 5, 17, [
    {
      id: 'pescador_presente', x: 6, y: 5, dir: 'left', look: 'pescador',
      talk: async (w) => {
        if (w.flag('presente_bolhudo')) { await w.say('Cuide bem do Bolhudo! Ele adora água fresquinha.'); return; }
        await w.say('Eu pesquei um Bolhudo, mas não tenho tempo para cuidar dele...');
        if (await w.ask('Você quer ficar com ele?')) {
          if (await w.giveMon('bolhudo', 8)) w.set('presente_bolhudo');
        } else await w.say('Ah... se mudar de ideia, volte aqui.');
      },
    },
  ], 0),

  ginasio1: {
    nome: 'GINÁSIO DE VENTANIA', musica: 'interior', borda: '0', interior: true,
    tiles: [
      '############',
      '############',
      '#gggggggggg#',
      '#gQggggggQg#',
      '#gQggggggQg#',
      '#ggQQggQQgg#',
      '#gggggggggg#',
      '#QQQgggQQQQ#',
      '#gggggggggg#',
      '#ggggQQQQgg#',
      '#gggggggggg#',
      '#gqggggggqg#',
      '#gggggggggg#',
      '#####mm#####',
    ],
    warps: [{ x: 5, y: 13, to: 'ventania', tx: 5, ty: 6, dir: 'down' }, { x: 6, y: 13, to: 'ventania', tx: 5, ty: 6, dir: 'down' }],
    npcs: [
      {
        id: 'guia', x: 7, y: 12, dir: 'left', look: 'campista',
        talk: async (w) => {
          if (w.flag('insignia_rocha')) { await w.say('Incrível! Você venceu a Bruna! Você vai longe, campeão!'); return; }
          await w.say('Ei, futuro campeão! A líder Bruna usa feras de PEDRA, muito resistentes.');
          await w.say('Ataques de ÁGUA, PLANTA, TERRA e LUTADOR são super eficazes contra elas. Tome, isso vai ajudar!');
          if (!w.flag('guia_presente')) { await w.giveItem('pocao', 2); w.set('guia_presente'); }
        },
      },
      treinador('teo', 8, 6, 'left', 'alpinista', {
        classe: 'Alpinista', nome: 'Teo', equipe: [['pedrico', 8]], premio: 160, visao: 4,
        intro: 'Você quer enfrentar a Bruna? Primeiro passe por mim!',
        derrota: 'Minha rocha rachou...', depois: 'A Bruna é muito mais forte do que eu.',
      }),
      treinador('lia', 3, 8, 'right', 'campista', {
        classe: 'Campista', nome: 'Lia', equipe: [['pulim', 8], ['pedrico', 8]], premio: 160, visao: 4,
        intro: 'Daqui você não passa!',
        derrota: 'Ah, não! Perdi!', depois: 'Boa sorte contra a líder!',
      }),
      {
        id: 'bruna', x: 5, y: 2, dir: 'down', look: 'lider',
        talk: async (w) => {
          if (w.flag('insignia_rocha')) { await w.say('Bruna: Você tem a Insígnia Rocha. Siga para o leste, pela Rota 2, e fique ainda mais forte!'); return; }
          await w.say('Bruna: Então você é o novato de Vila Orvalho. Sou Bruna, líder do Ginásio de Ventania.');
          await w.say('Bruna: Minhas feras de PEDRA são duras como muralhas. Mostre do que você é capaz!');
          const venceu = await w.battleTrainer({
            classe: 'Líder', nome: 'Bruna', equipe: [['pedrico', 10], ['rochedao', 12]], premio: 1200, lider: true, look: 'lider',
            intro: '', derrota: 'Bruna: Impressionante... você derrubou minha muralha!', depois: '', flag: 'tr_bruna',
          }, { musica: 'lider' });
          if (!venceu) return;
          await w.say('Bruna: Você merece isto. A INSÍGNIA ROCHA!');
          w.set('insignia_rocha');
          await w.jingle('insignia');
          await w.say('{nome} recebeu a INSÍGNIA ROCHA!');
          await w.say('Bruna: Leve também estas Supercápsulas. E passe no laboratório do Prof. Ipê, ele vai querer te ver!');
          await w.giveItem('supercapsula', 3);
          await w.say('Bruna: O túnel da Rota 2 já foi liberado. Siga para o leste, rumo ao Porto Maré!');
        },
      },
    ],
  },

  // ===================== ROTA 2 =====================
  rota2: {
    nome: 'ROTA 2', musica: 'rota', borda: 'T',
    tiles: [
      'TTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTT',
      'TT......""""""......TT~~~~~~.TTT',
      'TT."""".""""""".r...T~~~~~~~.TTT',
      'TT."""".......""""".~~~~~~~~.TTT',
      'TT.......S.....""""..~~~~~~..TTT',
      'TT...........................TTT',
      ',,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,',
      '...............""""""""""".....T',
      'TT..LLLLLL.....""""""""""".....T',
      'TT.............""""""""""..r..TT',
      'TT""""""......................TT',
      'TT""""""....f*f*f*f.......S...TT',
      'TT""""""......................TT',
      'TTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTT',
    ],
    warps: [],
    conexoes: { w: { map: 'ventania', d: 6 }, e: { map: 'bosque', d: 4 } },
    placas: [
      { x: 9, y: 4, texto: 'ROTA 2\n← Cidade Ventania    Bosque Sussurro →' },
      { x: 26, y: 11, texto: 'BOSQUE SUSSURRO\nNão se perca entre as árvores!' },
    ],
    encontros: { taxa: 10, lista: [['pulim', 4, 6, 20], ['piui', 4, 6, 20], ['larvito', 4, 5, 15], ['pedrico', 5, 7, 15], ['zapito', 5, 7, 10], ['gatuno', 5, 7, 15], ['socao', 6, 7, 5]] },
    npcs: [
      {
        id: 'operario', x: 29, y: 6, dir: 'left', look: 'operario', hideIf: 'insignia_rocha',
        talk: async (w) => { await w.say('Opa! A passagem para o bosque está fechada até alguém vencer a líder Bruna. Ordens do ginásio!'); },
      },
      treinador('ze', 20, 4, 'down', 'pescador', {
        classe: 'Pescador', nome: 'Zé', equipe: [['bolhudo', 7]], premio: 140, visao: 3,
        intro: 'Shhh! Você espantou os peixes! Agora vai ter que lutar!',
        derrota: 'Fisguei uma derrota...', depois: 'Bolhudo é uma ótima fera de água contra pedra.',
      }),
      treinador('rui', 14, 9, 'up', 'inseteiro', {
        classe: 'Inseteiro', nome: 'Rui', equipe: [['larvito', 5], ['mariluz', 7]], premio: 105, visao: 3,
        intro: 'Olha só os insetos que eu peguei!',
        derrota: 'Meus insetos foram esmagados!', depois: 'Larvito evolui rapidinho. Vale a pena treinar um!',
      }),
      treinador('mel', 25, 8, 'up', 'garota', {
        classe: 'Garota', nome: 'Mel', equipe: [['pulim', 6], ['zapito', 6]], premio: 96, visao: 2,
        intro: 'Meu Zapito está carregado de energia!',
        derrota: 'Fiquei sem bateria!', depois: 'Zapito é raro, mas aparece na grama desta rota.',
      }),
      itemNoChao('r2_superpocao', 3, 1, 'superpocao'),
      itemNoChao('r2_reviver', 28, 4, 'reviver'),
      itemNoChao('r2_capsulas', 7, 12, 'capsula', 3),
    ],
  },
};

export { rivalEquipe };
