// 签名回归：把随机源全部钉死后，签名输出必须与 golden.json 逐字符一致。
// 用途：改了 src/signing.js / crypto-shim.js / md5.js 之后，确认签名没被改坏。
// 局限：只能证明"本地实现没变"，证明不了"服务端还认"。后者要在浏览器里点"自检"。
// 用法：npm run check:sign    失败后确认这是有意改动才 npm run check:sign -- --update
import { execFileSync } from "node:child_process";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const GOLDEN = resolve(ROOT, "scripts/golden.json");
const TMP = resolve(ROOT, ".tmp-verify");
const update = process.argv.includes("--update");

/* ---------- 1. 把 signing.js 打成 node 能 import 的 ESM ---------- */
mkdirSync(TMP, { recursive: true });
const bundle = resolve(TMP, "signing.mjs");
const ESBUILD = resolve(ROOT, "node_modules/esbuild/bin/esbuild");
if (!existsSync(ESBUILD)) {
  console.error("找不到 esbuild，先 npm install");
  process.exit(1);
}
execFileSync(process.execPath, [
  ESBUILD,
  resolve(ROOT, "src/signing.js"),
  "--bundle",
  "--platform=browser",
  "--target=es2020",
  "--format=esm",
  "--legal-comments=none",
  "--outfile=" + bundle,
  "--alias:node:crypto=" + resolve(ROOT, "src/crypto-shim.js"),
  "--inject:" + resolve(ROOT, "src/inject-buffer.js"),
], { stdio: "inherit" });

/* ---------- 2. 钉死所有随机源 ---------- */
const FIXED_MS = 1794300364100;
let s1 = 0x12345678;
const rand = () => { s1 = (s1 * 1664525 + 1013904223) >>> 0; return s1 / 4294967296; };
Math.random = rand;
Date.now = () => FIXED_MS;
let s2 = 0x9e3779b9;
globalThis.__XHS_RANDBYTES__ = (n) => {
  const a = new Uint8Array(n);
  for (let i = 0; i < n; i++) { s2 = (s2 * 1103515245 + 12345) >>> 0; a[i] = s2 >>> 24; }
  return a;
};

const { signMainApi } = await import(pathToFileURL(bundle).href);

/* ---------- 3. 固定输入 ---------- */
const A1 = "1a0b88c1d2e3f405162738495a6b7c8d9e0f1a2b3c4d5e6f7a8b9c0d";
const UID = "61ae26060000000002020aad";
const LOC = "https://www.xiaohongshu.com/user/profile/" + UID + "?tab=fav&subTab=note";
const TS = Math.floor(FIXED_MS / 1000);

const CASES = [
  {
    name: "GET board/user",
    run: () => signMainApi("GET", "/api/sns/web/v1/board/user", { a1: A1 }, { user_id: UID, num: 15, page: 1 }, null, TS, LOC),
  },
  {
    name: "POST note/move",
    run: () => signMainApi("POST", "/api/sns/web/v1/note/move", { a1: A1 }, null, { target_board_id: "6aafe5eb000000000c034f47", notes_id: "6aeedfb8000000001803a7cb" }, TS, LOC),
  },
];

const produced = {};
for (const c of CASES) {
  const h = c.run();
  produced[c.name] = {};
  for (const k of ["x-s", "x-s-common", "x-t", "x-b3-traceid", "x-xray-traceid"]) {
    if (typeof h[k] !== "string") { console.error("[失败] " + c.name + " 缺头 " + k); process.exit(1); }
    produced[c.name][k] = h[k];
  }
  if (!produced[c.name]["x-s"].startsWith("XYS_")) {
    console.error("[失败] " + c.name + " 的 x-s 不是 XYS_ 前缀：" + produced[c.name]["x-s"].slice(0, 8));
    process.exit(1);
  }
}

/* ---------- 4. 比对 ---------- */
if (update || !existsSync(GOLDEN)) {
  const out = {
    note: "固定随机源(x-s 种子/Date.now/a1)后的签名产物。对不上说明签名逻辑变了，也可能只是随机种子变了。",
    fixed: { nowMs: FIXED_MS, a1: A1, uid: UID, location: LOC },
    cases: produced,
  };
  writeFileSync(GOLDEN, JSON.stringify(out, null, 2) + "\n");
  console.log("[sign] 已写入基准 scripts/golden.json");
  process.exit(0);
}

const golden = JSON.parse(readFileSync(GOLDEN, "utf8")).cases;
let bad = 0;
for (const name of Object.keys(produced)) {
  const want = golden[name];
  if (!want) { console.error("[失败] 基准里没有 " + name); bad++; continue; }
  for (const k of Object.keys(produced[name])) {
    if (produced[name][k] !== want[k]) {
      bad++;
      const a = produced[name][k], b = want[k];
      let i = 0;
      while (i < a.length && i < b.length && a[i] === b[i]) i++;
      console.error("[失败] " + name + " / " + k + " 第 " + i + " 字符起不一致");
      console.error("  实际 len=" + a.length + " " + a.slice(Math.max(0, i - 20), i + 40));
      console.error("  基准 len=" + b.length + " " + b.slice(Math.max(0, i - 20), i + 40));
    }
  }
}

if (bad) {
  console.error("\n[sign] 有 " + bad + " 处不一致。确认改动是故意的，就 npm run check:sign -- --update");
  process.exit(1);
}
console.log("[sign] OK  两个用例的五个头与基准逐字符一致");
