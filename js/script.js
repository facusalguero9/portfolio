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

// ---------------------------------------------------------------------
// i18n dictionary: every short UI string the "Switch language" button
// needs to swap, in one place. Long prose (the actual case studies etc.)
// lives twice in index.html instead — see the ".i18n-block" elements —
// because duplicating real HTML (with links, bold text, lists) in a JS
// string would be harder to read and edit than just writing it twice.
// ---------------------------------------------------------------------
const I18N = {
  en: {
    explorer: 'EXPLORER',
    sourceControl: 'SOURCE CONTROL',
    terminal: 'TERMINAL',
    builtWith: 'Built with Claude',
    profileRole: 'Zoho Developer · AI Specialist',
    linkUpwork: 'Upwork profile',
    linkLinkedin: 'LinkedIn profile',
    heroRole: 'Zoho Developer & AI Integration Specialist',
    heroLocation: '📍 Argentina · Working with clients worldwide via Upwork',
    ctaContact: '✉ Contact me',
    ctaUpwork: '↗ Upwork',
    ctaLinkedin: '↗ LinkedIn',
    badgeSuccess: '✓ 100% Job Success',
    badgeTopRated: '★ Top Rated',
    badgeEarned: '$60K+ earned',
    badgeHours: '4,848 hrs logged',
    badgeJobs: '11 jobs completed',
    termCmds: [
      { cmd: 'whoami', out: 'Facundo Salguero — Zoho Developer & AI Integration Specialist' },
      { cmd: 'cat skills.json | grep core', out: '"core_language": "Deluge"' },
      { cmd: 'open contact.txt', out: 'ff.aq199@gmail.com' },
    ],
  },
  es: {
    explorer: 'EXPLORADOR',
    sourceControl: 'CONTROL DE VERSIONES',
    terminal: 'TERMINAL',
    builtWith: 'Hecho con Claude',
    profileRole: 'Dev Zoho · Especialista en IA',
    linkUpwork: 'Perfil de Upwork',
    linkLinkedin: 'Perfil de LinkedIn',
    heroRole: 'Desarrollador Zoho y Especialista en Integración de IA',
    heroLocation: '📍 Argentina · Trabajo con clientes de todo el mundo vía Upwork',
    ctaContact: '✉ Contactarme',
    ctaUpwork: '↗ Upwork',
    ctaLinkedin: '↗ LinkedIn',
    badgeSuccess: '✓ 100% de éxito',
    badgeTopRated: '★ Mejor calificado',
    badgeEarned: '$60K+ ganados',
    badgeHours: '4.848 hs registradas',
    badgeJobs: '11 trabajos completados',
    termCmds: [
      { cmd: 'whoami', out: 'Facundo Salguero — Desarrollador Zoho y Especialista en IA' },
      { cmd: 'cat skills.json | grep core', out: '"core_language": "Deluge"' },
      { cmd: 'open contact.txt', out: 'ff.aq199@gmail.com' },
    ],
  },
};

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
     Theme toggle (dark / light)
     Every color in style.css is a CSS custom property (var(--...)), so
     switching themes is just flipping one attribute on <html> — the
     stylesheet's [data-theme="light"] block does the rest.
     --------------------------------------------------------------- */
  const root = document.documentElement;
  const themeToggle = document.getElementById('theme-toggle');

  function applyTheme(theme) {
    root.dataset.theme = theme;
    themeToggle.textContent = theme === 'light' ? '🌙' : '☀️';
    themeToggle.setAttribute(
      'aria-label',
      theme === 'light' ? 'Switch to dark theme' : 'Switch to light theme'
    );
    try { localStorage.setItem('theme', theme); } catch (e) { /* private browsing, etc. — fine to skip */ }
  }

  function initialTheme() {
    try {
      const saved = localStorage.getItem('theme');
      if (saved === 'light' || saved === 'dark') return saved;
    } catch (e) { /* ignore */ }
    // No stored preference yet: default to dark (the site's primary look)
    // regardless of OS setting — the toggle makes light mode one click away.
    return 'dark';
  }

  themeToggle.addEventListener('click', () => {
    applyTheme(root.dataset.theme === 'light' ? 'dark' : 'light');
  });

  applyTheme(initialTheme());

  /* ---------------------------------------------------------------
     Skin toggle (classic terminal look / modern rounded look)
     Same pattern as the theme toggle: one attribute on <html>, and
     style.css's html[data-skin="modern"] rules do the rest.
     --------------------------------------------------------------- */
  const skinToggle = document.getElementById('skin-toggle');

  function applySkin(skin) {
    root.dataset.skin = skin;
    skinToggle.textContent = skin === 'modern' ? '🖥 Classic' : '✨ Modern';
    skinToggle.setAttribute(
      'aria-label',
      skin === 'modern' ? 'Switch to classic IDE style' : 'Switch to modern style'
    );
    try { localStorage.setItem('skin', skin); } catch (e) { /* ignore */ }
  }

  function initialSkin() {
    try {
      const saved = localStorage.getItem('skin');
      if (saved === 'classic' || saved === 'modern') return saved;
    } catch (e) { /* ignore */ }
    return 'classic';
  }

  skinToggle.addEventListener('click', () => {
    applySkin(root.dataset.skin === 'modern' ? 'classic' : 'modern');
  });

  applySkin(initialSkin());

  /* ---------------------------------------------------------------
     Language toggle (English / Español)
     --------------------------------------------------------------- */
  const langButtons = document.querySelectorAll('.lang-btn');
  const i18nElements = document.querySelectorAll('[data-i18n]');
  const i18nBlocks   = document.querySelectorAll('.i18n-block');

  function setLanguage(lang) {
    root.lang = lang;

    // Short UI strings, swapped from the I18N dictionary above.
    i18nElements.forEach((el) => {
      const value = I18N[lang][el.dataset.i18n];
      if (value !== undefined) el.textContent = value;
    });

    // Long prose blocks: each pane has one English and one Spanish
    // .i18n-block — show the one matching the active language.
    i18nBlocks.forEach((block) => {
      block.hidden = block.dataset.lang !== lang;
    });

    // Highlight the active language button.
    langButtons.forEach((btn) => {
      btn.classList.toggle('active', btn.dataset.langBtn === lang);
    });

    try { localStorage.setItem('lang', lang); } catch (e) { /* ignore */ }

    restartTerminal(lang);
  }

  function initialLanguage() {
    try {
      const saved = localStorage.getItem('lang');
      if (saved === 'en' || saved === 'es') return saved;
    } catch (e) { /* ignore */ }
    // No stored preference: guess from the browser's language setting.
    return navigator.language && navigator.language.toLowerCase().startsWith('es') ? 'es' : 'en';
  }

  langButtons.forEach((btn) => {
    btn.addEventListener('click', () => setLanguage(btn.dataset.langBtn));
  });

  /* ---------------------------------------------------------------
     Terminal panel: collapse toggle + a small typewriter effect.
     Commands come from I18N[lang].termCmds, so switching language
     mid-animation restarts cleanly in the new language.
     --------------------------------------------------------------- */
  const terminalPanel  = document.getElementById('terminal-panel');
  const terminalToggle = document.getElementById('terminal-toggle');
  const terminalLine   = document.getElementById('terminal-line');

  terminalToggle.addEventListener('click', () => {
    const collapsed = terminalPanel.classList.toggle('collapsed');
    terminalToggle.textContent = collapsed ? '▸' : '▾';
    terminalToggle.setAttribute('aria-expanded', String(!collapsed));
  });

  let cmdIndex = 0;
  let typeIntervalId = null;
  let outputTimeoutId = null;
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  function typeLoop(lang) {
    const commands = I18N[lang].termCmds;
    const { cmd, out } = commands[cmdIndex % commands.length];
    let i = 0;
    terminalLine.textContent = '';

    typeIntervalId = setInterval(() => {
      terminalLine.textContent = cmd.slice(0, i + 1);
      i++;
      if (i === cmd.length) {
        clearInterval(typeIntervalId);
        outputTimeoutId = setTimeout(() => showOutput(out, lang), 400);
      }
    }, 55);
  }

  function showOutput(out, lang) {
    const outputLine = document.createElement('p');
    outputLine.className = 'terminal-output-line';
    outputLine.style.color = 'var(--term-text-dim)';
    outputLine.textContent = out;
    terminalLine.parentElement.insertBefore(outputLine, terminalLine.parentElement.lastElementChild.nextSibling);

    outputTimeoutId = setTimeout(() => {
      outputLine.remove();
      cmdIndex = (cmdIndex + 1) % I18N[lang].termCmds.length;
      typeLoop(lang);
    }, 2600);
  }

  function restartTerminal(lang) {
    clearInterval(typeIntervalId);
    clearTimeout(outputTimeoutId);
    terminalLine.parentElement.querySelectorAll('.terminal-output-line').forEach((n) => n.remove());

    if (prefersReducedMotion) {
      terminalLine.textContent = I18N[lang].termCmds[0].cmd;
    } else {
      typeLoop(lang);
    }
  }

  // Apply the detected/stored language once on load (also starts the
  // terminal for the first time).
  setLanguage(initialLanguage());
});
