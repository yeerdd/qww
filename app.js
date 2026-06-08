(function () {
  const refreshCommand = "powershell -ExecutionPolicy Bypass -File .\\scripts\\scan-workspace.ps1";
  const syncStateCommand = "powershell -ExecutionPolicy Bypass -File .\\scripts\\sync-personal-state.ps1";
  const workspacePath = "C:\\Users\\Fox-OS\\Desktop\\git";
  const scanScriptPath = `${workspacePath}\\scripts\\scan-workspace.ps1`;
  const personalStateKey = "repoNavigator.personalState.v1";
  const languageStateKey = "repoNavigator.language.v1";
  const validPersonalStatuses = new Set(["later", "in_progress", "blocked"]);
  const translations = {
    en: {
      "hero.eyebrow": "Workspace Radar",
      "hero.title": "Code Repository Navigator",
      "hero.lede": "A fast local radar for repo health, entry points, commands, and next actions across this workspace.",
      "hero.copyWorkspace": "Copy workspace path",
      "hero.copyRefresh": "Copy refresh command",
      "hero.copyStateSync": "Copy state sync command",
      "hero.openScanner": "Open scan script",
      "hero.exportState": "Export state file",
      "hero.importState": "Import state file",
      "hero.language": "Language",
      "summary.repos": "Repos",
      "summary.dirty": "Dirty",
      "summary.notes": "Notes",
      "summary.commands": "Commands",
      "workspace.path": "Workspace path",
      "workspace.topStack": "Top stack",
      "workspace.scanStatus": "Scan status",
      "filters.search": "Search repositories",
      "filters.searchPlaceholder": "Name, path, language, branch...",
      "filters.language": "Language",
      "filters.allLanguages": "All languages",
      "filters.status": "Status",
      "filters.allStatuses": "All statuses",
      "filters.dirtyOnly": "Dirty only",
      "filters.cleanOnly": "Clean only",
      "filters.sort": "Sort",
      "filters.sortRecent": "Recently updated",
      "filters.sortNotes": "Most notes",
      "filters.sortCommands": "Most commands",
      "filters.sortName": "Name",
      "quickFilters.title": "Quick Filters",
      "quickFilters.meta": "Jump straight to the repos that matter most right now.",
      "quickFilters.all": "All repos",
      "quickFilters.focus": "My focus",
      "quickFilters.favorites": "Favorites",
      "quickFilters.inProgress": "In progress",
      "quickFilters.blocked": "Blocked",
      "focus.title": "My Focus",
      "focus.meta": "Favorites, active work, blockers, and repos with personal notes.",
      "focus.empty": "Mark a repo as favorite, in progress, blocked, or add a note to see it here.",
      "dashboard.languageMix": "Language Mix",
      "dashboard.repositories": "Repositories",
      "dashboard.empty": "No repositories match the current filters.",
      "detail.close": "Close",
      "common.unknown": "Unknown",
      "common.none": "none",
      "common.noUpstream": "No upstream",
      "common.copyAll": "Copy all",
      "common.copy": "Copy",
      "dynamic.scanned": "Scanned {time}",
      "dynamic.languageCount": "{count} languages",
      "dynamic.resultCount": "{count} shown",
      "dynamic.focusCount": "{count} in focus",
      "dynamic.searchChip": "Search: {value}",
      "dynamic.languageChip": "Language: {value}",
      "dynamic.statusChip": "Status: {value}",
      "dynamic.sortChip": "Sort: {value}",
      "dynamic.quickFilterChip": "Quick filter: {value}",
      "status.later": "Later",
      "status.in_progress": "In progress",
      "status.blocked": "Blocked",
      "status.dirty": "Dirty",
      "status.clean": "Clean",
      "status.yes": "Yes",
      "status.no": "No",
      "sort.recent": "Recently updated",
      "sort.notes": "Most notes",
      "sort.commands": "Most commands",
      "sort.name": "Name",
      "quickFilter.all": "All repos",
      "quickFilter.focus": "My focus",
      "quickFilter.favorites": "Favorites",
      "quickFilter.in_progress": "In progress",
      "quickFilter.blocked": "Blocked",
      "card.favoritePrefix": "[Fav] ",
      "card.favorite": "Favorite",
      "card.favorited": "Favorited",
      "card.copyPath": "Copy path",
      "card.branch": "Branch",
      "card.updated": "Updated",
      "card.packageManager": "Package manager",
      "card.latestCommit": "Latest commit",
      "card.workStatus": "Work status",
      "card.gitStatus": "Git status",
      "card.radar": "Radar",
      "card.languages": "Languages",
      "card.signals": "Signals",
      "card.commands": "Commands",
      "card.notes": "Notes",
      "card.files": "Files",
      "card.entrypoints": "Entrypoints",
      "card.staged": "Staged",
      "card.changed": "Changed",
      "card.untracked": "Untracked",
      "card.aheadBehind": "Ahead/Behind",
      "card.noPersonalNote": "No personal note yet",
      "card.noFiles": "No files",
      "card.noStackHints": "No stack hints",
      "card.noneDetected": "None detected",
      "card.noTodo": "No TODO or FIXME notes found.",
      "card.repository": "Repository",
      "focus.noteEmpty": "No personal note yet. Add one from the detail panel.",
      "focus.unknownAuthor": "Unknown author",
      "detail.repository": "Repository",
      "detail.signals": "Signals",
      "detail.health": "Health",
      "detail.readme": "README",
      "detail.commands": "Commands",
      "detail.recentCommits": "Recent Commits",
      "detail.fileTree": "File Tree",
      "detail.notes": "Notes",
      "detail.git": "Git",
      "detail.personal": "My Workspace State",
      "detail.openFolder": "Open folder",
      "detail.openReadme": "Open README",
      "detail.copyReadmePath": "Copy README path",
      "detail.copyPreview": "Copy preview",
      "detail.copyCommands": "Copy all",
      "detail.copyFileTree": "Copy all",
      "detail.noReadmeFound": "No README found",
      "detail.noPreviewAvailable": "No preview available.",
      "detail.noCommandsDetected": "No commands detected.",
      "detail.noCommitsFound": "No commits found.",
      "detail.noFilesDetected": "No files detected.",
      "detail.noHealthSignals": "No health signals available.",
      "detail.packageManager": "Package manager",
      "detail.automation": "Automation",
      "detail.lockfiles": "Lockfiles",
      "detail.tests": "Tests",
      "detail.upstream": "Upstream",
      "detail.aheadBehind": "Ahead / Behind",
      "detail.stagedChanged": "Staged / Changed",
      "detail.latestAuthor": "Latest author",
      "detail.latestCommitTime": "Latest commit time",
      "detail.status": "Status",
      "detail.note": "Note",
      "detail.notePlaceholder": "What should future-you remember?",
      "empty.noSourceFiles": "No source files detected yet.",
      "toast.workspaceCopied": "Workspace path copied",
      "toast.refreshCopied": "Refresh command copied",
      "toast.noValue": "No {label} available",
      "toast.copied": "{label} copied",
      "toast.copyFailed": "Could not copy {label}",
      "toast.favoriteOn": "Marked as favorite",
      "toast.favoriteOff": "Removed from favorites",
      "toast.statusSaved": "Status saved: {value}",
      "toast.saveFailed": "Could not save personal state",
      "toast.stateExported": "State file exported",
      "toast.stateImported": "State file imported",
      "toast.stateImportFailed": "Could not import state file"
    },
    zh: {
      "hero.eyebrow": "工作区雷达",
      "hero.title": "代码仓库导航台",
      "hero.lede": "一个快速的本地工作台，用来查看仓库健康度、入口文件、常用命令和下一步动作。",
      "hero.copyWorkspace": "复制工作区路径",
      "hero.copyRefresh": "复制刷新命令",
      "hero.copyStateSync": "复制状态同步命令",
      "hero.openScanner": "打开扫描脚本",
      "hero.exportState": "导出状态文件",
      "hero.importState": "导入状态文件",
      "hero.language": "语言",
      "summary.repos": "仓库数",
      "summary.dirty": "未清理",
      "summary.notes": "备注数",
      "summary.commands": "命令数",
      "workspace.path": "工作区路径",
      "workspace.topStack": "主要技术栈",
      "workspace.scanStatus": "扫描状态",
      "filters.search": "搜索仓库",
      "filters.searchPlaceholder": "名称、路径、语言、分支……",
      "filters.language": "语言",
      "filters.allLanguages": "所有语言",
      "filters.status": "状态",
      "filters.allStatuses": "所有状态",
      "filters.dirtyOnly": "只看未清理",
      "filters.cleanOnly": "只看干净",
      "filters.sort": "排序",
      "filters.sortRecent": "最近更新",
      "filters.sortNotes": "备注最多",
      "filters.sortCommands": "命令最多",
      "filters.sortName": "按名称",
      "quickFilters.title": "快速筛选",
      "quickFilters.meta": "一键跳到你现在最关心的仓库。",
      "quickFilters.all": "全部仓库",
      "quickFilters.focus": "我的重点",
      "quickFilters.favorites": "已收藏",
      "quickFilters.inProgress": "进行中",
      "quickFilters.blocked": "已阻塞",
      "focus.title": "我的重点",
      "focus.meta": "这里会优先显示收藏、进行中的仓库、卡住的仓库，以及写过个人备注的仓库。",
      "focus.empty": "把仓库标记为收藏、进行中、阻塞，或写一条备注后，它就会出现在这里。",
      "dashboard.languageMix": "语言分布",
      "dashboard.repositories": "仓库列表",
      "dashboard.empty": "当前筛选条件下没有匹配的仓库。",
      "detail.close": "关闭",
      "common.unknown": "未知",
      "common.none": "无",
      "common.noUpstream": "没有上游分支",
      "common.copyAll": "全部复制",
      "common.copy": "复制",
      "dynamic.scanned": "扫描时间：{time}",
      "dynamic.languageCount": "{count} 种语言",
      "dynamic.resultCount": "显示 {count} 个",
      "dynamic.focusCount": "重点 {count} 个",
      "dynamic.searchChip": "搜索：{value}",
      "dynamic.languageChip": "语言：{value}",
      "dynamic.statusChip": "状态：{value}",
      "dynamic.sortChip": "排序：{value}",
      "dynamic.quickFilterChip": "快速筛选：{value}",
      "status.later": "稍后处理",
      "status.in_progress": "进行中",
      "status.blocked": "已阻塞",
      "status.dirty": "未清理",
      "status.clean": "干净",
      "status.yes": "有",
      "status.no": "无",
      "sort.recent": "最近更新",
      "sort.notes": "备注最多",
      "sort.commands": "命令最多",
      "sort.name": "按名称",
      "quickFilter.all": "全部仓库",
      "quickFilter.focus": "我的重点",
      "quickFilter.favorites": "已收藏",
      "quickFilter.in_progress": "进行中",
      "quickFilter.blocked": "已阻塞",
      "card.favoritePrefix": "[收藏] ",
      "card.favorite": "收藏",
      "card.favorited": "已收藏",
      "card.copyPath": "复制路径",
      "card.branch": "分支",
      "card.updated": "更新时间",
      "card.packageManager": "包管理器",
      "card.latestCommit": "最新提交",
      "card.workStatus": "个人状态",
      "card.gitStatus": "Git 状态",
      "card.radar": "项目雷达",
      "card.languages": "语言",
      "card.signals": "信号",
      "card.commands": "命令",
      "card.notes": "笔记",
      "card.files": "文件",
      "card.entrypoints": "入口",
      "card.staged": "已暂存",
      "card.changed": "已修改",
      "card.untracked": "未跟踪",
      "card.aheadBehind": "领先/落后",
      "card.noPersonalNote": "还没有个人备注",
      "card.noFiles": "没有文件",
      "card.noStackHints": "没有栈提示",
      "card.noneDetected": "未检测到",
      "card.noTodo": "没有找到 TODO 或 FIXME。",
      "card.repository": "仓库",
      "focus.noteEmpty": "还没有个人备注，可以在详情面板里补一条。",
      "focus.unknownAuthor": "未知作者",
      "detail.repository": "仓库",
      "detail.signals": "项目信号",
      "detail.health": "健康度",
      "detail.readme": "README",
      "detail.commands": "命令",
      "detail.recentCommits": "最近提交",
      "detail.fileTree": "文件树",
      "detail.notes": "笔记",
      "detail.git": "Git",
      "detail.personal": "我的工作状态",
      "detail.openFolder": "打开目录",
      "detail.openReadme": "打开 README",
      "detail.copyReadmePath": "复制 README 路径",
      "detail.copyPreview": "复制预览",
      "detail.copyCommands": "全部复制",
      "detail.copyFileTree": "全部复制",
      "detail.noReadmeFound": "没有找到 README",
      "detail.noPreviewAvailable": "没有可用预览。",
      "detail.noCommandsDetected": "没有检测到命令。",
      "detail.noCommitsFound": "没有找到提交记录。",
      "detail.noFilesDetected": "没有检测到文件。",
      "detail.noHealthSignals": "没有可用的健康信号。",
      "detail.packageManager": "包管理器",
      "detail.automation": "自动化",
      "detail.lockfiles": "锁文件",
      "detail.tests": "测试",
      "detail.upstream": "上游分支",
      "detail.aheadBehind": "领先 / 落后",
      "detail.stagedChanged": "已暂存 / 已修改",
      "detail.latestAuthor": "最新提交作者",
      "detail.latestCommitTime": "最新提交时间",
      "detail.status": "状态",
      "detail.note": "备注",
      "detail.notePlaceholder": "给未来的自己留一句提醒……",
      "empty.noSourceFiles": "还没有检测到源代码文件。",
      "toast.workspaceCopied": "已复制工作区路径",
      "toast.refreshCopied": "已复制刷新命令",
      "toast.noValue": "没有可用的{label}",
      "toast.copied": "已复制{label}",
      "toast.copyFailed": "复制{label}失败",
      "toast.favoriteOn": "已标记为收藏",
      "toast.favoriteOff": "已取消收藏",
      "toast.statusSaved": "状态已保存：{value}",
      "toast.saveFailed": "保存个人状态失败",
      "toast.stateExported": "状态文件已导出",
      "toast.stateImported": "状态文件已导入",
      "toast.stateImportFailed": "导入状态文件失败"
    }
  };
  const fallbackData = {
    scannedAt: new Date().toISOString(),
    workspace: workspacePath,
    repositories: [
      {
        name: "git",
        path: ".",
        absolutePath: workspacePath,
        branch: "main",
        dirty: false,
        lastModified: new Date().toISOString(),
        latestCommit: "Workspace repository",
        latestCommitAuthor: "Local user",
        latestCommitWhen: new Date().toISOString(),
        languages: [{ name: "PowerShell", files: 1 }, { name: "JavaScript", files: 1 }, { name: "CSS", files: 1 }],
        entryPoints: ["index.html", "scripts\\scan-workspace.ps1"],
        todos: [],
        readme: { absolutePath: `${workspacePath}\\README.md`, file: "README.md", preview: "A local dashboard for navigating repositories." },
        commands: [{ name: "Refresh data", command: refreshCommand, category: "workspace" }],
        health: [
          { label: "README", present: true },
          { label: "Tests", present: false },
          { label: "CI", present: false },
          { label: "License", present: false },
          { label: "Dependencies", present: false }
        ],
        recentCommits: [],
        fileTree: ["index.html", "app.js", "styles.css", "scripts\\scan-workspace.ps1"],
        insights: {
          packageManager: "none",
          automation: [],
          locks: [],
          testTargets: [],
          stackHints: ["Static app"]
        },
        metrics: {
          fileCount: 4,
          todoCount: 0,
          commandCount: 1,
          entryPointCount: 2
        },
        git: {
          staged: 0,
          changed: 0,
          untracked: 0,
          upstream: "origin/main",
          ahead: 0,
          behind: 0
        },
        personal: {
          favorite: false,
          workflowStatus: "later",
          note: ""
        }
      }
    ]
  };

  const data = window.REPO_NAV_DATA || fallbackData;
  const personalState = loadPersonalState();
  const repositories = (data.repositories || []).map((repo) => normalizeRepo(repo, personalState));
  const reposByPath = new Map(repositories.map((repo) => [repoKey(repo), repo]));
  const state = {
    search: "",
    language: "all",
    status: "all",
    sort: "recent",
    focusFilter: "all",
    selectedPath: null
  };

  const els = {
    repoCount: document.getElementById("repoCount"),
    dirtyCount: document.getElementById("dirtyCount"),
    todoCount: document.getElementById("todoCount"),
    commandCount: document.getElementById("commandCount"),
    workspacePath: document.getElementById("workspacePath"),
    topLanguage: document.getElementById("topLanguage"),
    scanTime: document.getElementById("scanTime"),
    languageCount: document.getElementById("languageCount"),
    languageMix: document.getElementById("languageMix"),
    quickFilterSummary: document.getElementById("quickFilterSummary"),
    focusCount: document.getElementById("focusCount"),
    focusGrid: document.getElementById("focusGrid"),
    focusEmpty: document.getElementById("focusEmpty"),
    repoGrid: document.getElementById("repoGrid"),
    resultCount: document.getElementById("resultCount"),
    activeFilters: document.getElementById("activeFilters"),
    emptyState: document.getElementById("emptyState"),
    searchInput: document.getElementById("searchInput"),
    languageFilter: document.getElementById("languageFilter"),
    statusFilter: document.getElementById("statusFilter"),
    sortFilter: document.getElementById("sortFilter"),
    detailOverlay: document.getElementById("detailOverlay"),
    detailDrawer: document.getElementById("detailDrawer"),
    detailContent: document.getElementById("detailContent"),
    closeDetail: document.getElementById("closeDetail"),
    toast: document.getElementById("toast"),
    copyWorkspace: document.getElementById("copyWorkspace"),
    copyRefresh: document.getElementById("copyRefresh"),
    copyStateSync: document.getElementById("copyStateSync"),
    openScanner: document.getElementById("openScanner"),
    exportState: document.getElementById("exportState"),
    importState: document.getElementById("importState"),
    languageToggle: document.getElementById("languageToggle")
  };

  let currentLanguage = loadLanguage();
  let toastTimer = null;

  function loadLanguage() {
    try {
      const stored = window.localStorage.getItem(languageStateKey);
      return stored === "zh" ? "zh" : "en";
    } catch (error) {
      return "en";
    }
  }

  function saveLanguage(value) {
    try {
      window.localStorage.setItem(languageStateKey, value);
    } catch (error) {}
  }

  function t(key, vars = {}) {
    const dict = translations[currentLanguage] || translations.en;
    const fallback = translations.en[key] || key;
    const template = dict[key] || fallback;
    return template.replace(/\{(\w+)\}/g, (_, name) => String(vars[name] ?? ""));
  }

  function applyStaticTranslations() {
    document.documentElement.lang = currentLanguage === "zh" ? "zh-CN" : "en";
    document.querySelectorAll("[data-i18n]").forEach((node) => {
      node.textContent = t(node.dataset.i18n);
    });
    document.querySelectorAll("[data-i18n-placeholder]").forEach((node) => {
      node.setAttribute("placeholder", t(node.dataset.i18nPlaceholder));
    });
    els.languageToggle.value = currentLanguage;
  }

  function loadPersonalState() {
    const fileState = normalizePersonalStateMap(window.REPO_NAV_PERSONAL_STATE);
    let browserState = {};

    try {
      const raw = window.localStorage.getItem(personalStateKey);
      browserState = raw ? normalizePersonalStateMap(JSON.parse(raw)) : {};
    } catch (error) {
      browserState = {};
    }

    return {
      ...fileState,
      ...browserState
    };
  }

  function savePersonalState() {
    try {
      window.localStorage.setItem(personalStateKey, JSON.stringify(personalState));
    } catch (error) {
      showToast(t("toast.saveFailed"));
    }
  }

  function serializePersonalState() {
    return {
      version: 1,
      updatedAt: new Date().toISOString(),
      repositories: personalState
    };
  }

  function normalizePersonalStateMap(payload) {
    if (!payload || typeof payload !== "object") return {};
    const source = payload.repositories && typeof payload.repositories === "object" ? payload.repositories : payload;
    const normalized = {};

    for (const [key, value] of Object.entries(source)) {
      if (!key || !value || typeof value !== "object") continue;
      normalized[key] = normalizePersonalEntry(value);
    }

    return normalized;
  }

  function normalizePersonalEntry(value) {
    const entry = value && typeof value === "object" ? value : {};
    return {
      favorite: Boolean(entry.favorite),
      workflowStatus: validPersonalStatuses.has(entry.workflowStatus) ? entry.workflowStatus : "later",
      note: typeof entry.note === "string" ? entry.note : ""
    };
  }

  function mergeImportedPersonalState(payload) {
    if (!payload || typeof payload !== "object" || !payload.repositories || typeof payload.repositories !== "object") {
      throw new Error("Invalid state payload");
    }

    for (const [key, value] of Object.entries(normalizePersonalStateMap(payload))) {
      personalState[key] = value;
    }

    for (const repo of repositories) {
      const key = personalKey(repo);
      repo.personal = normalizePersonalEntry(personalState[key]);
    }

    savePersonalState();
  }

  function exportPersonalStateFile() {
    const blob = new Blob([JSON.stringify(serializePersonalState(), null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "personal-state.json";
    document.body.append(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
    showToast(t("toast.stateExported"));
  }

  function importPersonalStateFile(file) {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const parsed = JSON.parse(String(reader.result || "{}"));
        mergeImportedPersonalState(parsed);
        render();
        if (state.selectedPath) {
          const repo = reposByPath.get(state.selectedPath);
          if (repo) renderDetail(repo);
        }
        showToast(t("toast.stateImported"));
      } catch (error) {
        showToast(t("toast.stateImportFailed"));
      }
    };
    reader.onerror = () => {
      showToast(t("toast.stateImportFailed"));
    };
    reader.readAsText(file);
  }

  function personalKey(repo) {
    return repo.absolutePath || repo.path || repo.name;
  }

  function normalizeRepo(repo, savedState) {
    const todoCount = (repo.todos || []).length;
    const commandCount = (repo.commands || []).length;
    const entryPointCount = (repo.entryPoints || []).length;
    const fileCount = (repo.fileTree || []).length;
    const personal = normalizePersonalEntry(savedState[personalKey(repo)]);
    return {
      ...repo,
      commands: (repo.commands || []).map((command) => ({
        category: command.category || "command",
        ...command
      })),
      insights: {
        packageManager: (repo.insights && repo.insights.packageManager) || "none",
        automation: (repo.insights && repo.insights.automation) || [],
        locks: (repo.insights && repo.insights.locks) || [],
        testTargets: (repo.insights && repo.insights.testTargets) || [],
        stackHints: (repo.insights && repo.insights.stackHints) || []
      },
      metrics: {
        fileCount,
        todoCount,
        commandCount,
        entryPointCount,
        ...(repo.metrics || {})
      },
      git: {
        staged: (repo.git && repo.git.staged) || 0,
        changed: (repo.git && repo.git.changed) || 0,
        untracked: (repo.git && repo.git.untracked) || 0,
        upstream: (repo.git && repo.git.upstream) || "",
        ahead: (repo.git && repo.git.ahead) || 0,
        behind: (repo.git && repo.git.behind) || 0
      },
      readme: repo.readme || null,
      personal
    };
  }

  function updatePersonalState(repo, patch) {
    const key = personalKey(repo);
    const next = normalizePersonalEntry({
      ...repo.personal,
      ...patch
    });
    repo.personal = next;
    personalState[key] = next;
    savePersonalState();
  }

  function toFileUrl(path) {
    if (!path) return "";
    const normalized = String(path).replace(/\\/g, "/");
    return `file:///${encodeURI(normalized)}`;
  }

  function formatDate(value) {
    if (!value) return "Unknown";
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return value;
    return new Intl.DateTimeFormat(undefined, {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit"
    }).format(date);
  }

  function escapeHtml(value) {
    return String(value || "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

  function repoKey(repo) {
    return repo.path || repo.name;
  }

  function renderList(items, emptyText, mapper) {
    return (items || []).length
      ? items.map(mapper).join("")
      : `<li>${escapeHtml(emptyText)}</li>`;
  }

  function allLanguages() {
    const counts = new Map();
    for (const repo of repositories) {
      for (const lang of repo.languages || []) {
        counts.set(lang.name, (counts.get(lang.name) || 0) + lang.files);
      }
    }
    return [...counts.entries()]
      .map(([name, files]) => ({ name, files }))
      .sort((a, b) => b.files - a.files || a.name.localeCompare(b.name));
  }

  function topLanguageLabel() {
    const language = allLanguages()[0];
    return language ? `${language.name} (${language.files})` : t("common.unknown");
  }

  function populateLanguageFilter() {
    for (const lang of allLanguages()) {
      const option = document.createElement("option");
      option.value = lang.name;
      option.textContent = lang.name;
      els.languageFilter.append(option);
    }
  }

  function renderSummary() {
    els.repoCount.textContent = repositories.length;
    els.dirtyCount.textContent = repositories.filter((repo) => repo.dirty).length;
    els.todoCount.textContent = repositories.reduce((sum, repo) => sum + repo.metrics.todoCount, 0);
    els.commandCount.textContent = repositories.reduce((sum, repo) => sum + repo.metrics.commandCount, 0);
    els.workspacePath.textContent = data.workspace || fallbackData.workspace;
    els.topLanguage.textContent = topLanguageLabel();
    els.scanTime.textContent = t("dynamic.scanned", { time: formatDate(data.scannedAt) });
    els.languageCount.textContent = t("dynamic.languageCount", { count: allLanguages().length });
    els.openScanner.href = toFileUrl(scanScriptPath);
  }

  function renderLanguageMix() {
    const languages = allLanguages();
    const max = Math.max(...languages.map((lang) => lang.files), 1);
    els.languageMix.innerHTML = languages.length
      ? languages.map((lang) => `
          <div class="bar-row">
            <div class="bar-label">
              <span>${escapeHtml(lang.name)}</span>
              <span>${lang.files}</span>
            </div>
            <div class="bar-track">
              <div class="bar-fill" style="width: ${(lang.files / max) * 100}%"></div>
            </div>
          </div>
        `).join("")
      : `<p class="small">${escapeHtml(t("empty.noSourceFiles"))}</p>`;
  }

  function focusRepos() {
    return repositories.filter((repo) =>
      repo.personal.favorite ||
      repo.personal.workflowStatus !== "later" ||
      Boolean(repo.personal.note.trim())
    );
  }

  function matchesFocusFilter(repo) {
    if (state.focusFilter === "focus") {
      return focusRepos().includes(repo);
    }
    if (state.focusFilter === "favorites") {
      return repo.personal.favorite;
    }
    if (state.focusFilter === "in_progress") {
      return repo.personal.workflowStatus === "in_progress";
    }
    if (state.focusFilter === "blocked") {
      return repo.personal.workflowStatus === "blocked";
    }
    return true;
  }

  function repoMatches(repo) {
    const haystack = [
      repo.name,
      repo.path,
      repo.branch,
      repo.latestCommit,
      repo.readme && repo.readme.preview,
      repo.personal.note,
      repo.personal.workflowStatus,
      repo.insights.packageManager,
      ...(repo.languages || []).map((lang) => lang.name),
      ...(repo.entryPoints || []),
      ...(repo.insights.stackHints || []),
      ...(repo.insights.automation || []),
      ...(repo.insights.testTargets || []),
      ...(repo.todos || []).map((todo) => todo.text),
      ...(repo.commands || []).map((command) => `${command.name} ${command.command}`)
    ].join(" ").toLowerCase();

    const languageMatch = state.language === "all" || (repo.languages || []).some((lang) => lang.name === state.language);
    const statusMatch = state.status === "all" || (state.status === "dirty" ? repo.dirty : !repo.dirty);
    const searchMatch = !state.search || haystack.includes(state.search.toLowerCase());
    const focusMatch = matchesFocusFilter(repo);
    return languageMatch && statusMatch && searchMatch && focusMatch;
  }

  function sortRepos(repos) {
    const sorted = [...repos];
    if (state.sort === "name") {
      sorted.sort((a, b) => a.name.localeCompare(b.name));
    } else if (state.sort === "notes") {
      sorted.sort((a, b) => b.metrics.todoCount - a.metrics.todoCount || a.name.localeCompare(b.name));
    } else if (state.sort === "commands") {
      sorted.sort((a, b) => b.metrics.commandCount - a.metrics.commandCount || a.name.localeCompare(b.name));
    } else {
      sorted.sort((a, b) => {
        if (a.personal.favorite !== b.personal.favorite) return a.personal.favorite ? -1 : 1;
        return String(b.lastModified).localeCompare(String(a.lastModified)) || a.name.localeCompare(b.name);
      });
    }
    return sorted;
  }

  function statusLabel(value) {
    if (value === "in_progress") return t("status.in_progress");
    if (value === "blocked") return t("status.blocked");
    return t("status.later");
  }

  function sortLabel(value) {
    if (value === "notes") return t("sort.notes");
    if (value === "commands") return t("sort.commands");
    if (value === "name") return t("sort.name");
    return t("sort.recent");
  }

  function quickFilterLabel(value) {
    if (value === "focus") return t("quickFilter.focus");
    if (value === "favorites") return t("quickFilter.favorites");
    if (value === "in_progress") return t("quickFilter.in_progress");
    if (value === "blocked") return t("quickFilter.blocked");
    return t("quickFilter.all");
  }

  function renderActiveFilters() {
    const chips = [];
    if (state.search) chips.push(t("dynamic.searchChip", { value: state.search }));
    if (state.language !== "all") chips.push(t("dynamic.languageChip", { value: state.language }));
    if (state.status !== "all") chips.push(t("dynamic.statusChip", { value: statusLabel(state.status) }));
    chips.push(t("dynamic.sortChip", { value: sortLabel(state.sort) }));
    if (state.focusFilter !== "all") chips.push(t("dynamic.quickFilterChip", { value: quickFilterLabel(state.focusFilter) }));
    els.activeFilters.innerHTML = chips.map((chip) => `<span class="filter-chip">${escapeHtml(chip)}</span>`).join("");
  }

  function metricPill(label, value) {
    return `<li class="metric-pill"><span>${escapeHtml(label)}</span><strong>${escapeHtml(value)}</strong></li>`;
  }

  function renderRepos() {
    const repos = sortRepos(repositories.filter(repoMatches));
    els.resultCount.textContent = t("dynamic.resultCount", { count: repos.length });
    els.emptyState.hidden = repos.length > 0;
    renderActiveFilters();
    els.repoGrid.innerHTML = repos.map((repo) => `
      <article class="repo-card" tabindex="0" role="button" data-repo-path="${escapeHtml(repoKey(repo))}" aria-label="Open ${escapeHtml(repo.name)} details">
        <div class="repo-card-top">
          <div class="repo-title">
            <div>
              <p class="card-kicker">${escapeHtml((repo.insights.stackHints || [repo.branch])[0] || t("card.repository"))}</p>
              <h3>${repo.personal.favorite ? t("card.favoritePrefix") : ""}${escapeHtml(repo.name)}</h3>
              <p class="meta">${escapeHtml(repo.path)}</p>
            </div>
            <span class="status ${repo.dirty ? "dirty" : ""}">${repo.dirty ? t("status.dirty") : t("status.clean")}</span>
          </div>
          <div class="mini-actions">
            <button class="mini-button ${repo.personal.favorite ? "active-toggle" : ""}" type="button" data-favorite-toggle="${escapeHtml(repoKey(repo))}">
              ${repo.personal.favorite ? t("card.favorited") : t("card.favorite")}
            </button>
            <button class="mini-button" type="button" data-copy="${escapeHtml(repo.path)}" data-copy-label="Path">
              ${t("card.copyPath")}
            </button>
          </div>
        </div>

        <div class="repo-meta-grid">
          <div class="meta-card">
            <span>${t("card.branch")}</span>
            <strong>${escapeHtml(repo.branch || t("common.unknown"))}</strong>
          </div>
          <div class="meta-card">
            <span>${t("card.updated")}</span>
            <strong>${escapeHtml(formatDate(repo.lastModified))}</strong>
          </div>
          <div class="meta-card">
            <span>${t("card.packageManager")}</span>
            <strong>${escapeHtml(repo.insights.packageManager || t("common.none"))}</strong>
          </div>
          <div class="meta-card">
            <span>${t("card.latestCommit")}</span>
            <strong>${escapeHtml(repo.latestCommit || t("detail.noCommitsFound"))}</strong>
          </div>
        </div>

        <div>
          <div class="section-label">${t("card.workStatus")}</div>
          <ul class="tags">
            <li class="tag status-tag">${escapeHtml(statusLabel(repo.personal.workflowStatus))}</li>
            <li class="tag note-tag">${escapeHtml(repo.personal.note || t("card.noPersonalNote"))}</li>
          </ul>
        </div>

        <div>
          <div class="section-label">${t("card.gitStatus")}</div>
          <ul class="metric-pills">
            ${metricPill(t("card.staged"), repo.git.staged)}
            ${metricPill(t("card.changed"), repo.git.changed)}
            ${metricPill(t("card.untracked"), repo.git.untracked)}
            ${metricPill(t("card.aheadBehind"), `${repo.git.ahead}/${repo.git.behind}`)}
          </ul>
        </div>

        <div>
          <div class="section-label">${t("card.radar")}</div>
          <ul class="metric-pills">
            ${metricPill(t("card.files"), repo.metrics.fileCount)}
            ${metricPill(t("card.commands"), repo.metrics.commandCount)}
            ${metricPill(t("card.notes"), repo.metrics.todoCount)}
            ${metricPill(t("card.entrypoints"), repo.metrics.entryPointCount)}
          </ul>
        </div>

        <div>
          <div class="section-label">${t("card.languages")}</div>
          <ul class="tags">
            ${(repo.languages || []).slice(0, 6).map((lang) => `<li class="tag">${escapeHtml(lang.name)} ${lang.files}</li>`).join("") || `<li class="tag">${t("card.noFiles")}</li>`}
          </ul>
        </div>

        <div>
          <div class="section-label">${t("card.signals")}</div>
          <ul class="tags">
            ${(repo.insights.stackHints || []).slice(0, 4).map((item) => `<li class="tag accent-tag">${escapeHtml(item)}</li>`).join("") || `<li class="tag">${t("card.noStackHints")}</li>`}
          </ul>
        </div>

        <div>
          <div class="section-label">${t("card.commands")}</div>
          <ul class="file-list">
            ${(repo.commands || []).slice(0, 3).map((command) => `<li>${escapeHtml(command.name)}</li>`).join("") || `<li>${t("card.noneDetected")}</li>`}
          </ul>
        </div>

        <div>
          <div class="section-label">${t("card.notes")}</div>
          <ul class="todo-list">
            ${(repo.todos || []).slice(0, 2).map((todo) => `<li>${escapeHtml(todo.file)}:${todo.line} ${escapeHtml(todo.text)}</li>`).join("") || `<li>${t("card.noTodo")}</li>`}
          </ul>
        </div>
      </article>
    `).join("");
  }

  function renderFocus() {
    const repos = focusRepos().filter(matchesFocusFilter);
    els.quickFilterSummary.textContent = quickFilterLabel(state.focusFilter);
    document.querySelectorAll("[data-focus-filter]").forEach((button) => {
      button.classList.toggle("active-chip", button.dataset.focusFilter === state.focusFilter);
    });
    els.focusCount.textContent = t("dynamic.focusCount", { count: repos.length });
    els.focusEmpty.hidden = repos.length > 0;
    els.focusGrid.innerHTML = repos.map((repo) => `
      <article class="focus-card" tabindex="0" role="button" data-repo-path="${escapeHtml(repoKey(repo))}" aria-label="Open ${escapeHtml(repo.name)} details">
        <div class="focus-head">
          <div>
            <p class="card-kicker">${escapeHtml(statusLabel(repo.personal.workflowStatus))}</p>
            <h3>${repo.personal.favorite ? t("card.favoritePrefix") : ""}${escapeHtml(repo.name)}</h3>
            <p class="meta">${escapeHtml(repo.path)}</p>
          </div>
          <span class="focus-badge ${repo.personal.workflowStatus === "blocked" ? "blocked-badge" : ""}">
            ${escapeHtml(statusLabel(repo.personal.workflowStatus))}
          </span>
        </div>
        <p class="focus-note">${escapeHtml(repo.personal.note || t("focus.noteEmpty"))}</p>
        <div class="focus-footer">
          <span>${escapeHtml(repo.latestCommitAuthor || t("focus.unknownAuthor"))}</span>
          <span>${escapeHtml(formatDate(repo.latestCommitWhen || repo.lastModified))}</span>
        </div>
      </article>
    `).join("");
  }

  function renderHealth(repo) {
    return `
      <div class="health-grid">
        ${(repo.health || []).map((signal) => `
          <div class="health-item ${signal.present ? "present" : ""}">
            <span>${signal.present ? t("status.yes") : t("status.no")}</span>
            <strong>${escapeHtml(signal.label)}</strong>
          </div>
        `).join("") || `<p class="small">${t("detail.noHealthSignals")}</p>`}
      </div>
    `;
  }

  function renderInsights(repo) {
    return `
      <section class="detail-section">
        <div class="detail-section-head">
          <h3>${t("detail.signals")}</h3>
          <button class="mini-button" type="button" data-copy="${escapeHtml(repo.path)}" data-copy-label="Path">${t("card.copyPath")}</button>
        </div>
        <div class="insight-grid">
          <div class="insight-card">
            <span>${t("detail.packageManager")}</span>
            <strong>${escapeHtml(repo.insights.packageManager || t("common.none"))}</strong>
          </div>
          <div class="insight-card">
            <span>${t("detail.automation")}</span>
            <strong>${escapeHtml((repo.insights.automation || []).join(", ") || t("common.none"))}</strong>
          </div>
          <div class="insight-card">
            <span>${t("detail.lockfiles")}</span>
            <strong>${escapeHtml((repo.insights.locks || []).join(", ") || t("common.none"))}</strong>
          </div>
          <div class="insight-card">
            <span>${t("detail.tests")}</span>
            <strong>${escapeHtml((repo.insights.testTargets || []).join(", ") || t("common.none"))}</strong>
          </div>
        </div>
        <ul class="tags">
          ${(repo.insights.stackHints || []).map((item) => `<li class="tag accent-tag">${escapeHtml(item)}</li>`).join("") || `<li class="tag">${t("card.noStackHints")}</li>`}
        </ul>
      </section>
    `;
  }

  function renderGitDetails(repo) {
    return `
      <section class="detail-section">
        <h3>${t("detail.git")}</h3>
        <div class="insight-grid">
          <div class="insight-card">
            <span>${t("detail.upstream")}</span>
            <strong>${escapeHtml(repo.git.upstream || t("common.noUpstream"))}</strong>
          </div>
          <div class="insight-card">
            <span>${t("detail.aheadBehind")}</span>
            <strong>${escapeHtml(`${repo.git.ahead} / ${repo.git.behind}`)}</strong>
          </div>
          <div class="insight-card">
            <span>${t("detail.stagedChanged")}</span>
            <strong>${escapeHtml(`${repo.git.staged} / ${repo.git.changed}`)}</strong>
          </div>
          <div class="insight-card">
            <span>${t("card.untracked")}</span>
            <strong>${escapeHtml(repo.git.untracked)}</strong>
          </div>
          <div class="insight-card">
            <span>${t("detail.latestAuthor")}</span>
            <strong>${escapeHtml(repo.latestCommitAuthor || t("common.unknown"))}</strong>
          </div>
          <div class="insight-card">
            <span>${t("detail.latestCommitTime")}</span>
            <strong>${escapeHtml(repo.latestCommitWhen ? formatDate(repo.latestCommitWhen) : t("common.unknown"))}</strong>
          </div>
        </div>
      </section>
    `;
  }

  function renderPersonalDetails(repo) {
    return `
      <section class="detail-section">
        <div class="detail-section-head">
          <h3>${t("detail.personal")}</h3>
          <button class="mini-button ${repo.personal.favorite ? "active-toggle" : ""}" type="button" data-favorite-toggle="${escapeHtml(repoKey(repo))}">
            ${repo.personal.favorite ? t("card.favorited") : t("card.favorite")}
          </button>
        </div>
        <div class="personal-grid">
          <label>
            <span>${t("detail.status")}</span>
            <select data-status-select="${escapeHtml(repoKey(repo))}">
              <option value="later" ${repo.personal.workflowStatus === "later" ? "selected" : ""}>${t("status.later")}</option>
              <option value="in_progress" ${repo.personal.workflowStatus === "in_progress" ? "selected" : ""}>${t("status.in_progress")}</option>
              <option value="blocked" ${repo.personal.workflowStatus === "blocked" ? "selected" : ""}>${t("status.blocked")}</option>
            </select>
          </label>
          <label class="note-field">
            <span>${t("detail.note")}</span>
            <textarea data-note-input="${escapeHtml(repoKey(repo))}" rows="4" placeholder="${escapeHtml(t("detail.notePlaceholder"))}">${escapeHtml(repo.personal.note)}</textarea>
          </label>
        </div>
      </section>
    `;
  }

  function renderDetail(repo) {
    const readmePath = repo.readme && repo.readme.absolutePath ? repo.readme.absolutePath : "";
    const folderUrl = toFileUrl(repo.absolutePath || repo.path);
    const readmeUrl = toFileUrl(readmePath);
    els.detailContent.innerHTML = `
      <div class="detail-head">
        <p class="eyebrow">${t("detail.repository")}</p>
        <h2 id="detailTitle">${escapeHtml(repo.name)}</h2>
        <p class="meta">${escapeHtml(repo.path)} - ${escapeHtml(repo.branch || t("common.unknown"))} - ${repo.dirty ? t("status.dirty") : t("status.clean")}</p>
        <div class="hero-actions detail-actions">
          <a class="action-button" href="${escapeHtml(folderUrl)}" target="_blank" rel="noreferrer">${t("detail.openFolder")}</a>
          ${readmeUrl ? `<a class="action-button subtle" href="${escapeHtml(readmeUrl)}" target="_blank" rel="noreferrer">${t("detail.openReadme")}</a>` : ""}
          <button class="action-button" type="button" data-copy="${escapeHtml(repo.path)}" data-copy-label="Path">${t("card.copyPath")}</button>
          <button class="action-button subtle" type="button" data-copy="${escapeHtml(repo.readme && repo.readme.file ? repo.readme.file : repo.path)}" data-copy-label="README path">${t("detail.copyReadmePath")}</button>
        </div>
      </div>

      ${renderInsights(repo)}
      ${renderPersonalDetails(repo)}
      ${renderGitDetails(repo)}

      <section class="detail-section">
        <h3>${t("detail.health")}</h3>
        ${renderHealth(repo)}
      </section>

      <section class="detail-section">
        <div class="detail-section-head">
          <h3>${t("detail.readme")}</h3>
          <button class="mini-button" type="button" data-copy="${escapeHtml(repo.readme && repo.readme.preview ? repo.readme.preview : "")}" data-copy-label="README preview">${t("detail.copyPreview")}</button>
        </div>
        <p class="meta">${escapeHtml(repo.readme && repo.readme.file ? repo.readme.file : t("detail.noReadmeFound"))}</p>
        <pre class="readme-preview">${escapeHtml(repo.readme && repo.readme.preview ? repo.readme.preview : t("detail.noPreviewAvailable"))}</pre>
      </section>

      <section class="detail-section">
        <div class="detail-section-head">
          <h3>${t("detail.commands")}</h3>
          <button class="mini-button" type="button" data-copy="${escapeHtml((repo.commands || []).map((command) => command.command).join("\n"))}" data-copy-label="Commands">${t("detail.copyCommands")}</button>
        </div>
        <ul class="command-list">
          ${renderList(repo.commands, t("detail.noCommandsDetected"), (command) => `
            <li>
              <div class="command-head">
                <span>${escapeHtml(command.name)}</span>
                <button class="mini-button" type="button" data-copy="${escapeHtml(command.command)}" data-copy-label="${escapeHtml(command.name)} command">${t("common.copy")}</button>
              </div>
              <code>${escapeHtml(command.command)}</code>
            </li>
          `)}
        </ul>
      </section>

      <section class="detail-section">
        <h3>${t("detail.recentCommits")}</h3>
        <ul class="commit-list">
          ${renderList(repo.recentCommits, t("detail.noCommitsFound"), (commit) => `
            <li>
              <code>${escapeHtml(commit.hash)}</code>
              <span>${escapeHtml(commit.subject)}</span>
              <small>${escapeHtml(commit.when)}</small>
            </li>
          `)}
        </ul>
      </section>

      <section class="detail-section">
        <div class="detail-section-head">
          <h3>${t("detail.fileTree")}</h3>
          <button class="mini-button" type="button" data-copy="${escapeHtml((repo.fileTree || []).join("\n"))}" data-copy-label="File tree">${t("detail.copyFileTree")}</button>
        </div>
        <ul class="tree-list">
          ${renderList((repo.fileTree || []).slice(0, 80), t("detail.noFilesDetected"), (file) => `<li>${escapeHtml(file)}</li>`)}
        </ul>
      </section>

      <section class="detail-section">
        <h3>${t("detail.notes")}</h3>
        <ul class="todo-list">
          ${renderList(repo.todos, t("card.noTodo"), (todo) => `<li>${escapeHtml(todo.file)}:${todo.line} ${escapeHtml(todo.text)}</li>`)}
        </ul>
      </section>
    `;
  }

  function openDetail(repo) {
    state.selectedPath = repoKey(repo);
    renderDetail(repo);
    els.detailOverlay.hidden = false;
    els.detailDrawer.setAttribute("aria-hidden", "false");
    document.body.classList.add("drawer-open");
    els.closeDetail.focus();
  }

  function closeDetail() {
    state.selectedPath = null;
    els.detailOverlay.hidden = true;
    els.detailDrawer.setAttribute("aria-hidden", "true");
    document.body.classList.remove("drawer-open");
  }

  function showToast(message) {
    if (!message) return;
    if (toastTimer) window.clearTimeout(toastTimer);
    els.toast.textContent = message;
    els.toast.hidden = false;
    els.toast.classList.add("visible");
    toastTimer = window.setTimeout(() => {
      els.toast.hidden = true;
      els.toast.classList.remove("visible");
    }, 1800);
  }

  async function copyText(value, label) {
    if (!value) {
      showToast(t("toast.noValue", { label: label || t("common.unknown") }));
      return;
    }
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(value);
      } else {
        const area = document.createElement("textarea");
        area.value = value;
        area.setAttribute("readonly", "");
        area.style.position = "absolute";
        area.style.left = "-9999px";
        document.body.append(area);
        area.select();
        document.execCommand("copy");
        area.remove();
      }
      showToast(t("toast.copied", { label: label || t("common.unknown") }));
    } catch (error) {
      showToast(t("toast.copyFailed", { label: label || t("common.unknown") }));
    }
  }

  function rerenderSelectedRepo() {
    renderFocus();
    renderRepos();
    if (!state.selectedPath) return;
    const repo = reposByPath.get(state.selectedPath);
    if (repo) {
      renderDetail(repo);
    }
  }

  function render() {
    applyStaticTranslations();
    renderSummary();
    renderLanguageMix();
    renderFocus();
    renderRepos();
  }

  els.searchInput.addEventListener("input", (event) => {
    state.search = event.target.value.trim();
    renderRepos();
  });

  els.languageFilter.addEventListener("change", (event) => {
    state.language = event.target.value;
    renderRepos();
  });

  els.statusFilter.addEventListener("change", (event) => {
    state.status = event.target.value;
    renderRepos();
  });

  els.sortFilter.addEventListener("change", (event) => {
    state.sort = event.target.value;
    renderRepos();
  });

  document.querySelectorAll("[data-focus-filter]").forEach((button) => {
    button.addEventListener("click", () => {
      state.focusFilter = button.dataset.focusFilter || "all";
      renderFocus();
      renderRepos();
    });
  });

  els.copyWorkspace.addEventListener("click", () => copyText(data.workspace || fallbackData.workspace, t("hero.copyWorkspace")));
  els.copyRefresh.addEventListener("click", () => copyText(refreshCommand, t("hero.copyRefresh")));
  els.copyStateSync.addEventListener("click", () => copyText(syncStateCommand, t("hero.copyStateSync")));
  els.exportState.addEventListener("click", exportPersonalStateFile);
  els.importState.addEventListener("change", (event) => {
    importPersonalStateFile(event.target.files && event.target.files[0]);
    event.target.value = "";
  });
  els.languageToggle.addEventListener("change", (event) => {
    currentLanguage = event.target.value === "zh" ? "zh" : "en";
    saveLanguage(currentLanguage);
    render();
    if (state.selectedPath) {
      const repo = reposByPath.get(state.selectedPath);
      if (repo) {
        renderDetail(repo);
      }
    }
  });

  document.addEventListener("click", (event) => {
    const copyButton = event.target.closest("[data-copy]");
    if (copyButton) {
      event.stopPropagation();
      copyText(copyButton.dataset.copy, copyButton.dataset.copyLabel);
      return;
    }

    const favoriteButton = event.target.closest("[data-favorite-toggle]");
    if (favoriteButton) {
      event.stopPropagation();
      const repo = reposByPath.get(favoriteButton.dataset.favoriteToggle);
      if (!repo) return;
      updatePersonalState(repo, { favorite: !repo.personal.favorite });
      rerenderSelectedRepo();
      showToast(repo.personal.favorite ? t("toast.favoriteOn") : t("toast.favoriteOff"));
      return;
    }

    const card = event.target.closest(".repo-card");
    if (card) {
      const repo = reposByPath.get(card.dataset.repoPath);
      if (repo) openDetail(repo);
      return;
    }

    const focusCard = event.target.closest(".focus-card");
    if (!focusCard) return;
    const repo = reposByPath.get(focusCard.dataset.repoPath);
    if (repo) openDetail(repo);
  });

  els.repoGrid.addEventListener("keydown", (event) => {
    if (event.key !== "Enter" && event.key !== " ") return;
    const card = event.target.closest(".repo-card");
    if (!card) return;
    event.preventDefault();
    const repo = reposByPath.get(card.dataset.repoPath);
    if (repo) openDetail(repo);
  });

  els.focusGrid.addEventListener("keydown", (event) => {
    if (event.key !== "Enter" && event.key !== " ") return;
    const card = event.target.closest(".focus-card");
    if (!card) return;
    event.preventDefault();
    const repo = reposByPath.get(card.dataset.repoPath);
    if (repo) openDetail(repo);
  });

  els.closeDetail.addEventListener("click", closeDetail);
  els.detailOverlay.addEventListener("click", closeDetail);
  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && !els.detailOverlay.hidden) {
      closeDetail();
    }
  });

  document.addEventListener("change", (event) => {
    const statusSelect = event.target.closest("[data-status-select]");
    if (!statusSelect) return;
    const repo = reposByPath.get(statusSelect.dataset.statusSelect);
    if (!repo) return;
    updatePersonalState(repo, { workflowStatus: statusSelect.value });
    rerenderSelectedRepo();
    showToast(t("toast.statusSaved", { value: statusLabel(repo.personal.workflowStatus) }));
  });

  document.addEventListener("input", (event) => {
    const noteInput = event.target.closest("[data-note-input]");
    if (!noteInput) return;
    const repo = reposByPath.get(noteInput.dataset.noteInput);
    if (!repo) return;
    updatePersonalState(repo, { note: noteInput.value });
    renderRepos();
  });

  populateLanguageFilter();
  render();
})();
