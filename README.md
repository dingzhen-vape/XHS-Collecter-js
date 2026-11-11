# XHS-Collector-js

用于小红书收藏页(主页)的批量(快捷)归类的油猴脚本

## 效果

- 收藏页每张卡片右上角出现圆形勾选框
- 侧边栏选目标专辑，点击开始移动,自动开始分类
- 可选「归类后置顶」，默认关闭
- 卡片左上角显示所属专辑（白底黑字圆角标签），实时更新
- 点赞数左边星标：按住向右拖，弹出专辑列表，拖到哪个专辑松开就归到哪（单篇快捷操作）
- 单击星标完成默认收藏
<img width="1280" height="668" alt="81b501f9ae98d924624f23693ec5265b" src="https://github.com/user-attachments/assets/35040177-6664-4505-904e-78f6f8fbdbdc" />

## 安装

先装 [Tampermonkey](https://www.tampermonkey.net/)，然后任选一种：

1. 打开 [`xhs-collect.user.js`](./xhs-collect.user.js)，点 Raw，Tampermonkey 会自动弹出安装页
2. 或者下载后拖进浏览器窗口
### greasyfork
[greasyfork](https://greasyfork.org/zh-CN/scripts/604729-%E5%B0%8F%E7%BA%A2%E4%B9%A6%E6%94%B6%E8%97%8F%E6%89%B9%E9%87%8F%E5%BD%92%E7%B1%BB)

## 使用

1. 打开自己的收藏页
2. 点右下角悬浮球展开侧边栏（会自动读取你的专辑列表）
3. 在「目标专辑」下拉里选一个专辑
4. 勾选要归类的笔记，点「开始归类」

归类是**移动**：笔记会从原专辑里消失，进入目标专辑。第一次建议只勾一篇试。

单篇可以更快：按住点赞旁边的星标不松手，向右拖出专辑列表，鼠标停在某个专辑上松开，这篇就直接进那个专辑。
拖动过程中不会跳转详情页；取消松在列表外面即可。

星标单击一下执行默认收藏行为

## 为什么需要自己实现签名

小红书的接口要求请求头带 `x-s`、`x-s-common` 等签名，否则返回 `code=300011 当前账号存在异常`。

页面上能直接调到的 `window._webmsxyw` 产出的是 `XYW_` 前缀（旧版，AES-128-CBC + 静态密钥），而现在接口要的是 `XYS_` 前缀（v4.3.1，144 字节 payload + 自定义 Base64）。两者算法不同，所以直接调它会一律失败。

站点自己的签名器已经被 JSVMP 保护（页面上那 20 个 `_<32位十六进制>` 全局都是同一个虚拟机派发入口），反推成本过高。所以这里改用确定性的实现：

- `src/signing.js` 移植自 [@lucasygu/redbook](https://github.com/lucasygu/redbook) 的 `dist/lib/signing.js`（MIT）
- 浏览器没有 Node 的 `crypto` 和 `Buffer`，用 `src/crypto-shim.js`（含纯 JS MD5）和 npm 的 `buffer` 补上
- 打包时用 esbuild 的 `--inject` 注入 `Buffer`，不改动页面的全局变量

签名算法的正确性做过逐字节比对：固定随机源后，本实现与 redbook 原实现在 GET/POST 两类请求上生成的 `x-s`、`x-s-common`、`x-t`、`x-b3-traceid`、`x-xray-traceid` 完全一致。

## 目录结构

```
.
├── xhs-collect.user.js   构建产物（未压缩），安装的就是这个
├── build.mjs             构建脚本
├── package.json
├── probe                 浏览器 Console 用的排查脚本，不参与构建
│   ├── dom.js            dump 卡片 DOM 结构
│   ├── net.js            抓接口请求体
│   └── headers.js        抓真实请求头（签名头）
├── scripts
│   ├── check.mjs          构建 + 元数据自检
│   ├── verify-sign.mjs    签名回归
│   └── golden.json        签名基准（钉死随机源后的五个头）
└── src
    ├── main-src.js       脚本自身的逻辑：勾选框、侧边栏、拖动、批量任务
    ├── signing.js        XYS 签名实现（来自 @lucasygu/redbook）
    ├── crypto-shim.js    node:crypto 的浏览器替身
    ├── md5.js            纯 JS MD5
    ├── fingerprint-data.js  签名用的指纹常量表
    └── inject-buffer.js  esbuild --inject 的注入点
```

## 构建

```bash
npm install
npm run build
```

想改功能只改 `src/main-src.js`，然后重新 `npm run build`。不要直接改 `xhs-collect.user.js`，那是产物。

产物不做压缩：打包只是为了把签名模块和 Buffer 一起塞进单文件，压缩会让人没法对着源码读，没必要。

改代码前先读 [`AGENTS.md`](./AGENTS.md)：里面写了接口清单、签名调用约定、页面 DOM 事实、改动流程和踩过的坑。

```bash
npm run verify     # 构建 + 元数据检查 + 签名回归，改完代码先跑这个
```

## 排查工具（probe/）

三个脚本都是**粘到浏览器 Console 里跑**的，不参与构建，也不用安装。小红书改版、接口报错、标签不对时，用它们取真实数据。

| 文件 | 抓什么 | 用法 |
| --- | --- | --- |
| `probe/dom.js` | 卡片选择器命中数、第一张卡片 `outerHTML`、卡片内 `a[href]`、class 去重、hover 是否新增元素 | 收藏页粘贴即跑，约 1 秒出结果 |
| `probe/net.js` | `fetch` / XHR 发出的 `/api/sns/web/` 请求：method、url、body | 粘贴 → 操作一次 → 敲 `__xhsNet()` |
| `probe/headers.js` | 同样请求的完整请求头，重点 `X-s`、`X-t`、`X-S-Common`、两个 traceid | 粘贴 → 操作一次 → 敲 `__xhsHeaders()` |

`net.js` 和 `headers.js` 会 hook 全局 `fetch` 与 `XMLHttpRequest`，只在当前页面有效，刷新即失效。两个同时装也能用，各记各的。抓到的 JSON 都会尝试复制到剪贴板。

判定规则：`X-s` 应当以 `XYS_` 开头。出现 `XYW_` 说明请求走了页面自带的旧签名函数，接口会返回 `300011`。
## 已知限制

- 归类是移动不是复制，没有撤销，选错专辑只能手动移回来
- 一篇一次请求，30 篇大约 20 秒；开了置顶模式是一篇三次，故意串行 + 间隔，避免触发风控
- 置顶模式会真的取消收藏再重收，中途网络抖动时靠重试兜底，失败的那篇需要手动收藏
- 专辑标签靠 `board/note` 接口反查：逐个专辑翻页读出笔记 id。进收藏页后自动跑一次，专辑多、笔记多时要十几秒才贴满；单专辑翻页上限 30 页（900 篇）
- 标签只贴在已经渲染出来的卡片上，滚动加载前的笔记不会提前显示
- 单击星标只负责「收进默认收藏夹」，不会把笔记从原专辑里挪出来；要换专辑还是用拖动或侧边栏
- 收藏成功后小红书自己的页面状态不会立刻变，刷新才看得到
- 接口随时可能变，签名算法绑定了当前的 `v4.3.1` 版本；如果全部返回 `300011`，多半是站点升级了签名

## 许可证

MIT，见 [LICENSE](./LICENSE)。可以自由使用、修改、分发、商用，保留版权声明即可。

脚本头里的写法是 `// @license MIT; https://opensource.org/licenses/MIT`：Tampermonkey 在脚本详情页会显示它，Greasy Fork 上传时也能识别。
脚本用到的签名实现移植自 [@lucasygu/redbook](https://github.com/lucasygu/redbook)（MIT）。

## 免责

仅供个人整理收藏使用。
整个项目完全由AI生成,可能随时会失效,并且可能带有未被察觉的安全风险,请谨慎安装
