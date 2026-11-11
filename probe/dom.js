/* 探针：dump 收藏页 DOM 结构
 *
 * 用法
 *   1. 打开自己的收藏页（/user/profile/{uid}?tab=fav&subTab=note）
 *   2. F12 → Console → 整段粘贴 → 回车
 *   3. 结果自动复制到剪贴板，贴给维护者
 *
 * 输出
 *   候选选择器命中数 / 第一张卡片 outerHTML / 卡片内 a[href]
 *   / class 去重 / hover 是否新增元素
 */
(async () => {
  const out = [];
  const P = (s) => out.push(s);
  const cut = (s, n) => (s && s.length > n ? s.slice(0, n) + "…" : (s || ""));
  const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

  P("URL: " + location.href);
  P("时间: " + new Date().toISOString());

  P("");
  P("=== 1. 候选选择器命中数 ===");
  const sels = [
    "section.note-item",
    ".note-item",
    "[data-note-id]",
    "a[href*='/explore/']",
    ".like-wrapper",
    "[class*='collect']",
    "[class*='board']",
  ];
  for (const sel of sels) {
    let n;
    try { n = document.querySelectorAll(sel).length; } catch (e) { n = "选择器无效: " + e.message; }
    P("  " + sel + " → " + n);
  }

  const card = document.querySelector("section.note-item") || document.querySelector(".note-item");
  if (!card) {
    P("");
    P("!! 没找到卡片。确认当前是收藏页，并往下滚动几屏再跑。");
    console.log(out.join("\n"));
    return;
  }

  P("");
  P("=== 2. 第一张卡片 outerHTML（空白已压） ===");
  P(cut(card.outerHTML.replace(/\s+/g, " "), 3000));

  P("");
  P("=== 3. 卡片内所有 a[href] ===");
  [...card.querySelectorAll("a")].forEach((a) => {
    const cls = typeof a.className === "string" ? a.className : "";
    P("  " + cut(a.getAttribute("href"), 100) + "   [class=" + cls + "]");
  });

  P("");
  P("=== 4. 卡片内 class 去重 ===");
  const seen = new Set();
  [...card.querySelectorAll("*")].forEach((el) => {
    const cls = typeof el.className === "string" ? el.className.trim() : "";
    if (!cls || seen.has(cls)) return;
    seen.add(cls);
    P("  " + el.tagName.toLowerCase() + "." + cls.replace(/\s+/g, "."));
  });

  P("");
  P("=== 5. hover 增量（等 700ms） ===");
  const before = new Set([...card.querySelectorAll("*")]);
  card.dispatchEvent(new MouseEvent("mouseenter", { bubbles: true }));
  card.dispatchEvent(new MouseEvent("mouseover", { bubbles: true }));
  await sleep(700);
  const added = [...card.querySelectorAll("*")].filter((e) => !before.has(e));
  if (!added.length) {
    P("  没有新增元素（说明收藏入口不在卡片上，必须走接口）");
  } else {
    added.slice(0, 20).forEach((e) => {
      const cls = typeof e.className === "string" ? e.className.trim() : "";
      P("  + " + e.tagName.toLowerCase() + (cls ? "." + cls.replace(/\s+/g, ".") : ""));
    });
  }

  const text = out.join("\n");
  console.log(text);
  try { copy(text); console.log("\n[已复制到剪贴板]"); } catch (e) { console.log("\n[复制失败，手动选中上面的输出]"); }
})();
