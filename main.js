/* ============================================================
   eason / eason — homepage interactions
   - language switch + i18n apply
   - reveal-on-scroll via IntersectionObserver
   - magnetic cursor halo (desktop)
   - hero typewriter loop
   ============================================================ */

(function () {
  'use strict';

  // ---------- placeholder content (replace when user provides real values) ----------
  const PLACEHOLDERS = {
    email:  'xuchenyang523@gmail.com',
    school: '',
    tagline: 'calm, useful tools',
    bio: '用 AI Agent 做一些有用的好用的工具，并把自己的一些梦想做成一些 APP。',
    bioEn: 'Crafting useful, well-made tools with AI Agents — and turning my daydreams into shippable apps.'
  };

  // ---------- helpers ----------
  const $  = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));

  // active locale, used by the project modal (rebuilt on open, so no data-i18n)
  let currentLang = 'zh-CN';

  const STORAGE_KEY = 'eason523.lang';
  const SUPPORTED = ['zh-CN', 'en-US'];

  function getInitialLang() {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved && SUPPORTED.includes(saved)) return saved;
    const nav = (navigator.language || 'zh-CN').toLowerCase();
    return nav.startsWith('zh') ? 'zh-CN' : 'en-US';
  }

  function applyPlaceholders(str, lang) {
    if (!str) return str;
    return str
      .replace(/\{\{school\}\}/g, PLACEHOLDERS.school)
      .replace(/\{\{tagline\}\}/g, PLACEHOLDERS.tagline)
      .replace(/\{\{bio\}\}/g, lang === 'zh-CN' ? PLACEHOLDERS.bio : PLACEHOLDERS.bioEn)
      .replace(/\{\{email\}\}/g, PLACEHOLDERS.email);
  }

  function applyLang(lang) {
    if (!HOMEPAGE_I18N[lang]) lang = 'zh-CN';
    currentLang = lang;

    // set html lang for accessibility + browser
    document.documentElement.setAttribute('lang', lang === 'zh-CN' ? 'zh-CN' : 'en');
    document.documentElement.setAttribute('data-lang', lang);

    // swap all data-i18n nodes
    $$('[data-i18n]').forEach((el) => {
      const key = el.getAttribute('data-i18n');
      const val = HOMEPAGE_I18N[lang][key];
      if (typeof val === 'string') {
        el.innerHTML = applyPlaceholders(val, lang);
      }
    });

    // resolve any data-i18n-attr-* (e.g. data-i18n-attr-href="mailto:{{email}}")
    $$('[data-i18n-attr-href]').forEach((el) => {
      const tpl = el.getAttribute('data-i18n-attr-href');
      if (typeof tpl === 'string') {
        el.setAttribute('href', applyPlaceholders(tpl, lang));
      }
    });

    // swap lang-switch buttons
    $$('.lang-switch button').forEach((btn) => {
      const active = btn.getAttribute('data-lang') === lang;
      btn.classList.toggle('is-active', active);
      btn.setAttribute('aria-pressed', String(active));
    });

    // update <title>
    document.title = lang === 'zh-CN' ? 'XCY — eason' : 'eason — XCY';

    // re-run typewriter with new word list
    restartTypewriter(lang);

    // persist
    try { localStorage.setItem(STORAGE_KEY, lang); } catch (_) {}
  }

  function bindLangSwitch() {
    const root = $('#lang-switch');
    if (!root) return;
    root.addEventListener('click', (e) => {
      const btn = e.target.closest('button[data-lang]');
      if (!btn) return;
      applyLang(btn.getAttribute('data-lang'));
    });
  }

  // ---------- theme switch (system / light / dark) ----------
  const THEME_KEY = 'eason523.theme';
  const THEMES = ['system', 'light', 'dark'];
  const THEME_ICON = { system: '◐', light: '☀', dark: '☾' };
  const THEME_LABEL = { system: 'Theme: follow system', light: 'Theme: light', dark: 'Theme: dark' };

  function getInitialTheme() {
    try {
      const saved = localStorage.getItem(THEME_KEY);
      if (THEMES.includes(saved)) return saved;
    } catch (_) {}
    return 'system';
  }

  function resolvedTheme(theme) {
    if (theme === 'system') {
      return matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark';
    }
    return theme;
  }

  function syncThemeColor(theme) {
    // drive the two <meta name="theme-color"> tags so the browser chrome
    // matches even when the user overrides the OS preference
    const isLight = resolvedTheme(theme) === 'light';
    $$('meta[name="theme-color"]').forEach((m) => {
      const dark = /dark/.test(m.getAttribute('media') || '');
      m.setAttribute('content', dark ? '#0B0B12' : '#FBF9FF');
      m.setAttribute('media', (dark === isLight) ? 'not all' : 'all');
    });
  }

  function applyTheme(theme) {
    if (!THEMES.includes(theme)) theme = 'system';
    const root = document.documentElement;
    if (theme === 'system') root.removeAttribute('data-theme');
    else root.setAttribute('data-theme', theme);

    const btn = $('#theme-toggle');
    if (btn) {
      btn.textContent = THEME_ICON[theme];
      btn.setAttribute('aria-label', THEME_LABEL[theme]);
    }
    syncThemeColor(theme);
    try { localStorage.setItem(THEME_KEY, theme); } catch (_) {}
  }

  function bindThemeToggle() {
    const btn = $('#theme-toggle');
    if (!btn) return;
    btn.addEventListener('click', () => {
      const current = getInitialTheme();
      const next = THEMES[(THEMES.indexOf(current) + 1) % THEMES.length];
      applyTheme(next);
    });
  }

  // ---------- scroll reveal ----------
  function bindReveal() {
    const els = $$('.reveal');
    if (!('IntersectionObserver' in window)) {
      els.forEach((el) => el.classList.add('is-in'));
      return;
    }
    const io = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-in');
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -8% 0px' });
    els.forEach((el) => io.observe(el));
  }

  // ---------- project detail modal ----------
  function bindModal() {
    const modal = $('#modal');
    if (!modal) return;
    const body = $('#modal-body');
    if (!body) return;

    const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;

    function open(key) {
      const val = HOMEPAGE_I18N[currentLang][key];
      if (typeof val !== 'string') return;
      body.innerHTML = val;
      modal.hidden = false;
      document.body.classList.add('modal-open');
      requestAnimationFrame(() => modal.classList.add('is-open'));
      const closeBtn = $('.modal__close', modal);
      if (closeBtn) closeBtn.focus();
      // lock card hover tilt while modal is up
      $$('.card').forEach((c) => c.classList.add('is-modal-open'));
    }
    function close() {
      modal.classList.remove('is-open');
      document.body.classList.remove('modal-open');
      $$('.card').forEach((c) => c.classList.remove('is-modal-open'));
      if (reduce) { modal.hidden = true; return; }
      setTimeout(() => { if (!modal.classList.contains('is-open')) modal.hidden = true; }, 250);
    }

    $$('.card[data-detail]').forEach((card) => {
      card.addEventListener('click', (e) => {
        if (e.target.closest('a')) return; // keep in-card links working
        open(card.getAttribute('data-detail'));
      });
      card.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          open(card.getAttribute('data-detail'));
        }
      });
    });

    $$('[data-modal-close]', modal).forEach((el) => el.addEventListener('click', close));

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && !modal.hidden) close();
    });
  }

  // ---------- scroll progress bar + back-to-top ----------
  function bindScrollProgress() {
    const bar = $('#scroll-progress');
    const top = $('#to-top');
    if (!bar && !top) return;
    const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;

    const onScroll = () => {
      const h = document.documentElement;
      const max = h.scrollHeight - window.innerHeight;
      const p = max > 0 ? Math.min(window.scrollY / max, 1) : 0;
      if (bar) bar.style.transform = `scaleX(${p})`;
      if (top) {
        const visible = window.scrollY > 400;
        top.classList.toggle('is-visible', visible);
        top.setAttribute('aria-hidden', String(!visible));
        top.style.setProperty('--p', `${(p * 100).toFixed(2)}%`);
      }
    };
    if (top) {
      top.addEventListener('click', () => {
        window.scrollTo({ top: 0, behavior: reduce ? 'auto' : 'smooth' });
      });
    }
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
  }

  // ---------- magnetic cursor halo ----------
  function bindCursorHalo() {
    const halo = $('#cursor-halo');
    if (!halo) return;
    if (matchMedia('(hover: none)').matches) return; // touch devices
    if (matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    let targetX = window.innerWidth / 2;
    let targetY = window.innerHeight / 2;
    let curX = targetX;
    let curY = targetY;
    let visible = false;
    let rafId = null;

    function onMove(e) {
      targetX = e.clientX;
      targetY = e.clientY;
      if (!visible) {
        visible = true;
        halo.classList.add('is-visible');
        curX = targetX;
        curY = targetY;
        halo.style.transform = `translate(${curX}px, ${curY}px) translate(-50%, -50%)`;
      }
      // magnetic pull for interactive elements
      const el = e.target.closest('a, button, .card, .contact__link');
      halo.classList.toggle('is-active', !!el);
    }
    function onLeave() {
      visible = false;
      halo.classList.remove('is-visible');
    }
    function tick() {
      curX += (targetX - curX) * 0.18;
      curY += (targetY - curY) * 0.18;
      halo.style.transform = `translate(${curX}px, ${curY}px) translate(-50%, -50%)`;
      rafId = requestAnimationFrame(tick);
    }
    window.addEventListener('mousemove', onMove, { passive: true });
    document.addEventListener('mouseleave', onLeave);
    rafId = requestAnimationFrame(tick);

    // gentle tilt on cards
    $$('.card').forEach((card) => {
      card.addEventListener('mousemove', (e) => {
        const r = card.getBoundingClientRect();
        const x = ((e.clientX - r.left) / r.width  - 0.5) * 4;  // -2..2
        const y = ((e.clientY - r.top)  / r.height - 0.5) * -4; // -2..2
        card.style.transform = `translateY(-4px) perspective(800px) rotateX(${y}deg) rotateY(${x}deg)`;
      });
      card.addEventListener('mouseleave', () => {
        card.style.transform = '';
      });
    });
  }

  // ---------- typewriter ----------
  let twState = null;
  function restartTypewriter(lang) {
    const list = HOMEPAGE_TYPEWRITER[lang] || HOMEPAGE_TYPEWRITER['en-US'];
    twState = { list, i: 0, phase: 'typing', pos: 0, pause: 0, lang };
  }

  function tickTypewriter() {
    const target = $('#typewriter');
    if (!target || !twState) return;
    const { list } = twState;
    const word = list[twState.i] || '';

    if (twState.phase === 'typing') {
      twState.pos += 1;
      target.textContent = word.slice(0, twState.pos);
      if (twState.pos >= word.length) {
        twState.phase = 'pausing';
        twState.pause = 60;
      }
    } else if (twState.phase === 'pausing') {
      twState.pause -= 1;
      if (twState.pause <= 0) twState.phase = 'deleting';
    } else if (twState.phase === 'deleting') {
      twState.pos -= 1;
      target.textContent = word.slice(0, twState.pos);
      if (twState.pos <= 0) {
        twState.phase = 'typing';
        twState.i = (twState.i + 1) % list.length;
      }
    }
  }

  function bindTypewriter() {
    const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
    const target = $('#typewriter');
    if (!target) return;
    if (reduce) {
      target.textContent = (HOMEPAGE_TYPEWRITER['en-US'] || []).join(' · ');
      return;
    }
    restartTypewriter('zh-CN');
    // pacing: type 110ms/char, delete 50ms/char, pause ~1.2s
    setInterval(() => {
      if (!twState) return;
      if (twState.phase === 'typing') tickTypewriter();
    }, 110);
    setInterval(() => {
      if (!twState) return;
      if (twState.phase === 'deleting') tickTypewriter();
    }, 50);
    // pause countdown
    setInterval(() => {
      if (!twState) return;
      if (twState.phase === 'pausing') tickTypewriter();
    }, 60);
  }

  // ---------- nav state on scroll (transparency + scrollspy) ----------
  function bindNavState() {
    const nav = $('#nav');
    const links = $$('.nav__links a');

    // active-section observer: kick in ~35% viewport band, bottom nav excluded
    const sectionIds = ['work', 'blog', 'skills', 'journey', 'repos', 'contact'].map((id) => document.getElementById(id)).filter(Boolean);
    const io = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        const id = entry.target.id;
        if (entry.isIntersecting) {
          links.forEach((a) => a.classList.toggle('is-active', a.getAttribute('href') === `#${id}`));
        }
      });
    }, { rootMargin: '-40% 0px -55% 0px', threshold: 0 });

    sectionIds.forEach((s) => io.observe(s));

    const onScroll = () => {
      const atTop = window.scrollY <= 8;
      nav.classList.toggle('is-scrolled', !atTop);
      // soften the bottom border while scrolled into content
      nav.style.borderBottomColor = atTop
        ? 'color-mix(in srgb, var(--line) 0%, transparent)'
        : 'color-mix(in srgb, var(--line) 90%, transparent)';
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
  }

  // ---------- mobile nav menu ----------
  function bindNavMenu() {
    const nav = $('#nav');
    const toggle = $('#nav-toggle');
    if (!nav || !toggle) return;

    function setOpen(open) {
      nav.classList.toggle('is-open', open);
      toggle.setAttribute('aria-expanded', String(open));
    }
    toggle.addEventListener('click', () => setOpen(!nav.classList.contains('is-open')));
    $('#nav-links').addEventListener('click', (e) => {
      if (e.target.closest('a')) setOpen(false);
    });
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && nav.classList.contains('is-open')) setOpen(false);
    });
    // close when resized past the breakpoint
    window.addEventListener('resize', () => {
      if (window.innerWidth > 720) setOpen(false);
    });
  }

  // ---------- image error fallback ----------
  function bindImageFallbacks() {
    $$('img').forEach((img) => {
      img.addEventListener('error', () => {
        img.style.opacity = '0';
        const wrap = img.closest('.card__media');
        if (wrap && !wrap.querySelector('.card__media-fallback')) {
          const fb = document.createElement('div');
          fb.className = 'card__media-fallback';
          fb.setAttribute('aria-hidden', 'true');
          fb.textContent = img.alt || 'image';
          wrap.appendChild(fb);
        }
      });
    });
  }

  // ---------- GitHub recent repos (graceful fallback) ----------
  function bindRepos() {
    const list = $('#repos-list');
    if (!list) return;

    const render = (items) => {
      list.innerHTML = items.map((r) => `
        <a class="repo-card reveal" href="${r.html_url}" target="_blank" rel="noopener">
          <div class="repo-card__head">
            <h3 class="repo-card__name mono">${r.name}</h3>
            <span class="repo-card__star mono" aria-hidden="true">★ ${r.stargazers_count || 0}</span>
          </div>
          <p class="repo-card__desc">${r.description || ''}</p>
          <span class="repo-card__meta mono">${r.language || '—'}${r.fork ? ' · fork' : ''}</span>
        </a>`).join('');
      reveal();
    };

    const fail = () => {
      list.innerHTML = `<p class="repos__hint">${currentLang === 'zh-CN' ? '仓库暂时拉取不到，稍后再来。' : 'Repos unavailable right now.'}</p>`;
    };

    fetch('https://api.github.com/users/eason523/repos?sort=pushed&per_page=6&type=owner')
      .then((res) => {
        if (!res.ok) throw new Error(String(res.status));
        return res.json();
      })
      .then((data) => {
        const owner = data
          .filter((r) => !r.fork)
          .slice(0, 6);
        if (owner.length) render(owner); else fail();
      })
      .catch(fail);
  }

  // ---------- boot ----------
  function boot() {
    const initial = getInitialLang();
    bindLangSwitch();
    bindReveal();
    bindCursorHalo();
    bindTypewriter();
    bindNavState();
    bindImageFallbacks();
    bindThemeToggle();
    bindModal();
    bindScrollProgress();
    bindNavMenu();
    bindRepos();
    applyLang(initial);
    applyTheme(getInitialTheme());
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }
})();
