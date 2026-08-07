/* ============================================================
   eason / blog — shared scripts
   renders index.html (list + search + filter) and post.html
   ============================================================ */

(function () {
  'use strict';

  const $  = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));

  const LANG_KEY = 'eason523.lang';
  const THEME_KEY = 'eason523.theme';

  // ---------- blog UI copy ----------
  const BLOG_I18N = {
    'zh-CN': {
      'arch.brand': 'journal',
      'arch.title': '随笔',
      'arch.sub': '工程 · 项目 · 随笔 —— 慢慢写，频繁发。',
      searchPlaceholder: '搜索文章…',
      'empty': '没有匹配的文章。',
      'post.back': '← 全部文章',
      all: '全部', prev: '← 上一篇', next: '下一篇 →', read: '分钟阅读', categoryLabel: '分类'
    },
    'en-US': {
      'arch.brand': 'journal',
      'arch.title': 'Notes',
      'arch.sub': 'Engineering · Projects · Essays — written slowly, published often.',
      searchPlaceholder: 'Search posts…',
      'empty': 'No posts match.',
      'post.back': '← All posts',
      all: 'All', prev: '← Previous', next: 'Next →', read: 'min read', categoryLabel: 'Category'
    }
  };

  // ---------- state ----------
  let lang = 'zh-CN';
  let state = { q: '', cat: 'all' };

  // ---------- helpers ----------
  function getInitialLang() {
    try {
      const saved = localStorage.getItem(LANG_KEY);
      if (saved && (saved === 'zh-CN' || saved === 'en-US')) return saved;
    } catch (_) {}
    return (navigator.language || 'zh-CN').toLowerCase().startsWith('zh') ? 'zh-CN' : 'en-US';
  }

  function catName(cat) {
    const c = BLOG_DATA.categories[cat];
    return (c && c[lang]) || cat;
  }
  function tagStr(tags) {
    return (tags || []).join(' ');
  }

  // crude reading time: zh ~400 chars/min, en ~200 words/min
  function readMins(post) {
    const text = (post.body[lang] || '').replace(/<[^>]+>/g, ' ');
    let n;
    if (lang === 'zh-CN') n = text.replace(/\s/g, '').length;
    else n = text.trim().split(/\s+/).length;
    return Math.max(1, Math.ceil(n / (lang === 'zh-CN' ? 400 : 200)));
  }

  function fmtDate(dateStr) {
    const d = new Date(dateStr);
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${d.getFullYear()}/${m}/${day}`;
  }

  function fmtBody(post) {
    return (post.body[lang] || post.body['zh-CN'] || '');
  }

  // ---------- i18n for the blog chrome ----------
  function applyBlogI18n() {
    const dict = BLOG_I18N[lang];
    $$('[data-b-i18n]').forEach((el) => {
      const v = dict[el.getAttribute('data-b-i18n')];
      if (typeof v === 'string') el.innerHTML = v;
    });
    $$('[data-b-i18n-attr]').forEach((el) => {
      const v = dict[el.getAttribute('data-b-i18n-attr')];
      if (typeof v === 'string') el.setAttribute('placeholder', v);
    });
  }

  // ---------- theme (same behaviour as homepage) ----------
  const THEMES = ['system', 'light', 'dark'];
  const THEME_ICON = { system: '◐', light: '☀', dark: '☾' };
  function getTheme() {
    try { const s = localStorage.getItem(THEME_KEY); if (THEMES.includes(s)) return s; } catch (_) {}
    return 'system';
  }
  function applyTheme(t) {
    const root = document.documentElement;
    if (t === 'system') root.removeAttribute('data-theme'); else root.setAttribute('data-theme', t);
    const btn = $('#theme-toggle');
    if (btn) btn.textContent = THEME_ICON[t];
    const isLight = t === 'system'
      ? matchMedia('(prefers-color-scheme: light)').matches
      : t === 'light';
    $$('meta[name="theme-color"]').forEach((m) => {
      const dark = /dark/.test(m.getAttribute('media') || '');
      m.setAttribute('content', dark ? '#0B0B12' : '#FBF9FF');
      m.setAttribute('media', (dark === isLight) ? 'not all' : 'all');
    });
    try { localStorage.setItem(THEME_KEY, t); } catch (_) {}
  }
  function bindTheme() {
    const btn = $('#theme-toggle');
    if (!btn) return;
    btn.addEventListener('click', () => {
      const cur = getTheme();
      applyTheme(THEMES[(THEMES.indexOf(cur) + 1) % THEMES.length]);
    });
  }

  // scroll progress (thin top bar)
  function bindProgress() {
    const bar = $('#scroll-progress');
    if (!bar) return;
    const onScroll = () => {
      const h = document.documentElement;
      const max = h.scrollHeight - window.innerHeight;
      bar.style.transform = `scaleX(${max > 0 ? Math.min(scrollY / max, 1) : 0})`;
    };
    addEventListener('scroll', onScroll, { passive: true });
    onScroll();
  }

  // ---------- index page ----------
  function bindLang() {
    const root = $('#lang-switch');
    if (!root) return;
    root.addEventListener('click', (e) => {
      const btn = e.target.closest('button[data-lang]');
      if (!btn) return;
      lang = btn.getAttribute('data-lang');
      try { localStorage.setItem(LANG_KEY, lang); } catch (_) {}
      renderIndex();
      applyBlogI18n();
    });
  }

  function setLangButtons() {
    $$('.lang-switch button').forEach((btn) => {
      const active = btn.getAttribute('data-lang') === lang;
      btn.classList.toggle('is-active', active);
      btn.setAttribute('aria-pressed', String(active));
    });
  }

  function renderFilters() {
    const list = $('#blog-filters');
    if (!list) return;
    list.innerHTML = '';
    const cats = [['all', BLOG_I18N[lang].all]].concat(
      Object.keys(BLOG_DATA.categories).map((c) => [c, catName(c)])
    );
    cats.forEach(([cat, label]) => {
      const b = document.createElement('button');
      b.type = 'button';
      b.dataset.cat = cat;
      b.textContent = label;
      if (cat === state.cat) b.classList.add('is-active');
      b.addEventListener('click', () => {
        state.cat = cat;
        renderIndex();
      });
      list.appendChild(b);
    });
  }

  function renderIndex() {
    setLangButtons();
    renderFilters();

    const list = $('#blog-list');
    const empty = $('#blog-empty');
    if (!list) return;

    const q = state.q.trim().toLowerCase();
    const posts = BLOG_DATA.posts.filter((p) => {
      if (state.cat !== 'all' && p.category !== state.cat) return false;
      if (!q) return true;
      const hay = `${p.title[lang]} ${p.excerpt[lang]} ${p.category} ${tagStr(p.tags)}`.toLowerCase();
      return hay.includes(q);
    });

    empty.hidden = posts.length > 0;
    list.innerHTML = '';

    posts.forEach((p, i) => {
      const a = document.createElement('a');
      a.href = `post.html?slug=${p.slug}`;
      a.className = 'blog-link reveal';
      a.innerHTML = `
        <div class="blog-link__meta mono">
          <span class="blog-link__cat">${catName(p.category)}</span>
          <span class="blog-link__date">${fmtDate(p.date)}</span>
          <span class="blog-link__read">${readMins(p)} ${BLOG_I18N[lang].read}</span>
        </div>
        <h3 class="blog-link__title">${p.title[lang]}</h3>
        <p class="blog-link__excerpt">${p.excerpt[lang]}</p>
        <span class="blog-link__more mono">→</span>`;
      list.appendChild(a);
    });
    reveal();
  }

  function reveal() {
    if (!('IntersectionObserver' in window)) {
      $$('.blog-link').forEach((el) => el.classList.add('is-in'));
      return;
    }
    $$('.blog-link').forEach((el, idx) => {
      el.style.transitionDelay = `${Math.min(idx * 40, 240)}ms`;
    });
    const io = new IntersectionObserver((entries) => {
      entries.forEach((en) => { if (en.isIntersecting) { en.target.classList.add('is-in'); io.unobserve(en.target); } });
    }, { threshold: 0.1 });
    $$('.blog-link').forEach((el) => io.observe(el));
  }

  function bindSearch() {
    const input = $('#blog-search');
    if (!input) return;
    let t;
    input.addEventListener('input', () => {
      clearTimeout(t);
      t = setTimeout(() => { state.q = input.value; renderIndex(); }, 140);
    });
  }

  // ---------- single post page ----------
  function renderPost() {
    const head = $('#article-head');
    const body = $('#article-body');
    const nav = $('#article-nav');
    if (!head || !body) return;

    const slug = new URLSearchParams(location.search).get('slug');
    const idx = BLOG_DATA.posts.findIndex((p) => p.slug === slug);
    if (idx === -1) {
      body.innerHTML = `<p>${BLOG_I18N[lang].empty}</p>`;
      return;
    }
    const p = BLOG_DATA.posts[idx];
    const prev = BLOG_DATA.posts[idx - 1];
    const next = BLOG_DATA.posts[idx + 1];

    document.title = `${p.title[lang]} — eason`;
    $('#article-head').innerHTML = `
      <p class="mono article__cat">${catName(p.category)}</p>
      <h1 class="article__title">${p.title[lang]}</h1>
      <p class="mono article__meta">${fmtDate(p.date)} · ${readMins(p)} ${BLOG_I18N[lang].read}</p>
      <div class="article__tags">${(p.tags || []).map((t) => `<span>${t}</span>`).join('')}</div>`;
    body.innerHTML = fmtBody(p);

    let navHTML = '';
    if (prev) navHTML += `<a class="article__nav-link article__nav-link--prev mono" href="post.html?slug=${prev.slug}">${BLOG_I18N[lang].prev} · ${prev.title[lang]}</a>`;
    if (next) navHTML += `<a class="article__nav-link article__nav-link--next mono" href="post.html?slug=${next.slug}">${next.title[lang]} · ${BLOG_I18N[lang].next}</a>`;
    nav.innerHTML = navHTML;

    // refresh meta theme-color on scroll progress is handled; reveal body
    body.classList.add('is-in');
  }

  // ---------- boot ----------
  function boot() {
    lang = getInitialLang();
    bindTheme();
    bindProgress();
    applyTheme(getTheme());

    if ($('#blog-list')) {
      bindLang();
      bindSearch();
      renderIndex();
    }
    if ($('#article-body')) {
      bindLang();
      renderPost();
    }
    applyBlogI18n();
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();
})();