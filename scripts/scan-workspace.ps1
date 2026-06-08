param(
  [string]$Workspace = (Resolve-Path ".").Path,
  [string]$Output = "data/repos.js"
)

$ErrorActionPreference = "Stop"

$languageByExtension = @{
  ".astro" = "Astro"; ".bat" = "Batch"; ".c" = "C"; ".cpp" = "C++"; ".cs" = "C#";
  ".css" = "CSS"; ".dart" = "Dart"; ".go" = "Go"; ".h" = "C/C++ Header"; ".html" = "HTML";
  ".java" = "Java"; ".js" = "JavaScript"; ".jsx" = "JavaScript"; ".json" = "JSON";
  ".kt" = "Kotlin"; ".lua" = "Lua"; ".md" = "Markdown"; ".php" = "PHP"; ".ps1" = "PowerShell";
  ".py" = "Python"; ".rb" = "Ruby"; ".rs" = "Rust"; ".scss" = "SCSS"; ".sh" = "Shell";
  ".sql" = "SQL"; ".svelte" = "Svelte"; ".swift" = "Swift"; ".toml" = "TOML"; ".ts" = "TypeScript";
  ".tsx" = "TypeScript"; ".txt" = "Text"; ".vue" = "Vue"; ".xml" = "XML"; ".yaml" = "YAML"; ".yml" = "YAML"
}

$entryPointNames = @(
  "package.json", "pnpm-workspace.yaml", "pyproject.toml", "Cargo.toml", "go.mod", "pom.xml", "build.gradle",
  "README.md", "readme.md", "LICENSE", "license", ".github", "index.html", "main.py", "app.py", "server.js",
  "main.go", "vite.config.ts", "vite.config.js", "next.config.js", "next.config.mjs", "docker-compose.yml",
  "docker-compose.yaml", "Makefile", "Procfile"
)

$ignoredPathPattern = "\\.git\\|\\data\\|\\node_modules\\|\\dist\\|\\build\\|\\.next\\|\\.venv\\|\\vendor\\|\\target\\|coverage\\|out\\|bin\\|obj\\"

function Convert-ToRelativePath {
  param([string]$Base, [string]$Path)
  $resolvedBase = (Resolve-Path $Base).Path.TrimEnd("\")
  $resolvedPath = (Resolve-Path $Path).Path.TrimEnd("\")
  if ($resolvedBase -eq $resolvedPath) {
    return "."
  }
  $baseUri = [Uri]($resolvedBase + "\")
  $pathUri = [Uri]$resolvedPath
  $relative = $baseUri.MakeRelativeUri($pathUri).ToString()
  return [Uri]::UnescapeDataString($relative).Replace("/", "\")
}

function Get-GitValue {
  param([string]$RepoPath, [string[]]$GitArgs)
  try {
    $value = git -C $RepoPath @GitArgs 2>$null
    if ($LASTEXITCODE -eq 0) {
      return ($value -join " ").Trim()
    }
  } catch {
    return ""
  }
  return ""
}

function Get-GitStatusDetails {
  param([string]$RepoPath)

  $details = [ordered]@{
    changed = 0
    staged = 0
    untracked = 0
  }

  try {
    $lines = @(git -C $RepoPath status --porcelain 2>$null)
    if ($LASTEXITCODE -ne 0) { return $details }

    foreach ($line in $lines) {
      if (-not $line) { continue }
      if ($line.StartsWith("??")) {
        $details.untracked++
        continue
      }

      $indexState = if ($line.Length -ge 1) { $line.Substring(0, 1) } else { " " }
      $workTreeState = if ($line.Length -ge 2) { $line.Substring(1, 1) } else { " " }
      if ($indexState -ne " ") { $details.staged++ }
      if ($workTreeState -ne " ") { $details.changed++ }
    }
  } catch {}

  return $details
}

function Get-GitTrackingDetails {
  param([string]$RepoPath)

  $details = [ordered]@{
    upstream = ""
    ahead = 0
    behind = 0
  }

  $upstream = Get-GitValue -RepoPath $RepoPath -GitArgs @("rev-parse", "--abbrev-ref", "--symbolic-full-name", "@{upstream}")
  if (-not $upstream) { return $details }

  $details.upstream = $upstream

  try {
    $counts = git -C $RepoPath rev-list --left-right --count "$upstream...HEAD" 2>$null
    if ($LASTEXITCODE -eq 0 -and $counts) {
      $parts = ($counts -join " ").Trim() -split "\s+"
      if ($parts.Count -ge 2) {
        $details.behind = [int]$parts[0]
        $details.ahead = [int]$parts[1]
      }
    }
  } catch {}

  return $details
}

function New-LookupSet {
  param([object[]]$Files)
  $set = @{}
  foreach ($file in $Files) {
    $set[$file.Name.ToLowerInvariant()] = $true
  }
  return $set
}

function Get-RelativeNames {
  param([object[]]$Files, [string]$RepoPath)
  return @($Files | ForEach-Object { Convert-ToRelativePath -Base $RepoPath -Path $_.FullName })
}

function Get-PackageManager {
  param([hashtable]$NameSet)
  if ($NameSet.ContainsKey("pnpm-lock.yaml")) { return "pnpm" }
  if ($NameSet.ContainsKey("yarn.lock")) { return "yarn" }
  if ($NameSet.ContainsKey("bun.lockb") -or $NameSet.ContainsKey("bun.lock")) { return "bun" }
  if ($NameSet.ContainsKey("package-lock.json")) { return "npm" }
  if ($NameSet.ContainsKey("composer.lock")) { return "composer" }
  if ($NameSet.ContainsKey("poetry.lock")) { return "poetry" }
  if ($NameSet.ContainsKey("cargo.lock")) { return "cargo" }
  if ($NameSet.ContainsKey("go.sum")) { return "go" }
  if ($NameSet.ContainsKey("gemfile.lock")) { return "bundler" }
  return "none"
}

function Get-LockFiles {
  param([hashtable]$NameSet)
  $knownLocks = @(
    "package-lock.json", "pnpm-lock.yaml", "yarn.lock", "bun.lockb", "bun.lock",
    "poetry.lock", "Cargo.lock", "go.sum", "Gemfile.lock", "composer.lock"
  )
  return @($knownLocks | Where-Object { $NameSet.ContainsKey($_.ToLowerInvariant()) })
}

function Get-AutomationSignals {
  param([string[]]$RelativeNames)
  $signals = New-Object System.Collections.Generic.List[string]
  if ($RelativeNames | Where-Object { $_ -match "^\.github\\workflows\\" } | Select-Object -First 1) {
    $signals.Add("GitHub Actions") | Out-Null
  }
  if ($RelativeNames | Where-Object { $_ -match "azure-pipelines" } | Select-Object -First 1) {
    $signals.Add("Azure Pipelines") | Out-Null
  }
  if ($RelativeNames | Where-Object { $_ -match "circleci" } | Select-Object -First 1) {
    $signals.Add("CircleCI") | Out-Null
  }
  if ($RelativeNames | Where-Object { $_ -match "docker-compose\.(ya?ml)$|dockerfile$" } | Select-Object -First 1) {
    $signals.Add("Docker") | Out-Null
  }
  if ($RelativeNames | Where-Object { $_ -match "(^|\\)makefile$" } | Select-Object -First 1) {
    $signals.Add("Make") | Out-Null
  }
  if ($RelativeNames | Where-Object { $_ -match "vercel\.json|netlify\.toml" } | Select-Object -First 1) {
    $signals.Add("Deploy config") | Out-Null
  }
  return @($signals.ToArray())
}

function Get-TestTargets {
  param([string[]]$RelativeNames, [hashtable]$NameSet)
  $targets = New-Object System.Collections.Generic.List[string]
  if ($RelativeNames | Where-Object { $_ -match "\\tests?\\|\.test\.|\.spec\." } | Select-Object -First 1) {
    $targets.Add("Test files") | Out-Null
  }
  if ($NameSet.ContainsKey("pytest.ini")) {
    $targets.Add("pytest") | Out-Null
  }
  if ($NameSet.ContainsKey("vitest.config.ts") -or $NameSet.ContainsKey("vitest.config.js")) {
    $targets.Add("Vitest") | Out-Null
  }
  if ($NameSet.ContainsKey("jest.config.js") -or $NameSet.ContainsKey("jest.config.ts")) {
    $targets.Add("Jest") | Out-Null
  }
  if ($NameSet.ContainsKey("playwright.config.ts") -or $NameSet.ContainsKey("playwright.config.js")) {
    $targets.Add("Playwright") | Out-Null
  }
  return @($targets.ToArray())
}

function Get-StackHints {
  param([hashtable]$NameSet, [object[]]$Languages)
  $hints = New-Object System.Collections.Generic.List[string]
  if ($NameSet.ContainsKey("package.json")) { $hints.Add("JavaScript app") | Out-Null }
  if ($NameSet.ContainsKey("pyproject.toml")) { $hints.Add("Python project") | Out-Null }
  if ($NameSet.ContainsKey("cargo.toml")) { $hints.Add("Rust crate") | Out-Null }
  if ($NameSet.ContainsKey("go.mod")) { $hints.Add("Go module") | Out-Null }
  if ($NameSet.ContainsKey("index.html") -and -not $NameSet.ContainsKey("package.json")) { $hints.Add("Static app") | Out-Null }
  if ($NameSet.ContainsKey("next.config.js") -or $NameSet.ContainsKey("next.config.mjs")) { $hints.Add("Next.js") | Out-Null }
  if ($NameSet.ContainsKey("vite.config.ts") -or $NameSet.ContainsKey("vite.config.js")) { $hints.Add("Vite") | Out-Null }
  if ($NameSet.ContainsKey("docker-compose.yml") -or $NameSet.ContainsKey("docker-compose.yaml")) { $hints.Add("Containerized") | Out-Null }
  if (-not $hints.Count -and $Languages.Count -gt 0) {
    $hints.Add($Languages[0].name) | Out-Null
  }
  return @($hints.ToArray() | Select-Object -Unique)
}

function Get-ReadmePreview {
  param([object[]]$Files, [string]$RepoPath)
  $readme = $Files | Where-Object { $_.Name -match "^readme(\..+)?$" } | Select-Object -First 1
  if (-not $readme) { return $null }
  try {
    $lines = Get-Content -Path $readme.FullName -TotalCount 28 -ErrorAction Stop |
      Where-Object { $_.Trim() } |
      Select-Object -First 8
    return [ordered]@{
      absolutePath = $readme.FullName
      file = Convert-ToRelativePath -Base $RepoPath -Path $readme.FullName
      preview = (($lines -join "`n").Trim())
    }
  } catch {
    return [ordered]@{
      absolutePath = $readme.FullName
      file = Convert-ToRelativePath -Base $RepoPath -Path $readme.FullName
      preview = ""
    }
  }
}

function Get-PackageScripts {
  param([string]$RepoPath, [string]$PackageManager)
  $packagePath = Join-Path $RepoPath "package.json"
  if (-not (Test-Path $packagePath)) { return @() }
  try {
    $package = Get-Content -Raw -Path $packagePath | ConvertFrom-Json
    if (-not $package.scripts) { return @() }
    $runner = if ($PackageManager -and $PackageManager -ne "none") { $PackageManager } else { "npm" }
    return $package.scripts.PSObject.Properties |
      Sort-Object Name |
      ForEach-Object {
        [ordered]@{
          name = "$runner run $($_.Name)"
          command = "$runner run $($_.Name)"
          category = "script"
        }
      }
  } catch {
    return @()
  }
}

function Add-Command {
  param(
    [System.Collections.Generic.List[object]]$Commands,
    [string]$Name,
    [string]$Command,
    [string]$Category = "command"
  )
  if (-not $Command) { return }
  $existing = $Commands | Where-Object { $_.command -eq $Command } | Select-Object -First 1
  if ($existing) { return }
  $Commands.Add([ordered]@{ name = $Name; command = $Command; category = $Category }) | Out-Null
}

function Get-RecommendedCommands {
  param([object[]]$Files, [string]$RepoPath, [hashtable]$NameSet, [string[]]$RelativeNames)
  $commands = New-Object System.Collections.Generic.List[object]
  $packageManager = Get-PackageManager -NameSet $NameSet

  if ($NameSet.ContainsKey("package.json")) {
    $installCommand = switch ($packageManager) {
      "pnpm" { "pnpm install" }
      "yarn" { "yarn install" }
      "bun" { "bun install" }
      default { "npm install" }
    }
    $testCommand = switch ($packageManager) {
      "pnpm" { "pnpm test" }
      "yarn" { "yarn test" }
      "bun" { "bun test" }
      default { "npm test" }
    }
    Add-Command -Commands $commands -Name "Install dependencies" -Command $installCommand -Category "setup"
    Add-Command -Commands $commands -Name "Run tests" -Command $testCommand -Category "test"
  }

  if ($NameSet.ContainsKey("pyproject.toml")) {
    Add-Command -Commands $commands -Name "Install project" -Command "pip install -e ." -Category "setup"
  }
  if ($NameSet.ContainsKey("requirements.txt")) {
    Add-Command -Commands $commands -Name "Install requirements" -Command "pip install -r requirements.txt" -Category "setup"
  }
  if ($NameSet.ContainsKey("cargo.toml")) {
    Add-Command -Commands $commands -Name "Run Rust tests" -Command "cargo test" -Category "test"
  }
  if ($NameSet.ContainsKey("go.mod")) {
    Add-Command -Commands $commands -Name "Run Go tests" -Command "go test ./..." -Category "test"
  }
  if ($NameSet.ContainsKey("makefile")) {
    Add-Command -Commands $commands -Name "List make targets" -Command "make help" -Category "automation"
  }
  if ($RelativeNames | Where-Object { $_ -match "\\tests?\\|\.test\.|\.spec\." } | Select-Object -First 1) {
    Add-Command -Commands $commands -Name "Run detected tests" -Command "Run detected test command for this stack" -Category "test"
  }

  foreach ($script in (Get-PackageScripts -RepoPath $RepoPath -PackageManager $packageManager)) {
    Add-Command -Commands $commands -Name $script.name -Command $script.command -Category $script.category
  }

  return @($commands.ToArray() | Select-Object -First 12)
}

function Get-HealthSignals {
  param([string[]]$RelativeNames, [hashtable]$NameSet)
  $joined = ($RelativeNames -join "`n").ToLowerInvariant()
  return @(
    [ordered]@{ label = "README"; present = $NameSet.ContainsKey("readme.md") },
    [ordered]@{ label = "Tests"; present = [bool]($joined -match "\\tests?\\|\.test\.|\.spec\.|pytest|playwright\.config|vitest\.config|jest\.config") },
    [ordered]@{ label = "CI"; present = [bool]($joined -match "\\.github\\workflows\\|azure-pipelines|circleci|gitlab-ci") },
    [ordered]@{ label = "License"; present = [bool]($NameSet.ContainsKey("license") -or $NameSet.ContainsKey("license.md")) },
    [ordered]@{ label = "Dependencies"; present = [bool]($NameSet.ContainsKey("package.json") -or $NameSet.ContainsKey("pyproject.toml") -or $NameSet.ContainsKey("requirements.txt") -or $NameSet.ContainsKey("cargo.toml") -or $NameSet.ContainsKey("go.mod") -or $NameSet.ContainsKey("pom.xml")) },
    [ordered]@{ label = "Lockfile"; present = [bool]((Get-LockFiles -NameSet $NameSet).Count) }
  )
}

function Get-FileTree {
  param([object[]]$Files, [string]$RepoPath)
  return $Files |
    Sort-Object FullName |
    Select-Object -First 120 |
    ForEach-Object { Convert-ToRelativePath -Base $RepoPath -Path $_.FullName }
}

function Get-RepositoryInfo {
  param([string]$RepoPath, [string]$WorkspacePath)

  $files = Get-ChildItem -Path $RepoPath -Recurse -File -Force |
    Where-Object { $_.FullName -notmatch $ignoredPathPattern }

  $languageCounts = @{}
  foreach ($file in $files) {
    $ext = $file.Extension.ToLowerInvariant()
    if ($languageByExtension.ContainsKey($ext)) {
      $language = $languageByExtension[$ext]
      $languageCounts[$language] = 1 + [int]($languageCounts[$language])
    }
  }

  $languages = $languageCounts.GetEnumerator() |
    Sort-Object -Property Value -Descending |
    ForEach-Object { [ordered]@{ name = $_.Key; files = $_.Value } }

  $entryPoints = $files |
    Where-Object { $entryPointNames -contains $_.Name } |
    Select-Object -First 16 |
    ForEach-Object { Convert-ToRelativePath -Base $RepoPath -Path $_.FullName }

  $relativeNames = Get-RelativeNames -Files $files -RepoPath $RepoPath
  $nameSet = New-LookupSet -Files $files

  $todos = @()
  foreach ($file in ($files | Where-Object { $languageByExtension.ContainsKey($_.Extension.ToLowerInvariant()) } | Select-Object -First 500)) {
    try {
      $matches = Select-String -Path $file.FullName -Pattern "(//|#|/\*|<!--|;)\s*(TODO|FIXME)\s*[:\-]" -CaseSensitive:$false -SimpleMatch:$false -ErrorAction SilentlyContinue
      foreach ($match in $matches | Select-Object -First 3) {
        $todos += [ordered]@{
          file = Convert-ToRelativePath -Base $RepoPath -Path $file.FullName
          line = $match.LineNumber
          text = $match.Line.Trim()
        }
      }
    } catch {}
    if ($todos.Count -ge 8) { break }
  }

  $branch = Get-GitValue -RepoPath $RepoPath -GitArgs @("branch", "--show-current")
  if (-not $branch) { $branch = "detached" }

  $status = Get-GitValue -RepoPath $RepoPath -GitArgs @("status", "--porcelain")
  $statusDetails = Get-GitStatusDetails -RepoPath $RepoPath
  $tracking = Get-GitTrackingDetails -RepoPath $RepoPath
  $latestCommit = Get-GitValue -RepoPath $RepoPath -GitArgs @("log", "-1", "--pretty=%h %s")
  $latestCommitAuthor = Get-GitValue -RepoPath $RepoPath -GitArgs @("log", "-1", "--pretty=%an")
  $latestCommitWhen = Get-GitValue -RepoPath $RepoPath -GitArgs @("log", "-1", "--date=iso", "--pretty=%cd")
  $recentCommits = @(git -C $RepoPath log -5 --pretty="%h%x09%cr%x09%s" 2>$null | ForEach-Object {
    $parts = $_ -split "`t", 3
    if ($parts.Count -eq 3) {
      [ordered]@{ hash = $parts[0]; when = $parts[1]; subject = $parts[2] }
    }
  })

  $lastModified = ($files | Sort-Object LastWriteTime -Descending | Select-Object -First 1).LastWriteTime
  if (-not $lastModified) { $lastModified = (Get-Item $RepoPath).LastWriteTime }

  $commands = @(Get-RecommendedCommands -Files $files -RepoPath $RepoPath -NameSet $nameSet -RelativeNames $relativeNames)
  $locks = @(Get-LockFiles -NameSet $nameSet)
  $tests = @(Get-TestTargets -RelativeNames $relativeNames -NameSet $nameSet)
  $automation = @(Get-AutomationSignals -RelativeNames $relativeNames)

  [ordered]@{
    name = Split-Path $RepoPath -Leaf
    path = Convert-ToRelativePath -Base $WorkspacePath -Path $RepoPath
    absolutePath = $RepoPath
    branch = $branch
    dirty = [bool]$status
    lastModified = $lastModified.ToUniversalTime().ToString("o")
    latestCommit = $latestCommit
    latestCommitAuthor = $latestCommitAuthor
    latestCommitWhen = $latestCommitWhen
    languages = @($languages)
    entryPoints = @($entryPoints)
    todos = @($todos)
    readme = Get-ReadmePreview -Files $files -RepoPath $RepoPath
    commands = $commands
    health = Get-HealthSignals -RelativeNames $relativeNames -NameSet $nameSet
    recentCommits = @($recentCommits)
    fileTree = @(Get-FileTree -Files $files -RepoPath $RepoPath)
    insights = [ordered]@{
      packageManager = Get-PackageManager -NameSet $nameSet
      automation = $automation
      locks = $locks
      testTargets = $tests
      stackHints = @(Get-StackHints -NameSet $nameSet -Languages $languages)
    }
    metrics = [ordered]@{
      fileCount = $files.Count
      todoCount = $todos.Count
      commandCount = $commands.Count
      entryPointCount = $entryPoints.Count
    }
    git = [ordered]@{
      staged = $statusDetails.staged
      changed = $statusDetails.changed
      untracked = $statusDetails.untracked
      upstream = $tracking.upstream
      ahead = $tracking.ahead
      behind = $tracking.behind
    }
  }
}

$workspacePath = (Resolve-Path $Workspace).Path
$gitDirs = Get-ChildItem -Path $workspacePath -Recurse -Force -Directory -Filter ".git" |
  Where-Object { $_.FullName -notmatch "\\.git\\.+\\.git$" }

if (Test-Path (Join-Path $workspacePath ".git")) {
  $repoPaths = @($workspacePath)
} else {
  $repoPaths = @()
}

$repoPaths += $gitDirs |
  ForEach-Object { Split-Path $_.FullName -Parent } |
  Where-Object { $_ -ne $workspacePath } |
  Sort-Object -Unique

$repositories = foreach ($repoPath in $repoPaths) {
  Get-RepositoryInfo -RepoPath $repoPath -WorkspacePath $workspacePath
}

$payload = [ordered]@{
  scannedAt = (Get-Date).ToUniversalTime().ToString("o")
  workspace = $workspacePath
  repositories = @($repositories)
}

$json = $payload | ConvertTo-Json -Depth 10
$outputPath = Join-Path $workspacePath $Output
$outputDir = Split-Path $outputPath -Parent
if (-not (Test-Path $outputDir)) {
  New-Item -ItemType Directory -Path $outputDir | Out-Null
}

"window.REPO_NAV_DATA = $json;" | Set-Content -Path $outputPath -Encoding UTF8
Write-Host "Wrote $outputPath"
