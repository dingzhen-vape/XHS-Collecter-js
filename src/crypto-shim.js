import { Buffer } from "buffer";
import { md5Hex } from "./md5.js";

function toBytes(x) {
  if (typeof x === "string") return new TextEncoder().encode(x);
  if (x instanceof Uint8Array) return x;
  if (Array.isArray(x)) return Uint8Array.from(x);
  return Uint8Array.from(x);
}

const crypto = {
  createHash(alg) {
    if (String(alg).toLowerCase() !== "md5") throw new Error("unsupported hash: " + alg);
    const chunks = [];
    return {
      update(d) { chunks.push(toBytes(d)); return this; },
      digest(enc) {
        let total = 0;
        for (const c of chunks) total += c.length;
        const all = new Uint8Array(total);
        let o = 0;
        for (const c of chunks) { all.set(c, o); o += c.length; }
        const hex = md5Hex(all);
        if (!enc) return Buffer.from(hex, "hex");
        if (enc === "hex") return hex;
        throw new Error("unsupported digest encoding: " + enc);
      },
    };
  },
  randomBytes(n) {
    const b = Buffer.alloc(n);
    if (globalThis.__XHS_RANDBYTES__) { b.set(globalThis.__XHS_RANDBYTES__(n)); return b; }
    globalThis.crypto.getRandomValues(b);
    return b;
  },
  createCipheriv() { throw new Error("XYW/AES 未打包，本脚本只用 XYS"); },
};

export default crypto;
