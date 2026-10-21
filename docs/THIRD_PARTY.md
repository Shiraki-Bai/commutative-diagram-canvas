# 第三方资源与来源

本仓库不将第三方代码声明为自有，也不改变其许可。

| 资源 | 版本/来源 | 许可副本 |
|---|---|---|
| MathJax tex-svg.js | 3.2.2；https://cdn.jsdelivr.net/npm/mathjax@3.2.2/es5/tex-svg.js | ui/licenses/MathJax-Apache-2.0.txt |
| Acorn | 8.14.0；https://cdn.jsdelivr.net/npm/acorn@8.14.0/dist/acorn.js | ui/licenses/Acorn-MIT.txt |
| Hana 浏览器 SDK | 从公开 Hana App SDK 分发样例取得：https://github.com/youyongdemao/HanaAgent-prompt-optimizer/blob/main/sdk/ui.js | ui/licenses/SDK-distribution-MIT.txt；同时附 HanaAgent-Apache-2.0.txt 供上游归属查阅 |

上述路径以 commutative-diagram-app 为根。SDK 文件未被本项目修改；其 upstream 类型与接口以当前 Hana 主机为准。

MathJax 与 Acorn 在画布源码和 App 构建目录各有一份，构建时同步，避免运行时下载。单文件 HTML 中也保留许可文本。不使用外部图片、字体 CDN 或在线编译服务。

对 SDK 的 MIT 分发说明不等于替上游全部代码重新许可；原文件自带版权与许可标记继续保留。
