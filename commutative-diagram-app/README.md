# 交换图画布 Hana App 1.5.2

此目录是可打包的 Hana v2 App。通过扩展管理器安装，不直接修改 Hana 安装目录。

- UI：ui/editor.html；入口 index.js；版本 manifest.json 与 package.json 保持一致。
- 核心画布从 ../diagram-drawer 同步，运行 `python ../diagram-drawer/build-hana.py` 生成安装 ZIP。
- 离线资源均随包附带。草稿/snippets 走 Hana 正式 App 存储；复制走剪贴板接口，下载走保存文件接口。
- 权限仅 app/tools.expose-to-model、app/windows.manage、app/ui.clipboard-write。
- 不申请网络、模型调用、进程执行、任意文件读取。
- Ctrl+Q 删除选中对象；无选择不执行；输入框内不拦截。
- 清空按钮和 Ctrl+E 均不再确认，仍可撤销。参数和未应用源码保留。
- 1.5.2 修复双线／三线箭头主体与头部的精确连接；其他箭头绘制保持。

源码、限制、发布说明见仓库根 README 与 releases/v1.5.2.md。第三方许可证在 ui/licenses/。
