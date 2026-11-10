
import { signMainApi } from "./signing.js";

const HOST = "https://edith.xiaohongshu.com";
const P_BOARDS = "/api/sns/web/v1/board/user";
const P_MOVE = "/api/sns/web/v1/note/move";
const P_COLLECT = "/api/sns/web/v1/note/collect";
const P_UNCOLLECT = "/api/sns/web/v1/note/uncollect";
const P_BOARD_NOTE = "/api/sns/web/v1/board/note";

const CFG = {
  CARD: "section.note-item",
  BOARD_NUM: 30,
  BOARD_PAGES: 2,
  DELAY: 600,
};

const state = {
  selected: new Set(),
  done: new Set(),
  cards: new Map(),
  boards: [],
  boardMap: new Map(),
  mapLoaded: false,
  autoTagged: false,
  tagging: false,
  running: false,
  cancel: false,
  favSeen: false,
  recollect: false,
};

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

function cookie(name) {
  const m = document.cookie.match(new RegExp("(?:^|;\\s*)" + name + "=([^;]*)"));
  return m ? decodeURIComponent(m[1]) : null;
}

function userId() {
  const m = location.pathname.match(/\/user\/profile\/([0-9a-f]{24})/);
  return m ? m[1] : null;
}

function noteIdOf(card) {
  const direct = card.getAttribute("data-note-id");
  if (direct) return direct;
  const a = card.querySelector('a[href*="/explore/"]');
  if (a) {
    const m = (a.getAttribute("href") || "").match(/\/explore\/([0-9a-f]{24})/);
    if (m) return m[1];
  }
  return null;
}

/* ---------------- 接口 ---------------- */

function sign(method, path, params, body) {
  const a1 = cookie("a1");
  if (!a1) throw new Error("取不到 a1 cookie，确认已登录");
  return signMainApi(method, path, { a1 }, params || null, body || null, Date.now() / 1000, location.href);
}

async function api(method, path, params, body) {
  const h = sign(method, path, params, body);
  let url = HOST + path;
  if (params) {
    url += "?" + Object.keys(params).map((k) => k + "=" + encodeURIComponent(params[k])).join("&");
  }
  const headers = Object.assign({ accept: "application/json, text/plain, */*" }, h);
  const opt = { method, headers, credentials: "include" };
  if (body) {
    headers["content-type"] = "application/json;charset=utf-8";
    opt.body = JSON.stringify(body);
  }
  const res = await fetch(url, opt);
  const text = await res.text();
  let j = null;
  try { j = JSON.parse(text); } catch (e) {
    throw new Error("HTTP " + res.status + " 非 JSON 响应: " + text.slice(0, 120));
  }
  if (j.code !== 0 && j.success !== true) {
    throw new Error("code=" + j.code + " " + (j.msg || "(无 msg)"));
  }
  return j.data;
}

async function fetchBoards() {
  const uid = userId();
  if (!uid) throw new Error("取不到 userId，请先打开自己的收藏页");
  const d = await api("GET", P_BOARDS, { user_id: uid, num: CFG.BOARD_NUM, page: 1 });
  return ((d && d.boards) || []).map((b) => ({ id: b.id, name: b.name }));
}

function itemNoteId(n) {
  if (!n) return null;
  return n.note_id || n.id || (n.note_card && n.note_card.note_id) || null;
}

// 反查每篇笔记被归到了哪些专辑：逐个专辑拉笔记列表，拼出 noteId -> [专辑名]
async function loadBoardMap(pages) {
  if (state.tagging) return;
  state.tagging = true;
  const cap = pages || CFG.BOARD_PAGES;
  ui.log("识别专辑中…");
  try {
    if (!state.boards.length) state.boards = await fetchBoards();
    const map = new Map();
    for (const b of state.boards) {
      let cursor = "";
      let n = 0;
      for (let p = 0; p < cap; p++) {
        const d = await api("GET", P_BOARD_NOTE, { board_id: b.id, num: CFG.BOARD_NUM, cursor });
        const list = (d && (d.notes || d.items || d.note_list)) || [];
        for (const it of list) {
          const id = itemNoteId(it);
          if (!id) continue;
          const arr = map.get(id) || [];
          if (arr.indexOf(b.name) < 0) arr.push(b.name);
          map.set(id, arr);
          n++;
        }
        if (!list.length) ui.log("· " + b.name + " 读到 0 篇，返回字段：" + Object.keys(d || {}).join(","), "er");
        cursor = (d && d.cursor) || "";
        if (!cursor || !list.length) break;
        await sleep(200);
      }
      ui.log("· " + b.name + "：读出 " + n + " 篇");
    }
    state.boardMap = map;
    state.mapLoaded = true;
    state.cards.forEach((c, id) => paintTag(id));
    ui.log("识别完成：已有 " + map.size + " 篇归类", "ok");
  } catch (e) {
    ui.log("识别失败：" + e.message, "er");
  } finally {
    state.tagging = false;
  }
}

function moveOne(noteId, boardId) {
  return api("POST", P_MOVE, null, { target_board_id: boardId, notes_id: noteId });
}

// 收藏列表按收藏时间倒序。接口没有「修改收藏时间」的能力，
// 所以要让一篇笔记排到最前，只能取消收藏后再收一次。
async function classifyOne(noteId, boardId, recollect) {
  if (!recollect) {
    await moveOne(noteId, boardId);
    return;
  }
  try {
    await api("POST", P_UNCOLLECT, null, { note_ids: noteId });
  } catch (e) {
    throw new Error("取消收藏失败，未做任何改动: " + e.message);
  }
  await sleep(300);
  let redo = false;
  let lastErr = "";
  for (let i = 0; i < 3 && !redo; i++) {
    try {
      await api("POST", P_COLLECT, null, { note_id: noteId });
      redo = true;
    } catch (e) {
      lastErr = e.message;
      await sleep(500);
    }
  }
  if (!redo) {
    throw new Error("已取消收藏，但重新收藏失败，这篇现在不在收藏里，请手动收藏: " + lastErr);
  }
  await sleep(300);
  try {
    await moveOne(noteId, boardId);
  } catch (e) {
    throw new Error("已重新收藏，但移入目标专辑失败，笔记现在默认收藏夹里: " + e.message);
  }
}

/* ---------------- 卡片上的复选框 ---------------- */

const CARD_CSS = [
  ".xhs-pick{position:absolute;top:8px;right:8px;width:26px;height:26px;border-radius:50%;",
  "background:rgba(0,0,0,.42);border:1.5px solid rgba(255,255,255,.92);z-index:9;cursor:pointer;",
  "display:flex;align-items:center;justify-content:center;transition:background .15s,transform .15s;",
  "box-sizing:border-box;backdrop-filter:blur(2px);-webkit-backdrop-filter:blur(2px)}",
  ".xhs-pick:hover{transform:scale(1.1);background:rgba(0,0,0,.62)}",
  ".xhs-pick::after{content:'';width:10px;height:5px;border-left:2px solid #fff;border-bottom:2px solid #fff;",
  "transform:rotate(-45deg) scale(0);transition:transform .16s;margin-top:-3px}",
  ".xhs-pick.on{background:#ff2e4d;border-color:#ff2e4d}",
  ".xhs-pick.on::after{transform:rotate(-45deg) scale(1)}",
  ".xhs-note-done{opacity:.42}",  ".xhs-board-tag{position:absolute;left:8px;top:8px;z-index:8;background:#fff;color:#111;border-radius:10px;",  "padding:1px 8px;font-size:11px;line-height:18px;font-weight:600;box-shadow:0 1px 6px rgba(0,0,0,.2);",  "max-width:calc(100% - 100px);overflow:hidden;text-overflow:ellipsis;white-space:nowrap;pointer-events:none}",
].join("");

function injectCardCss() {
  if (document.getElementById("xhs-pick-css")) return;
  const st = document.createElement("style");
  st.id = "xhs-pick-css";
  st.textContent = CARD_CSS;
  document.head.appendChild(st);
}

function paint(id) {
  const card = state.cards.get(id);
  if (!card) return;
  const box = card.querySelector(":scope > .xhs-pick");
  if (box) box.classList.toggle("on", state.selected.has(id));
  card.classList.toggle("xhs-note-done", state.done.has(id));
  paintTag(id);
}

// 卡片左上角的专辑名角标：白底黑字圆角，内容为这篇归属的专辑
function paintTag(id) {
  const card = state.cards.get(id);
  if (!card) return;
  const names = state.boardMap.get(id);
  let el = card.querySelector(":scope > .xhs-board-tag");
  if (!names || !names.length) {
    if (el) el.remove();
    return;
  }
  if (!el) {
    el = document.createElement("div");
    el.className = "xhs-board-tag";
    card.appendChild(el);
  }
  const t = names.join(" · ");
  if (el.textContent !== t) {
    el.textContent = t;
    el.title = "已归类：" + t;
  }
}

function toggle(id) {
  if (state.selected.has(id)) state.selected.delete(id);
  else state.selected.add(id);
  paint(id);
  ui.renderCount();
}

function decorate(card) {
  const id = noteIdOf(card);
  if (!id) return;
  state.cards.set(id, card);
  if (card.querySelector(":scope > .xhs-pick")) { paint(id); return; }
  if (getComputedStyle(card).position === "static") card.style.position = "relative";
  const box = document.createElement("div");
  box.className = "xhs-pick";
  box.title = "勾选这篇笔记";
  box.addEventListener("click", (e) => {
    e.preventDefault();
    e.stopPropagation();
    toggle(id);
  }, true);
  box.addEventListener("mousedown", (e) => e.stopPropagation(), true);
  card.appendChild(box);
  paint(id);
}

function scan() {
  if (favContext()) state.favSeen = true;
  if (!state.favSeen) return;
  const cards = document.querySelectorAll(CFG.CARD);
  for (let i = 0; i < cards.length; i++) decorate(cards[i]);

}

function favContext() {
  const sp = new URLSearchParams(location.search);
  if (sp.get("tab") === "fav") return true;
  const t = document.querySelector(".reds-tab-item.active.sub-tab-list");
  return !!(t && /收藏/.test(t.textContent));
}

/* ---------------- 侧边栏 ---------------- */

const UI_CSS = [
  ":host{all:initial}*{box-sizing:border-box}",
  ".wrap{position:fixed;left:0;top:0;width:44px;height:44px;z-index:2147483000;",
  "font-family:-apple-system,BlinkMacSystemFont,'PingFang SC','Microsoft YaHei',sans-serif;",
  "font-size:13px;line-height:1.5;color:#222}",
  ".tab{position:absolute;left:0;top:0;width:44px;height:44px;border-radius:50%;border:0;cursor:grab;background:#ff2e4d;color:#fff;",
  "font-size:18px;box-shadow:0 4px 16px rgba(255,46,77,.4);display:none;align-items:center;justify-content:center;",
  "padding:0;touch-action:none}",
  ".tab:active{cursor:grabbing}",
  ".tab b{position:absolute;top:-4px;right:-4px;min-width:18px;height:18px;border-radius:9px;background:#222;",
  "color:#fff;font-size:11px;line-height:18px;text-align:center;padding:0 4px;font-weight:600}",
  ".tab.show{display:flex}",
  ".panel{position:absolute;right:0;top:0;width:272px;background:#fff;border-radius:12px;box-shadow:0 8px 32px rgba(0,0,0,.16);",
  "border:1px solid rgba(0,0,0,.06);overflow:hidden;transition:opacity .18s,transform .18s}",
  ".panel.hide{display:none}",
  ".hd{display:flex;align-items:center;justify-content:space-between;padding:10px 12px;background:#ff2e4d;color:#fff;",
  "cursor:move;user-select:none;touch-action:none}",
  ".hd b{font-weight:600;font-size:13px}",
  ".hd .n{background:rgba(255,255,255,.28);border-radius:9px;padding:0 7px;font-size:12px;margin-left:auto;margin-right:8px}",
  ".x{cursor:pointer;border:0;background:transparent;color:#fff;font-size:15px;line-height:1;padding:3px 5px;border-radius:6px}",
  ".x:hover{background:rgba(255,255,255,.2)}",
  ".bd{padding:10px 12px 12px}",
  ".lb{color:#888;font-size:12px;margin:0 0 4px}",
  ".ck{display:flex;align-items:center;gap:6px;margin-top:9px;font-size:12px;color:#555;cursor:pointer;user-select:none}",
  ".ck input{width:14px;height:14px;margin:0;flex:none;accent-color:#ff2e4d;cursor:pointer}",
  "select{width:100%;padding:7px 8px;border:1px solid #e3e3e3;border-radius:8px;font-size:13px;",
  "background:#fafafa;outline:none;color:#222}",
  "select:focus{border-color:#ff2e4d}",
  ".row{display:flex;gap:8px;margin-top:8px}",
  ".row>*{flex:1}",
  "button.b{cursor:pointer;border:1px solid #e3e3e3;background:#fff;border-radius:8px;padding:7px 8px;",
  "font-size:12px;color:#333;font-family:inherit}",
  "button.b:hover{background:#f5f5f5}",
  "button.b:disabled{opacity:.45;cursor:not-allowed}",
  "button.p{border:0;background:#ff2e4d;color:#fff;font-weight:600;padding:9px 8px;font-size:13px}",
  "button.p:hover:enabled{background:#e8283f}",
  ".bar{height:4px;background:#f0f0f0;border-radius:2px;overflow:hidden;margin-top:10px;display:none}",
  ".bar.show{display:block}",
  ".bar i{display:block;height:100%;width:0;background:#ff2e4d;transition:width .2s}",
  ".lg{margin-top:10px;max-height:160px;overflow:auto;font-size:12px;color:#555;",
  "font-family:ui-monospace,Consolas,monospace;border-top:1px dashed #eee;padding-top:8px}",
  ".lg div{padding:1px 0;word-break:break-all}",
  ".lg .ok{color:#0a8f45}.lg .er{color:#d0021b}.lg .inf{color:#888}",
].join("");

function buildUI() {
  injectCardCss();
  const host = document.createElement("div");
  host.id = "xhs-picker-host";
  const sr = host.attachShadow({ mode: "open" });
  const st = document.createElement("style");
  st.textContent = UI_CSS;
  sr.appendChild(st);

  const wrap = document.createElement("div");
  wrap.className = "wrap";
  wrap.innerHTML =
    '<button class="tab" title="批量归类">\u2605<b>0</b></button>' +
    '<div class="panel">' +
      '<div class="hd"><b>批量归类</b><span class="n">0</span><button class="x" title="收起">\u2015</button></div>' +
      '<div class="bd">' +
        '<div class="lb">目标专辑</div>' +
        '<select class="board"><option value="">加载中…</option></select>' +
        '<div class="row"><button class="b reload">刷新专辑</button><button class="b test">自检</button></div>' +
        '<div class="row"><button class="b tag">识别专辑</button></div>' +
        '<label class="ck" title="先取消收藏再重新收藏，让这篇排到收藏列表最前面。注意：多一次请求，也更慢"><input type="checkbox" class="rc"><span>归类后重新收藏（置顶）</span></label>' +
        '<div class="row"><button class="b all">全选可见</button><button class="b clear">清空</button></div>' +
        '<div class="row"><button class="b p go">开始归类</button></div>' +
        '<div class="row"><button class="b stop" disabled>停止</button></div>' +
        '<div class="bar"><i></i></div>' +
        '<div class="lg"></div>' +
      '</div>' +
    '</div>';
  sr.appendChild(wrap);

  const q = (s) => wrap.querySelector(s);
  const elPanel = q(".panel");
  const elTab = q(".tab");
  const elBadge = q(".tab b");
  const elSel = q("select.board");
  const elCount = q(".n");
  const elBar = q(".bar");
  const elBarI = q(".bar i");
  const elLog = q(".lg");
  const btnGo = q(".go");
  const btnStop = q(".stop");

  function log(msg, cls) {
    const d = document.createElement("div");
    if (cls) d.className = cls;
    d.textContent = msg;
    elLog.appendChild(d);
    elLog.scrollTop = elLog.scrollHeight;
    while (elLog.children.length > 200) elLog.removeChild(elLog.firstChild);
  }

  function renderCount() {
    elCount.textContent = state.selected.size;
    elBadge.textContent = state.selected.size;
  }

  function setProgress(done, total) {
    if (!total) { elBar.classList.remove("show"); elBarI.style.width = "0"; return; }
    elBar.classList.add("show");
    elBarI.style.width = Math.round((done / total) * 100) + "%";
  }

  function renderBoards() {
    elSel.innerHTML = "";
    if (!state.boards.length) {
      const o = document.createElement("option");
      o.value = "";
      o.textContent = "(没有专辑，点自检)";
      elSel.appendChild(o);
      return;
    }
    state.boards.forEach((b) => {
      const op = document.createElement("option");
      op.value = b.id;
      op.textContent = b.name;
      elSel.appendChild(op);
    });
  }

  elSel.addEventListener("change", () => {
    try { localStorage.setItem("xhs-picker-board", elSel.value); } catch (e) {}
  });

  const elRc = q(".rc");
  try { state.recollect = localStorage.getItem("xhs-picker-recollect") === "1"; } catch (e) {}
  elRc.checked = state.recollect;
  elRc.addEventListener("change", () => {
    state.recollect = elRc.checked;
    try { localStorage.setItem("xhs-picker-recollect", elRc.checked ? "1" : "0"); } catch (e) {}
    log(state.recollect ? "已开启重新收藏：归类时会先取消再收藏" : "已关闭重新收藏：只移动专辑", "inf");
  });

  /* ---------- 拖动与定位 ---------- */

  const PANEL_W = 272;
  const pos = { x: 0, y: 0 };

  function visibleBox() {
    const open = !elPanel.classList.contains("hide");
    return open
      ? { w: PANEL_W, h: elPanel.offsetHeight || 320, dx: 44 - PANEL_W }
      : { w: 44, h: 44, dx: 0 };
  }

  function setPos(x, y) {
    const b = visibleBox();
    x = Math.max(4 - b.dx, Math.min(x, innerWidth - 4 - b.w - b.dx));
    y = Math.max(4, Math.min(y, innerHeight - 4 - b.h));
    pos.x = x;
    pos.y = y;
    wrap.style.left = x + "px";
    wrap.style.top = y + "px";
  }

  function savePos() {
    try { localStorage.setItem("xhs-picker-pos", JSON.stringify(pos)); } catch (e) {}
  }

  function collapse() {
    elPanel.classList.add("hide");
    elTab.classList.add("show");
    setPos(pos.x, pos.y);
  }

  function expand() {
    elPanel.classList.remove("hide");
    elTab.classList.remove("show");
    setPos(pos.x, pos.y);
    // 第一次展开时自动识别一次（每个专辑只读第一页，量小）；之后由「识别专辑」按钮手动触发
    if (!state.mapLoaded && !state.tagging && !state.autoTagged) {
      state.autoTagged = true;
      loadBoardMap(1);
    }
  }

  function draggable(handle, onTap) {
    let sx = 0, sy = 0, ox = 0, oy = 0, active = false, moved = false;
    handle.addEventListener("pointerdown", (e) => {
      if (e.button !== 0) return;
      if (e.target.closest && e.target.closest(".x")) return;
      active = true;
      moved = false;
      sx = e.clientX;
      sy = e.clientY;
      ox = pos.x;
      oy = pos.y;
      try { handle.setPointerCapture(e.pointerId); } catch (err) {}
      e.preventDefault();
    });
    handle.addEventListener("pointermove", (e) => {
      if (!active) return;
      const dx = e.clientX - sx, dy = e.clientY - sy;
      if (!moved && Math.abs(dx) + Math.abs(dy) < 4) return;
      moved = true;
      setPos(ox + dx, oy + dy);
    });
    const end = (e) => {
      if (!active) return;
      active = false;
      try { handle.releasePointerCapture(e.pointerId); } catch (err) {}
      if (moved) savePos();
      else if (onTap) onTap();
    };
    handle.addEventListener("pointerup", end);
    handle.addEventListener("pointercancel", end);
  }

  q(".x").addEventListener("click", collapse);

  async function loadBoards(silent) {
    if (!silent) elSel.innerHTML = '<option value="">读取中…</option>';
    try {
      state.boards = await fetchBoards();
      renderBoards();
      const last = localStorage.getItem("xhs-picker-board");
      if (last && state.boards.some((b) => b.id === last)) elSel.value = last;
      if (!silent) log("专辑 " + state.boards.length + " 个", "ok");
    } catch (e) {
      state.boards = [];
      renderBoards();
      log("读专辑失败: " + e.message, "er");
    }
  }
  q(".reload").addEventListener("click", () => loadBoards(false));
  q(".tag").addEventListener("click", () => loadBoardMap());

  q(".test").addEventListener("click", async () => {
    log("--- 自检 ---", "inf");
    const a1 = cookie("a1");
    log("a1: " + (a1 ? a1.slice(0, 6) + "… (len " + a1.length + ")" : "缺失"), a1 ? "inf" : "er");
    const uid = userId();
    log("userId: " + (uid || "未取到"), uid ? "inf" : "er");
    if (!a1 || !uid) return;
    try {
      await loadBoards(true);
      log("接口可用，专辑 " + state.boards.length + " 个", "ok");
    } catch (e) {
      log("接口失败: " + e.message, "er");
    }
  });

  q(".all").addEventListener("click", () => {
    const cards = document.querySelectorAll(CFG.CARD);
    for (let i = 0; i < cards.length; i++) {
      const id = noteIdOf(cards[i]);
      if (id && !state.done.has(id)) state.selected.add(id);
      if (id) decorate(cards[i]);
    }
    renderCount();
  });

  q(".clear").addEventListener("click", () => {
    state.selected.clear();
    state.cards.forEach((c, id) => paint(id));
    renderCount();
  });

  q(".stop").addEventListener("click", () => {
    state.cancel = true;
    log("已请求停止…", "inf");
  });

  async function run(ids, label) {
    if (state.running) { log("正在跑，先等着", "inf"); return; }
    const boardId = elSel.value;
    if (!boardId) { log("先选一个目标专辑", "er"); return; }
    if (!ids.length) { log("没有勾选任何笔记", "er"); return; }
    state.running = true;
    state.cancel = false;
    btnGo.disabled = true;
    btnStop.disabled = false;
    log("--- " + label + "：" + ids.length + " 篇 ---", "inf");
    if (state.recollect) log("模式：重新收藏并置顶（每篇 3 个请求，会慢一些）", "inf");
    let ok = 0, fail = 0;
    for (let i = 0; i < ids.length; i++) {
      if (state.cancel) { log("已停止，剩余 " + (ids.length - i) + " 篇未处理", "inf"); break; }
      const nid = ids[i];
      try {
        await classifyOne(nid, boardId, state.recollect);
        ok++;
        state.selected.delete(nid);
        state.done.add(nid);
        const op = elSel.options[elSel.selectedIndex];
        if (op && op.textContent) state.boardMap.set(nid, [op.textContent]);
        paint(nid);
        renderCount();
        log((i + 1) + "/" + ids.length + " " + nid + (state.recollect ? " 已归类并置顶" : " 已归类"), "ok");
      } catch (e) {
        fail++;
        log((i + 1) + "/" + ids.length + " " + nid + " 失败: " + e.message, "er");
      }
      setProgress(i + 1, ids.length);
      if (i < ids.length - 1) await sleep(CFG.DELAY);
    }
    log("完成：成功 " + ok + "，失败 " + fail, fail ? "er" : "ok");
    state.running = false;
    btnGo.disabled = false;
    btnStop.disabled = true;
    setTimeout(() => setProgress(0, 0), 1200);
  }

  btnGo.addEventListener("click", () => run(Array.from(state.selected), "开始归类"));

  document.documentElement.appendChild(host);

  ui.log = log;
  ui.renderCount = renderCount;
  ui.expand = expand;
  ui.panelCollapsed = () => elPanel.classList.contains("hide");
  ui.loadBoards = loadBoards;

  renderCount();
  elTab.classList.add("show");

  let savedPos = null;
  try { savedPos = JSON.parse(localStorage.getItem("xhs-picker-pos") || "null"); } catch (e) {}
  if (savedPos && typeof savedPos.x === "number" && typeof savedPos.y === "number") {
    setPos(savedPos.x, savedPos.y);
  } else {
    setPos(innerWidth - 62, 96);
  }

  draggable(elTab, expand);
  draggable(q(".hd"), null);
  window.addEventListener("resize", () => setPos(pos.x, pos.y));

  loadBoards(true);
}

const ui = {
  log: () => {},
  renderCount: () => {},
  expand: () => {},
  panelCollapsed: () => true,
  loadBoards: () => {},
};

/* ---------------- 启动 ---------------- */

function boot() {
  if (document.getElementById("xhs-picker-host")) return;
  buildUI();
  scan();
  const mo = new MutationObserver((muts) => {
    for (let i = 0; i < muts.length; i++) {
      if (muts[i].addedNodes.length) { scan(); return; }
    }
  });
  mo.observe(document.body, { childList: true, subtree: true });
  setInterval(scan, 1500);
  let last = location.href;
  setInterval(() => {
    if (location.href !== last) {
      last = location.href;
      setTimeout(scan, 400);
    }
  }, 500);
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", boot);
} else {
  boot();
}
