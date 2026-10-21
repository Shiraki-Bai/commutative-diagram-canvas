# 首次发布前的本地检查

适用于本仓库首次 v1.5.2 源码快照。

- 使用显式文件白名单从原项目整理，不复制浏览器配置目录、截图、日志或原工作区 Git 配置。
- .gitignore 排除 dist、测试浏览器目录、环境文件、常见私钥与认证文件。
- scripts/scan-secrets.py 对源码和文档检查常见 GitHub token、provider key、私钥头部、带密码 URL；本次未发现匹配。此类扫描不是“绝不含任何敏感信息”的证明。
- 人工审阅顶层目录、待暂存文件及 App manifest 权限。项目只使用宿主授权接口，不含账号令牌或仓库凭据。
- App ZIP 路径检查未包含 .git、.env、浏览器测试配置、auth.json、hosts.yml 或 credentials 文件。
- 发行包仅两份构建产物，另附 SHA256SUMS.txt。安装包中不含用户的图、snippets 私人配置或 Hana 存储草稿。
- 使用 GitHub keyring 的既有登录态；提交使用 GitHub noreply 邮箱，未将凭据写入远程 URL 或源码。

后续发布应重跑扫描、审阅 git diff --cached，不能将本次检查结果视作未来版本的保证。
