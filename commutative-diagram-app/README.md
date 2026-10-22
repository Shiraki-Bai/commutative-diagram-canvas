# 交换图画布 Hana App 1.6.0（统一版本）

按用户要求将此前开发编号 1.8.1 的完整功能统一标记为 1.6.0，不回退功能。manifest、package、入口日志及发布文件名一致。

此目录是可打包的 Hana v2 App。通过扩展管理器安装，不直接修改 Hana 安装目录。应用 id 与存储键未改变，不删除旧草稿或命名记录。

## 能力

- SVG 交换图可视化编辑、弯箭头、自环、双线／三线共用头部、单射和满射。
- 节点与箭头名称自动聚焦；当前输入过程中不反复抢焦点。
- 保存中央命名弹窗、载入名称搜索列表，完整保存可编辑模型、样式、布局、视图和源码草稿。
- 载入整体撤销恢复原草稿，不合并两份图；保存记录可删除并在当前会话 Ctrl+Z 恢复。
- Ctrl+Z 撤销、Ctrl+L 定位、Ctrl+E 直接清空、Ctrl+S 下载代码、Ctrl+Q 删除选中对象。文本输入区域不触发画布热键。
- 离线依赖随包附带；草稿和命名记录使用正式 App 存储；复制和下载使用正式接口。

## 安装与构建

UI 为 ui/editor.html，入口为 index.js。画布从 ../diagram-drawer 同步，运行 `python ../diagram-drawer/build-hana.py` 构建 ZIP。已装开发编号更高的版本若提示降级，请按本次授权通过正式安装确认处理，不卸载数据绕过。

权限仍只有 app/tools.expose-to-model、app/windows.manage、app/ui.clipboard-write；不申请网络、模型、进程或任意文件读取。

第三方许可位于 ui/licenses。说明和累计更新公告见仓库根 README、docs/SAVED-DIAGRAMS.md、releases/v1.6.0.md。

以后默认仅递增末位（1.6.0→1.6.1）；中间位只在用户明确要求时调整。
