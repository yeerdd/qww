(function () {
  const fallbackData = {
    scannedAt: new Date().toISOString(),
    workspace: "C:\\Users\\Fox-OS\\Desktop\\git",
    repositories: [
      {
        name: "git",
        path: ".",
        branch: "main",
        dirty: false,
        lastModified: new Date().toISOString(),
        latestCommit: "Workspace repository",
        languages: [{ name: "PowerShell", files: 1 }, { name: "JavaScript", files: 1 }, { name: "CSS", files: 1 }],
        entryPoints: ["index.html", "scripts/scan-workspace.ps1"],
        todos: [],
        readme: { file: "README.md", preview: "A local dashboard for navigating repositories." },
        commands: [{ name: "Refresh data", command: "powershell -ExecutionPolicy Bypass -File .\\scripts\\scan-workspace.ps1" }],
        health: [
          { label: "README", present: true },
          { label: "Tests", present: false },
          { label: "CI", present: false },
          { label: "License", present: false },
          { label: "Dependencies", present: false }
        ],
        recentCommits: [],
        fileTree: ["index.html", "app.js", "styles.css", "scripts\\scan-workspace.ps1"]
      }
    ]
  };

  const data = window.REPO_NAV_DATA || fallbackData;
  const reposByPath = new Map((data.repositories || []).map((repo) => [repo.path || repo.name, repo]));
  const state = {
    search: "",
    language: "all",
    status: "all",
    selectedPath: null
  };

  const els = {
    repoCount: document.getElementById("repoCount"),
    dirtyCount: document.getElementById("dirtyCount"),
    todoCount: document.getElementById("todoCount"),
    scanTime: document.getElementById("scanTime"),
    languageMix: document.getElementById("languageMix"),
    repoGrid: document.getElementById("repoGrid"),
    resultCount: document.getElementById("resultCount"),
    emptyState: document.getElementById("emptyState"),
    searchInput: document.getElementById("searchInput"),
    languageFilter: document.getElementById("languageFilter"),
    statusFilter: document.getElementById("statusFilter"),
    detailOverlay: document.getElementById("detailOverlay"),
    detailDrawer: document.getElementById("detailDrawer"),
    detailContent: document.getElementById("detailContent"),
    closeDetail: document.getElementById("closeDetail")
  };

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
    for (const repo of data.repositories || []) {
      for (const lang of repo.languages || []) {
        counts.set(lang.name, (counts.get(lang.name) || 0) + lang.files);
      }
    }
    return [...counts.entries()]
      .map(([name, files]) => ({ name, files }))
      .sort((a, b) => b.files - a.files || a.name.localeCompare(b.name));
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
    const repos = data.repositories || [];
    els.repoCount.textContent = repos.length;
    els.dirtyCount.textContent = repos.filter((repo) => repo.dirty).length;
    els.todoCount.textContent = repos.reduce((sum, repo) => sum + (repo.todos || []).length, 0);
    els.scanTime.textContent = `Scanned ${formatDate(data.scannedAt)}`;
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
      : `<p class="small">No source files detected yet.</p>`;
  }

  function repoMatches(repo) {
    const haystack = [
      repo.name,
      repo.path,
      repo.branch,
      repo.latestCommit,
      repo.readme && repo.readme.preview,
      ...(repo.languages || []).map((lang) => lang.name),
      ...(repo.entryPoints || []),
      ...(repo.todos || []).map((todo) => todo.text),
      ...(repo.commands || []).map((command) => `${command.name} ${command.command}`)
    ].join(" ").toLowerCase();

    const languageMatch = state.language === "all" || (repo.languages || []).some((lang) => lang.name === state.language);
    const statusMatch = state.status === "all" || (state.status === "dirty" ? repo.dirty : !repo.dirty);
    const searchMatch = !state.search || haystack.includes(state.search.toLowerCase());
    return languageMatch && statusMatch && searchMatch;
  }

  function renderRepos() {
    const repos = (data.repositories || []).filter(repoMatches);
    els.resultCount.textContent = `${repos.length} shown`;
    els.emptyState.hidden = repos.length > 0;
    els.repoGrid.innerHTML = repos.map((repo) => `
      <article class="repo-card" tabindex="0" role="button" data-repo-path="${escapeHtml(repoKey(repo))}" aria-label="Open ${escapeHtml(repo.name)} details">
        <div class="repo-title">
          <div>
            <h3>${escapeHtml(repo.name)}</h3>
            <p class="meta">${escapeHtml(repo.path)}</p>
          </div>
          <span class="status ${repo.dirty ? "dirty" : ""}">${repo.dirty ? "Dirty" : "Clean"}</span>
        </div>

        <div class="meta">Branch: <strong>${escapeHtml(repo.branch || "unknown")}</strong></div>
        <div class="meta">Updated: ${formatDate(repo.lastModified)}</div>
        <div class="meta">Latest: ${escapeHtml(repo.latestCommit || "No commits found")}</div>

        <div>
          <div class="section-label">Languages</div>
          <ul class="tags">
            ${(repo.languages || []).slice(0, 6).map((lang) => `<li class="tag">${escapeHtml(lang.name)} - ${lang.files}</li>`).join("") || `<li class="tag">No files</li>`}
          </ul>
        </div>

        <div>
          <div class="section-label">Entry Points</div>
          <ul class="file-list">
            ${(repo.entryPoints || []).slice(0, 6).map((file) => `<li>${escapeHtml(file)}</li>`).join("") || `<li>None detected</li>`}
          </ul>
        </div>

        <div>
          <div class="section-label">Notes</div>
          <ul class="todo-list">
            ${(repo.todos || []).slice(0, 3).map((todo) => `<li>${escapeHtml(todo.file)}:${todo.line} ${escapeHtml(todo.text)}</li>`).join("") || `<li>No TODO or FIXME notes found.</li>`}
          </ul>
        </div>
      </article>
    `).join("");
  }

  function renderHealth(repo) {
    return `
      <div class="health-grid">
        ${(repo.health || []).map((signal) => `
          <div class="health-item ${signal.present ? "present" : ""}">
            <span>${signal.present ? "Yes" : "No"}</span>
            <strong>${escapeHtml(signal.label)}</strong>
          </div>
        `).join("") || `<p class="small">No health signals available.</p>`}
      </div>
    `;
  }

  function renderDetail(repo) {
    els.detailContent.innerHTML = `
      <div class="detail-head">
        <p class="eyebrow">Repository</p>
        <h2 id="detailTitle">${escapeHtml(repo.name)}</h2>
        <p class="meta">${escapeHtml(repo.path)} - ${escapeHtml(repo.branch || "unknown")} - ${repo.dirty ? "Dirty" : "Clean"}</p>
      </div>

      <section class="detail-section">
        <h3>Health</h3>
        ${renderHealth(repo)}
      </section>

      <section class="detail-section">
        <h3>README</h3>
        <p class="meta">${escapeHtml(repo.readme && repo.readme.file ? repo.readme.file : "No README found")}</p>
        <pre class="readme-preview">${escapeHtml(repo.readme && repo.readme.preview ? repo.readme.preview : "No preview available.")}</pre>
      </section>

      <section class="detail-section">
        <h3>Commands</h3>
        <ul class="command-list">
          ${renderList(repo.commands, "No commands detected.", (command) => `
            <li>
              <span>${escapeHtml(command.name)}</span>
              <code>${escapeHtml(command.command)}</code>
            </li>
          `)}
        </ul>
      </section>

      <section class="detail-section">
        <h3>Recent Commits</h3>
        <ul class="commit-list">
          ${renderList(repo.recentCommits, "No commits found.", (commit) => `
            <li>
              <code>${escapeHtml(commit.hash)}</code>
              <span>${escapeHtml(commit.subject)}</span>
              <small>${escapeHtml(commit.when)}</small>
            </li>
          `)}
        </ul>
      </section>

      <section class="detail-section">
        <h3>File Tree</h3>
        <ul class="tree-list">
          ${renderList((repo.fileTree || []).slice(0, 80), "No files detected.", (file) => `<li>${escapeHtml(file)}</li>`)}
        </ul>
      </section>

      <section class="detail-section">
        <h3>Notes</h3>
        <ul class="todo-list">
          ${renderList(repo.todos, "No TODO or FIXME notes found.", (todo) => `<li>${escapeHtml(todo.file)}:${todo.line} ${escapeHtml(todo.text)}</li>`)}
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

  function render() {
    renderSummary();
    renderLanguageMix();
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

  els.repoGrid.addEventListener("click", (event) => {
    const card = event.target.closest(".repo-card");
    if (!card) return;
    const repo = reposByPath.get(card.dataset.repoPath);
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

  els.closeDetail.addEventListener("click", closeDetail);
  els.detailOverlay.addEventListener("click", closeDetail);
  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && !els.detailOverlay.hidden) {
      closeDetail();
    }
  });

  populateLanguageFilter();
  render();
})();
