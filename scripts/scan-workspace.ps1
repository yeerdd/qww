param(
  [string]$Workspace = (Resolve-Path ".").Path,
  [string]$Output = "data/repos.js"
)

$ErrorActionPreference = "Stop"

$languageByExtension = @{
  ".cs" = "C#"; ".css" = "CSS"; ".go" = "Go"; ".html" = "HTML"; ".java" = "Java";
  ".js" = "JavaScript"; ".jsx" = "JavaScript"; ".json" = "JSON"; ".kt" = "Kotlin";
  ".md" = "Markdown"; ".php" = "PHP"; ".ps1" = "PowerShell"; ".py" = "Python";
  ".rb" = "Ruby"; ".rs" = "Rust"; ".scss" = "SCSS"; ".sh" = "Shell";
  ".sql" = "SQL"; ".swift" = "Swift"; ".ts" = "TypeScript"; ".tsx" = "TypeScript";
  ".vue" = "Vue"; ".yaml" = "YAML"; ".yml" = "YAML"
}

$entryPointNames = @(
  "package.json", "pyproject.toml", "Cargo.toml", "go.mod", "pom.xml", "build.gradle",
  "README.md", "readme.md", "LICENSE", "license", ".github", "index.html", "main.py", "app.py", "server.js", "main.go"
)

$ignoredPathPattern = "\\.git\\|\\data\\|\\node_modules\\|\\dist\\|\\build\\|\\.next\\|\\.venv\\|\\vendor\\|\\target\\"

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

function Get-ReadmePreview {
  param([object[]]$Files, [string]$RepoPath)
  $readme = $Files | Where-Object { $_.Name -match "^readme(\..+)?$" } | Select-Object -First 1
  if (-not $readme) { return $null }
  try {
    $lines = Get-Content -Path $readme.FullName -TotalCount 28 -ErrorAction Stop |
      Where-Object { $_.Trim() } |
      Select-Object -First 8
    return [ordered]@{
      file = Convert-ToRelativePath -Base $RepoPath -Path $readme.FullName
      preview = (($lines -join "`n").Trim())
    }
  } catch {
    return [ordered]@{
      file = Convert-ToRelativePath -Base $RepoPath -Path $readme.FullName
      preview = ""
    }
  }
}

function Get-PackageScripts {
  param([string]$RepoPath)
  $packagePath = Join-Path $RepoPath "package.json"
  if (-not (Test-Path $packagePath)) { return @() }
  try {
    $package = Get-Content -Raw -Path $packagePath | ConvertFrom-Json
    if (-not $package.scripts) { return @() }
    return $package.scripts.PSObject.Properties |
      Sort-Object Name |
      ForEach-Object { [ordered]@{ name = "npm run $($_.Name)"; command = $_.Value } }
  } catch {
    return @()
  }
}

function Get-RecommendedCommands {
  param([object[]]$Files, [string]$RepoPath)
  $names = @{}
  foreach ($file in $Files) { $names[$file.Name] = $true }

  $commands = New-Object System.Collections.Generic.List[object]
  if ($names.ContainsKey("package.json")) {
    $commands.Add([ordered]@{ name = "Install"; command = "npm install" }) | Out-Null
  }
  if ($names.ContainsKey("pyproject.toml")) {
    $commands.Add([ordered]@{ name = "Install"; command = "pip install -e ." }) | Out-Null
  }
  if ($names.ContainsKey("requirements.txt")) {
    $commands.Add([ordered]@{ name = "Install"; command = "pip install -r requirements.txt" }) | Out-Null
  }
  if ($names.ContainsKey("Cargo.toml")) {
    $commands.Add([ordered]@{ name = "Test"; command = "cargo test" }) | Out-Null
  }
  if ($names.ContainsKey("go.mod")) {
    $commands.Add([ordered]@{ name = "Test"; command = "go test ./..." }) | Out-Null
  }
  if (($Files | Where-Object { $_.Name -match "pytest|test|spec" } | Select-Object -First 1)) {
    $commands.Add([ordered]@{ name = "Test"; command = "Run detected test command for this stack" }) | Out-Null
  }

  foreach ($script in (Get-PackageScripts -RepoPath $RepoPath)) {
    $commands.Add($script) | Out-Null
  }
  return @($commands.ToArray() | Select-Object -First 10)
}

function Get-HealthSignals {
  param([object[]]$Files)
  $relativeNames = $Files | ForEach-Object { $_.FullName.ToLowerInvariant() }
  $fileNames = $Files | ForEach-Object { $_.Name.ToLowerInvariant() }

  return @(
    [ordered]@{ label = "README"; present = [bool]($fileNames | Where-Object { $_ -match "^readme" } | Select-Object -First 1) },
    [ordered]@{ label = "Tests"; present = [bool]($relativeNames | Where-Object { $_ -match "\\tests?\\|\.test\.|\.spec\.|pytest" } | Select-Object -First 1) },
    [ordered]@{ label = "CI"; present = [bool]($relativeNames | Where-Object { $_ -match "\\.github\\workflows\\|\\azure-pipelines|\\circleci|\\gitlab-ci" } | Select-Object -First 1) },
    [ordered]@{ label = "License"; present = [bool]($fileNames | Where-Object { $_ -match "^license" } | Select-Object -First 1) },
    [ordered]@{ label = "Dependencies"; present = [bool]($fileNames | Where-Object { $_ -match "package.json|pyproject.toml|requirements.txt|cargo.toml|go.mod|pom.xml" } | Select-Object -First 1) }
  )
}

function Get-FileTree {
  param([object[]]$Files, [string]$RepoPath)
  return $Files |
    Sort-Object FullName |
    Select-Object -First 80 |
    ForEach-Object { Convert-ToRelativePath -Base $RepoPath -Path $_.FullName }
}

function Get-RepositoryInfo {
  param([string]$RepoPath, [string]$WorkspacePath)

  $files = Get-ChildItem -Path $RepoPath -Recurse -File -Force |
    Where-Object {
      $_.FullName -notmatch $ignoredPathPattern
    }

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
    Select-Object -First 12 |
    ForEach-Object { Convert-ToRelativePath -Base $RepoPath -Path $_.FullName }

  $todos = @()
  foreach ($file in ($files | Where-Object { $languageByExtension.ContainsKey($_.Extension.ToLowerInvariant()) } | Select-Object -First 400)) {
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
  $latestCommit = Get-GitValue -RepoPath $RepoPath -GitArgs @("log", "-1", "--pretty=%h %s")
  $recentCommits = @(git -C $RepoPath log -5 --pretty="%h%x09%cr%x09%s" 2>$null | ForEach-Object {
    $parts = $_ -split "`t", 3
    if ($parts.Count -eq 3) {
      [ordered]@{ hash = $parts[0]; when = $parts[1]; subject = $parts[2] }
    }
  })

  $lastModified = ($files | Sort-Object LastWriteTime -Descending | Select-Object -First 1).LastWriteTime
  if (-not $lastModified) { $lastModified = (Get-Item $RepoPath).LastWriteTime }

  [ordered]@{
    name = Split-Path $RepoPath -Leaf
    path = Convert-ToRelativePath -Base $WorkspacePath -Path $RepoPath
    branch = $branch
    dirty = [bool]$status
    lastModified = $lastModified.ToUniversalTime().ToString("o")
    latestCommit = $latestCommit
    languages = @($languages)
    entryPoints = @($entryPoints)
    todos = @($todos)
    readme = Get-ReadmePreview -Files $files -RepoPath $RepoPath
    commands = @(Get-RecommendedCommands -Files $files -RepoPath $RepoPath)
    health = Get-HealthSignals -Files $files
    recentCommits = @($recentCommits)
    fileTree = @(Get-FileTree -Files $files -RepoPath $RepoPath)
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

$json = $payload | ConvertTo-Json -Depth 8
$outputPath = Join-Path $workspacePath $Output
$outputDir = Split-Path $outputPath -Parent
if (-not (Test-Path $outputDir)) {
  New-Item -ItemType Directory -Path $outputDir | Out-Null
}

"window.REPO_NAV_DATA = $json;" | Set-Content -Path $outputPath -Encoding UTF8
Write-Host "Wrote $outputPath"
