import type { Status } from './moves';

export type Item = {
  nome: string;
  preco: number;
  desc: string;
  tipo: 'cura' | 'status' | 'captura' | 'reviver' | 'chave';
  cura?: number;
  curaStatus?: Status | 'all';
  bonus?: number; // captura
};

export const ITEMS = {
  capsula: { nome: 'Cápsula', preco: 200, tipo: 'captura', bonus: 1, desc: 'Uma cápsula para capturar feras selvagens.' },
  supercapsula: { nome: 'Supercápsula', preco: 600, tipo: 'captura', bonus: 1.5, desc: 'Cápsula melhorada, com mais chance de captura.' },
  pocao: { nome: 'Poção', preco: 300, tipo: 'cura', cura: 20, desc: 'Recupera 20 PV de uma fera.' },
  superpocao: { nome: 'Superpoção', preco: 700, tipo: 'cura', cura: 50, desc: 'Recupera 50 PV de uma fera.' },
  antidoto: { nome: 'Antídoto', preco: 100, tipo: 'status', curaStatus: 'psn', desc: 'Cura o envenenamento.' },
  despertador: { nome: 'Despertador', preco: 250, tipo: 'status', curaStatus: 'slp', desc: 'Acorda uma fera adormecida.' },
  antiparalisia: { nome: 'Antiparalisia', preco: 200, tipo: 'status', curaStatus: 'par', desc: 'Cura a paralisia.' },
  pomada: { nome: 'Pomada Fria', preco: 250, tipo: 'status', curaStatus: 'brn', desc: 'Cura queimaduras.' },
  curatotal: { nome: 'Cura Total', preco: 600, tipo: 'status', curaStatus: 'all', desc: 'Cura qualquer problema de estado.' },
  reviver: { nome: 'Reanimador', preco: 1500, tipo: 'reviver', desc: 'Reanima uma fera desmaiada com metade dos PV.' },
} satisfies Record<string, Item>;

export type ItemId = keyof typeof ITEMS;
export const item = (id: string): Item => (ITEMS as Record<string, Item>)[id];
