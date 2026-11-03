import type { Tipo } from './types';

export type Stat = 'atk' | 'def' | 'spa' | 'spd' | 'spe';
export type Status = 'brn' | 'psn' | 'par' | 'slp';

export type Efeito =
  | { k: 'stat'; alvo: 'foe' | 'self'; stat: Stat; n: number; chance?: number }
  | { k: 'status'; s: Status; chance?: number }
  | { k: 'flinch'; chance: number }
  | { k: 'drain' }
  | { k: 'recoil' }
  | { k: 'heal' }
  | { k: 'crit' };

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

export const MOVES = {
  investida: { nome: 'Investida', tipo: 'Normal', cat: 'fis', poder: 40, prec: 100, pp: 35, desc: 'Avança contra o alvo com o corpo todo.' },
  arranhao: { nome: 'Arranhão', tipo: 'Normal', cat: 'fis', poder: 40, prec: 100, pp: 35, desc: 'Arranha o alvo com garras afiadas.' },
  rosnado: { nome: 'Rosnado', tipo: 'Normal', cat: 'status', poder: 0, prec: 100, pp: 40, ef: { k: 'stat', alvo: 'foe', stat: 'atk', n: -1 }, desc: 'Rosna de forma fofa e baixa o Ataque do alvo.' },
  olharferoz: { nome: 'Olhar Feroz', tipo: 'Normal', cat: 'status', poder: 0, prec: 100, pp: 30, ef: { k: 'stat', alvo: 'foe', stat: 'def', n: -1 }, desc: 'Encara o alvo e baixa a Defesa dele.' },
  ataquerapido: { nome: 'Ataque Rápido', tipo: 'Normal', cat: 'fis', poder: 40, prec: 100, pp: 30, prio: 1, desc: 'Golpe veloz que sempre ataca primeiro.' },
  mordida: { nome: 'Mordida', tipo: 'Normal', cat: 'fis', poder: 60, prec: 100, pp: 25, ef: { k: 'flinch', chance: 30 }, desc: 'Morde com força. Pode fazer o alvo hesitar.' },
  endurecer: { nome: 'Endurecer', tipo: 'Normal', cat: 'status', poder: 0, prec: 0, pp: 30, ef: { k: 'stat', alvo: 'self', stat: 'def', n: 1 }, desc: 'Contrai os músculos e aumenta a Defesa.' },
  canção: { nome: 'Canção Suave', tipo: 'Normal', cat: 'status', poder: 0, prec: 55, pp: 15, ef: { k: 'status', s: 'slp' }, desc: 'Uma melodia calma que faz o alvo dormir.' },
  pancadao: { nome: 'Pancadão', tipo: 'Normal', cat: 'fis', poder: 85, prec: 100, pp: 15, ef: { k: 'status', s: 'par', chance: 30 }, desc: 'Joga o corpo todo no alvo. Pode paralisar.' },
  investidabruta: { nome: 'Investida Bruta', tipo: 'Normal', cat: 'fis', poder: 90, prec: 85, pp: 20, ef: { k: 'recoil' }, desc: 'Ataque forte que também machuca o usuário.' },
  agilidade: { nome: 'Agilidade', tipo: 'Normal', cat: 'status', poder: 0, prec: 0, pp: 30, ef: { k: 'stat', alvo: 'self', stat: 'spe', n: 2 }, desc: 'Relaxa o corpo e aumenta muito a Velocidade.' },
  descanso: { nome: 'Recompor', tipo: 'Normal', cat: 'status', poder: 0, prec: 0, pp: 10, ef: { k: 'heal' }, desc: 'Recupera metade dos PV máximos.' },

  brasa: { nome: 'Brasa', tipo: 'Fogo', cat: 'esp', poder: 40, prec: 100, pp: 25, ef: { k: 'status', s: 'brn', chance: 10 }, desc: 'Pequenas chamas. Pode queimar o alvo.' },
  rodafogo: { nome: 'Roda de Fogo', tipo: 'Fogo', cat: 'fis', poder: 60, prec: 100, pp: 25, ef: { k: 'status', s: 'brn', chance: 10 }, desc: 'Rola envolto em fogo. Pode queimar.' },
  labareda: { nome: 'Labareda', tipo: 'Fogo', cat: 'esp', poder: 90, prec: 100, pp: 15, ef: { k: 'status', s: 'brn', chance: 10 }, desc: 'Um jato de chamas intenso. Pode queimar.' },
  fumaca: { nome: 'Fumaceira', tipo: 'Fogo', cat: 'status', poder: 0, prec: 100, pp: 20, ef: { k: 'stat', alvo: 'foe', stat: 'atk', n: -1 }, desc: 'Solta fumaça quente que baixa o Ataque do alvo.' },

  jatodagua: { nome: "Jato d'Água", tipo: 'Água', cat: 'esp', poder: 40, prec: 100, pp: 25, desc: 'Esguicha água com força no alvo.' },
  bolhas: { nome: 'Bolhas', tipo: 'Água', cat: 'esp', poder: 40, prec: 100, pp: 30, ef: { k: 'stat', alvo: 'foe', stat: 'spe', n: -1, chance: 10 }, desc: 'Bolhas que podem baixar a Velocidade.' },
  pulsoagua: { nome: 'Pulso Aquático', tipo: 'Água', cat: 'esp', poder: 60, prec: 100, pp: 20, desc: 'Onda de choque de água pura.' },
  maremoto: { nome: 'Maremoto', tipo: 'Água', cat: 'esp', poder: 90, prec: 100, pp: 15, desc: 'Uma onda enorme varre o campo.' },
  casco: { nome: 'Casco', tipo: 'Água', cat: 'status', poder: 0, prec: 0, pp: 40, ef: { k: 'stat', alvo: 'self', stat: 'def', n: 1 }, desc: 'Se protege e aumenta a Defesa.' },

  chicote: { nome: 'Chicote de Cipó', tipo: 'Planta', cat: 'fis', poder: 45, prec: 100, pp: 25, desc: 'Golpeia com cipós finos.' },
  absorver: { nome: 'Absorver', tipo: 'Planta', cat: 'esp', poder: 25, prec: 100, pp: 25, ef: { k: 'drain' }, desc: 'Rouba energia e recupera PV.' },
  folhanavalha: { nome: 'Folha Navalha', tipo: 'Planta', cat: 'fis', poder: 55, prec: 95, pp: 25, ef: { k: 'crit' }, desc: 'Folhas afiadas. Acerta pontos críticos com facilidade.' },
  posono: { nome: 'Pó do Sono', tipo: 'Planta', cat: 'status', poder: 0, prec: 75, pp: 15, ef: { k: 'status', s: 'slp' }, desc: 'Espalha um pó que faz o alvo dormir.' },
  megadreno: { nome: 'Mega Dreno', tipo: 'Planta', cat: 'esp', poder: 50, prec: 100, pp: 15, ef: { k: 'drain' }, desc: 'Drena muita energia e recupera PV.' },
  rajadafolhas: { nome: 'Rajada de Folhas', tipo: 'Planta', cat: 'esp', poder: 90, prec: 100, pp: 10, desc: 'Uma tempestade de folhas cortantes.' },
  povenenoso: { nome: 'Pó Venenoso', tipo: 'Planta', cat: 'status', poder: 0, prec: 75, pp: 35, ef: { k: 'status', s: 'psn' }, desc: 'Pó tóxico que envenena o alvo.' },

  choque: { nome: 'Choquinho', tipo: 'Elétrico', cat: 'esp', poder: 40, prec: 100, pp: 30, ef: { k: 'status', s: 'par', chance: 10 }, desc: 'Descarga elétrica. Pode paralisar.' },
  ondatrovao: { nome: 'Onda Trovão', tipo: 'Elétrico', cat: 'status', poder: 0, prec: 90, pp: 20, ef: { k: 'status', s: 'par' }, desc: 'Uma onda elétrica fraca que paralisa.' },
  faisca: { nome: 'Faísca', tipo: 'Elétrico', cat: 'fis', poder: 65, prec: 100, pp: 20, ef: { k: 'status', s: 'par', chance: 30 }, desc: 'Investida eletrificada. Pode paralisar.' },
  relampago: { nome: 'Relâmpago', tipo: 'Elétrico', cat: 'esp', poder: 90, prec: 100, pp: 15, ef: { k: 'status', s: 'par', chance: 10 }, desc: 'Um raio poderoso. Pode paralisar.' },

  lancapedras: { nome: 'Lança-Pedras', tipo: 'Pedra', cat: 'fis', poder: 50, prec: 90, pp: 15, desc: 'Arremessa pedras pequenas.' },
  desabamento: { nome: 'Desabamento', tipo: 'Pedra', cat: 'fis', poder: 75, prec: 90, pp: 10, ef: { k: 'flinch', chance: 30 }, desc: 'Derruba rochas. Pode fazer o alvo hesitar.' },
  muralha: { nome: 'Muralha', tipo: 'Pedra', cat: 'status', poder: 0, prec: 0, pp: 20, ef: { k: 'stat', alvo: 'self', stat: 'def', n: 2 }, desc: 'Endurece como pedra e aumenta muito a Defesa.' },
  tumbapedra: { nome: 'Tumba de Pedra', tipo: 'Pedra', cat: 'fis', poder: 60, prec: 95, pp: 15, ef: { k: 'stat', alvo: 'foe', stat: 'spe', n: -1 }, desc: 'Cerca o alvo com pedras e baixa a Velocidade.' },

  teia: { nome: 'Teia', tipo: 'Inseto', cat: 'status', poder: 0, prec: 95, pp: 40, ef: { k: 'stat', alvo: 'foe', stat: 'spe', n: -1 }, desc: 'Prende o alvo com seda e baixa a Velocidade.' },
  picada: { nome: 'Picada', tipo: 'Inseto', cat: 'fis', poder: 60, prec: 100, pp: 20, desc: 'Morde o alvo com mandíbulas fortes.' },
  ferrao: { nome: 'Ferrão', tipo: 'Inseto', cat: 'fis', poder: 25, prec: 100, pp: 35, ef: { k: 'status', s: 'psn', chance: 30 }, desc: 'Ferroada que pode envenenar.' },
  zumbido: { nome: 'Zumbido', tipo: 'Inseto', cat: 'esp', poder: 90, prec: 100, pp: 10, desc: 'Vibra as asas criando uma onda sonora.' },

  rajada: { nome: 'Rajada', tipo: 'Voador', cat: 'esp', poder: 40, prec: 100, pp: 35, desc: 'Bate as asas e cria um vendaval.' },
  bicada: { nome: 'Bicada', tipo: 'Voador', cat: 'fis', poder: 35, prec: 100, pp: 35, desc: 'Bica o alvo com o bico pontudo.' },
  asaataque: { nome: 'Golpe de Asa', tipo: 'Voador', cat: 'fis', poder: 60, prec: 100, pp: 35, desc: 'Golpeia com as asas abertas.' },
  aereo: { nome: 'Corte Aéreo', tipo: 'Voador', cat: 'fis', poder: 60, prec: 0, pp: 20, desc: 'Ataque veloz que nunca erra.' },
} satisfies Record<string, Move>;

export type MoveId = keyof typeof MOVES;
export const move = (id: MoveId): Move => MOVES[id] as Move;
