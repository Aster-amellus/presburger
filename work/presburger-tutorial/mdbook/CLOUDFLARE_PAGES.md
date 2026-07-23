# Cloudflare Pages 原生构建

本书由 Cloudflare Pages 的 Git 集成构建和发布。Pages 项目使用仓库根目录作为 Root directory；不要创建第二条 GitHub Actions 上传链路。

在 Cloudflare 控制台的 Pages 项目中填写：

| 配置项 | 值 |
| --- | --- |
| Production branch | `main` |
| Framework preset | `None` |
| Root directory | 仓库根目录（留空） |
| Build command | `bash work/presburger-tutorial/mdbook/cloudflare-pages-build.sh` |
| Build output directory | `outputs/presburger-algebra-polyhedral-analysis-mdbook/book` |
| Node.js version | `22`（或 Pages v3 默认的 Node 22） |

不要填写单独的 Deploy command。构建脚本会下载固定的 mdBook 0.4.52，以临时目录安装固定的 `mdbook-i18n-helpers 0.3.5`，再安装 `package-lock.json` 锁定的依赖，并运行测试、内容契约检查和双语 mdBook 构建；Cloudflare Pages 随后自动上传上述输出目录。构建产物根目录为中文，完整 Català 版本位于 `/ca/`，每页工具栏可在中文与 Català 间保留同一页和锚点地切换。

每次推送到 `main` 都会触发生产部署；仓库内 Pull Request 会由 Pages 生成预览部署。首次成功发布后，在 Pages 项目的 **Custom domains** 中添加 `presburger.asters.cat`。
