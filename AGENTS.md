# AGENTS.md

给接手这个仓库的 agent 看的。人也可以看，但 README 是给使用者写的，这里是给改代码的人写的。

## 这是什么

一个油猴脚本：在小红书收藏页给每张笔记加勾选框，然后用侧边栏把它们批量移进某个专辑。
全部走小红书自己的 Web 接口，不点页面按钮。难点只有一个：接口要求 `x-s` / `x-s-common` 签名。

## 先跑这三条

```bash
npm install
npm run verify     # 构建 + 元数据检查 + 签名回归
npm run build      # 只构建，产物 xhs-collect.user.js
```

`npm run verify` = `scripts/check.mjs` + `scripts/verify-sign.mjs`。改完代码先跑它，再去浏览器验证。

## 目录

| 路径 | 是什么 |
| --- | --- |
| `src/main-src.js` | 脚本逻辑，唯一手改的源文件 |
| `src/signing.js` | XYS 签名实现，移植自 @lucasygu/redbook，别改 |
| `src/crypto-shim.js` | `node:crypto` 的浏览器替身（md5 + randomBytes） |
| `src/md5.js` | 纯 JS MD5（WebCrypto 不提供 md5） |
| `src/fingerprint-data.js` | 签名用的指纹常量表 |
| `src/inject-buffer.js` | esbuild `--inject` 的注入点，一行 export |
| `build.mjs` | 构建脚本，esbuild CLI |
| `xhs-collect.user.js` | 产物，未压缩，别手改 |
| `scripts/check.mjs` | 构建 + 语法 + 元数据 + 版本一致性 |
| `scripts/verify-sign.mjs` | 钉死随机源后比对 `scripts/golden.json` |

## 硬约束

1. **产物不压缩**。打包是必须的（要把签名模块和 Buffer 塞进单文件），压缩不是。用户要能对着源码读。
2. **不手改产物**。改 `src/main-src.js`，然后 `npm run build`。
3. **`@grant none` 不能动**。脚本要在页面主世界跑，用 `document.cookie` 和 `fetch` 带 cookie。
4. **不引运行时依赖**。除了 buffer（打包进去），不加新包。
5. **`@license` 行不能删**。写成 `MIT; https://opensource.org/licenses/MIT`：Tampermonkey 认 SPDX 标识符，Greasy Fork 认这个格式并会链到许可证全文。`scripts/check.mjs` 会在缺失时报错。

## 接口（全部打到 `https://edith.xiaohongshu.com`）

| 方法 | 路径 | body / query | 用途 |
| --- | --- | --- | --- |
| GET | `/api/sns/web/v1/board/user` | `user_id, num, page` | 专辑列表 |
| GET | `/api/sns/web/v1/board/note` | `board_id, num, cursor` | 某个专辑里的笔记，卡片左上角标签靠它反查 |
| GET | `/api/sns/web/v2/note/collect/page` | `num, cursor, user_id` | 收藏页列表（当前用不到，扩展时有用） |
| POST | `/api/sns/web/v1/note/move` | `{target_board_id, notes_id}` | 移入专辑，核心接口 |
| POST | `/api/sns/web/v1/note/collect` | `{note_id}` | 收藏，收进默认收藏夹 |
| POST | `/api/sns/web/v1/note/uncollect` | `{note_ids}` | 取消收藏，字段是复数 ids 但值为单个字符串 |

响应约定：`code === 0` 或 `success === true` 才算成功，否则拿 `msg` 报错。
失败最常见的是 `code=300011 当前账号存在异常`，那是签名不对，不是账号真有问题。

「重新收藏置顶」= uncollect → collect → move 三步。收藏列表按收藏时间倒序，接口没有改时间的能力，只能重收一次拿新时间。

## 签名，唯一容易崩的地方

- 页面上的 `window._webmsxyw` 产出 **`XYW_`** 前缀（旧版，AES-128-CBC + 静态密钥），当前接口要 **`XYS_`** 前缀（v4.3.1，144 字节 payload + 自定义 Base64）。名字里的 `xyw` 就说明它是旧签名器。直接调它永远 `300011`。
- 站点自己的 XYS 签名器被 JSVMP 保护（页面上那 20 个 `_<32位十六进制>` 全局都是同一个虚拟机派发入口），静态扫不到、调不出，别在这上面浪费时间。
- 所以自己实现。调用约定：

```js
signMainApi(method, uri, cookies, params, payload, timestamp, signLocation)
// cookies 只需 {a1}，从 document.cookie 取
// GET 时 params 传对象（自动拼 query）；POST 时 payload 传**对象**
//   传字符串会被 JSON.stringify 二次转义，签名对不上
// timestamp 是**秒**（Date.now() / 1000）
// 返回 { "x-s", "x-s-common", "x-t", "x-b3-traceid", "x-xray-traceid" }，键名小写
```

`scripts/verify-sign.mjs` 把 `Math.random`、`Date.now`、`crypto.randomBytes` 全部钉死后比对五个头。
它只能证明实现没被改坏，不能证明服务端还认。后者必须在浏览器里点侧边栏的「自检」。

## 页面 DOM 事实（实测，改版后要重新确认）

- 卡片：`section.note-item`，每张带 `data-note-id`，取 noteId 用这个属性最稳
- 卡片里的链接指向 `/user/profile/{uid}/{noteId}?xsec_token=...`，**不是** `/explore/`，别用 href 解析 noteId（`noteIdOf()` 里那个是兜底）
- **卡片上没有收藏按钮**，hover 也不出现，所以 DOM 路线走不通
- 收藏页 URL 形如 `/user/profile/{uid}?tab=fav&subTab=note`；点开笔记会盖弹窗并把 URL 改成 `/explore/{id}`，页面内容不变，所以别只看 URL 判断「是不是收藏页」
- 勾选框是 `div.xhs-pick` 不是 `<input>`：原生控件被站点全局样式污染，封面又被 `<a>` 覆盖。用 CSS `::after` 画勾，click 捕获阶段 `stopPropagation` 防跳转
- 侧边栏在 Shadow DOM（`#xhs-picker-host`）里，隔离站点样式；拖动只绑 `.hd`，否则会吞掉下拉框和按钮
- 专辑标签 `div.xhs-board-tag` 贴在卡片左上角，数据来自 `loadBoardMap()`：逐个专辑翻 `board/note` 直到 `has_more === false`，拼出 `noteId -> [专辑名]`。翻页上限 `CFG.BOARD_MAX_PAGES`，自动扫描只读 3 页，按钮读全
- 星标单击 = `starCollect()` → `POST note/collect`（默认收藏动作），不碰专辑；拖动 >12px 才弹菜单，位移 >4px 即视为拖动、松手不收藏。两个阈值分开是为了避免手抖误触
- 星标 `div.xhs-star` 是 `.like-wrapper` 的第一个子节点（心形图标左边）。别改成 footer 的兄弟节点：footer 用 flex/`space-between` 排布，插成兄弟会被挤到离点赞很远；塞进 `.like-wrapper` 才保证紧贴。找不到 `.like-wrapper` 才退回绝对定位（`.xhs-star.abs`，右下角）
- 按住星标向右拖 12px 弹出专辑列表（另一个 Shadow DOM：`#xhs-quick-host`），松手命中哪项就归哪。**没有**用 `setPointerCapture`，否则 `elementFromPoint` 命中不到菜单项；改成 document 级 pointermove + `shadowRoot.elementFromPoint()` 自己做命中测试
- `scan()` 里第一张卡片出现后 600ms 自动跑一次 `loadBoardMap()`（`state.autoTagged` 保证每次页面加载只跑一次），不用等展开面板

## 改动的标准流程

1. 改 `src/main-src.js`
2. `npm run verify`
3. Tampermonkey 里重新导入 `xhs-collect.user.js`（点 Raw 覆盖）
4. 打开自己的收藏页，点侧边栏「自检」，应该绿字列出专辑
5. 只勾 1 篇试跑，确认日志和列表都对，再批量

## 环境陷阱（踩过的）

- **esbuild 的 JS API 会 EPERM**（需要管道拉子进程）。用 CLI + `stdio: "inherit"`，`build.mjs` 已经是这么写的。
- 同理，任何需要 `stdio: "pipe"` 的子进程调用在受限环境里都会 EPERM。
- **别用 PowerShell `Get-Content -Raw` 把大文件读进变量再写回**：工具输出超长会被截断，结果是文件开头被吃掉、语法直接坏掉。用 node 读写文件。
- 生成代码时别在模板字符串里塞反引号，容易把模板本身搞坏。用单引号字符串数组 `join("\n")`，或者用 `fs.appendFileSync` 分段追加。
- 字符串里有英文撇号（比如报错原文）时，那一行改用双引号，否则单引号字符串会被截断，报 `Expected ',', got 'ident'`。
- `Buffer` 用 esbuild `--inject:src/inject-buffer.js` 注入，**不要**写 `globalThis.Buffer = ...`，那会污染页面。
- 这台机器 PowerShell 禁用了脚本执行，`npm` 会报 `npm.ps1 因为在此系统上禁止运行脚本`，用 `npm.cmd`。
- 沙箱里 git 推送需要凭据时 `credential.helper` 起不来（报 sh.exe couldn't create signal pipe），推送交给用户在本机终端做。仓库配置了 `http.proxy=http://127.0.0.1:7897` 和 `http.sslBackend=openssl`，因为这台机器 schannel 直连 GitHub 会报 `SEC_E_NO_CREDENTIALS`。

## 排障

| 症状 | 先查 |
| --- | --- |
| `code=300011` | 签名。跑 `npm run check:sign`，再确认 `@grant none`、a1 取到了 |
| 取不到 a1 | 没登录，或 cookie 被浏览器策略挡了 |
| 专辑下拉是空的 | 点「自检」看报错。`user_id` 从 URL 拿，必须站在自己的收藏页 |
| 勾选框不出现 | 不在收藏页（判断逻辑见 `favContext()`），或卡片结构变了 |
| 归类成功但列表没变 | 前端有缓存，刷新页面看 |

## 还没做的

- `notes_id` 能不能逗号分隔一次移动多篇（试出来能快几倍）
- 撤销上一次归类（需要事先记下每篇原来的 board_id）
- 跨批次累积勾选
- 归类后把卡片从列表移除
