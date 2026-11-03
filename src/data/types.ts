export type Tipo = 'Normal' | 'Fogo' | 'Água' | 'Planta' | 'Elétrico' | 'Pedra' | 'Inseto' | 'Voador';

export const TIPO_COR: Record<Tipo, string> = {
  Normal: '#a8a878', Fogo: '#f08030', 'Água': '#6890f0', Planta: '#78c850',
  'Elétrico': '#e8c020', Pedra: '#b8a038', Inseto: '#a8b820', Voador: '#a890f0',
};

// multiplicador[atacante][defensor]; ausente = 1
const CHART: Partial<Record<Tipo, Partial<Record<Tipo, number>>>> = {
  Normal: { Pedra: 0.5 },
  Fogo: { Planta: 2, Inseto: 2, Fogo: 0.5, 'Água': 0.5, Pedra: 0.5 },
  'Água': { Fogo: 2, Pedra: 2, 'Água': 0.5, Planta: 0.5 },
  Planta: { 'Água': 2, Pedra: 2, Fogo: 0.5, Planta: 0.5, Inseto: 0.5, Voador: 0.5 },
  'Elétrico': { 'Água': 2, Voador: 2, Planta: 0.5, 'Elétrico': 0.5, Pedra: 0.5 },
  Pedra: { Fogo: 2, Voador: 2, Inseto: 2 },
  Inseto: { Planta: 2, Fogo: 0.5, Voador: 0.5 },
  Voador: { Planta: 2, Inseto: 2, Pedra: 0.5, 'Elétrico': 0.5 },
};

export function efetividade(atk: Tipo, def: Tipo[]): number {
  return def.reduce((m, d) => m * (CHART[atk]?.[d] ?? 1), 1);
}
