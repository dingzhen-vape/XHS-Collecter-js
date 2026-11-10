# XHS-Collecter-js

小红书收藏页的批量归类油猴脚本：在收藏页每张笔记右上角加一个勾选框，用侧边栏把它们一次性移动到指定专辑。

不需要逐个点开笔记、点收藏、选专辑、再确认。

## 效果

- 收藏页每张卡片右上角出现圆形勾选框，点击勾选，不会跳转详情
- 右侧悬浮球可拖动，点开是可收起的侧边栏，面板本身也能拖动
- 侧边栏选目标专辑，点「开始归类」，逐篇调用官方接口移动
- 进度条 + 日志，每篇的结果和错误都会列出来
- 中途可以停止，已完成的不会重复处理

## 安装

先装 [Tampermonkey](https://www.tampermonkey.net/)，然后任选一种：

1. 打开 [`xhs-collect.user.js`](./xhs-collect.user.js)，点 Raw，Tampermonkey 会自动弹出安装页
2. 或者下载后拖进浏览器窗口

## 使用

1. 打开自己的收藏页：`https://www.xiaohongshu.com/user/profile/<你的uid>?tab=fav&subTab=note`
2. 点右下角悬浮球展开侧边栏（默认收起，第一次会自动读取你的专辑列表）
3. 在「目标专辑」下拉里选一个专辑
4. 勾选要归类的笔记，点「开始归类」

归类是**移动**：笔记会从原专辑里消失，进入目标专辑。第一次建议只勾一篇试。

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
├── xhs-collect.user.js   构建产物（压缩），发给用户的就是这个
├── build.mjs             构建脚本
├── package.json
└── src
    ├── main-src.js       脚本自身的逻辑：勾选框、侧边栏、拖动、批量任务
    ├── signing.js        XYS 签名实现（来自 @lucasygu/redbook）
    ├── crypto-shim.js    node:crypto 的浏览器替身
    ├── md5.js            纯 JS MD5
    ├── fingerprint-data.js  签名用的指纹常量表
    ├── buffer-shim.js    Buffer 兼容（旧入口用）
    └── inject-buffer.js  esbuild --inject 的注入点
```

## 构建

```bash
npm install
npm run build            # 生成压缩版 xhs-collect.user.js
npm run build:readable   # 生成未压缩版，方便阅读
```

想改功能只改 `src/main-src.js`，然后重新 `npm run build`。不要直接改 `xhs-collect.user.js`，那是产物。

## 已知限制

- 归类是移动不是复制，没有撤销，选错专辑只能手动移回来
- 一篇一次请求，30 篇大约 20 秒，故意串行 + 间隔，避免触发风控
- 接口随时可能变，签名算法绑定了当前的 `v4.3.1` 版本；如果全部返回 `300011`，多半是站点升级了签名

## 免责

仅供个人整理收藏使用。请控制频率，别拿去做批量操作，账号风险自负。
