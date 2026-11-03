import type { Status } from './moves';

export type Item = {
  nome: string;
  preco: number;
  desc: string;
  tipo: 'cura' | 'status' | 'captura' | 'reviver' | 'pp' | 'repelente' | 'chave';
  cura?: number;
  curaStatus?: Status | 'all';
  bonus?: number; // captura
  passos?: number; // repelente
};

export const ITEMS = {
  capsula: { nome: 'Cápsula', preco: 200, tipo: 'captura', bonus: 1, desc: 'Uma cápsula para capturar feras selvagens.' },
  supercapsula: { nome: 'Supercápsula', preco: 600, tipo: 'captura', bonus: 1.5, desc: 'Cápsula melhorada, com mais chance de captura.' },
  ultracapsula: { nome: 'Ultracápsula', preco: 1200, tipo: 'captura', bonus: 2, desc: 'Cápsula de alta tecnologia. Excelente chance de captura.' },
  capsulaaurora: { nome: 'Cápsula Aurora', preco: 0, tipo: 'captura', bonus: 255, desc: 'Uma cápsula lendária. Captura qualquer fera, sem falhar.' },
  pocao: { nome: 'Poção', preco: 300, tipo: 'cura', cura: 20, desc: 'Recupera 20 PV de uma fera.' },
  superpocao: { nome: 'Superpoção', preco: 700, tipo: 'cura', cura: 50, desc: 'Recupera 50 PV de uma fera.' },
  hiperpocao: { nome: 'Hiperpoção', preco: 1200, tipo: 'cura', cura: 200, desc: 'Recupera 200 PV de uma fera.' },
  pocaomax: { nome: 'Poção Máxima', preco: 2500, tipo: 'cura', cura: 9999, desc: 'Recupera todos os PV de uma fera.' },
  antidoto: { nome: 'Antídoto', preco: 100, tipo: 'status', curaStatus: 'psn', desc: 'Cura o envenenamento.' },
  despertador: { nome: 'Despertador', preco: 250, tipo: 'status', curaStatus: 'slp', desc: 'Acorda uma fera adormecida.' },
  antiparalisia: { nome: 'Antiparalisia', preco: 200, tipo: 'status', curaStatus: 'par', desc: 'Cura a paralisia.' },
  pomada: { nome: 'Pomada Fria', preco: 250, tipo: 'status', curaStatus: 'brn', desc: 'Cura queimaduras.' },
  curatotal: { nome: 'Cura Total', preco: 600, tipo: 'status', curaStatus: 'all', desc: 'Cura qualquer problema de estado.' },
  reviver: { nome: 'Reanimador', preco: 1500, tipo: 'reviver', desc: 'Reanima uma fera desmaiada com metade dos PV.' },
  elixir: { nome: 'Elixir', preco: 1500, tipo: 'pp', desc: 'Recupera 10 PP de todos os golpes de uma fera.' },
  repelente: { nome: 'Repelente', preco: 350, tipo: 'repelente', passos: 100, desc: 'Afasta feras selvagens por 100 passos.' },
  superrepelente: { nome: 'Super-repelente', preco: 600, tipo: 'repelente', passos: 250, desc: 'Afasta feras selvagens por 250 passos.' },
  compartilhador: { nome: 'Compartilhador XP', preco: 0, tipo: 'chave', desc: 'Item especial: feras que não lutaram também recebem metade da experiência.' },
} satisfies Record<string, Item>;

export type ItemId = keyof typeof ITEMS;
export const item = (id: string): Item => (ITEMS as Record<string, Item>)[id];
