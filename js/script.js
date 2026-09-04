/**
 * Facundo Salguero — portfolio-as-code-editor
 *
 * LEARNING NOTES (Facu): this file is plain vanilla JavaScript — no
 * framework, no build step. Every browser understands it as-is. The
 * three ideas doing all the work here are:
 *   1. document.querySelector / querySelectorAll — find elements.
 *   2. element.addEventListener('click', fn) — react to user actions.
 *   3. element.classList.add/remove/toggle — change what's on screen.
 * That's ~80% of front-end JavaScript in practice.
 */

// Wrap everything in a listener for DOMContentLoaded so we don't try to
// grab elements before the browser has finished building the page.
document.addEventListener('DOMContentLoaded', () => {

  const ICONS = { md: 'M↓', json: '{}', txt: '≡' };

  const sidebar   = document.getElementById('sidebar');
  const tabbar    = document.getElementById('tabbar');
  const statusFile = document.getElementById('status-file');
  const allFileButtons = document.querySelectorAll('.file-item');
  const allPanes  = document.querySelectorAll('.pane');

  // Keep track of which files are "open" (have a tab), in order.
  let openTabs = ['about'];

  /* ---------------------------------------------------------------
     Opening / activating a file
     --------------------------------------------------------------- */
  function openFile(target) {
    if (!openTabs.includes(target)) {
      openTabs.push(target);
      renderTabs();
    }
    activateFile(target);
  }

  function activateFile(target) {
    // 1. Sidebar: mark the matching button as selected.
    allFileButtons.forEach((btn) => {
      const isMatch = btn.dataset.target === target;
      btn.classList.toggle('active', isMatch);
      btn.setAttribute('aria-selected', isMatch ? 'true' : 'false');
    });

    // 2. Editor: show the matching pane, hide the rest.
    allPanes.forEach((pane) => {
      pane.classList.toggle('active', pane.id === `pane-${target}`);
    });

    // 3. Tab bar: mark the matching tab as active.
    tabbar.querySelectorAll('.tab').forEach((tab) => {
      tab.classList.toggle('active', tab.dataset.target === target);
    });

    // 4. Status bar: show the current filename.
    const meta = getFileMeta(target);
    if (meta && statusFile) statusFile.textContent = meta.label;

    // On mobile, pick a file and close the drawer automatically.
    closeSidebarOnMobile();
  }

  function getFileMeta(target) {
    const btn = document.querySelector(`.file-item[data-target="${target}"]`);
    if (!btn) return null;
    return { label: btn.dataset.label, icon: btn.dataset.icon };
  }

  /* ---------------------------------------------------------------
     Tab bar rendering
     --------------------------------------------------------------- */
  function renderTabs() {
    tabbar.innerHTML = '';
    openTabs.forEach((target) => {
      const meta = getFileMeta(target);
      if (!meta) return;

      const tab = document.createElement('button');
      tab.className = 'tab';
      tab.dataset.target = target;
      tab.setAttribute('role', 'tab');
      tab.innerHTML =
        `<span class="file-icon icon-${meta.icon}">${ICONS[meta.icon] || ''}</span> ` +
        `${meta.label} <span class="tab-close" data-close="${target}">×</span>`;
      tabbar.appendChild(tab);
    });
  }

  /* ---------------------------------------------------------------
     Event delegation: one listener on the container instead of one
     per button. Cheaper, and it keeps working for tabs we create
     dynamically later.
     --------------------------------------------------------------- */
  sidebar.addEventListener('click', (event) => {
    const fileBtn = event.target.closest('.file-item');
    if (fileBtn) {
      openFile(fileBtn.dataset.target);
      return;
    }

    const folderBtn = event.target.closest('.folder-item');
    if (folderBtn) {
      const expanded = folderBtn.getAttribute('aria-expanded') === 'true';
      folderBtn.setAttribute('aria-expanded', String(!expanded));
    }
  });

  tabbar.addEventListener('click', (event) => {
    const closeBtn = event.target.closest('.tab-close');
    if (closeBtn) {
      event.stopPropagation();
      closeTab(closeBtn.dataset.close);
      return;
    }
    const tab = event.target.closest('.tab');
    if (tab) activateFile(tab.dataset.target);
  });

  function closeTab(target) {
    const wasActive = tabbar.querySelector(`.tab.active`)?.dataset.target === target;
    openTabs = openTabs.filter((t) => t !== target);

    if (openTabs.length === 0) openTabs = ['about']; // always keep at least one tab open

    renderTabs();
    if (wasActive) activateFile(openTabs[openTabs.length - 1]);
  }

  /* ---------------------------------------------------------------
     Mobile sidebar drawer
     --------------------------------------------------------------- */
  const sidebarToggle = document.getElementById('sidebar-toggle');
  sidebarToggle.addEventListener('click', () => {
    const isOpen = sidebar.classList.toggle('open');
    sidebarToggle.setAttribute('aria-expanded', String(isOpen));
  });

  function closeSidebarOnMobile() {
    if (window.matchMedia('(max-width: 860px)').matches) {
      sidebar.classList.remove('open');
      sidebarToggle.setAttribute('aria-expanded', 'false');
    }
  }

  // Tap outside the open mobile drawer to close it (common mobile-menu pattern).
  document.addEventListener('click', (event) => {
    const isMobile = window.matchMedia('(max-width: 860px)').matches;
    const clickedInsideSidebar = sidebar.contains(event.target);
    const clickedToggle = sidebarToggle.contains(event.target);
    if (isMobile && sidebar.classList.contains('open') && !clickedInsideSidebar && !clickedToggle) {
      sidebar.classList.remove('open');
      sidebarToggle.setAttribute('aria-expanded', 'false');
    }
  });

  /* ---------------------------------------------------------------
     Terminal panel: collapse toggle + a small typewriter effect
     --------------------------------------------------------------- */
  const terminalPanel  = document.getElementById('terminal-panel');
  const terminalToggle = document.getElementById('terminal-toggle');
  const terminalLine   = document.getElementById('terminal-line');

  terminalToggle.addEventListener('click', () => {
    const collapsed = terminalPanel.classList.toggle('collapsed');
    terminalToggle.textContent = collapsed ? '▸' : '▾';
    terminalToggle.setAttribute('aria-expanded', String(!collapsed));
  });

  const commands = [
    { cmd: 'whoami', out: 'Facundo Salguero — Zoho Developer & AI Integration Specialist' },
    { cmd: 'cat skills.json | grep core', out: '"core_language": "Deluge"' },
    { cmd: 'open contact.txt', out: 'ff.aq199@gmail.com' },
  ];

  let cmdIndex = 0;

  function typeLoop() {
    const { cmd, out } = commands[cmdIndex];
    let i = 0;
    terminalLine.textContent = '';

    const typeInterval = setInterval(() => {
      terminalLine.textContent = cmd.slice(0, i + 1);
      i++;
      if (i === cmd.length) {
        clearInterval(typeInterval);
        setTimeout(() => showOutput(out), 400);
      }
    }, 55);
  }

  function showOutput(out) {
    const outputLine = document.createElement('p');
    outputLine.className = 'terminal-output-line';
    outputLine.style.color = 'var(--text-dim)';
    outputLine.textContent = out;
    terminalLine.parentElement.insertBefore(outputLine, terminalLine.parentElement.lastElementChild.nextSibling);

    setTimeout(() => {
      outputLine.remove();
      cmdIndex = (cmdIndex + 1) % commands.length;
      typeLoop();
    }, 2600);
  }

  // Respect users who've asked their OS for reduced motion.
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (!prefersReducedMotion) {
    typeLoop();
  } else {
    terminalLine.textContent = 'whoami';
  }
});
