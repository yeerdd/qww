# Code Repository Navigator

A local, dependency-free dashboard for scanning and browsing repositories under this workspace.

## Use

Open `index.html` in a browser to view the navigator.

To refresh repository data:

```powershell
powershell -ExecutionPolicy Bypass -File .\scripts\scan-workspace.ps1
```

The scanner writes `data/repos.js`, which is loaded by the dashboard without a dev server.

## What It Shows

- Repository cards with branch, latest commit, dirty status, and last modified time
- Language and file-type breakdowns
- Entry-point hints such as `package.json`, `pyproject.toml`, `Cargo.toml`, `go.mod`, and README files
- TODO/FIXME notes from source files
- Search, language filters, and status filters
