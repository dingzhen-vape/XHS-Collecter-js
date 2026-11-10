// 构建 + 自检：产物能不能装上、版本对不对、有没有忘了提交产物。
// 用法：npm run build:check
import { execFileSync } from "node:child_process";
import { readFileSync, statSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const OUT = resolve(ROOT, "xhs-collect.user.js");

function fail(msg) {
  console.error("\n[失败] " + msg);
  process.exit(1);
}

function step(msg) { console.log("[check] " + msg); }

// 1. 重新构建（产物必须由 src/ 生成，不接受手改产物）
step("build");
execFileSync(process.execPath, [resolve(ROOT, "build.mjs")], { stdio: "inherit", cwd: ROOT });

// 2. 语法
step("node --check");
try {
  execFileSync(process.execPath, ["--check", OUT], { stdio: "inherit" });
} catch (e) {
  fail("产物有语法错误");
}

const code = readFileSync(OUT, "utf8");

// 3. 元数据
const REQUIRED = ["==UserScript==", "@name", "@version", "@match", "@grant", "@run-at"];
for (const k of REQUIRED) {
  if (!code.includes(k)) fail("缺少元数据 " + k);
}
if (!/\/\/ @match\s+https:\/\/www\.xiaohongshu\.com\/\*/.test(code)) fail("@match 不是小红书域名");
if (!/\/\/ @grant\s+none/.test(code)) fail("@grant 必须是 none，否则签名拿不到页面环境");

// 4. 版本一致
const pkg = JSON.parse(readFileSync(resolve(ROOT, "package.json"), "utf8"));
const mv = code.match(/\/\/ @version\s+(\S+)/);
if (!mv) fail("产物里找不到 @version");
if (mv[1] !== pkg.version) fail("@version(" + mv[1] + ") 与 package.json(" + pkg.version + ") 不一致");

// 5. 关键常量没被改坏（改接口时这些会动，提醒同步 README/AGENTS）
const NEEDED = ["/api/sns/web/v1/board/user", "/api/sns/web/v1/note/move", "/api/sns/web/v1/note/collect", "/api/sns/web/v1/note/uncollect"];
for (const p of NEEDED) {
  if (!code.includes(p)) fail("产物里缺少接口 " + p);
}

const lines = code.split("\n").length;
const kb = (statSync(OUT).size / 1024).toFixed(1);
console.log("[check] OK  " + kb + " KB / " + lines + " 行 / v" + pkg.version);

// 6. 产物是不是忘了提交（改了源码没重新 build 就 commit，装上的脚本会是旧的）
try {
  execFileSync("git", ["diff", "--quiet", "--", "xhs-collect.user.js"], { cwd: ROOT, stdio: "ignore" });
} catch (e) {
  console.warn("[check] 注意：产物与已提交版本不同，记得 git add xhs-collect.user.js");
}
