// Gera public/icon.png (512x512) a partir do sprite do Brasilho, sem depender de navegador.
import { deflateSync } from 'node:zlib';
import { writeFileSync } from 'node:fs';
import { creatureGrid } from '../src/gfx/creatures';
import { hexToRgb } from '../src/gfx/pixel';

const N = Number((globalThis as any).process.argv[2] ?? 512);
const OUT = (globalThis as any).process.argv[3] ?? 'public/icon.png';
const K = N / 512;
const buf = Buffer.alloc(N * N * 4);
const g = creatureGrid('brasilho');
const R = 96 * K; // raio do canto
for (let y = 0; y < N; y++) for (let x = 0; x < N; x++) {
  const i = (y * N + x) * 4;
  const cx = Math.min(Math.max(x, R), N - R), cy = Math.min(Math.max(y, R), N - R);
  const inside = Math.hypot(x - cx, y - cy) <= R;
  if (!inside) continue;
  const t = y / N;
  buf[i] = Math.round(0x28 + (0xe8 - 0x28) * t);
  buf[i + 1] = Math.round(0x3c + (0x88 - 0x3c) * t);
  buf[i + 2] = Math.round(0x78 + (0x58 - 0x78) * t);
  buf[i + 3] = 255;
  // sprite 48x48 ampliado 8x, centralizado
  const sx = Math.floor((x - 64 * K) / (8 * K)), sy = Math.floor((y - 72 * K) / (8 * K));
  const col = g.get(sx, sy);
  if (col) { const [r, gg, b] = hexToRgb(col); buf[i] = r; buf[i + 1] = gg; buf[i + 2] = b; }
}
const raw = Buffer.alloc((N * 4 + 1) * N);
for (let y = 0; y < N; y++) { raw[y * (N * 4 + 1)] = 0; buf.copy(raw, y * (N * 4 + 1) + 1, y * N * 4, (y + 1) * N * 4); }
const crcTable = new Uint32Array(256).map((_, n) => { let c = n; for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1; return c >>> 0; });
const crc = (b: Buffer) => { let c = 0xffffffff; for (const v of b) c = crcTable[(c ^ v) & 255] ^ (c >>> 8); return (c ^ 0xffffffff) >>> 0; };
const chunk = (type: string, data: Buffer) => { const l = Buffer.alloc(4); l.writeUInt32BE(data.length); const td = Buffer.concat([Buffer.from(type), data]); const c = Buffer.alloc(4); c.writeUInt32BE(crc(td)); return Buffer.concat([l, td, c]); };
const ihdr = Buffer.alloc(13); ihdr.writeUInt32BE(N, 0); ihdr.writeUInt32BE(N, 4); ihdr[8] = 8; ihdr[9] = 6;
const png = Buffer.concat([Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]), chunk('IHDR', ihdr), chunk('IDAT', deflateSync(raw)), chunk('IEND', Buffer.alloc(0))]);
writeFileSync(OUT, png);
console.log(OUT, png.length, 'bytes');
