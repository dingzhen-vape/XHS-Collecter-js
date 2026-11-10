import { execFileSync } from "node:child_process";
import { readFileSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = dirname(fileURLToPath(import.meta.url));
const readable = process.argv.includes("--readable");

// esbuild 的 JS API 会以管道方式拉起子进程，某些受限环境下会 EPERM。
// 这里改用 CLI + stdio:inherit，行为一致且更稳。
const ESBUILD_CLI = resolve(ROOT, "node_modules/esbuild/bin/esbuild");

const META = [
  "// ==UserScript==",
  "// @name         \u5c0f\u7ea2\u4e66\u6536\u85cf\u6279\u91cf\u5f52\u7c7b",
  "// @namespace    local.xhs.picker",
  "// @version      1.2.0",
  "// @description  \u6536\u85cf\u9875\u52fe\u9009\u7b14\u8bb0\uff0c\u7528\u5b98\u65b9\u63a5\u53e3\u6279\u91cf\u5f52\u5165\u6307\u5b9a\u4e13\u8f91",
  "// @match        https://www.xiaohongshu.com/*",
  "// @grant        none",
  "// @run-at       document-idle",
  "// ==/UserScript==",
  "",
  "",
].join("\n");

const NOTE = [
  "/* ============================================================",
  "   \u53ef\u8bfb\u7248\uff1a\u903b\u8f91\u4e0e xhs-collect.user.js \u76f8\u540c\uff0c\u53ea\u662f\u6ca1\u538b\u7f29\u3002",
  "   \u4e09\u6bb5\u5185\u5bb9\uff1aBuffer \u517c\u5bb9\u5c42 / XYS \u7b7e\u540d\u6a21\u5757 / \u811a\u672c\u81ea\u8eab\u903b\u8f91",
  "   \u81ea\u8eab\u903b\u8f91\u7684\u6e90\u7801\u5728 src/main-src.js",
  "   ============================================================ */",
  "",
  "",
].join("\n");

const outfile = readable ? "xhs-collect.readable.user.js" : "xhs-collect.user.js";

const args = [
  ESBUILD_CLI,
  resolve(ROOT, "src/main-src.js"),
  "--bundle",
  "--platform=browser",
  "--target=es2020",
  "--format=iife",
  "--legal-comments=inline",
  "--outfile=" + resolve(ROOT, outfile),
  "--alias:node:crypto=" + resolve(ROOT, "src/crypto-shim.js"),
  "--inject:" + resolve(ROOT, "src/inject-buffer.js"),
];
if (!readable) args.push("--minify");

execFileSync(process.execPath, args, { stdio: "inherit", cwd: ROOT });

const body = readFileSync(resolve(ROOT, outfile), "utf8");
writeFileSync(resolve(ROOT, outfile), META + (readable ? NOTE : "") + body);
console.log(outfile + "  " + (META.length + body.length) + " bytes");
