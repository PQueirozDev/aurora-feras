import { type MapDef, itemNoChao, treinador, npc, andarilho, casa, centro, loja, estoquePadrao, rivalEquipe } from '../mapkit';
import { inicialJogador } from '../../game/state';

const GRUNT = 'Recruta Eclipse';

export const REGIAO2: Record<string, MapDef> = {
  // ===================== BOSQUE SUSSURRO =====================
  bosque: {
    nome: 'BOSQUE SUSSURRO', musica: 'rota', borda: 'T',
    tiles: [
      'TTTTTTTTTTTTTTTTTTTTTTTTTTTTTT',
      'TTTTTTTTTTTTTTTTTTTTTTTTTTTTTT',
      'TTT""""TTTTTT,,,,,,TTTT""""TTT',
      'TTT""""..TTTT,TTTT,TTTT"""".TT',
      'TTT..""".....,TTTT,,,,,,""".TT',
      'TTTT.TTTTTTTT,TTTTTTTT.,TTT.TT',
      'TTTT.TTT"""T.,.""TTTTT.,TTT.TT',
      'TTTT...."""..,."""TTTT.,,,,,TT',
      'TTTTTTTT"""TT,TTT""TTT.TTTT.TT',
      'TTTTTTTTTTTTT,TTTTTTTT.TTTT.TT',
      ',,,,,,,,,,,,,,TTTTTTTT.TTTT.TT',
      'TTTTTTT.""""TTTTT""""..TTTT.TT',
      'TTTTTTT.""""TTTTT"""".TTTTT.TT',
      'TTTTTTT......,,,,,,,,,,,,,,,TT',
      'TTTTTTTTTTTT,TTTTTTTTTTTTTT,TT',
      'TT""""TTTTTT,TTTT""""TTTTTT,TT',
      'TT"""".......TTTT""""...,,,,,,',
      'TT""""TTTTTT.TTTT""""..TTTTTTT',
      'TT....TTTTTT.....,,,,,,TTTTTTT',
      'TTTTTTTTTTTTTTTTTTTTTTTTTTTTTT',
      'TTTTTTTTTTTTTTTTTTTTTTTTTTTTTT',
      'TTTTTTTTTTTTTTTTTTTTTTTTTTTTTT',
    ],
    warps: [],
    conexoes: { w: { map: 'rota2', d: -4 }, e: { map: 'porto', d: 1 } },
    encontros: { taxa: 12, lista: [['larvito', 8, 10, 20], ['mariluz', 10, 12, 10], ['cogumelinho', 9, 12, 20], ['toxinho', 9, 12, 20], ['gatuno', 9, 11, 15], ['vultinho', 10, 12, 10], ['besourao', 12, 13, 5]] },
    npcs: [
      treinador('bosque_g1', 12, 7, 'right', 'eclipse', {
        classe: GRUNT, nome: 'Recruta', equipe: [['toxinho', 11], ['morcegote', 11]], premio: 220, visao: 2,
        intro: 'Ei, você! Este bosque está fechado para pesquisa da EQUIPE ECLIPSE! Some daqui!',
        derrota: 'Tsc... uma criança me venceu?', depois: 'O chefe vai ficar sabendo disso...',
      }),
      treinador('bosque_g2', 20, 12, 'down', 'eclipse', {
        classe: GRUNT, nome: 'Recruta', equipe: [['gatuno', 12], ['toxinho', 12]], premio: 240, visao: 2,
        intro: 'Estamos capturando feras raras do bosque. Elas valem uma fortuna no mercado!',
        derrota: 'Argh! Vou contar para o Admin Corvo!', depois: 'O Admin Corvo está esperando no Porto Maré. Ele vai acabar com você!',
      }),
      treinador('bosque_inseto', 4, 7, 'right', 'inseteiro', {
        classe: 'Inseteiro', nome: 'Caio', equipe: [['larvito', 10], ['mariluz', 11], ['larvito', 10]], premio: 165, visao: 3,
        intro: 'Este bosque é o paraíso dos insetos!',
        derrota: 'Que derrota zumbidora...', depois: 'Dizem que um Besourão raríssimo vive aqui no bosque.',
      }),
      treinador('bosque_garota', 3, 16, 'right', 'garota', {
        classe: 'Exploradora', nome: 'Nina', equipe: [['cogumelinho', 11], ['gatuno', 12]], premio: 180, visao: 4,
        intro: 'Me perdi no bosque... mas posso lutar!',
        derrota: 'Ainda estou perdida E derrotada!', depois: 'A saída fica a leste, eu acho...',
      }),
      itemNoChao('bosque_i1', 27, 3, 'superpocao'),
      itemNoChao('bosque_i2', 3, 18, 'repelente', 2),
      itemNoChao('bosque_i3', 4, 2, 'supercapsula', 2),
    ],
  },

  // ===================== PORTO MARÉ =====================
  porto: {
    nome: 'PORTO MARÉ', musica: 'cidade', borda: '~',
    cidade: { nome: 'Porto Maré', x: 4, y: 11 },
    tiles: [
      'TTTTTTTTTTTTT,,TTTTTTTTTTTTT',
      'T............,,............T',
      'T.YYYYY......,,....OOOOOOO.T',
      'T.YYYYY......,,....OOOOOOO.T',
      'T.WwDwW......,,....OOOOOOO.T',
      'T....,.......,,....WWwDwWW.T',
      'T....,,,,,,,,,,,,,,,,,,,,,.T',
      'T............,,............T',
      'T.CCCCC......,,....MMMMM...T',
      'T.CCCCC......,,....MMMMM...T',
      'T.WwDwW......,,....WwDwW...T',
      'T...,........,,......,.....T',
      'T...,,,,,,,,,,,,,,,,,,.....T',
      'T............,,............T',
      'T.XXXXXXX....,,....YYYYY...T',
      'T.XXXXXXX....,,....YYYYY...T',
      'T.WWWDWWW....,,....WwDwW...T',
      ',....,.......,,......,.....T',
      'T....,,,,,,,,,,,,,,,,,.....T',
      'T;;;;;;;;;;;;==;;;;;;;;;;;;T',
      '~~~~~~~~~~~~~==~~~~~~~~~~~~~',
      '~~~~nnn~~~~~~==~~~~~~nnn~~~~',
      '~~~~~~~~~~~~~==~~~~~~~~~~~~~',
      '~~~~~~~~~~~~~~~~~~~~~~~~~~~~',
    ],
    warps: [
      { x: 4, y: 4, to: 'casa_p1', tx: 4, ty: 6, dir: 'up' },
      { x: 22, y: 5, to: 'ginasio2', tx: 5, ty: 12, dir: 'up' },
      { x: 4, y: 10, to: 'centro_porto', tx: 5, ty: 7, dir: 'up' },
      { x: 21, y: 10, to: 'loja_porto', tx: 4, ty: 6, dir: 'up' },
      { x: 5, y: 16, to: 'armazem', tx: 6, ty: 10, dir: 'up' },
      { x: 21, y: 16, to: 'casa_p2', tx: 4, ty: 6, dir: 'up' },
    ],
    conexoes: { w: { map: 'bosque', d: -1 }, n: { map: 'rota3', d: -4 } },
    placas: [],
    npcs: [
      {
        id: 'marinheiro_porta', x: 22, y: 6, dir: 'down', look: 'marinheiro', hideIf: 'armazem_limpo',
        talk: async (w) => { await w.say('O ginásio está fechado! A líder Marina foi investigar o ARMAZÉM do porto. Dizem que a Equipe Eclipse escondeu feras roubadas lá dentro!'); },
      },
      andarilho('pescador_porto', 9, 13, 'pescador', 'No mar perto do porto vivem cardumes de Bolhudo. Quando evoluem, viram Marlâmina!'),
      andarilho('moca_porto', 18, 7, 'moca', 'Os navios trazem mercadorias de toda a região de Aurora.'),
      npc('marinheiro2', 14, 21, 'up', 'marinheiro', 'Este cais leva aos barcos de pesca. O mar está agitado demais para navegar hoje.'),
      itemNoChao('porto_i1', 26, 1, 'elixir'),
    ],
    aoPisar: async (w, x, y) => {
      if (x <= 2 && y === 17 && !w.flag('rival2') && w.flag('insignia_rocha')) {
        w.set('rival2');
        await w.say('{rival}: Ei, {nome}! Também chegou ao Porto Maré? Eu já peguei um monte de feras novas!');
        await w.say('{rival}: Vamos ver quem treinou mais!');
        await w.battleTrainer({
          classe: 'Rival', nome: '{rival}', equipe: rivalEquipe(inicialJogador(), 1), intro: '', premio: 600, look: 'rival',
          derrota: '{rival}: Hmpf... você teve sorte. Muita sorte!', depois: '', flag: 'tr_rival2',
        }, { podePerder: true });
        await w.say('{rival}: Ouvi dizer que a Equipe Eclipse está aprontando no armazém do porto. Não vou deixar você ficar com toda a glória!');
        return true;
      }
      return false;
    },
  },

  casa_p1: casa('porto', 4, 4, [
    npc('velha_porto', 5, 4, 'right', 'velho', 'Meu neto tinha um Bolhudo... a Equipe Eclipse levou embora. Que gente malvada!'),
  ], 2),
  casa_p2: casa('porto', 21, 16, [
    {
      id: 'mestre_golpes', x: 6, y: 4, dir: 'left', look: 'veterano',
      talk: async (w) => {
        if (w.flag('presente_toupeco')) { await w.say('Feras de TERRA são ótimas contra ELÉTRICO. Lembre disso na Cidade Faísca!'); return; }
        await w.say('Sou caçador de feras aposentado. Este Toupeco cava túneis pela casa toda... você aceita cuidar dele?');
        if (await w.ask('Ficar com o Toupeco?')) { if (await w.giveMon('toupeco', 16)) w.set('presente_toupeco'); }
      },
    },
  ], 0),
  centro_porto: centro('porto', 4, 10),
  loja_porto: loja('porto', 21, 10, estoquePadrao),

  armazem: {
    nome: 'ARMAZÉM DO PORTO', musica: 'interior', borda: '0', interior: true,
    tiles: [
      '##############',
      '##############',
      '#t___x__x___t#',
      '#t_tt____tt_t#',
      '#____tt______#',
      '#_tt____tt___#',
      '#____________#',
      '#tt__tttt__tt#',
      '#____________#',
      '#x__________x#',
      '#____________#',
      '######mm######',
    ],
    warps: [{ x: 6, y: 11, to: 'porto', tx: 5, ty: 17, dir: 'down' }, { x: 7, y: 11, to: 'porto', tx: 5, ty: 17, dir: 'down' }],
    npcs: [
      treinador('arm_g1', 3, 8, 'right', 'eclipse', {
        classe: GRUNT, nome: 'Recruta', equipe: [['morcegote', 14], ['toxinho', 15]], premio: 300, visao: 4,
        intro: 'Intruso! Ninguém entra no esconderijo da Equipe Eclipse!',
        derrota: 'Você é mais forte do que parece...', depois: 'O Admin Corvo está no fundo do armazém.',
      }),
      treinador('arm_g2', 10, 6, 'left', 'eclipse', {
        classe: GRUNT, nome: 'Recruta', equipe: [['gatuno', 15], ['cogumelinho', 15]], premio: 300, visao: 4,
        intro: 'As feras deste armazém vão nos deixar ricos!',
        derrota: 'Nããão!', depois: 'Pode ir... o Corvo vai te dar uma lição.',
      }),
      {
        id: 'corvo', x: 6, y: 3, dir: 'down', look: 'corvo', hideIf: 'armazem_limpo',
        talk: async (w) => {
          await w.say('Corvo: Então você é o pirralho que atrapalhou meus recrutas no bosque.');
          await w.say('Corvo: Sou Corvo, Admin da EQUIPE ECLIPSE. Quando o eclipse chegar, todas as feras de Aurora serão nossas!');
          const venceu = await w.battleTrainer({
            classe: 'Admin Eclipse', nome: 'Corvo', equipe: [['morcegote', 16], ['toxinho', 17], ['vampirao', 19]], premio: 1200, chefe: true, look: 'corvo',
            intro: '', derrota: 'Corvo: Impossível! Fui derrotado por uma criança...', depois: '', flag: 'tr_corvo',
          }, { musica: 'lider' });
          if (!venceu) return;
          await w.say('Corvo: Hmpf. Pode ficar com essas feras. A Equipe Eclipse tem planos muito maiores na Cidade Faísca...');
          await w.flash('#000');
          w.set('armazem_limpo');
          w.refresh();
          await w.say('O Admin Corvo fugiu! As feras roubadas foram libertadas.');
          await w.say('Marina: Uau! Foi você quem expulsou a Equipe Eclipse? Sou Marina, líder do Ginásio do Porto. Muito obrigada!');
          await w.say('Marina: Me encontre no ginásio. Quero ver essa força numa batalha de verdade!');
        },
      },
      itemNoChao('arm_i1', 2, 9, 'reviver'),
      itemNoChao('arm_i2', 12, 2, 'supercapsula', 3),
    ],
  },

  ginasio2: {
    nome: 'GINÁSIO DO PORTO', musica: 'interior', borda: '0', interior: true,
    tiles: [
      '############',
      '############',
      '#__________#',
      '#~~~~==~~~~#',
      '#~~~~==~~~~#',
      '#__________#',
      '#__~~~~~~__#',
      '#__~====~__#',
      '#__~~~~~~__#',
      '#__________#',
      '#~~______~~#',
      '#~~______~~#',
      '#__________#',
      '#####mm#####',
    ],
    warps: [{ x: 5, y: 13, to: 'porto', tx: 22, ty: 6, dir: 'down' }, { x: 6, y: 13, to: 'porto', tx: 22, ty: 6, dir: 'down' }],
    npcs: [
      npc('guia2', 8, 12, 'left', 'campista', 'Marina usa feras de ÁGUA. Use ELÉTRICO ou PLANTA para virar a maré!'),
      treinador('gin2_t1', 1, 9, 'right', 'pescador', {
        classe: 'Pescador', nome: 'Beto', equipe: [['bolhudo', 16], ['bolhudo', 16]], premio: 320, visao: 4,
        intro: 'A maré está a meu favor!',
        derrota: 'Afundei...', depois: 'A Marina é forte como uma onda gigante.',
      }),
      treinador('gin2_t2', 10, 5, 'left', 'moca', {
        classe: 'Nadadora', nome: 'Duda', equipe: [['bolhudo', 17], ['pingolim', 17]], premio: 340, visao: 4,
        intro: 'Vamos ver se você sabe nadar!',
        derrota: 'Glub glub...', depois: 'Boa sorte com a Marina!',
      }),
      {
        id: 'marina', x: 5, y: 2, dir: 'down', look: 'marina', showIf: 'armazem_limpo',
        talk: async (w) => {
          if (w.flag('insignia_mare')) { await w.say('Marina: A Insígnia Maré combina com você! Siga para o norte, pela Rota 3, até a Caverna Brasa.'); return; }
          await w.say('Marina: Bem-vindo ao meu ginásio! As ondas do Porto Maré me ensinaram que a força vem da persistência.');
          const venceu = await w.battleTrainer({
            classe: 'Líder', nome: 'Marina', equipe: [['bolhudo', 18], ['marolhao', 19], ['marlamina', 21]], premio: 2100, lider: true, look: 'marina',
            intro: '', derrota: 'Marina: Fui levada pela correnteza! Que batalha incrível!', depois: '', flag: 'tr_marina',
          }, { musica: 'lider' });
          if (!venceu) return;
          w.set('insignia_mare');
          await w.jingle('insignia');
          await w.say('{nome} recebeu a INSÍGNIA MARÉ!');
          await w.say('Marina: Leve também estes Repelentes. Na Caverna Brasa as feras não param de aparecer!');
          await w.giveItem('superrepelente', 3);
        },
      },
    ],
  },

  // ===================== ROTA 3 =====================
  rota3: {
    nome: 'ROTA 3', musica: 'rota', borda: 'A',
    tiles: [
      'AAAAAAAAAAAAAAAAAAAA',
      'AAAAAAAAAEAAAAAAAAAA',
      'AAA......,.......AAA',
      'AA.."""".,.""""...AA',
      'AA.."""".,.""""...AA',
      'AA.......,,,,,....AA',
      'AAA..r.......,..r.AA',
      'AAAAAA.......,..AAAA',
      'TT"""""".....,...TTT',
      'TT""""""..,,,,...TTT',
      'TT""""""..,......TTT',
      'TT........,.""""".TT',
      'TTTTTTT...,.""""".TT',
      'TTTTTTT...,.......TT',
      'TT~~~~~...,,,,,...TT',
      'TT~~~~~.......,...TT',
      'TT~~~~~..S....,...TT',
      'TT............,...TT',
      'TTLLLLLLLL.LLL,LLLTT',
      'TT............,...TT',
      'TT""""""......,...TT',
      'TT""""""..,,,,,...TT',
      'TT""""""..,.......TT',
      'TT........,.......TT',
      'TTTTTTTTT,,TTTTTTTTT',
      'TTTTTTTTT,,TTTTTTTTT',
    ],
    warps: [{ x: 9, y: 1, to: 'caverna', tx: 9, ty: 17, dir: 'up' }],
    conexoes: { s: { map: 'porto', d: 4 } },
    placas: [{ x: 9, y: 16, texto: 'ROTA 3\n↑ Caverna Brasa     ↓ Porto Maré' }],
    encontros: { taxa: 10, lista: [['piui', 14, 16, 15], ['ventor', 17, 18, 5], ['toupeco', 14, 17, 20], ['socao', 14, 17, 20], ['toxinho', 14, 16, 15], ['pedrico', 15, 17, 15], ['mentalis', 16, 17, 10]] },
    npcs: [
      treinador('r3_t1', 7, 10, 'right', 'karateca', {
        classe: 'Carateca', nome: 'Kenji', equipe: [['socao', 17], ['socao', 18]], premio: 360, visao: 3,
        intro: 'Hah! Meus punhos estão prontos!',
        derrota: 'Preciso treinar mais...', depois: 'Feras de LUTADOR batem forte em NORMAL e PEDRA.',
      }),
      treinador('r3_t2', 16, 15, 'left', 'alpinista', {
        classe: 'Alpinista', nome: 'Rocha', equipe: [['pedrico', 16], ['toupeco', 17], ['pedrico', 17]], premio: 340, visao: 3,
        intro: 'Estou indo escalar a montanha. Mas antes, uma batalha!',
        derrota: 'Despenquei...', depois: 'A Caverna Brasa é escura. Fique atento!',
      }),
      treinador('r3_t3', 9, 22, 'right', 'medium', {
        classe: 'Médium', nome: 'Zélia', equipe: [['vultinho', 18]], premio: 300, visao: 2,
        intro: 'Os espíritos me disseram que você viria...',
        derrota: 'Os espíritos estavam errados.', depois: 'Feras FANTASMA ignoram golpes NORMAIS.',
      }),
      itemNoChao('r3_i1', 17, 4, 'superpocao', 2),
      itemNoChao('r3_i2', 17, 11, 'antiparalisia', 2),
    ],
  },

  // ===================== CAVERNA BRASA =====================
  caverna: {
    nome: 'CAVERNA BRASA', musica: 'caverna', borda: 'K', escuro: true, caverna: true,
    tiles: [
      'KKKKKKKKKKKKKKKKKKKKKKKK',
      'KKKKKKKKKKKKKKKKKKEKKKKK',
      'KK::::::KKKKKKKK::::KKKK',
      'KK::::::KKKKKKKK::::KKKK',
      'KK::KK::::::::::::::KKKK',
      'KK::KK:::KKKKKKK::KKKKKK',
      'KK::KK:::KllllKK::KKKKKK',
      'KK::::::::llllK::::::KKK',
      'KKKKKKK:::KKKKK::::::KKK',
      'KKKKKKK:::::::::::KK:KKK',
      'KK:::::::KKKKKK:::KK:KKK',
      'KK:llll::KKKKKK:::::::KK',
      'KK:llll::::::::::KKKK:KK',
      'KK::::::KKKKKKK::KKKK:KK',
      'KKKK::::KKKKKKK:::::::KK',
      'KKKK::::::::::::::KKKKKK',
      'KKKKKKKKK::KKKKKKKKKKKKK',
      'KKKKKKKKK::KKKKKKKKKKKKK',
      'KKKKKKKKKEEKKKKKKKKKKKKK',
      'KKKKKKKKKKKKKKKKKKKKKKKK',
    ],
    warps: [
      { x: 9, y: 18, to: 'rota3', tx: 9, ty: 2, dir: 'down' },
      { x: 10, y: 18, to: 'rota3', tx: 9, ty: 2, dir: 'down' },
      { x: 18, y: 1, to: 'faisca', tx: 11, ty: 19, dir: 'up' },
    ],
    encontros: { taxa: 9, lista: [['morcegote', 16, 19, 30], ['toupeco', 16, 19, 20], ['lavazinho', 17, 20, 20], ['pedrico', 17, 19, 15], ['vultinho', 17, 20, 10], ['escavadao', 20, 20, 5]] },
    npcs: [
      treinador('cav_t1', 12, 9, 'left', 'alpinista', {
        classe: 'Montanhista', nome: 'Odair', equipe: [['lavazinho', 19], ['pedrico', 19]], premio: 380, visao: 3,
        intro: 'Esta caverna é quente como um forno! Vamos esquentar mais ainda!',
        derrota: 'Esfriei...', depois: 'A saída fica no norte. A Cidade Faísca é logo ali.',
      }),
      treinador('cav_t2', 3, 13, 'up', 'medium', {
        classe: 'Médium', nome: 'Joca', equipe: [['vultinho', 19], ['vultinho', 20]], premio: 400, visao: 3,
        intro: 'Buuu! Assustei você?',
        derrota: 'Você nem piscou...', depois: 'Vultinho evolui no nível 28.',
      }),
      itemNoChao('cav_i1', 2, 2, 'elixir'),
      itemNoChao('cav_i2', 20, 10, 'ultracapsula'),
      itemNoChao('cav_i3', 20, 7, 'hiperpocao'),
    ],
  },
};
