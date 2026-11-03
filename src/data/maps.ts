// Índice de todos os mapas do jogo. Os mapas ficam divididos por região em src/data/maps/.
export * from './mapkit';
import type { MapDef } from './mapkit';
import { REGIAO1 } from './maps/regiao1';
import { REGIAO2 } from './maps/regiao2';
import { REGIAO3 } from './maps/regiao3';

export const MAPS: Record<string, MapDef> = { ...REGIAO1, ...REGIAO2, ...REGIAO3 };
