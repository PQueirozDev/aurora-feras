// Gera os sprites das feras em PNG (192x192, fundo transparente) para o site.
import { deflateSync } from 'node:zlib';
import { writeFileSync } from 'node:fs';
import { creatureGrid } from '../src/gfx/creatures';
import { hexToRgb } from '../src/gfx/pixel';
import { SPECIES_LIST } from '../src/data/species';

const crcT = new Uint32Array(256).map((_, n) => { let c = n; for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1; return c >>> 0; });
const crc = (b: Buffer) => { let c = 0xffffffff; for (const v of b) c = crcT[(c ^ v) & 255] ^ (c >>> 8); return (c ^ 0xffffffff) >>> 0; };
const chunk = (t: string, d: Buffer) => { const l = Buffer.alloc(4); l.writeUInt32BE(d.length); const td = Buffer.concat([Buffer.from(t), d]); const c = Buffer.alloc(4); c.writeUInt32BE(crc(td)); return Buffer.concat([l, td, c]); };

function png(key: string, S = 4) {
  const g = creatureGrid(key);
  const N = 48 * S;
  const raw = Buffer.alloc((N * 4 + 1) * N);
  for (let y = 0; y < N; y++) {
    raw[y * (N * 4 + 1)] = 0;
    for (let x = 0; x < N; x++) {
      const col = g.get(Math.floor(x / S), Math.floor(y / S));
      if (!col) continue;
      const [r, gg, b] = hexToRgb(col);
      const i = y * (N * 4 + 1) + 1 + x * 4;
      raw[i] = r; raw[i + 1] = gg; raw[i + 2] = b; raw[i + 3] = 255;
    }
  }
  const ih = Buffer.alloc(13); ih.writeUInt32BE(N, 0); ih.writeUInt32BE(N, 4); ih[8] = 8; ih[9] = 6;
  return Buffer.concat([Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]), chunk('IHDR', ih), chunk('IDAT', deflateSync(raw)), chunk('IEND', Buffer.alloc(0))]);
}

const lista = SPECIES_LIST.map(([k, sp]) => ({ k, nome: sp.nome, tipos: sp.tipos, id: sp.id, cat: sp.cat, lendario: !!sp.lendario }));
for (const { k } of lista) writeFileSync(`site/img/feras/${k}.png`, png(k));
writeFileSync('site/feras.json', JSON.stringify(lista));
console.log(lista.length, 'sprites gerados');
