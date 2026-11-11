/* 探针：抓真实请求头（重点看签名头）
 *
 * 用法
 *   1. 收藏页 F12 → Console → 整段粘贴 → 回车
 *   2. 在页面上操作一次（收藏 / 移动专辑 / 切到专辑 tab）
 *   3. 回到 Console 敲 __xhsHeaders()
 *
 * 关注的头：X-s（签名）、X-t（时间戳）、X-S-Common（指纹）、x-b3-traceid、x-xray-traceid。
 * 键名大小写在不同版本里不统一，脚本内部按小写比对。
 */
(() => {
  if (window.__xhsHeadersInstalled) {
    console.log("已经装过了，直接敲 __xhsHeaders()（要重装先刷新页面）");
    return;
  }
  window.__xhsHeadersInstalled = true;

  const recs = [];
  const RE = /\/api\/sns\/web\//;

  function snapshot(kind, method, url, headers, body) {
    const h = {};
    try {
      for (const k of Object.keys(headers || {})) h[k] = headers[k];
    } catch (e) {}
    let b = "";
    try { b = body ? String(body).slice(0, 800) : ""; } catch (e) {}
    recs.push({ t: new Date().toISOString(), kind: kind, method: String(method || "GET").toUpperCase(), url: String(url), headers: h, body: b });
  }

  // ---- XHR：先记 open，再累积 setRequestHeader，send 时快照 ----
  const oOpen = XMLHttpRequest.prototype.open;
  const oSet = XMLHttpRequest.prototype.setRequestHeader;
  const oSend = XMLHttpRequest.prototype.send;

  XMLHttpRequest.prototype.open = function (m, u) {
    this.__xhsH = { m: m, u: u, h: {} };
    return oOpen.apply(this, arguments);
  };
  XMLHttpRequest.prototype.setRequestHeader = function (k, v) {
    try { if (this.__xhsH) this.__xhsH.h[k] = v; } catch (e) {}
    return oSet.apply(this, arguments);
  };
  XMLHttpRequest.prototype.send = function (b) {
    try {
      if (this.__xhsH && RE.test(String(this.__xhsH.u))) {
        snapshot("xhr", this.__xhsH.m, this.__xhsH.u, this.__xhsH.h, b);
      }
    } catch (e) {}
    return oSend.apply(this, arguments);
  };

  // ---- fetch ----
  const oFetch = window.fetch;
  window.fetch = function (input, init) {
    try {
      const url = typeof input === "string" ? input : (input && input.url);
      if (url && RE.test(url)) {
        const h = {};
        const hd = (init && init.headers) || (input && input.headers);
        if (hd) {
          if (typeof hd.forEach === "function") hd.forEach((v, k) => { h[k] = v; });
          else if (Array.isArray(hd)) hd.forEach((p) => { h[p[0]] = p[1]; });
          else for (const k of Object.keys(hd)) h[k] = hd[k];
        }
        snapshot("fetch", (init && init.method) || "GET", url, h, init && init.body);
      }
    } catch (e) {}
    return oFetch.apply(this, arguments);
  };

  function pick(h, name) {
    const want = String(name).toLowerCase();
    for (const k of Object.keys(h || {})) if (k.toLowerCase() === want) return h[k];
    return undefined;
  }

  const WATCH = ["x-s", "x-t", "x-s-common", "x-b3-traceid", "x-xray-traceid", "content-type", "accept"];

  window.__xhsHeaders = () => {
    if (!recs.length) {
      console.log("一条都没抓到。先去做一次操作（收藏 / 移动专辑），再敲 __xhsHeaders()");
      return;
    }
    const lines = [];
    const P = (s) => lines.push(s);
    const short = (u) => String(u).replace(/^.*?\/api\//, "/api/");

    P("=== 捕获 " + recs.length + " 条 ===");
    recs.forEach((r, i) => {
      P("");
      P("#" + i + " [" + r.kind + "] " + r.method + " " + short(r.url));
      P("  全部头(" + Object.keys(r.headers).length + "): " + Object.keys(r.headers).join(", "));
      for (const n of WATCH) {
        const v = pick(r.headers, n);
        if (v === undefined) continue;
        const s = String(v);
        P("  " + n + ": " + (s.length > 120 ? s.slice(0, 120) + "…(共 " + s.length + " 字符)" : s));
      }
      if (r.body) P("  body: " + r.body);
    });

    P("");
    P("=== 结论 ===");
    const common = recs.filter((r) => pick(r.headers, "x-s-common") !== undefined);
    P("带 X-S-Common: " + common.length + "/" + recs.length);
    const xs = recs.map((r) => pick(r.headers, "x-s")).filter((v) => v !== undefined);
    const prefixes = [...new Set(xs.map((v) => String(v).slice(0, 4)))];
    P("带 X-s: " + xs.length + "，前缀: " + (prefixes.length ? prefixes.join(" ") : "（无）"));
    if (prefixes.some((p) => p.indexOf("XYW") === 0)) {
      P("!! 出现了 XYW_ 前缀：这是旧签名，接口会返回 300011");
    }
    if (common.length >= 2) {
      const a = String(pick(common[0].headers, "x-s-common"));
      const b = String(pick(common[1].headers, "x-s-common"));
      P("两条 X-S-Common: " + (a === b ? "完全相同（可跨请求复用）" : "不同（含随机数或请求相关信息）"));
    }

    const text = lines.join("\n");
    console.log(text);

    const json = JSON.stringify(recs, null, 2);
    try { copy(json); console.log("\n[已复制 JSON 到剪贴板]"); } catch (e) { console.log("\n[复制失败，手动选中上面的文本]"); }
  };

  window.__xhsHeadersClear = () => { recs.length = 0; console.log("已清空"); };

  console.log("请求头 hook 已装好。去做一次操作，然后敲 __xhsHeaders()");
})();
