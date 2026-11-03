import type { Tipo } from './types';
import type { MoveId } from './moves';

export type Corpo = 'bipede' | 'quadrupede' | 'redondo' | 'ave' | 'peixe' | 'larva' | 'borboleta' | 'pedra';
export type Detalhe = 'chamas' | 'folhas' | 'barbatana' | 'orelhas' | 'orelhasLongas' | 'chifre' | 'antenas' | 'raio' | 'crista' | 'espinhos' | 'cauda' | 'caudaFogo' | 'caudaFolha' | 'caudaRaio' | 'concha';

export type Aparencia = {
  corpo: Corpo;
  c1: string; // cor principal
  c2: string; // barriga / detalhe claro
  c3: string; // acento
  tam: number; // 0.6 .. 1
  detalhes: Detalhe[];
  olho?: 'normal' | 'bravo' | 'fofo';
};

export type Species = {
  id: number;
  nome: string;
  tipos: Tipo[];
  base: { hp: number; atk: number; def: number; spa: number; spd: number; spe: number };
  captura: number;
  xpBase: number;
  golpes: [number, MoveId][];
  evolui?: { nivel: number; para: string };
  cat: string;
  texto: string;
  look: Aparencia;
};

export const SPECIES: Record<string, Species> = {
  brasilho: {
    id: 1, nome: 'Brasilho', tipos: ['Fogo'], base: { hp: 39, atk: 52, def: 43, spa: 60, spd: 50, spe: 65 }, captura: 45, xpBase: 62,
    golpes: [[1, 'arranhao'], [1, 'rosnado'], [7, 'brasa'], [9, 'fumaca'], [13, 'rodafogo'], [17, 'mordida'], [22, 'labareda']],
    evolui: { nivel: 16, para: 'fornalhao' }, cat: 'Fera Fagulha',
    texto: 'A chama em sua cabeça fica mais forte quando ele está feliz. Adora dormir perto de fogueiras.',
    look: { corpo: 'quadrupede', c1: '#e86838', c2: '#f8e0b8', c3: '#f8d838', tam: 0.72, detalhes: ['orelhas', 'chamas', 'cauda'], olho: 'fofo' },
  },
  fornalhao: {
    id: 2, nome: 'Fornalhão', tipos: ['Fogo'], base: { hp: 68, atk: 74, def: 68, spa: 90, spd: 70, spe: 85 }, captura: 45, xpBase: 150,
    golpes: [[1, 'arranhao'], [1, 'brasa'], [13, 'rodafogo'], [17, 'mordida'], [22, 'labareda'], [28, 'investidabruta']],
    cat: 'Fera Fornalha',
    texto: 'Seu corpo fica tão quente que a grama seca por onde ele passa. Protege seu treinador com ferocidade.',
    look: { corpo: 'quadrupede', c1: '#c84028', c2: '#f8c080', c3: '#f8e048', tam: 1, detalhes: ['orelhas', 'chamas', 'espinhos', 'caudaFogo'], olho: 'bravo' },
  },
  pingolim: {
    id: 3, nome: 'Pingolim', tipos: ['Água'], base: { hp: 44, atk: 48, def: 65, spa: 50, spd: 64, spe: 43 }, captura: 45, xpBase: 63,
    golpes: [[1, 'investida'], [1, 'rosnado'], [7, 'bolhas'], [9, 'casco'], [13, 'jatodagua'], [18, 'pulsoagua'], [24, 'maremoto']],
    evolui: { nivel: 16, para: 'marolhao' }, cat: 'Fera Gota',
    texto: 'Vive em lagos limpos. Quando assustado, esguicha água pela boca e foge rolando.',
    look: { corpo: 'redondo', c1: '#58a8e8', c2: '#d8f0f8', c3: '#3878c8', tam: 0.72, detalhes: ['barbatana'], olho: 'fofo' },
  },
  marolhao: {
    id: 4, nome: 'Marolhão', tipos: ['Água'], base: { hp: 72, atk: 70, def: 90, spa: 75, spd: 85, spe: 60 }, captura: 45, xpBase: 152,
    golpes: [[1, 'investida'], [1, 'bolhas'], [13, 'jatodagua'], [18, 'pulsoagua'], [24, 'maremoto'], [30, 'investidabruta']],
    cat: 'Fera Maré',
    texto: 'Consegue criar pequenas ondas batendo a cauda. Pescadores dizem que ele avisa quando vem tempestade.',
    look: { corpo: 'quadrupede', c1: '#3888d8', c2: '#c8e8f8', c3: '#f8f8f8', tam: 1, detalhes: ['barbatana', 'crista', 'cauda'], olho: 'bravo' },
  },
  folhito: {
    id: 5, nome: 'Folhito', tipos: ['Planta'], base: { hp: 45, atk: 49, def: 49, spa: 65, spd: 65, spe: 45 }, captura: 45, xpBase: 64,
    golpes: [[1, 'investida'], [1, 'rosnado'], [7, 'absorver'], [9, 'chicote'], [13, 'posono'], [17, 'folhanavalha'], [22, 'megadreno'], [27, 'rajadafolhas']],
    evolui: { nivel: 16, para: 'bosquerel' }, cat: 'Fera Broto',
    texto: 'A folha em sua cabeça se vira sozinha na direção do sol. Gosta de tomar chuva.',
    look: { corpo: 'quadrupede', c1: '#78c858', c2: '#e0f0b8', c3: '#3a9a48', tam: 0.7, detalhes: ['folhas'], olho: 'fofo' },
  },
  bosquerel: {
    id: 6, nome: 'Bosquerel', tipos: ['Planta'], base: { hp: 70, atk: 75, def: 75, spa: 90, spd: 85, spe: 70 }, captura: 45, xpBase: 151,
    golpes: [[1, 'investida'], [1, 'absorver'], [9, 'chicote'], [13, 'posono'], [17, 'folhanavalha'], [22, 'megadreno'], [27, 'rajadafolhas']],
    cat: 'Fera Bosque',
    texto: 'Pequenas plantas crescem nas costas dele. Dizem que florestas inteiras nasceram por onde ele dormiu.',
    look: { corpo: 'quadrupede', c1: '#4a9a48', c2: '#c8e098', c3: '#f070a0', tam: 1, detalhes: ['folhas', 'espinhos', 'caudaFolha'], olho: 'normal' },
  },
  pulim: {
    id: 7, nome: 'Pulim', tipos: ['Normal'], base: { hp: 40, atk: 50, def: 40, spa: 30, spd: 40, spe: 65 }, captura: 255, xpBase: 51,
    golpes: [[1, 'investida'], [1, 'rosnado'], [5, 'ataquerapido'], [9, 'olharferoz'], [13, 'mordida'], [17, 'agilidade'], [21, 'pancadao']],
    evolui: { nivel: 15, para: 'saltarao' }, cat: 'Fera Coelho',
    texto: 'Muito comum em campos abertos. Dá pulos enormes com as patas traseiras para fugir.',
    look: { corpo: 'redondo', c1: '#c8a878', c2: '#f8f0e0', c3: '#f0a0b0', tam: 0.6, detalhes: ['orelhasLongas'], olho: 'fofo' },
  },
  saltarao: {
    id: 8, nome: 'Saltarão', tipos: ['Normal'], base: { hp: 65, atk: 80, def: 60, spa: 45, spd: 60, spe: 100 }, captura: 120, xpBase: 128,
    golpes: [[1, 'investida'], [1, 'ataquerapido'], [9, 'olharferoz'], [13, 'mordida'], [17, 'agilidade'], [21, 'pancadao'], [27, 'investidabruta']],
    cat: 'Fera Salto',
    texto: 'Um chute de suas pernas traseiras é capaz de quebrar troncos. Corre mais rápido que um carro.',
    look: { corpo: 'bipede', c1: '#a88858', c2: '#f0e0c8', c3: '#f0a0b0', tam: 0.95, detalhes: ['orelhasLongas', 'cauda'], olho: 'bravo' },
  },
  piui: {
    id: 9, nome: 'Piuí', tipos: ['Normal', 'Voador'], base: { hp: 40, atk: 45, def: 40, spa: 35, spd: 35, spe: 56 }, captura: 255, xpBase: 50,
    golpes: [[1, 'bicada'], [1, 'rosnado'], [5, 'rajada'], [9, 'ataquerapido'], [13, 'asaataque'], [19, 'agilidade'], [24, 'aereo']],
    evolui: { nivel: 15, para: 'ventor' }, cat: 'Fera Passarinho',
    texto: 'Canta sem parar ao amanhecer. Bandos de Piuí costumam seguir viajantes pela estrada.',
    look: { corpo: 'ave', c1: '#d8a058', c2: '#f8f0d8', c3: '#f8c038', tam: 0.6, detalhes: ['crista'], olho: 'fofo' },
  },
  ventor: {
    id: 10, nome: 'Ventor', tipos: ['Normal', 'Voador'], base: { hp: 63, atk: 65, def: 55, spa: 50, spd: 50, spe: 81 }, captura: 120, xpBase: 122,
    golpes: [[1, 'bicada'], [1, 'rajada'], [9, 'ataquerapido'], [13, 'asaataque'], [19, 'agilidade'], [24, 'aereo']],
    cat: 'Fera Vento',
    texto: 'Plana por horas sem bater as asas. Avista presas a quilômetros de distância.',
    look: { corpo: 'ave', c1: '#a86838', c2: '#f0e0c0', c3: '#d84838', tam: 0.95, detalhes: ['crista', 'cauda'], olho: 'bravo' },
  },
  larvito: {
    id: 11, nome: 'Larvito', tipos: ['Inseto'], base: { hp: 45, atk: 35, def: 45, spa: 25, spd: 25, spe: 40 }, captura: 255, xpBase: 45,
    golpes: [[1, 'investida'], [1, 'teia'], [6, 'ferrao']],
    evolui: { nivel: 10, para: 'mariluz' }, cat: 'Fera Larva',
    texto: 'Come o próprio peso em folhas todo dia. Solta seda pegajosa quando se sente ameaçado.',
    look: { corpo: 'larva', c1: '#98c838', c2: '#e8f0a0', c3: '#e85848', tam: 0.65, detalhes: ['antenas'], olho: 'fofo' },
  },
  mariluz: {
    id: 12, nome: 'Mariluz', tipos: ['Inseto', 'Voador'], base: { hp: 60, atk: 45, def: 50, spa: 80, spd: 80, spe: 70 }, captura: 45, xpBase: 160,
    golpes: [[1, 'rajada'], [1, 'teia'], [10, 'posono'], [12, 'povenenoso'], [16, 'picada'], [22, 'zumbido']],
    cat: 'Fera Mariposa',
    texto: 'Suas asas brilham fracamente no escuro. Atrai outras feras com o pó cintilante que solta.',
    look: { corpo: 'borboleta', c1: '#8868c8', c2: '#f8e8a0', c3: '#58d8e8', tam: 0.9, detalhes: ['antenas'], olho: 'normal' },
  },
  zapito: {
    id: 13, nome: 'Zapito', tipos: ['Elétrico'], base: { hp: 40, atk: 55, def: 35, spa: 70, spd: 50, spe: 95 }, captura: 120, xpBase: 110,
    golpes: [[1, 'choque'], [1, 'rosnado'], [6, 'ataquerapido'], [10, 'ondatrovao'], [15, 'faisca'], [21, 'agilidade'], [26, 'relampago']],
    cat: 'Fera Faísca',
    texto: 'Suas antenas soltam faíscas quando fica animado. Em dias de tempestade flutua alguns centímetros do chão.',
    look: { corpo: 'redondo', c1: '#58c8e8', c2: '#f0fcff', c3: '#f8e048', tam: 0.62, detalhes: ['antenas', 'cauda'], olho: 'fofo' },
  },
  pedrico: {
    id: 14, nome: 'Pedrico', tipos: ['Pedra'], base: { hp: 45, atk: 75, def: 95, spa: 30, spd: 30, spe: 20 }, captura: 190, xpBase: 70,
    golpes: [[1, 'investida'], [1, 'endurecer'], [6, 'lancapedras'], [11, 'muralha'], [16, 'tumbapedra'], [21, 'desabamento'], [26, 'investidabruta']],
    evolui: { nivel: 20, para: 'rochedao' }, cat: 'Fera Seixo',
    texto: 'Fica parado por dias e se confunde com as pedras do caminho. Muita gente já tropeçou em um.',
    look: { corpo: 'pedra', c1: '#a09888', c2: '#c8c0b0', c3: '#787068', tam: 0.65, detalhes: [], olho: 'bravo' },
  },
  rochedao: {
    id: 15, nome: 'Rochedão', tipos: ['Pedra'], base: { hp: 70, atk: 100, def: 120, spa: 45, spd: 45, spe: 35 }, captura: 75, xpBase: 150,
    golpes: [[1, 'investida'], [1, 'lancapedras'], [11, 'muralha'], [16, 'tumbapedra'], [21, 'desabamento'], [26, 'investidabruta']],
    cat: 'Fera Rocha',
    texto: 'Desce as montanhas rolando quando quer viajar. Seu corpo é duro como granito.',
    look: { corpo: 'pedra', c1: '#888078', c2: '#b0a898', c3: '#e0a040', tam: 1, detalhes: ['espinhos'], olho: 'bravo' },
  },
  bolhudo: {
    id: 16, nome: 'Bolhudo', tipos: ['Água'], base: { hp: 55, atk: 45, def: 55, spa: 60, spd: 55, spe: 60 }, captura: 190, xpBase: 80,
    golpes: [[1, 'bolhas'], [1, 'investida'], [8, 'jatodagua'], [14, 'casco'], [20, 'pulsoagua'], [28, 'maremoto']],
    cat: 'Fera Peixe',
    texto: 'Infla o corpo cheio de água para parecer maior. Seu canto parece bolhas estourando.',
    look: { corpo: 'peixe', c1: '#f08878', c2: '#f8e0d0', c3: '#f8f8f8', tam: 0.8, detalhes: ['barbatana'], olho: 'fofo' },
  },
};

export const SPECIES_LIST = Object.entries(SPECIES).sort((a, b) => a[1].id - b[1].id);
