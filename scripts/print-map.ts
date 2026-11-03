import { MAPS } from '../src/data/maps';
const id = (globalThis as any).process.argv[2];
MAPS[id].tiles.forEach((r, y) => console.log(String(y).padStart(2), r));
