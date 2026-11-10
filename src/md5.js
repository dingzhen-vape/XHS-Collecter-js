// 纯 JS MD5（浏览器无 MD5 API）
const S = [7,12,17,22,7,12,17,22,7,12,17,22,7,12,17,22,
           5,9,14,20,5,9,14,20,5,9,14,20,5,9,14,20,
           4,11,16,23,4,11,16,23,4,11,16,23,4,11,16,23,
           6,10,15,21,6,10,15,21,6,10,15,21,6,10,15,21];
const K = new Uint32Array(64);
for (let i = 0; i < 64; i++) K[i] = Math.floor(Math.abs(Math.sin(i + 1)) * 4294967296) >>> 0;

function toBytes(x) {
  if (typeof x === "string") return new TextEncoder().encode(x);
  if (x instanceof Uint8Array) return x;
  if (Array.isArray(x)) return Uint8Array.from(x);
  return Uint8Array.from(x);
}

function wordsToHex(ws) {
  let s = "";
  for (let i = 0; i < ws.length; i++) {
    const w = ws[i] >>> 0;
    for (let j = 0; j < 4; j++) s += (((w >>> (j * 8)) & 0xff) + 0x100).toString(16).slice(1);
  }
  return s;
}

export function md5Hex(input) {
  const bytes = toBytes(input);
  const len = bytes.length;
  const bitLen = len * 8;
  const total = (((len + 8) >>> 6) + 1) << 6;
  const buf = new Uint8Array(total);
  buf.set(bytes, 0);
  buf[len] = 0x80;
  const dv = new DataView(buf.buffer, 0, total);
  dv.setUint32(total - 8, bitLen >>> 0, true);
  dv.setUint32(total - 4, Math.floor(bitLen / 4294967296) >>> 0, true);

  let a0 = 0x67452301, b0 = 0xefcdab89 | 0, c0 = 0x98badcfe | 0, d0 = 0x10325476;
  a0 = a0 >>> 0;
  const M = new Uint32Array(16);
  for (let off = 0; off < total; off += 64) {
    for (let i = 0; i < 16; i++) M[i] = dv.getUint32(off + i * 4, true);
    let A = a0, B = b0, C = c0, D = d0;
    for (let i = 0; i < 64; i++) {
      let F, g;
      if (i < 16) { F = (B & C) | (~B & D); g = i; }
      else if (i < 32) { F = (D & B) | (~D & C); g = (5 * i + 1) & 15; }
      else if (i < 48) { F = B ^ C ^ D; g = (3 * i + 5) & 15; }
      else { F = C ^ (B | ~D); g = (7 * i) & 15; }
      const sum = (A + F + K[i] + M[g]) >>> 0;
      const s = S[i];
      const rot = ((sum << s) | (sum >>> (32 - s))) >>> 0;
      const nb = (B + rot) >>> 0;
      A = D; D = C; C = B; B = nb;
    }
    a0 = (a0 + A) >>> 0; b0 = (b0 + B) >>> 0; c0 = (c0 + C) >>> 0; d0 = (d0 + D) >>> 0;
  }
  return wordsToHex([a0, b0, c0, d0]);
}
