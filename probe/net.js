/* 探针：抓接口请求体
 *
 * 用法
 *   1. 收藏页 F12 → Console → 整段粘贴 → 回车
 *   2. 在页面上做一次要观察的动作（收藏 / 移动专辑 / 切专辑）
 *   3. 回到 Console 敲 __xhsNet()
 *
 * 只记 /api/sns/web/ 的请求。结果打印成表格 + JSON，并复制到剪贴板。
 * 接口清单与字段含义见 AGENTS.md。
 */
(() => {
  if (window.__xhsNetInstalled) {
    console.log("已经装过了，直接敲 __xhsNet()（要重装先刷新页面）");
    return;
  }
  window.__xhsNetInstalled = true;

  const recs = [];
  const RE = /\/api\/sns\/web\//;
  const MAX_BODY = 2000;

  function push(kind, method, url, body) {
    let b = "";
    try { b = body ? String(body).slice(0, MAX_BODY) : ""; } catch (e) { b = "<无法读取>"; }
    recs.push({
      t: new Date().toISOString(),
      kind: kind,
      method: String(method || "GET").toUpperCase(),
      url: String(url),
      body: b,
    });
  }

  // ---- fetch ----
  const oFetch = window.fetch;
  window.fetch = function (input, init) {
    try {
      const url = typeof input === "string" ? input : (input && input.url);
      if (url && RE.test(url)) push("fetch", (init && init.method) || "GET", url, init && init.body);
    } catch (e) {}
    return oFetch.apply(this, arguments);
  };

  // ---- XMLHttpRequest ----
  const oOpen = XMLHttpRequest.prototype.open;
  const oSend = XMLHttpRequest.prototype.send;
  XMLHttpRequest.prototype.open = function (m, u) {
    this.__xhsNet = { m: m, u: u };
    return oOpen.apply(this, arguments);
  };
  XMLHttpRequest.prototype.send = function (b) {
    try {
      if (this.__xhsNet && RE.test(String(this.__xhsNet.u))) {
        push("xhr", this.__xhsNet.m, this.__xhsNet.u, b);
      }
    } catch (e) {}
    return oSend.apply(this, arguments);
  };

  window.__xhsNet = () => {
    if (!recs.length) {
      console.log("一条都没抓到。先去做一次操作（收藏 / 移动专辑），再敲 __xhsNet()");
      return;
    }
    const short = (u) => String(u).replace(/^.*?\/api\//, "/api/");
    console.table(recs.map((r, i) => ({ "#": i, kind: r.kind, method: r.method, url: short(r.url), body: r.body.slice(0, 90) })));

    const text = recs
      .map((r, i) => "#" + i + " " + r.kind + " " + r.method + " " + short(r.url) + (r.body ? "\n    body: " + r.body : ""))
      .join("\n");
    console.log("%c=== 请求明细 ===\n" + text, "font-family:monospace");

    const json = JSON.stringify(recs, null, 2);
    try { copy(json); console.log("\n[已复制 JSON 到剪贴板]"); } catch (e) { console.log("\n[复制失败，手动选中上面的明细]"); }
  };

  window.__xhsNetClear = () => { recs.length = 0; console.log("已清空"); };

  console.log("请求体 hook 已装好。去做一次操作，然后敲 __xhsNet()");
})();
