import type { Tipo } from './types';
import type { MoveId } from './moves';

export type Corpo = 'bipede' | 'quadrupede' | 'redondo' | 'ave' | 'peixe' | 'larva' | 'borboleta' | 'pedra' | 'serpente' | 'fantasma';
export type Detalhe =
  | 'chamas' | 'folhas' | 'barbatana' | 'orelhas' | 'orelhasLongas' | 'chifre' | 'antenas' | 'crista' | 'espinhos'
  | 'cauda' | 'caudaFogo' | 'caudaFolha' | 'caudaRaio' | 'chapeu' | 'punhos' | 'asasMorcego' | 'presas' | 'joia' | 'coroa' | 'aura';

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
  lendario?: boolean;
};

type B = Species['base'];
const b = (hp: number, atk: number, def: number, spa: number, spd: number, spe: number): B => ({ hp, atk, def, spa, spd, spe });

export const SPECIES: Record<string, Species> = {
  // ===== iniciais =====
  brasilho: {
    id: 1, nome: 'Fagulin', tipos: ['Fogo'], base: b(39, 52, 43, 60, 50, 65), captura: 45, xpBase: 62,
    golpes: [[1, 'arranhao'], [1, 'rosnado'], [7, 'brasa'], [10, 'fumaca'], [13, 'rodafogo'], [17, 'mordida'], [21, 'presaflama'], [28, 'labareda'], [38, 'erupcao']],
    evolui: { nivel: 16, para: 'fornalhao' }, cat: 'Fera Fagulha',
    texto: 'A chama em sua cabeça fica mais forte quando ele está feliz. Adora dormir perto de fogueiras.',
    look: { corpo: 'quadrupede', c1: '#e86838', c2: '#f8e0b8', c3: '#f8d838', tam: 0.72, detalhes: ['orelhas', 'chamas', 'cauda'], olho: 'fofo' },
  },
  fornalhao: {
    id: 2, nome: 'Lobrasa', tipos: ['Fogo'], base: b(58, 72, 62, 82, 66, 82), captura: 45, xpBase: 142,
    golpes: [[1, 'arranhao'], [1, 'brasa'], [13, 'rodafogo'], [17, 'mordida'], [21, 'presaflama'], [28, 'labareda'], [33, 'dancaespada'], [38, 'erupcao']],
    evolui: { nivel: 34, para: 'labaredor' }, cat: 'Fera Fornalha',
    texto: 'Seu corpo fica tão quente que a grama seca por onde ele passa. Protege seu treinador com ferocidade.',
    look: { corpo: 'quadrupede', c1: '#c84028', c2: '#f8c080', c3: '#f8e048', tam: 0.9, detalhes: ['orelhas', 'chamas', 'espinhos', 'caudaFogo'], olho: 'bravo' },
  },
  labaredor: {
    id: 3, nome: 'Ignarco', tipos: ['Fogo', 'Lutador'], base: b(78, 104, 75, 100, 75, 98), captura: 45, xpBase: 240,
    golpes: [[1, 'presaflama'], [1, 'chute'], [28, 'labareda'], [34, 'supersoco'], [40, 'erupcao'], [46, 'impacto']],
    cat: 'Fera Vulcão',
    texto: 'Fica de pé quando luta a sério. Seus punhos queimam a mais de mil graus.',
    look: { corpo: 'bipede', c1: '#b83020', c2: '#f8c080', c3: '#f8e048', tam: 1, detalhes: ['chamas', 'punhos', 'espinhos'], olho: 'bravo' },
  },
  pingolim: {
    id: 4, nome: 'Gotim', tipos: ['Água'], base: b(44, 48, 65, 50, 64, 43), captura: 45, xpBase: 63,
    golpes: [[1, 'investida'], [1, 'rosnado'], [7, 'bolhas'], [10, 'casco'], [13, 'jatodagua'], [18, 'mordida'], [22, 'pulsoagua'], [29, 'maremoto'], [38, 'hidrocanhao']],
    evolui: { nivel: 16, para: 'marolhao' }, cat: 'Fera Gota',
    texto: 'Vive em lagos limpos. Quando assustado, esguicha água pela boca e foge rolando.',
    look: { corpo: 'redondo', c1: '#58a8e8', c2: '#d8f0f8', c3: '#3878c8', tam: 0.72, detalhes: ['barbatana'], olho: 'fofo' },
  },
  marolhao: {
    id: 5, nome: 'Ondarel', tipos: ['Água'], base: b(64, 66, 82, 68, 78, 58), captura: 45, xpBase: 142,
    golpes: [[1, 'investida'], [1, 'bolhas'], [13, 'jatodagua'], [18, 'mordida'], [22, 'pulsoagua'], [29, 'maremoto'], [33, 'chuvaacida'], [38, 'hidrocanhao']],
    evolui: { nivel: 34, para: 'abissal' }, cat: 'Fera Maré',
    texto: 'Consegue criar pequenas ondas batendo a cauda. Pescadores dizem que ele avisa quando vem tempestade.',
    look: { corpo: 'quadrupede', c1: '#3888d8', c2: '#c8e8f8', c3: '#f8f8f8', tam: 0.9, detalhes: ['barbatana', 'crista', 'cauda'], olho: 'bravo' },
  },
  abissal: {
    id: 6, nome: 'Abismor', tipos: ['Água', 'Terra'], base: b(95, 100, 100, 85, 90, 60), captura: 45, xpBase: 240,
    golpes: [[1, 'cachoeira'], [1, 'lama'], [29, 'maremoto'], [34, 'terremoto'], [40, 'hidrocanhao']],
    cat: 'Fera Abismo',
    texto: 'Vive no fundo de lagos escuros. Um golpe de sua cauda faz a terra tremer.',
    look: { corpo: 'quadrupede', c1: '#285898', c2: '#a8d0e8', c3: '#e8c858', tam: 1, detalhes: ['barbatana', 'espinhos', 'cauda'], olho: 'bravo' },
  },
  folhito: {
    id: 7, nome: 'Brotin', tipos: ['Planta'], base: b(45, 49, 49, 65, 65, 45), captura: 45, xpBase: 64,
    golpes: [[1, 'investida'], [1, 'rosnado'], [7, 'absorver'], [10, 'chicote'], [13, 'posono'], [17, 'folhanavalha'], [22, 'megadreno'], [27, 'sintese'], [31, 'rajadafolhas'], [40, 'raiosolar']],
    evolui: { nivel: 16, para: 'bosquerel' }, cat: 'Fera Broto',
    texto: 'A folha em sua cabeça se vira sozinha na direção do sol. Gosta de tomar chuva.',
    look: { corpo: 'quadrupede', c1: '#78c858', c2: '#e0f0b8', c3: '#3a9a48', tam: 0.7, detalhes: ['folhas'], olho: 'fofo' },
  },
  bosquerel: {
    id: 8, nome: 'Ramagal', tipos: ['Planta'], base: b(62, 66, 70, 82, 80, 62), captura: 45, xpBase: 142,
    golpes: [[1, 'investida'], [1, 'absorver'], [10, 'chicote'], [13, 'posono'], [17, 'folhanavalha'], [22, 'megadreno'], [27, 'sintese'], [31, 'rajadafolhas'], [40, 'raiosolar']],
    evolui: { nivel: 34, para: 'silvarca' }, cat: 'Fera Bosque',
    texto: 'Pequenas plantas crescem nas costas dele. Dizem que florestas inteiras nasceram por onde ele dormiu.',
    look: { corpo: 'quadrupede', c1: '#4a9a48', c2: '#c8e098', c3: '#f070a0', tam: 0.9, detalhes: ['folhas', 'espinhos', 'caudaFolha'], olho: 'normal' },
  },
  silvarca: {
    id: 9, nome: 'Silvarca', tipos: ['Planta', 'Venenoso'], base: b(82, 85, 90, 108, 100, 75), captura: 45, xpBase: 240,
    golpes: [[1, 'folhanavalha'], [1, 'acido'], [31, 'rajadafolhas'], [34, 'bombalodo'], [40, 'raiosolar']],
    cat: 'Fera Floresta',
    texto: 'Uma floresta ambulante. As flores em suas costas soltam um perfume que paralisa inimigos.',
    look: { corpo: 'quadrupede', c1: '#2f7a3a', c2: '#b8d888', c3: '#d858a0', tam: 1, detalhes: ['folhas', 'espinhos', 'caudaFolha', 'coroa'], olho: 'bravo' },
  },

  // ===== comuns do começo =====
  pulim: {
    id: 10, nome: 'Pulim', tipos: ['Normal'], base: b(40, 50, 40, 30, 40, 65), captura: 255, xpBase: 51,
    golpes: [[1, 'investida'], [1, 'rosnado'], [5, 'ataquerapido'], [9, 'olharferoz'], [13, 'mordida'], [17, 'agilidade'], [21, 'pancadao'], [28, 'investidabruta']],
    evolui: { nivel: 15, para: 'saltarao' }, cat: 'Fera Coelho',
    texto: 'Muito comum em campos abertos. Dá pulos enormes com as patas traseiras para fugir.',
    look: { corpo: 'redondo', c1: '#c8a878', c2: '#f8f0e0', c3: '#f0a0b0', tam: 0.6, detalhes: ['orelhasLongas'], olho: 'fofo' },
  },
  saltarao: {
    id: 11, nome: 'Saltarão', tipos: ['Normal'], base: b(65, 82, 60, 45, 60, 100), captura: 120, xpBase: 128,
    golpes: [[1, 'investida'], [1, 'ataquerapido'], [9, 'olharferoz'], [13, 'mordida'], [17, 'agilidade'], [21, 'pancadao'], [27, 'chute'], [33, 'investidabruta']],
    cat: 'Fera Salto',
    texto: 'Um chute de suas pernas traseiras é capaz de quebrar troncos. Corre mais rápido que um carro.',
    look: { corpo: 'bipede', c1: '#a88858', c2: '#f0e0c8', c3: '#f0a0b0', tam: 0.95, detalhes: ['orelhasLongas', 'cauda'], olho: 'bravo' },
  },
  piui: {
    id: 12, nome: 'Piuí', tipos: ['Normal', 'Voador'], base: b(40, 45, 40, 35, 35, 56), captura: 255, xpBase: 50,
    golpes: [[1, 'bicada'], [1, 'rosnado'], [5, 'rajada'], [9, 'ataquerapido'], [13, 'asaataque'], [19, 'agilidade'], [24, 'aereo'], [31, 'bicobroca']],
    evolui: { nivel: 18, para: 'ventor' }, cat: 'Fera Passarinho',
    texto: 'Canta sem parar ao amanhecer. Bandos de Piuí costumam seguir viajantes pela estrada.',
    look: { corpo: 'ave', c1: '#d8a058', c2: '#f8f0d8', c3: '#f8c038', tam: 0.6, detalhes: ['crista'], olho: 'fofo' },
  },
  ventor: {
    id: 13, nome: 'Ventor', tipos: ['Normal', 'Voador'], base: b(73, 75, 65, 55, 60, 91), captura: 90, xpBase: 150,
    golpes: [[1, 'bicada'], [1, 'rajada'], [9, 'ataquerapido'], [13, 'asaataque'], [19, 'agilidade'], [24, 'aereo'], [31, 'bicobroca'], [40, 'aves']],
    cat: 'Fera Vento',
    texto: 'Plana por horas sem bater as asas. Avista presas a quilômetros de distância.',
    look: { corpo: 'ave', c1: '#a86838', c2: '#f0e0c0', c3: '#d84838', tam: 0.95, detalhes: ['crista', 'cauda'], olho: 'bravo' },
  },
  larvito: {
    id: 14, nome: 'Larvito', tipos: ['Inseto'], base: b(45, 35, 45, 25, 25, 40), captura: 255, xpBase: 45,
    golpes: [[1, 'investida'], [1, 'teia'], [6, 'ferrao']],
    evolui: { nivel: 10, para: 'mariluz' }, cat: 'Fera Larva',
    texto: 'Come o próprio peso em folhas todo dia. Solta seda pegajosa quando se sente ameaçado.',
    look: { corpo: 'larva', c1: '#98c838', c2: '#e8f0a0', c3: '#e85848', tam: 0.65, detalhes: ['antenas'], olho: 'fofo' },
  },
  mariluz: {
    id: 15, nome: 'Mariluz', tipos: ['Inseto', 'Voador'], base: b(60, 45, 50, 85, 80, 75), captura: 45, xpBase: 160,
    golpes: [[1, 'rajada'], [1, 'teia'], [10, 'posono'], [12, 'povenenoso'], [16, 'picada'], [22, 'confusao'], [28, 'zumbido'], [34, 'psiquico']],
    cat: 'Fera Mariposa',
    texto: 'Suas asas brilham fracamente no escuro. Atrai outras feras com o pó cintilante que solta.',
    look: { corpo: 'borboleta', c1: '#8868c8', c2: '#f8e8a0', c3: '#58d8e8', tam: 0.9, detalhes: ['antenas'], olho: 'normal' },
  },
  gatuno: {
    id: 16, nome: 'Gatuno', tipos: ['Normal'], base: b(45, 55, 40, 40, 45, 80), captura: 200, xpBase: 58,
    golpes: [[1, 'arranhao'], [1, 'rosnado'], [6, 'mordida'], [11, 'ataquerapido'], [16, 'corte'], [22, 'agilidade'], [28, 'garrasombra']],
    evolui: { nivel: 26, para: 'felinao' }, cat: 'Fera Gato',
    texto: 'Curioso e esperto, adora objetos brilhantes. Costuma roubar moedas de viajantes distraídos.',
    look: { corpo: 'quadrupede', c1: '#8a8a98', c2: '#e8e8f0', c3: '#f8d050', tam: 0.62, detalhes: ['orelhas', 'cauda'], olho: 'fofo' },
  },
  felinao: {
    id: 17, nome: 'Felumbra', tipos: ['Normal'], base: b(70, 85, 60, 60, 65, 110), captura: 90, xpBase: 150,
    golpes: [[1, 'arranhao'], [1, 'mordida'], [16, 'corte'], [22, 'agilidade'], [28, 'garrasombra'], [34, 'dancaespada'], [40, 'pisotear']],
    cat: 'Fera Felino',
    texto: 'Caçador silencioso. A joia na testa brilha quando sente o perigo se aproximar.',
    look: { corpo: 'quadrupede', c1: '#58586a', c2: '#d0d0e0', c3: '#f8d050', tam: 0.9, detalhes: ['orelhas', 'cauda', 'joia'], olho: 'bravo' },
  },

  // ===== elétricos, pedra, água =====
  zapito: {
    id: 18, nome: 'Zapito', tipos: ['Elétrico'], base: b(40, 55, 35, 70, 50, 95), captura: 120, xpBase: 110,
    golpes: [[1, 'choque'], [1, 'rosnado'], [6, 'ataquerapido'], [10, 'ondatrovao'], [15, 'faisca'], [21, 'agilidade'], [26, 'relampago']],
    evolui: { nivel: 26, para: 'voltorrao' }, cat: 'Fera Faísca',
    texto: 'Suas antenas soltam faíscas quando fica animado. Em dias de tempestade flutua alguns centímetros do chão.',
    look: { corpo: 'redondo', c1: '#58c8e8', c2: '#f0fcff', c3: '#f8e048', tam: 0.62, detalhes: ['antenas', 'cauda'], olho: 'fofo' },
  },
  voltorrao: {
    id: 19, nome: 'Trovalhão', tipos: ['Elétrico'], base: b(65, 75, 60, 100, 75, 115), captura: 60, xpBase: 180,
    golpes: [[1, 'choque'], [1, 'faisca'], [21, 'agilidade'], [26, 'relampago'], [32, 'carga'], [38, 'trovao']],
    cat: 'Fera Tempestade',
    texto: 'Acumula tanta energia que ilumina uma cidade inteira por uma noite. Corre como um raio.',
    look: { corpo: 'quadrupede', c1: '#3898c8', c2: '#e0f4ff', c3: '#f8e048', tam: 0.95, detalhes: ['antenas', 'caudaRaio', 'espinhos'], olho: 'bravo' },
  },
  pedrico: {
    id: 20, nome: 'Pedrico', tipos: ['Pedra'], base: b(45, 75, 95, 30, 30, 20), captura: 190, xpBase: 70,
    golpes: [[1, 'investida'], [1, 'endurecer'], [6, 'lancapedras'], [11, 'muralha'], [16, 'tumbapedra'], [21, 'desabamento'], [26, 'investidabruta'], [34, 'avalanche']],
    evolui: { nivel: 22, para: 'rochedao' }, cat: 'Fera Seixo',
    texto: 'Fica parado por dias e se confunde com as pedras do caminho. Muita gente já tropeçou em um.',
    look: { corpo: 'pedra', c1: '#a09888', c2: '#c8c0b0', c3: '#787068', tam: 0.65, detalhes: [], olho: 'bravo' },
  },
  rochedao: {
    id: 21, nome: 'Rochedão', tipos: ['Pedra', 'Terra'], base: b(70, 100, 120, 45, 45, 35), captura: 75, xpBase: 160,
    golpes: [[1, 'investida'], [1, 'lancapedras'], [11, 'muralha'], [16, 'tumbapedra'], [21, 'desabamento'], [28, 'terremoto'], [34, 'avalanche']],
    cat: 'Fera Rocha',
    texto: 'Desce as montanhas rolando quando quer viajar. Seu corpo é duro como granito.',
    look: { corpo: 'pedra', c1: '#888078', c2: '#b0a898', c3: '#e0a040', tam: 1, detalhes: ['espinhos'], olho: 'bravo' },
  },
  bolhudo: {
    id: 22, nome: 'Bolhudo', tipos: ['Água'], base: b(55, 50, 55, 60, 55, 65), captura: 190, xpBase: 80,
    golpes: [[1, 'bolhas'], [1, 'investida'], [8, 'jatodagua'], [14, 'casco'], [20, 'pulsoagua'], [25, 'mordida'], [30, 'maremoto']],
    evolui: { nivel: 25, para: 'marlamina' }, cat: 'Fera Peixe',
    texto: 'Infla o corpo cheio de água para parecer maior. Seu canto parece bolhas estourando.',
    look: { corpo: 'peixe', c1: '#f08878', c2: '#f8e0d0', c3: '#f8f8f8', tam: 0.75, detalhes: ['barbatana'], olho: 'fofo' },
  },
  marlamina: {
    id: 23, nome: 'Marlâmina', tipos: ['Água'], base: b(75, 95, 70, 70, 70, 95), captura: 70, xpBase: 170,
    golpes: [[1, 'bolhas'], [1, 'mordida'], [20, 'pulsoagua'], [25, 'cachoeira'], [30, 'maremoto'], [36, 'hidrocanhao']],
    cat: 'Fera Espadarte',
    texto: 'Nada tão rápido que corta as ondas como uma lâmina. Vive em bandos perto do porto.',
    look: { corpo: 'peixe', c1: '#3878b8', c2: '#d0e8f8', c3: '#f8f8f8', tam: 1, detalhes: ['barbatana', 'chifre'], olho: 'bravo' },
  },

  // ===== bosque / caverna =====
  cogumelinho: {
    id: 24, nome: 'Cogumino', tipos: ['Planta', 'Venenoso'], base: b(50, 55, 60, 50, 60, 30), captura: 190, xpBase: 65,
    golpes: [[1, 'absorver'], [1, 'povenenoso'], [8, 'ferroadavenenosa'], [13, 'esporo'], [18, 'megadreno'], [24, 'acido'], [30, 'bombalodo']],
    evolui: { nivel: 24, para: 'fungao' }, cat: 'Fera Cogumelo',
    texto: 'Vive em florestas úmidas. O chapéu solta esporos que dão sono quando ele espirra.',
    look: { corpo: 'redondo', c1: '#f0e0c8', c2: '#fff8f0', c3: '#d84848', tam: 0.6, detalhes: ['chapeu'], olho: 'fofo' },
  },
  fungao: {
    id: 25, nome: 'Fungaral', tipos: ['Planta', 'Venenoso'], base: b(75, 80, 85, 75, 85, 35), captura: 75, xpBase: 160,
    golpes: [[1, 'absorver'], [1, 'esporo'], [18, 'megadreno'], [24, 'acido'], [30, 'bombalodo'], [36, 'raiosolar']],
    cat: 'Fera Fungo',
    texto: 'O chapéu enorme cobre um corpo frágil. Dizem que é uma colônia inteira de cogumelos vivos.',
    look: { corpo: 'bipede', c1: '#e8d8c0', c2: '#fff8f0', c3: '#a83878', tam: 0.95, detalhes: ['chapeu'], olho: 'normal' },
  },
  besourao: {
    id: 26, nome: 'Escarabruto', tipos: ['Inseto', 'Lutador'], base: b(80, 115, 85, 40, 70, 75), captura: 45, xpBase: 175,
    golpes: [[1, 'investida'], [1, 'carate'], [10, 'picada'], [16, 'focototal'], [22, 'tesourax'], [28, 'supersoco'], [34, 'chifrada']],
    cat: 'Fera Besouro',
    texto: 'Raro e muito forte. Consegue levantar cem vezes o próprio peso com o chifre.',
    look: { corpo: 'bipede', c1: '#3858a8', c2: '#a8b8e0', c3: '#f0c048', tam: 0.9, detalhes: ['chifre', 'punhos'], olho: 'bravo' },
  },
  toxinho: {
    id: 27, nome: 'Toxinho', tipos: ['Venenoso'], base: b(40, 60, 45, 40, 50, 60), captura: 190, xpBase: 60,
    golpes: [[1, 'ferroadavenenosa'], [1, 'olharferoz'], [8, 'mordida'], [13, 'acido'], [18, 'gastoxico'], [23, 'presaveneno'], [30, 'bombalodo']],
    evolui: { nivel: 24, para: 'toxiboa' }, cat: 'Fera Serpente',
    texto: 'Se esconde na grama e pica os tornozelos de quem passa. O veneno dá uma coceira terrível.',
    look: { corpo: 'serpente', c1: '#a058b8', c2: '#f0d8f8', c3: '#f8e048', tam: 0.65, detalhes: ['presas'], olho: 'bravo' },
  },
  toxiboa: {
    id: 28, nome: 'Toxiboa', tipos: ['Venenoso'], base: b(70, 90, 70, 65, 75, 85), captura: 75, xpBase: 160,
    golpes: [[1, 'ferroadavenenosa'], [1, 'mordida'], [18, 'gastoxico'], [23, 'presaveneno'], [30, 'bombalodo'], [36, 'gritoguerra'], [42, 'terremoto']],
    cat: 'Fera Naja',
    texto: 'Abre o capuz e encara a presa até ela não conseguir se mexer. Muito temida no pântano.',
    look: { corpo: 'serpente', c1: '#783890', c2: '#e8c8f0', c3: '#f8e048', tam: 1, detalhes: ['presas', 'coroa'], olho: 'bravo' },
  },
  toupeco: {
    id: 29, nome: 'Toupeco', tipos: ['Terra'], base: b(45, 60, 50, 30, 45, 55), captura: 190, xpBase: 62,
    golpes: [[1, 'arranhao'], [1, 'lama'], [8, 'corte'], [13, 'areia'], [18, 'bombalama'], [24, 'ossada'], [32, 'terremoto']],
    evolui: { nivel: 26, para: 'escavadao' }, cat: 'Fera Toupeira',
    texto: 'Cava túneis tão rápido que parece nadar na terra. Fica tonto quando vê a luz do sol.',
    look: { corpo: 'redondo', c1: '#a87850', c2: '#f0d8b8', c3: '#f0a0a0', tam: 0.6, detalhes: ['punhos'], olho: 'fofo' },
  },
  escavadao: {
    id: 30, nome: 'Escavadão', tipos: ['Terra'], base: b(75, 100, 80, 50, 65, 80), captura: 75, xpBase: 165,
    golpes: [[1, 'arranhao'], [1, 'lama'], [18, 'bombalama'], [24, 'ossada'], [30, 'dancaespada'], [36, 'terremoto'], [42, 'avalanche']],
    cat: 'Fera Escavadeira',
    texto: 'Suas garras de aço furam até rochas. Mineradores seguem seus túneis para achar pedras preciosas.',
    look: { corpo: 'bipede', c1: '#886040', c2: '#e8c8a0', c3: '#d0d0d8', tam: 0.95, detalhes: ['punhos', 'espinhos'], olho: 'bravo' },
  },
  morcegote: {
    id: 31, nome: 'Morcegote', tipos: ['Venenoso', 'Voador'], base: b(40, 45, 35, 30, 40, 60), captura: 255, xpBase: 54,
    golpes: [[1, 'mordida'], [1, 'ferroadavenenosa'], [8, 'rajada'], [13, 'asaataque'], [18, 'presaveneno'], [24, 'aereo']],
    evolui: { nivel: 22, para: 'vampirao' }, cat: 'Fera Morcego',
    texto: 'Mora em cavernas escuras. Não enxerga bem, mas ouve um sussurro a cem metros.',
    look: { corpo: 'redondo', c1: '#5868a8', c2: '#c8c8e8', c3: '#f07898', tam: 0.55, detalhes: ['asasMorcego', 'orelhas', 'presas'], olho: 'fofo' },
  },
  vampirao: {
    id: 32, nome: 'Vampirão', tipos: ['Venenoso', 'Voador'], base: b(75, 80, 70, 65, 75, 90), captura: 90, xpBase: 159,
    golpes: [[1, 'mordida'], [1, 'asaataque'], [18, 'presaveneno'], [24, 'aereo'], [30, 'bombalodo'], [36, 'bicobroca']],
    cat: 'Fera Vampiro',
    texto: 'Voa em silêncio pela noite. Suas asas são tão largas que cobrem a lua.',
    look: { corpo: 'redondo', c1: '#3c4888', c2: '#a8a8d8', c3: '#e85878', tam: 0.85, detalhes: ['asasMorcego', 'orelhas', 'presas'], olho: 'bravo' },
  },
  lavazinho: {
    id: 33, nome: 'Magmito', tipos: ['Fogo', 'Pedra'], base: b(50, 60, 70, 60, 50, 40), captura: 150, xpBase: 72,
    golpes: [[1, 'investida'], [1, 'brasa'], [9, 'lancapedras'], [15, 'fumaca'], [21, 'rodafogo'], [27, 'tumbapedra'], [33, 'labareda']],
    evolui: { nivel: 30, para: 'vulcanor' }, cat: 'Fera Magma',
    texto: 'Uma pedra que nunca esfria. Gosta de se esconder dentro de crateras borbulhantes.',
    look: { corpo: 'pedra', c1: '#784838', c2: '#a86848', c3: '#f88830', tam: 0.62, detalhes: ['chamas'], olho: 'fofo' },
  },
  vulcanor: {
    id: 34, nome: 'Vulcanor', tipos: ['Fogo', 'Pedra'], base: b(80, 95, 100, 95, 75, 55), captura: 60, xpBase: 175,
    golpes: [[1, 'brasa'], [1, 'lancapedras'], [21, 'rodafogo'], [27, 'tumbapedra'], [33, 'labareda'], [38, 'avalanche'], [44, 'erupcao']],
    cat: 'Fera Vulcão',
    texto: 'Quando fica bravo, a cratera em suas costas solta lava. É melhor não irritá-lo.',
    look: { corpo: 'pedra', c1: '#583028', c2: '#885040', c3: '#f86830', tam: 1, detalhes: ['chamas', 'espinhos'], olho: 'bravo' },
  },

  // ===== lutadores, fantasmas, psíquicos =====
  socao: {
    id: 35, nome: 'Socão', tipos: ['Lutador'], base: b(60, 80, 50, 35, 45, 45), captura: 180, xpBase: 75,
    golpes: [[1, 'investida'], [1, 'olharferoz'], [7, 'carate'], [13, 'chute'], [19, 'focototal'], [25, 'supersoco'], [33, 'impacto']],
    evolui: { nivel: 28, para: 'punhoforte' }, cat: 'Fera Treino',
    texto: 'Treina socando árvores o dia todo. Fica bravo se alguém interromper seu treino.',
    look: { corpo: 'bipede', c1: '#d8a878', c2: '#f8e8d0', c3: '#e05050', tam: 0.65, detalhes: ['punhos'], olho: 'bravo' },
  },
  punhoforte: {
    id: 36, nome: 'Punhoforte', tipos: ['Lutador'], base: b(90, 120, 80, 45, 70, 60), captura: 70, xpBase: 175,
    golpes: [[1, 'carate'], [1, 'chute'], [19, 'focototal'], [25, 'supersoco'], [33, 'impacto'], [40, 'terremoto']],
    cat: 'Fera Campeã',
    texto: 'Seus punhos quebram pedras como se fossem papel. Respeita apenas quem o vence em combate.',
    look: { corpo: 'bipede', c1: '#b87848', c2: '#f0d8b8', c3: '#e03838', tam: 1, detalhes: ['punhos', 'crista'], olho: 'bravo' },
  },
  vultinho: {
    id: 37, nome: 'Vultinho', tipos: ['Fantasma'], base: b(40, 35, 40, 75, 55, 70), captura: 190, xpBase: 70,
    golpes: [[1, 'lambida'], [1, 'pesadelo'], [9, 'raionoturno'], [15, 'fogofatuo'], [21, 'bolasombria'], [28, 'garrasombra']],
    evolui: { nivel: 28, para: 'assombrao' }, cat: 'Fera Sombra',
    texto: 'Brinca de assustar pessoas no escuro. Quando alguém ri dele, fica envergonhado e some.',
    look: { corpo: 'fantasma', c1: '#9078c8', c2: '#e0d8f8', c3: '#f87898', tam: 0.62, detalhes: [], olho: 'fofo' },
  },
  assombrao: {
    id: 38, nome: 'Assombrão', tipos: ['Fantasma', 'Venenoso'], base: b(65, 60, 65, 115, 80, 100), captura: 60, xpBase: 180,
    golpes: [[1, 'lambida'], [1, 'raionoturno'], [21, 'bolasombria'], [28, 'garrasombra'], [34, 'bombalodo'], [40, 'futuro']],
    cat: 'Fera Assombração',
    texto: 'Atravessa paredes e esconde-se na sombra das pessoas. Dizem que adora roubar o calor dos vivos.',
    look: { corpo: 'fantasma', c1: '#584080', c2: '#c8b8e8', c3: '#e83878', tam: 1, detalhes: ['coroa', 'aura'], olho: 'bravo' },
  },
  mentalis: {
    id: 39, nome: 'Mentalis', tipos: ['Psíquico'], base: b(45, 30, 45, 80, 70, 70), captura: 150, xpBase: 75,
    golpes: [[1, 'confusao'], [1, 'hipnose'], [10, 'meditar'], [16, 'psicorte'], [22, 'psiquico'], [30, 'futuro']],
    evolui: { nivel: 30, para: 'oraculum' }, cat: 'Fera Mente',
    texto: 'Lê os pensamentos de quem está por perto. Fica com dor de cabeça em lugares muito barulhentos.',
    look: { corpo: 'bipede', c1: '#f0a8c8', c2: '#fff0f8', c3: '#a868d8', tam: 0.6, detalhes: ['joia', 'orelhas'], olho: 'normal' },
  },
  oraculum: {
    id: 40, nome: 'Oraculum', tipos: ['Psíquico'], base: b(70, 45, 70, 125, 105, 95), captura: 50, xpBase: 185,
    golpes: [[1, 'confusao'], [1, 'meditar'], [16, 'psicorte'], [22, 'psiquico'], [30, 'futuro'], [36, 'bolasombria']],
    cat: 'Fera Oráculo',
    texto: 'Prevê o futuro em sonhos. Antigos reis consultavam Oraculum antes de cada decisão.',
    look: { corpo: 'bipede', c1: '#d878b0', c2: '#f8e0f0', c3: '#8848c8', tam: 0.95, detalhes: ['joia', 'coroa', 'aura'], olho: 'normal' },
  },

  // ===== lendário =====
  aurorix: {
    id: 41, nome: 'Aurorix', tipos: ['Psíquico', 'Voador'], base: b(100, 90, 90, 125, 110, 105), captura: 3, xpBase: 270, lendario: true,
    golpes: [[1, 'aereo'], [1, 'psiquico'], [40, 'meditar'], [45, 'furacao'], [50, 'futuro']],
    cat: 'Fera Aurora',
    texto: 'A lenda diz que as luzes da aurora no céu são as penas de Aurorix brilhando enquanto ele voa.',
    look: { corpo: 'ave', c1: '#58d8c8', c2: '#f0f8ff', c3: '#c878f0', tam: 1, detalhes: ['crista', 'cauda', 'coroa', 'aura'], olho: 'bravo' },
  },
};

export const SPECIES_LIST = Object.entries(SPECIES).sort((a, b) => a[1].id - b[1].id);
