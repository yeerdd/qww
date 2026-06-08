# Code Repository Navigator / 代码仓库导航台

这是一个本地网页工具，用来查看这个工作区里的代码仓库。它不需要安装依赖，也不需要启动服务器，直接打开 `index.html` 就能用。

## 怎么用

1. 打开 `index.html` 查看导航台。
2. 如果文件或 Git 状态变了，运行下面的命令刷新扫描数据：

```powershell
powershell -ExecutionPolicy Bypass -File .\scripts\scan-workspace.ps1
```

扫描脚本会生成 `data/repos.js`，网页打开时会自动读取它。

## 怎么保存个人状态

网页里的收藏、进行中、阻塞和备注会先存在浏览器本地。想把它们备份到项目里，可以这样做：

1. 在网页里点击“导出状态文件”，得到 `personal-state.json`。
2. 把导出的文件放到项目的 `data/personal-state.json`。
3. 运行下面的命令，把 JSON 转成网页能自动读取的 JS 文件：

```powershell
powershell -ExecutionPolicy Bypass -File .\scripts\sync-personal-state.ps1
```

运行后会更新 `data/personal-state.js`。下次打开 `index.html`，网页会自动加载这些个人状态。

## 这些文件有什么用

- `index.html` 是网页入口，双击打开它。
- `app.js` 是网页逻辑，比如筛选、详情面板、收藏、备注和中英切换。
- `styles.css` 是网页样式。
- `scripts/scan-workspace.ps1` 是扫描脚本，用来重新生成仓库数据。
- `scripts/sync-personal-state.ps1` 是状态同步脚本，用来把 JSON 状态文件转成网页能自动读取的 JS 状态文件。
- `data/repos.js` 是扫描出来的仓库列表和 Git 状态。
- `data/personal-state.js` 是网页启动时自动读取的个人状态，比如收藏、进行中、阻塞和备注。
- `data/personal-state.json` 是导入/导出用的状态文件，方便把个人状态备份或带到别的地方。

## 网页能看什么

- 每个仓库的分支、最新提交、是否有未提交修改、最后更新时间。
- 语言和文件类型分布。
- 项目入口提示，比如 `package.json`、`pyproject.toml`、`Cargo.toml`、`go.mod` 和 README。
- 源代码里的 TODO / FIXME 笔记。
- 搜索、语言筛选、Git 状态筛选和排序。
- 快速筛选：全部仓库、我的重点、收藏、进行中、已阻塞。
- 技术栈信号：包管理器、锁文件、自动化配置和测试入口。
- 可复制的路径、命令、README 预览和文件树。
- 个人工作状态：收藏、稍后处理、进行中、阻塞和备注。
- 内置中文 / 英文切换。
- 支持导入 / 导出 `data/personal-state.json`，方便备份个人状态。
