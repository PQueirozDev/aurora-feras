import type { Tipo } from './types';

export type Stat = 'atk' | 'def' | 'spa' | 'spd' | 'spe';
export type Status = 'brn' | 'psn' | 'par' | 'slp';

export type Efeito =
  | { k: 'stat'; alvo: 'foe' | 'self'; stat: Stat; n: number; chance?: number }
  | { k: 'stat2'; alvo: 'self'; stats: Stat[]; n: number }
  | { k: 'status'; s: Status; chance?: number }
  | { k: 'flinch'; chance: number }
  | { k: 'drain' }
  | { k: 'recoil' }
  | { k: 'heal' }
  | { k: 'crit' }
  | { k: 'fixo' }; // dano igual ao nível do usuário

export type Move = {
  nome: string;
  tipo: Tipo;
  cat: 'fis' | 'esp' | 'status';
  poder: number;
  prec: number; // 0 = nunca erra
  pp: number;
  prio?: number;
  ef?: Efeito;
  desc: string;
};

const st = (alvo: 'foe' | 'self', stat: Stat, n: number, chance?: number): Efeito => ({ k: 'stat', alvo, stat, n, chance });
const ss = (s: Status, chance?: number): Efeito => ({ k: 'status', s, chance });

export const MOVES = {
  // ---------------- NORMAL ----------------
  investida: { nome: 'Investida', tipo: 'Normal', cat: 'fis', poder: 40, prec: 100, pp: 35, desc: 'Avança contra o alvo com o corpo todo.' },
  arranhao: { nome: 'Arranhão', tipo: 'Normal', cat: 'fis', poder: 40, prec: 100, pp: 35, desc: 'Arranha o alvo com garras afiadas.' },
  rosnado: { nome: 'Rosnado', tipo: 'Normal', cat: 'status', poder: 0, prec: 100, pp: 40, ef: st('foe', 'atk', -1), desc: 'Rosna de forma fofa e baixa o Ataque do alvo.' },
  olharferoz: { nome: 'Olhar Feroz', tipo: 'Normal', cat: 'status', poder: 0, prec: 100, pp: 30, ef: st('foe', 'def', -1), desc: 'Encara o alvo e baixa a Defesa dele.' },
  ataquerapido: { nome: 'Ataque Rápido', tipo: 'Normal', cat: 'fis', poder: 40, prec: 100, pp: 30, prio: 1, desc: 'Golpe veloz que sempre ataca primeiro.' },
  mordida: { nome: 'Mordida', tipo: 'Normal', cat: 'fis', poder: 60, prec: 100, pp: 25, ef: { k: 'flinch', chance: 30 }, desc: 'Morde com força. Pode fazer o alvo hesitar.' },
  endurecer: { nome: 'Endurecer', tipo: 'Normal', cat: 'status', poder: 0, prec: 0, pp: 30, ef: st('self', 'def', 1), desc: 'Contrai os músculos e aumenta a Defesa.' },
  cancao: { nome: 'Canção Suave', tipo: 'Normal', cat: 'status', poder: 0, prec: 55, pp: 15, ef: ss('slp'), desc: 'Uma melodia calma que faz o alvo dormir.' },
  pancadao: { nome: 'Pancadão', tipo: 'Normal', cat: 'fis', poder: 85, prec: 100, pp: 15, ef: ss('par', 30), desc: 'Joga o corpo todo no alvo. Pode paralisar.' },
  investidabruta: { nome: 'Investida Bruta', tipo: 'Normal', cat: 'fis', poder: 90, prec: 85, pp: 20, ef: { k: 'recoil' }, desc: 'Ataque forte que também machuca o usuário.' },
  agilidade: { nome: 'Agilidade', tipo: 'Normal', cat: 'status', poder: 0, prec: 0, pp: 30, ef: st('self', 'spe', 2), desc: 'Relaxa o corpo e aumenta muito a Velocidade.' },
  descanso: { nome: 'Recompor', tipo: 'Normal', cat: 'status', poder: 0, prec: 0, pp: 10, ef: { k: 'heal' }, desc: 'Recupera metade dos PV máximos.' },
  corte: { nome: 'Corte', tipo: 'Normal', cat: 'fis', poder: 55, prec: 95, pp: 30, desc: 'Corta o alvo com garras ou lâminas.' },
  pisotear: { nome: 'Pisotear', tipo: 'Normal', cat: 'fis', poder: 65, prec: 100, pp: 20, ef: { k: 'flinch', chance: 30 }, desc: 'Pisa com força. Pode fazer o alvo hesitar.' },
  hiperfeixe: { nome: 'Hiperfeixe', tipo: 'Normal', cat: 'esp', poder: 120, prec: 90, pp: 5, desc: 'Um raio devastador de pura energia.' },
  dancaespada: { nome: 'Dança das Lâminas', tipo: 'Normal', cat: 'status', poder: 0, prec: 0, pp: 20, ef: st('self', 'atk', 2), desc: 'Uma dança de guerra que aumenta muito o Ataque.' },
  gritoguerra: { nome: 'Grito de Guerra', tipo: 'Normal', cat: 'status', poder: 0, prec: 100, pp: 30, ef: st('foe', 'def', -2), desc: 'Um grito assustador que baixa muito a Defesa do alvo.' },

  // ---------------- FOGO ----------------
  brasa: { nome: 'Brasa', tipo: 'Fogo', cat: 'esp', poder: 40, prec: 100, pp: 25, ef: ss('brn', 10), desc: 'Pequenas chamas. Pode queimar o alvo.' },
  rodafogo: { nome: 'Roda de Fogo', tipo: 'Fogo', cat: 'fis', poder: 60, prec: 100, pp: 25, ef: ss('brn', 10), desc: 'Rola envolto em fogo. Pode queimar.' },
  labareda: { nome: 'Labareda', tipo: 'Fogo', cat: 'esp', poder: 90, prec: 100, pp: 15, ef: ss('brn', 10), desc: 'Um jato de chamas intenso. Pode queimar.' },
  fumaca: { nome: 'Fumaceira', tipo: 'Fogo', cat: 'status', poder: 0, prec: 100, pp: 20, ef: st('foe', 'atk', -1), desc: 'Solta fumaça quente que baixa o Ataque do alvo.' },
  presaflama: { nome: 'Presa Flamejante', tipo: 'Fogo', cat: 'fis', poder: 65, prec: 95, pp: 15, ef: ss('brn', 20), desc: 'Morde com presas em chamas. Pode queimar.' },
  erupcao: { nome: 'Erupção', tipo: 'Fogo', cat: 'esp', poder: 110, prec: 85, pp: 5, ef: ss('brn', 30), desc: 'Uma explosão de lava. Pode queimar.' },
  fogofatuo: { nome: 'Fogo-Fátuo', tipo: 'Fogo', cat: 'status', poder: 0, prec: 85, pp: 15, ef: ss('brn'), desc: 'Chamas fantasmagóricas que queimam o alvo.' },

  // ---------------- ÁGUA ----------------
  jatodagua: { nome: "Jato d'Água", tipo: 'Água', cat: 'esp', poder: 40, prec: 100, pp: 25, desc: 'Esguicha água com força no alvo.' },
  bolhas: { nome: 'Bolhas', tipo: 'Água', cat: 'esp', poder: 40, prec: 100, pp: 30, ef: st('foe', 'spe', -1, 10), desc: 'Bolhas que podem baixar a Velocidade.' },
  pulsoagua: { nome: 'Pulso Aquático', tipo: 'Água', cat: 'esp', poder: 60, prec: 100, pp: 20, desc: 'Onda de choque de água pura.' },
  maremoto: { nome: 'Maremoto', tipo: 'Água', cat: 'esp', poder: 90, prec: 100, pp: 15, desc: 'Uma onda enorme varre o campo.' },
  casco: { nome: 'Casco', tipo: 'Água', cat: 'status', poder: 0, prec: 0, pp: 40, ef: st('self', 'def', 1), desc: 'Se protege e aumenta a Defesa.' },
  cachoeira: { nome: 'Cachoeira', tipo: 'Água', cat: 'fis', poder: 80, prec: 100, pp: 15, ef: { k: 'flinch', chance: 20 }, desc: 'Investida com a força de uma cachoeira.' },
  hidrocanhao: { nome: 'Hidrocanhão', tipo: 'Água', cat: 'esp', poder: 110, prec: 80, pp: 5, desc: 'Dispara um jato de água esmagador.' },
  chuvaacida: { nome: 'Garoa', tipo: 'Água', cat: 'status', poder: 0, prec: 0, pp: 10, ef: { k: 'heal' }, desc: 'Absorve uma chuva fina e recupera metade dos PV.' },

  // ---------------- PLANTA ----------------
  chicote: { nome: 'Chicote de Cipó', tipo: 'Planta', cat: 'fis', poder: 45, prec: 100, pp: 25, desc: 'Golpeia com cipós finos.' },
  absorver: { nome: 'Absorver', tipo: 'Planta', cat: 'esp', poder: 25, prec: 100, pp: 25, ef: { k: 'drain' }, desc: 'Rouba energia e recupera PV.' },
  folhanavalha: { nome: 'Folha Navalha', tipo: 'Planta', cat: 'fis', poder: 55, prec: 95, pp: 25, ef: { k: 'crit' }, desc: 'Folhas afiadas. Acerta pontos críticos com facilidade.' },
  posono: { nome: 'Pó do Sono', tipo: 'Planta', cat: 'status', poder: 0, prec: 75, pp: 15, ef: ss('slp'), desc: 'Espalha um pó que faz o alvo dormir.' },
  megadreno: { nome: 'Mega Dreno', tipo: 'Planta', cat: 'esp', poder: 50, prec: 100, pp: 15, ef: { k: 'drain' }, desc: 'Drena muita energia e recupera PV.' },
  rajadafolhas: { nome: 'Rajada de Folhas', tipo: 'Planta', cat: 'esp', poder: 90, prec: 100, pp: 10, desc: 'Uma tempestade de folhas cortantes.' },
  povenenoso: { nome: 'Pó Venenoso', tipo: 'Planta', cat: 'status', poder: 0, prec: 75, pp: 35, ef: ss('psn'), desc: 'Pó tóxico que envenena o alvo.' },
  esporo: { nome: 'Esporos', tipo: 'Planta', cat: 'status', poder: 0, prec: 90, pp: 15, ef: ss('slp'), desc: 'Nuvem de esporos que faz o alvo dormir.' },
  raiosolar: { nome: 'Raio Solar', tipo: 'Planta', cat: 'esp', poder: 120, prec: 85, pp: 5, desc: 'Concentra a luz do sol em um raio poderoso.' },
  sintese: { nome: 'Fotossíntese', tipo: 'Planta', cat: 'status', poder: 0, prec: 0, pp: 10, ef: { k: 'heal' }, desc: 'Absorve luz e recupera metade dos PV.' },

  // ---------------- ELÉTRICO ----------------
  choque: { nome: 'Choquinho', tipo: 'Elétrico', cat: 'esp', poder: 40, prec: 100, pp: 30, ef: ss('par', 10), desc: 'Descarga elétrica. Pode paralisar.' },
  ondatrovao: { nome: 'Onda Trovão', tipo: 'Elétrico', cat: 'status', poder: 0, prec: 90, pp: 20, ef: ss('par'), desc: 'Uma onda elétrica fraca que paralisa.' },
  faisca: { nome: 'Faísca', tipo: 'Elétrico', cat: 'fis', poder: 65, prec: 100, pp: 20, ef: ss('par', 30), desc: 'Investida eletrificada. Pode paralisar.' },
  relampago: { nome: 'Relâmpago', tipo: 'Elétrico', cat: 'esp', poder: 90, prec: 100, pp: 15, ef: ss('par', 10), desc: 'Um raio poderoso. Pode paralisar.' },
  trovao: { nome: 'Trovão', tipo: 'Elétrico', cat: 'esp', poder: 110, prec: 70, pp: 10, ef: ss('par', 30), desc: 'Um trovão violento cai do céu. Pode paralisar.' },
  carga: { nome: 'Carga Total', tipo: 'Elétrico', cat: 'status', poder: 0, prec: 0, pp: 20, ef: st('self', 'spa', 2), desc: 'Acumula eletricidade e aumenta muito o Ataque Especial.' },

  // ---------------- PEDRA ----------------
  lancapedras: { nome: 'Lança-Pedras', tipo: 'Pedra', cat: 'fis', poder: 50, prec: 90, pp: 15, desc: 'Arremessa pedras pequenas.' },
  desabamento: { nome: 'Desabamento', tipo: 'Pedra', cat: 'fis', poder: 75, prec: 90, pp: 10, ef: { k: 'flinch', chance: 30 }, desc: 'Derruba rochas. Pode fazer o alvo hesitar.' },
  muralha: { nome: 'Muralha', tipo: 'Pedra', cat: 'status', poder: 0, prec: 0, pp: 20, ef: st('self', 'def', 2), desc: 'Endurece como pedra e aumenta muito a Defesa.' },
  tumbapedra: { nome: 'Tumba de Pedra', tipo: 'Pedra', cat: 'fis', poder: 60, prec: 95, pp: 15, ef: st('foe', 'spe', -1), desc: 'Cerca o alvo com pedras e baixa a Velocidade.' },
  avalanche: { nome: 'Avalanche', tipo: 'Pedra', cat: 'fis', poder: 100, prec: 80, pp: 5, desc: 'Uma avalanche de rochas pesadas.' },
  joia: { nome: 'Joia Cortante', tipo: 'Pedra', cat: 'esp', poder: 80, prec: 100, pp: 20, desc: 'Dispara cristais afiados que brilham.' },

  // ---------------- INSETO ----------------
  teia: { nome: 'Teia', tipo: 'Inseto', cat: 'status', poder: 0, prec: 95, pp: 40, ef: st('foe', 'spe', -1), desc: 'Prende o alvo com seda e baixa a Velocidade.' },
  picada: { nome: 'Picada', tipo: 'Inseto', cat: 'fis', poder: 60, prec: 100, pp: 20, desc: 'Morde o alvo com mandíbulas fortes.' },
  ferrao: { nome: 'Ferrão', tipo: 'Inseto', cat: 'fis', poder: 25, prec: 100, pp: 35, ef: ss('psn', 30), desc: 'Ferroada que pode envenenar.' },
  zumbido: { nome: 'Zumbido', tipo: 'Inseto', cat: 'esp', poder: 90, prec: 100, pp: 10, desc: 'Vibra as asas criando uma onda sonora.' },
  tesourax: { nome: 'Tesoura X', tipo: 'Inseto', cat: 'fis', poder: 80, prec: 100, pp: 15, desc: 'Corta em X com garras afiadas.' },
  chifrada: { nome: 'Megachifre', tipo: 'Inseto', cat: 'fis', poder: 110, prec: 85, pp: 10, desc: 'Investe com um chifre enorme.' },

  // ---------------- VOADOR ----------------
  rajada: { nome: 'Rajada', tipo: 'Voador', cat: 'esp', poder: 40, prec: 100, pp: 35, desc: 'Bate as asas e cria um vendaval.' },
  bicada: { nome: 'Bicada', tipo: 'Voador', cat: 'fis', poder: 35, prec: 100, pp: 35, desc: 'Bica o alvo com o bico pontudo.' },
  asaataque: { nome: 'Golpe de Asa', tipo: 'Voador', cat: 'fis', poder: 60, prec: 100, pp: 35, desc: 'Golpeia com as asas abertas.' },
  aereo: { nome: 'Corte Aéreo', tipo: 'Voador', cat: 'fis', poder: 60, prec: 0, pp: 20, desc: 'Ataque veloz que nunca erra.' },
  bicobroca: { nome: 'Bico Broca', tipo: 'Voador', cat: 'fis', poder: 80, prec: 100, pp: 20, desc: 'Gira como uma broca e perfura o alvo.' },
  furacao: { nome: 'Furacão', tipo: 'Voador', cat: 'esp', poder: 110, prec: 70, pp: 10, desc: 'Um furacão violento envolve o alvo.' },
  aves: { nome: 'Voo Bravo', tipo: 'Voador', cat: 'fis', poder: 120, prec: 100, pp: 15, ef: { k: 'recoil' }, desc: 'Mergulha do céu com tudo. Também machuca o usuário.' },

  // ---------------- TERRA ----------------
  lama: { nome: 'Tapa de Lama', tipo: 'Terra', cat: 'esp', poder: 20, prec: 100, pp: 10, ef: st('foe', 'spe', -1), desc: 'Joga lama no rosto do alvo e baixa a Velocidade.' },
  ossada: { nome: 'Escavar', tipo: 'Terra', cat: 'fis', poder: 80, prec: 100, pp: 10, desc: 'Cava rapidamente e ataca por baixo.' },
  terremoto: { nome: 'Terremoto', tipo: 'Terra', cat: 'fis', poder: 100, prec: 100, pp: 10, desc: 'Um terremoto sacode todo o campo.' },
  bombalama: { nome: 'Bomba de Lama', tipo: 'Terra', cat: 'esp', poder: 65, prec: 85, pp: 10, desc: 'Arremessa uma bola de lama dura.' },
  areia: { nome: 'Tempestade de Areia', tipo: 'Terra', cat: 'status', poder: 0, prec: 100, pp: 15, ef: st('foe', 'spa', -1), desc: 'Areia nos olhos baixa o Ataque Especial do alvo.' },

  // ---------------- LUTADOR ----------------
  carate: { nome: 'Golpe de Caratê', tipo: 'Lutador', cat: 'fis', poder: 50, prec: 100, pp: 25, ef: { k: 'crit' }, desc: 'Golpe preciso que acerta críticos com facilidade.' },
  chute: { nome: 'Chute Baixo', tipo: 'Lutador', cat: 'fis', poder: 60, prec: 100, pp: 20, desc: 'Um chute rasteiro e forte.' },
  supersoco: { nome: 'Supersoco', tipo: 'Lutador', cat: 'fis', poder: 90, prec: 95, pp: 15, desc: 'Um soco concentrado com toda a força.' },
  focototal: { nome: 'Foco Total', tipo: 'Lutador', cat: 'status', poder: 0, prec: 0, pp: 20, ef: { k: 'stat2', alvo: 'self', stats: ['atk', 'def'], n: 1 }, desc: 'Concentra-se e aumenta Ataque e Defesa.' },
  impacto: { nome: 'Impacto Final', tipo: 'Lutador', cat: 'fis', poder: 120, prec: 100, pp: 5, ef: { k: 'recoil' }, desc: 'Ataque com toda a força. Também machuca o usuário.' },

  // ---------------- FANTASMA ----------------
  lambida: { nome: 'Lambida', tipo: 'Fantasma', cat: 'fis', poder: 30, prec: 100, pp: 30, ef: ss('par', 30), desc: 'Lambe com uma língua gelada. Pode paralisar.' },
  raionoturno: { nome: 'Raio Noturno', tipo: 'Fantasma', cat: 'esp', poder: 1, prec: 100, pp: 15, ef: { k: 'fixo' }, desc: 'Causa dano igual ao nível do usuário.' },
  bolasombria: { nome: 'Bola Sombria', tipo: 'Fantasma', cat: 'esp', poder: 80, prec: 100, pp: 15, ef: st('foe', 'spd', -1, 20), desc: 'Uma esfera de sombras. Pode baixar a Defesa Especial.' },
  pesadelo: { nome: 'Hipnose Sombria', tipo: 'Fantasma', cat: 'status', poder: 0, prec: 65, pp: 15, ef: ss('slp'), desc: 'Olhos hipnóticos fazem o alvo dormir.' },
  garrasombra: { nome: 'Garra Sombria', tipo: 'Fantasma', cat: 'fis', poder: 70, prec: 100, pp: 15, ef: { k: 'crit' }, desc: 'Garras de sombra. Acerta críticos com facilidade.' },

  // ---------------- PSÍQUICO ----------------
  confusao: { nome: 'Confusão', tipo: 'Psíquico', cat: 'esp', poder: 50, prec: 100, pp: 25, desc: 'Uma onda telecinética fraca.' },
  psiquico: { nome: 'Psíquico', tipo: 'Psíquico', cat: 'esp', poder: 90, prec: 100, pp: 10, ef: st('foe', 'spd', -1, 10), desc: 'Uma forte onda mental. Pode baixar a Defesa Especial.' },
  meditar: { nome: 'Meditar', tipo: 'Psíquico', cat: 'status', poder: 0, prec: 0, pp: 20, ef: { k: 'stat2', alvo: 'self', stats: ['spa', 'spd'], n: 1 }, desc: 'Medita e aumenta Ataque e Defesa Especiais.' },
  hipnose: { nome: 'Hipnose', tipo: 'Psíquico', cat: 'status', poder: 0, prec: 60, pp: 20, ef: ss('slp'), desc: 'Movimentos hipnóticos que fazem o alvo dormir.' },
  psicorte: { nome: 'Psicorte', tipo: 'Psíquico', cat: 'fis', poder: 70, prec: 100, pp: 20, ef: { k: 'crit' }, desc: 'Lâminas psíquicas. Acerta críticos com facilidade.' },
  futuro: { nome: 'Visão do Futuro', tipo: 'Psíquico', cat: 'esp', poder: 120, prec: 90, pp: 5, desc: 'Libera toda a energia mental acumulada.' },

  // ---------------- VENENOSO ----------------
  acido: { nome: 'Ácido', tipo: 'Venenoso', cat: 'esp', poder: 40, prec: 100, pp: 30, ef: st('foe', 'spd', -1, 10), desc: 'Jato de ácido. Pode baixar a Defesa Especial.' },
  ferroadavenenosa: { nome: 'Ferroada Tóxica', tipo: 'Venenoso', cat: 'fis', poder: 15, prec: 100, pp: 35, ef: ss('psn', 30), desc: 'Picada venenosa que pode envenenar.' },
  bombalodo: { nome: 'Bomba de Lodo', tipo: 'Venenoso', cat: 'esp', poder: 90, prec: 100, pp: 10, ef: ss('psn', 30), desc: 'Lodo tóxico arremessado. Pode envenenar.' },
  gastoxico: { nome: 'Gás Tóxico', tipo: 'Venenoso', cat: 'status', poder: 0, prec: 90, pp: 20, ef: ss('psn'), desc: 'Nuvem venenosa que envenena o alvo.' },
  presaveneno: { nome: 'Presa Venenosa', tipo: 'Venenoso', cat: 'fis', poder: 70, prec: 100, pp: 20, ef: ss('psn', 30), desc: 'Morde com presas venenosas. Pode envenenar.' },
} satisfies Record<string, Move>;

export type MoveId = keyof typeof MOVES;
export const move = (id: MoveId): Move => MOVES[id] as Move;
