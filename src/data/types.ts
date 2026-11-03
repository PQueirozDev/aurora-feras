export type Tipo =
  | 'Normal' | 'Fogo' | 'Água' | 'Planta' | 'Elétrico' | 'Pedra' | 'Inseto' | 'Voador'
  | 'Terra' | 'Lutador' | 'Fantasma' | 'Psíquico' | 'Venenoso';

export const TIPOS: Tipo[] = ['Normal', 'Fogo', 'Água', 'Planta', 'Elétrico', 'Pedra', 'Inseto', 'Voador', 'Terra', 'Lutador', 'Fantasma', 'Psíquico', 'Venenoso'];

export const TIPO_COR: Record<Tipo, string> = {
  Normal: '#a8a878', Fogo: '#f08030', 'Água': '#6890f0', Planta: '#78c850',
  'Elétrico': '#e8c020', Pedra: '#b8a038', Inseto: '#a8b820', Voador: '#a890f0',
  Terra: '#d8b058', Lutador: '#c03028', Fantasma: '#705898', 'Psíquico': '#f85888', Venenoso: '#a040a0',
};

// multiplicador[atacante][defensor]; ausente = 1
const CHART: Partial<Record<Tipo, Partial<Record<Tipo, number>>>> = {
  Normal: { Pedra: 0.5, Fantasma: 0 },
  Fogo: { Planta: 2, Inseto: 2, Fogo: 0.5, 'Água': 0.5, Pedra: 0.5 },
  'Água': { Fogo: 2, Pedra: 2, Terra: 2, 'Água': 0.5, Planta: 0.5 },
  Planta: { 'Água': 2, Pedra: 2, Terra: 2, Fogo: 0.5, Planta: 0.5, Inseto: 0.5, Voador: 0.5, Venenoso: 0.5 },
  'Elétrico': { 'Água': 2, Voador: 2, Planta: 0.5, 'Elétrico': 0.5, Terra: 0 },
  Pedra: { Fogo: 2, Voador: 2, Inseto: 2, Lutador: 0.5, Terra: 0.5 },
  Inseto: { Planta: 2, 'Psíquico': 2, Fogo: 0.5, Voador: 0.5, Lutador: 0.5, Fantasma: 0.5, Venenoso: 0.5 },
  Voador: { Planta: 2, Inseto: 2, Lutador: 2, Pedra: 0.5, 'Elétrico': 0.5 },
  Terra: { Fogo: 2, 'Elétrico': 2, Pedra: 2, Venenoso: 2, Planta: 0.5, Inseto: 0.5, Voador: 0 },
  Lutador: { Normal: 2, Pedra: 2, Voador: 0.5, Inseto: 0.5, 'Psíquico': 0.5, Venenoso: 0.5, Fantasma: 0 },
  Fantasma: { Fantasma: 2, 'Psíquico': 2, Normal: 0 },
  'Psíquico': { Lutador: 2, Venenoso: 2, 'Psíquico': 0.5 },
  Venenoso: { Planta: 2, Venenoso: 0.5, Terra: 0.5, Pedra: 0.5, Fantasma: 0.5 },
};

export function efetividade(atk: Tipo, def: Tipo[]): number {
  return def.reduce((m, d) => m * (CHART[atk]?.[d] ?? 1), 1);
}
