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

  // ---------- nav state on scroll ----------
  function bindNavState() {
    const nav = $('#nav');
    if (!nav) return;
    const onScroll = () => {
      nav.style.borderBottomColor = window.scrollY > 8
        ? 'color-mix(in srgb, var(--line) 90%, transparent)'
        : 'color-mix(in srgb, var(--line) 60%, transparent)';
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
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

  // ---------- boot ----------
  function boot() {
    const initial = getInitialLang();
    bindLangSwitch();
    bindReveal();
    bindCursorHalo();
    bindTypewriter();
    bindNavState();
    bindImageFallbacks();
    applyLang(initial);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }
})();