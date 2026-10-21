# 交换图画布 · Commutative Diagram Canvas

离线可视化编辑交换图，提供 Hana App 与单文件 HTML 两种交付。当前版本 **1.5.2**。

## 使用

从仓库的 GitHub Releases 下载：

- `交换图画布-HanaApp-1.5.2.zip`：在 Hana 的扩展管理中安装并确认权限。
- `交换图画布-1.5.2.html`：直接用 Edge / Chrome 打开，无需 Python、Hana 或本机 LaTeX。

节点／箭头通过鼠标编辑，支持弯箭头、自环、双线／三线共用头部、单射和满射。可编辑并应用受支持的 tikz-cd 源码，导出带 tikz 围栏的完整代码。

快捷键：Ctrl+Z 撤销，Ctrl+L 定位，Ctrl+E 直接清空，Ctrl+S 下载代码，Ctrl+Q 删除选中对象。输入区域保留正常编辑按键，不触发画布快捷操作。

## 目录

```text
diagram-drawer/               # 画布源码、构建与测试
commutative-diagram-app/      # Hana App manifest、入口与随包资源
releases/v1.5.2.md            # 对应标签及 Release 的中文公告
docs/                        # 架构、版本和第三方说明
dist/                        # 本机构建产物，Git 忽略；发布时作为附件上传
```

`diagram-drawer` 是画布逻辑的编辑源。App 的 `ui` 保留构建副本，便于直接检视安装包；修改画布后需要运行两个构建脚本同步。不要手改 Hana 已安装的应用目录。

## 构建

开发环境需要 Python 3；没有 pip/npm 依赖：

```sh
python diagram-drawer/build.py
python diagram-drawer/build-hana.py
```

版本取自 `commutative-diagram-app/manifest.json`，两份产物写入 `dist/`。运行成品不需要 Python。应用程序与安装包不携带本机账号、令牌或浏览器测试数据。

## 测试

Node.js 22+（浏览器测试使用全局 WebSocket / fetch）；本次验证环境为 Node.js 24。

```sh
node diagram-drawer/parser-tests.cjs
node diagram-drawer/geometry-tests.cjs
node diagram-drawer/joint-tests.cjs
node diagram-drawer/test-hana-entry.cjs
node diagram-drawer/test.cjs
python scripts/scan-secrets.py
```

最后一个浏览器回归脚本默认使用 Windows Edge，可设置 `BROWSER_PATH` 指向本机 Chromium/Edge 可执行文件。它创建独立测试配置目录，均被 `.gitignore` 排除；不能替代所有设备上的兼容性验证。

## 已知边界

- 画布是结构预览，最终排版以 TeX 为准。源码解析不是任意 TikZ 编译器，不支持的样式会明确拒绝。
- Snippets 内置 18 条起步规则；可导入数据型配置，不执行函数。重复编号镜像、嵌套占位符等暂不兼容，会报告未启用条目。
- Hana App 使用应用存储；HTML 使用当前浏览器存储，两者不会自动互相迁移。可用源码复制／应用迁移图。
- App 当前是一个共享工作区，避免多窗口同时修改同一稿。
- 旧格式草稿第一次加载时会备份并一次对齐默认字号 small / footnotesize；之后的显式字号设置会保留。

## 发布与许可

首次入库从可验证的 **v1.5.2** 开始，不伪造此前 Git 历史，不补写未授权的历史 Releases。后续遵循 [版本规则](docs/VERSIONING.md)。

此仓库按用户要求为私有；项目自有代码暂未额外授予开源许可。第三方资源保留自身许可，见 [第三方说明](docs/THIRD_PARTY.md) 和 App 随包的 `ui/licenses/`。
