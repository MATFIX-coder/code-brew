/* ==========================================================================
   Code&Brew — общий скрипт: шапка/подвал, анимации, рендер страниц из data.js
   ========================================================================== */
(() => {
  const D = window.CB;
  const page = document.body.dataset.page;
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const finePointer = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
  const hasGsap = typeof window.gsap !== 'undefined';
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];

  const ICON = {
    arrow: '<svg class="arrow" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 12h14M13 6l6 6-6 6"/></svg>',
    arrowUR: '<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M7 17 17 7M8 7h9v9"/></svg>',
    gh: '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12 .5a11.5 11.5 0 0 0-3.64 22.41c.58.1.79-.25.79-.56v-2c-3.2.7-3.88-1.37-3.88-1.37-.53-1.33-1.28-1.69-1.28-1.69-1.05-.71.08-.7.08-.7 1.16.08 1.77 1.19 1.77 1.19 1.03 1.77 2.7 1.26 3.36.96.1-.75.4-1.26.73-1.55-2.55-.29-5.24-1.28-5.24-5.68 0-1.26.45-2.28 1.19-3.09-.12-.29-.52-1.46.11-3.04 0 0 .97-.31 3.17 1.18a11 11 0 0 1 5.77 0c2.2-1.49 3.17-1.18 3.17-1.18.63 1.58.23 2.75.11 3.04.74.81 1.19 1.83 1.19 3.09 0 4.41-2.69 5.38-5.25 5.67.41.36.78 1.06.78 2.14v3.17c0 .31.21.67.8.56A11.5 11.5 0 0 0 12 .5Z"/></svg>',
    tg: '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M21.9 4.3 18.7 19.4c-.2 1-.9 1.3-1.7.8l-4.9-3.6-2.4 2.3c-.3.3-.5.5-1 .5l.3-5 9.1-8.2c.4-.4-.1-.6-.6-.2L6.2 13.1l-4.8-1.5c-1-.3-1.1-1 .2-1.5L20.5 3c.9-.3 1.6.2 1.4 1.3Z"/></svg>',
    spark: '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12 0c.7 6.6 5.4 11.3 12 12-6.6.7-11.3 5.4-12 12-.7-6.6-5.4-11.3-12-12C6.6 11.3 11.3 6.6 12 0Z"/></svg>'
  };

  const NAV = [
    ['index.html', 'Главная', 'home'],
    ['projects.html', 'Проекты', 'projects'],
    ['events.html', 'Хакатоны', 'events'],
    ['team.html', 'Команда', 'team']
  ];

  const fmtDate = (iso) => iso.split('-').reverse().join('.');
  const MONTHS = ['январь', 'февраль', 'март', 'апрель', 'май', 'июнь', 'июль', 'август', 'сентябрь', 'октябрь', 'ноябрь', 'декабрь'];
  const monthYear = (iso) => { const [y, m] = iso.split('-'); return `${MONTHS[+m - 1]} ${y}`; };
  const projectBySlug = (slug) => D.projects.find((p) => p.slug === slug);
  const memberName = (id) => D.team.find((m) => m.id === id)?.name || id;
  const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

  /* ------------------------------------------------------------------
     Общие элементы: шапка, мобильное меню, подвал, курсор
     ------------------------------------------------------------------ */
  function renderLayout() {
    const header = document.createElement('header');
    header.className = 'site-header';
    header.innerHTML = `
      <div class="container">
        <a class="logo" href="index.html" aria-label="Code&Brew — на главную">
          <img src="assets/img/brand/favicon.png" alt="" width="38" height="38">
          <span>Code<span class="amp">&amp;</span>Brew</span>
        </a>
        <nav class="nav" aria-label="Основное меню">
          ${NAV.map(([href, label, key]) => `<a href="${href}"${key === page || (page === 'project' && key === 'projects') ? ' aria-current="page"' : ''}>${label}</a>`).join('')}
        </nav>
        <div class="header-actions">
          <a class="btn btn--sm" href="index.html#contact">Обсудить проект ${ICON.arrow}</a>
          <button class="burger" type="button" aria-label="Открыть меню" aria-expanded="false"><span></span><span></span></button>
        </div>
      </div>`;
    document.body.prepend(header);

    const mm = document.createElement('div');
    mm.className = 'mobile-menu';
    mm.innerHTML = `
      ${NAV.map(([href, label], i) => `<a href="${href}"><span>0${i + 1}</span>${label}</a>`).join('')}
      <a href="index.html#contact"><span>05</span>Связаться</a>
      <div class="mm-foot">${D.org.city} · ${D.org.university}</div>`;
    document.body.appendChild(mm);

    const burger = $('.burger', header);
    burger.addEventListener('click', () => {
      const open = document.body.classList.toggle('menu-open');
      burger.setAttribute('aria-expanded', open);
      window.__lenis?.[open ? 'stop' : 'start']();
    });
    $$('a', mm).forEach((a) => a.addEventListener('click', () => {
      document.body.classList.remove('menu-open');
      window.__lenis?.start();
    }));

    const footer = document.createElement('footer');
    footer.className = 'site-footer';
    footer.innerHTML = `
      <div class="container">
        <div class="footer__grid">
          <div>
            <a class="logo" href="index.html"><img src="assets/img/brand/favicon.png" alt="" width="38" height="38"><span>Code<span class="amp">&amp;</span>Brew</span></a>
            <p class="footer__about">Команда разработчиков из Екатеринбурга. ${esc(D.org.slogan)}.</p>
          </div>
          <div><h4>Навигация</h4><ul>${NAV.map(([h, l]) => `<li><a class="link-u" href="${h}">${l}</a></li>`).join('')}</ul></div>
          <div><h4>Проекты</h4><ul>${D.projects.map((p) => `<li><a class="link-u" href="project.html?p=${p.slug}">${esc(p.title)}</a></li>`).join('')}</ul></div>
          <div><h4>Связь</h4><ul>
            <li><a class="link-u" href="${D.org.github}" target="_blank" rel="noopener">GitHub</a></li>
            <li><a class="link-u" href="mailto:${D.org.contacts.email}">${D.org.contacts.email}</a></li>
            <li><a class="link-u" href="index.html#contact">Telegram команды</a></li>
          </ul></div>
        </div>
        <div class="footer__bottom"><span>© ${new Date().getFullYear()} Code&amp;Brew</span><span>${D.org.city} · ${D.org.university}</span></div>
      </div>
      <div class="footer__mark" aria-hidden="true">Code<span class="amp">&amp;</span>Brew</div>`;
    document.body.appendChild(footer);

    const wipe = document.createElement('div');
    wipe.className = 'page-wipe';
    wipe.innerHTML = '<i></i><i></i><i></i><i></i><i></i>';
    document.body.appendChild(wipe);

    if (finePointer && !reduced) {
      const ring = document.createElement('div'); ring.className = 'cursor'; ring.innerHTML = '<span></span>';
      const dot = document.createElement('div'); dot.className = 'cursor-dot';
      document.body.append(ring, dot);
    }
  }

  /* ------------------------------------------------------------------
     Рендер разделов из data.js
     ------------------------------------------------------------------ */
  const teamCard = (m) => `
    <article class="member" data-reveal>
      <div class="member__photo">
        <img src="${m.photo}" alt="${esc(m.name)}" loading="lazy">
        <a class="member__gh" href="https://github.com/${m.github}" target="_blank" rel="noopener" aria-label="GitHub ${esc(m.name)}">${ICON.gh}<span>@${esc(m.github)}</span></a>
      </div>
      <h3 class="member__name">${esc(m.name)}</h3>
      <a class="member__note member__tg link-u" href="https://t.me/${m.telegram}" target="_blank" rel="noopener">${ICON.tg}@${esc(m.telegram)}</a>
    </article>`;

  function renderHome() {
    const track = $('#hs-track');
    if (track) {
      track.innerHTML = D.projects.map((p, i) => `
        <a class="hpanel" href="project.html?p=${p.slug}" data-cursor="Открыть">
          <div class="hpanel__media">
            <div class="hpanel__badge"><span class="chip">${esc(p.kind)}</span>${p.context ? `<span class="chip">${esc(p.context)}</span>` : ''}</div>
            <img src="${p.cover}" alt="${esc(p.title)}" loading="lazy">
          </div>
          <div class="hpanel__info">
            <div><h3 class="hpanel__title">${esc(p.title)}</h3><p class="hpanel__sub">${esc(p.subtitle)}</p></div>
            <span class="hpanel__idx">${String(i + 1).padStart(2, '0')} / ${String(D.projects.length).padStart(2, '0')}</span>
          </div>
        </a>`).join('') + `
        <div class="hpanel hpanel--end">
          <a href="projects.html" data-cursor="Все">
            <span class="big-arrow">${ICON.arrowUR}</span>
            <span class="h-card">Все проекты</span>
            <span class="muted">Подробно о каждом: задача, решение, стек и команда</span>
          </a>
        </div>`;
    }
    const ev = $('#home-events');
    if (ev) {
      ev.innerHTML = [...D.events].reverse().map((e) => `
        <a class="ev-row" href="events.html" ${e.cert ? `data-preview="${e.cert}"` : (e.project ? `data-preview="${projectBySlug(e.project).cover}"` : '')} data-cursor="Смотреть">
          <span class="ev-row__date">${fmtDate(e.date)}</span>
          <span class="ev-row__title">${esc(e.title)}</span>
          <span class="ev-row__type ${e.type === 'Хакатон' ? 'is-hack' : ''}">${e.type}</span>
          <span class="ev-row__arrow">${ICON.arrowUR}</span>
        </a>`).join('');
    }
    const team = $('#home-team');
    if (team) team.innerHTML = D.team.map(teamCard).join('');
    const tg = $('#tg-grid');
    if (tg) {
      tg.innerHTML = D.team.map((m) => `
        <a class="tg-card card" href="https://t.me/${m.telegram}" target="_blank" rel="noopener" data-cursor="Написать" data-reveal>
          <span class="tg-card__qr"><img src="assets/img/qr/${m.telegram.toLowerCase()}.svg" alt="QR-код Telegram ${esc(m.name)}" width="132" height="132" loading="lazy"></span>
          <span class="tg-card__who"><img src="${m.photo}" alt="" loading="lazy"><span><b>${esc(m.name)}</b><span class="tg-card__nick">${ICON.tg}@${esc(m.telegram)}</span></span></span>
        </a>`).join('');
    }
  }

  function renderProjects() {
    const grid = $('#pgrid');
    if (!grid) return;
    const sizes = ['is-wide', 'is-narrow', 'is-narrow', 'is-wide', ''];
    grid.innerHTML = D.projects.map((p, i) => `
      <a class="pcard ${sizes[i % sizes.length]}" href="project.html?p=${p.slug}" data-filter="${p.filter}" style="--accent:${p.accent}" data-cursor="Открыть" data-reveal>
        <div class="pcard__media"><img src="${p.cover}" alt="${esc(p.title)}" loading="lazy"></div>
        <div class="pcard__top"><h2 class="pcard__title">${esc(p.title)}</h2><span class="pcard__year">${p.year}</span></div>
        <p class="pcard__sub">${esc(p.subtitle)}</p>
        <div class="chips"><span class="chip">${esc(p.kind)}</span><span class="chip">${esc(p.status)}</span></div>
      </a>`).join('');
    $('#pcount').firstChild.textContent = String(D.projects.length).padStart(2, '0');

    const groups = [['all', 'Все'], ['web', 'Веб-сервисы'], ['game', 'Игры'], ['ai', 'ИИ'], ['analytics', 'Аналитика']];
    const f = $('#filters');
    f.innerHTML = groups.map(([k, l], i) => {
      const n = k === 'all' ? D.projects.length : D.projects.filter((p) => p.filter === k).length;
      return `<button class="filter-btn${i === 0 ? ' is-active' : ''}" data-f="${k}" type="button">${l}<sup>${n}</sup></button>`;
    }).join('');
    f.addEventListener('click', (e) => {
      const b = e.target.closest('.filter-btn'); if (!b) return;
      $$('.filter-btn', f).forEach((x) => x.classList.toggle('is-active', x === b));
      $$('.pcard', grid).forEach((c) => c.classList.toggle('is-out', b.dataset.f !== 'all' && c.dataset.filter !== b.dataset.f));
    });
  }

  function renderProject() {
    const root = $('#project');
    if (!root) return;
    const slug = new URLSearchParams(location.search).get('p');
    const idx = D.projects.findIndex((p) => p.slug === slug);
    if (idx < 0) { location.replace('projects.html'); return; }
    const p = D.projects[idx];
    const next = D.projects[(idx + 1) % D.projects.length];
    document.title = `${p.title} — Code&Brew`;
    root.style.setProperty('--accent', p.accent);

    const members = D.team.filter((m) => m.projects.some(([s]) => s === p.slug));
    const guests = D.guests.filter((g) => g.project === p.slug);
    const event = D.events.find((e) => e.project === p.slug);
    const sec = (title, body, i) => `<section class="proj-body"><h2 class="h-card" data-reveal><span class="eyebrow"><b>${String(i).padStart(2, '0')}</b></span><br><br>${title}</h2><div data-reveal>${body}</div></section>`;
    let n = 0;
    const blocks = [];
    blocks.push(sec('Задача', `<p>${esc(p.problem)}</p>`, ++n));
    blocks.push(sec('Решение', `<p>${esc(p.solution)}</p>`, ++n));
    if (p.features.length) blocks.push(sec('Что умеет', `<ul class="features">${p.features.map((x) => `<li>${esc(x)}</li>`).join('')}</ul>`, ++n));
    if (p.swot) {
      const cells = [['S', 'Сильные стороны', '#3dff9a'], ['W', 'Слабые стороны', '#ff6b6b'], ['O', 'Возможности', '#2be4ff'], ['T', 'Угрозы', '#ffb547']];
      blocks.push(sec('SWOT-анализ', `<div class="swot">${cells.map(([k, l, c]) => `<div class="swot__cell"><h3><b style="background:${c}">${k}</b>${l}</h3><ul>${p.swot[k].map((x) => `<li>${esc(x)}</li>`).join('')}</ul></div>`).join('')}</div>`, ++n));
    }
    if (p.steps.length) blocks.push(sec('Как делали', `<ol class="ptimeline">${p.steps.map(([t, d], i) => `<li><span class="n">${String(i + 1).padStart(2, '0')}</span><h3>${esc(t)}</h3><p>${esc(d)}</p></li>`).join('')}</ol>`, ++n));
    if (p.metrics.length) blocks.push(`<section class="metrics">${p.metrics.map(([v, l]) => `<div class="metric" data-reveal><b data-count="${v}">${v}</b><span>${esc(l)}</span></div>`).join('')}</section>`);
    blocks.push(sec('Стек', `<div class="stack">${p.stack.map((s) => `<span class="chip">${esc(s)}</span>`).join('')}</div>`, ++n));
    blocks.push(sec('Команда', `<ul class="people">${members.map((m) => `<li><span>${esc(m.name)}</span><span>${esc(m.projects.find(([s]) => s === p.slug)[1])}</span></li>`).join('')}${guests.map((g) => `<li><span>${esc(g.name)}<span class="guest">приглашённый участник</span></span><span>${esc(g.role)}</span></li>`).join('')}</ul>`, ++n));
    if (p.gallery.length > 1) blocks.push(`<section><div class="section-head"><span class="eyebrow"><b>${String(++n).padStart(2, '0')}</b> Галерея</span></div><div class="gallery">${p.gallery.map(([src, cap]) => `<figure data-lightbox="${src}" data-caption="${esc(cap)}" data-reveal><img src="${src}" alt="${esc(cap)}" loading="lazy"><figcaption>${esc(cap)}</figcaption></figure>`).join('')}</div></section>`);

    root.innerHTML = `
      <section class="proj-hero">
        <div class="container">
          <a class="back-link" href="projects.html">← Все проекты</a>
          <h1 class="proj-title" data-split>${esc(p.title)}</h1>
          <p class="proj-sub" data-reveal>${esc(p.subtitle)}</p>
          <p class="lead" style="margin-top:28px" data-reveal>${esc(p.lead)}</p>
          ${p.links.length ? `<div class="hero__ctas" style="margin-top:36px" data-reveal>${p.links.map(([l, u], i) => `<a class="btn ${i === 0 ? 'btn--primary' : ''}" href="${u}" target="_blank" rel="noopener">${esc(l)} ${ICON.arrow}</a>`).join('')}</div>` : ''}
          <dl class="proj-meta" data-reveal>
            <div><dt>Год</dt><dd>${p.year}</dd></div>
            <div><dt>Тип</dt><dd>${esc(p.kind)}</dd></div>
            <div><dt>Статус</dt><dd>${esc(p.status)}</dd></div>
            <div><dt>${event ? 'Событие' : 'Контекст'}</dt><dd>${esc(event ? event.title : (p.context || '—'))}</dd></div>
          </dl>
        </div>
      </section>
      <div class="container"><div class="proj-cover" data-reveal="scale"><img src="${p.cover}" alt="${esc(p.title)}" data-parallax="-0.08"></div></div>
      <div class="section" style="padding-bottom:0"><div class="container proj-flow">${blocks.join('')}</div></div>
      <a class="next-proj" href="project.html?p=${next.slug}" data-cursor="Далее">
        <span class="eyebrow">Следующий проект</span>
        <div class="next-proj__title">${esc(next.title)}</div>
      </a>`;
  }

  function renderEvents() {
    const tl = $('#timeline');
    if (!tl) return;
    tl.innerHTML = '<div class="tl__line"><i></i></div>' + D.events.map((e) => {
      const p = e.project && projectBySlug(e.project);
      return `
      <div class="tl__item">
        <div class="tl__date" data-reveal><b>${fmtDate(e.date).slice(0, 5)}</b><span>${monthYear(e.date)}</span></div>
        <article class="tl__card card" data-reveal>
          <span class="chip" style="${e.type === 'Хакатон' ? 'color:var(--cyan)' : ''}">${e.type}</span>
          <h3>${esc(e.title)}</h3>
          <p>${esc(e.text)}</p>
          ${e.cert ? `<div class="tl__cert" data-lightbox="${e.cert}" data-caption="Сертификат участника · ${esc(e.title)}" data-cursor="Открыть"><img src="${e.cert}" alt="Сертификат: ${esc(e.title)}" loading="lazy"></div>` : ''}
          ${p ? `<a class="tl__link link-u" href="project.html?p=${p.slug}">Проект: ${esc(p.title)} ${ICON.arrowUR}</a>` : ''}
        </article>
      </div>`;
    }).join('');
    const hacks = D.events.filter((e) => e.type === 'Хакатон').length;
    $('#ev-count').firstChild.textContent = String(D.events.length).padStart(2, '0');
    $('#ev-hacks').textContent = hacks;
    $('#ev-conf').textContent = D.events.length - hacks;
  }

  function renderTeam() {
    const g = $('#team-big');
    if (!g) return;
    g.innerHTML = D.team.map((m) => `
      <article class="tmember card" data-reveal>
        <div class="member member__photo"><img src="${m.photo}" alt="${esc(m.name)}" loading="lazy"></div>
        <div>
          <span class="eyebrow">Code&amp;Brew</span>
          <h3>${esc(m.name)}</h3>
          <div class="links-line"><a class="gh-line link-u" href="https://github.com/${m.github}" target="_blank" rel="noopener">${ICON.gh}${esc(m.github)}</a><a class="gh-line link-u" href="https://t.me/${m.telegram}" target="_blank" rel="noopener">${ICON.tg}@${esc(m.telegram)}</a></div>
          <ul>${m.projects.map(([s, r]) => `<li><a class="link-u" href="project.html?p=${s}">${esc(projectBySlug(s).title)}</a><span>${esc(r)}</span></li>`).join('')}</ul>
        </div>
      </article>`).join('');
    const gl = $('#guests');
    if (gl) gl.innerHTML = D.guests.map((x) => `<li><span>${esc(x.name)}</span><span>${esc(projectBySlug(x.project).title)} · ${esc(x.role)}</span></li>`).join('');
  }

  /* ------------------------------------------------------------------
     Анимации и интерактив
     ------------------------------------------------------------------ */
  function splitWords(el) {
    const walk = (node) => {
      [...node.childNodes].forEach((n) => {
        if (n.nodeType === 3) {
          const frag = document.createDocumentFragment();
          n.textContent.split(/(\s+)/).forEach((part) => {
            if (!part) return;
            if (/^\s+$/.test(part)) { frag.appendChild(document.createTextNode(' ')); return; }
            const outer = document.createElement('span'); outer.className = 'split-line'; outer.style.display = 'inline-block';
            const inner = document.createElement('span'); inner.textContent = part; if (node.classList?.contains('grad-text')) inner.className = 'grad-text';
            outer.appendChild(inner); frag.appendChild(outer);
          });
          n.replaceWith(frag);
        } else if (n.nodeType === 1 && !n.classList.contains('split-line') && n.tagName !== 'BR') walk(n);
      });
    };
    walk(el);
    $$('.grad-text', el).forEach((g) => { if (g.querySelector('.split-line')) g.classList.remove('grad-text'); });
  }

  function wrapWordsForScrub(el) {
    const walk = (node) => {
      [...node.childNodes].forEach((n) => {
        if (n.nodeType === 3) {
          const frag = document.createDocumentFragment();
          n.textContent.split(/(\s+)/).forEach((part) => {
            if (!part) return;
            if (/^\s+$/.test(part)) frag.appendChild(document.createTextNode(' '));
            else { const s = document.createElement('span'); s.className = 'word'; s.textContent = part; frag.appendChild(s); }
          });
          n.replaceWith(frag);
        } else if (n.nodeType === 1) walk(n);
      });
    };
    walk(el);
  }

  function initSmoothScroll() {
    if (reduced || typeof window.Lenis === 'undefined' || !hasGsap) return;
    const lenis = new window.Lenis({ duration: 1.15, easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)), smoothWheel: true });
    window.__lenis = lenis;
    lenis.on('scroll', window.ScrollTrigger.update);
    gsap.ticker.add((t) => lenis.raf(t * 1000));
    gsap.ticker.lagSmoothing(0);
    $$('a[href*="#"]').forEach((a) => a.addEventListener('click', (e) => {
      const url = new URL(a.href, location.href);
      if (url.pathname !== location.pathname || !url.hash) return;
      const t = $(url.hash); if (!t) return;
      e.preventDefault(); lenis.scrollTo(t, { offset: -20, duration: 1.6 });
    }));
  }

  function initHeader() {
    const h = $('.site-header');
    let last = 0;
    const onScroll = () => {
      const y = window.scrollY;
      h.classList.toggle('is-scrolled', y > 40);
      h.classList.toggle('is-hidden', y > 400 && y > last && !document.body.classList.contains('menu-open'));
      last = y;
    };
    window.addEventListener('scroll', onScroll, { passive: true }); onScroll();
  }

  function initCursor() {
    const ring = $('.cursor'), dot = $('.cursor-dot');
    if (!ring || !hasGsap) return;
    const label = $('span', ring);
    const rx = gsap.quickTo(ring, 'x', { duration: 0.5, ease: 'power3' }), ry = gsap.quickTo(ring, 'y', { duration: 0.5, ease: 'power3' });
    const dx = gsap.quickTo(dot, 'x', { duration: 0.08 }), dy = gsap.quickTo(dot, 'y', { duration: 0.08 });
    window.addEventListener('mousemove', (e) => { rx(e.clientX); ry(e.clientY); dx(e.clientX); dy(e.clientY); });
    document.addEventListener('mouseover', (e) => {
      const t = e.target.closest('[data-cursor], a, button, [data-lightbox]');
      ring.classList.toggle('is-label', !!t?.dataset.cursor);
      ring.classList.toggle('is-hover', !!t && !t.dataset.cursor);
      label.textContent = t?.dataset.cursor || '';
      dot.style.opacity = t?.dataset.cursor ? 0 : 1;
    });
    document.addEventListener('mouseleave', () => gsap.to([ring, dot], { opacity: 0, duration: 0.3 }));
    document.addEventListener('mouseenter', () => gsap.to([ring, dot], { opacity: 1, duration: 0.3 }));
  }

  function initTransitions() {
    const bars = $$('.page-wipe i');
    if (!hasGsap || reduced) return;
    if (sessionStorage.getItem('cb-wipe')) {
      sessionStorage.removeItem('cb-wipe');
      gsap.set(bars, { scaleY: 1, transformOrigin: 'top' });
      gsap.to(bars, { scaleY: 0, duration: 0.7, ease: 'power4.inOut', stagger: 0.05, delay: 0.05 });
    }
    document.addEventListener('click', (e) => {
      const a = e.target.closest('a');
      if (!a || a.target === '_blank' || e.metaKey || e.ctrlKey || e.shiftKey || e.button !== 0) return;
      const url = new URL(a.href, location.href);
      if (url.origin !== location.origin || (url.pathname === location.pathname && url.search === location.search)) return;
      e.preventDefault();
      sessionStorage.setItem('cb-wipe', '1');
      gsap.set(bars, { transformOrigin: 'bottom' });
      gsap.to(bars, { scaleY: 1, duration: 0.6, ease: 'power4.inOut', stagger: 0.05, onComplete: () => { location.href = url.href; } });
    });
    window.addEventListener('pageshow', (e) => { if (e.persisted) gsap.set(bars, { scaleY: 0 }); });
  }

  function initReveals() {
    if (!hasGsap || reduced) {
      document.documentElement.classList.remove('js');
      return;
    }
    const ST = window.ScrollTrigger;
    $$('[data-split]').forEach((el) => {
      splitWords(el);
      if (el.closest('.hero')) return; // в hero своя анимация
      gsap.to($$('.split-line > span', el), {
        y: 0, duration: 1.1, ease: 'power4.out', stagger: 0.06,
        scrollTrigger: { trigger: el, start: 'top 88%' }
      });
    });
    ST.batch('[data-reveal]', {
      start: 'top 90%',
      onEnter: (els) => gsap.to(els, { opacity: 1, y: 0, scale: 1, duration: 1.1, ease: 'power3.out', stagger: 0.08, overwrite: true })
    });
    $$('[data-count]').forEach((el) => {
      const raw = el.dataset.count; const num = parseFloat(raw); if (Number.isNaN(num)) return;
      const suffix = raw.replace(/[\d.]/g, '');
      const sup = el.querySelector('sup')?.outerHTML || '';
      const o = { v: 0 };
      ST.create({ trigger: el, start: 'top 90%', once: true, onEnter: () => gsap.to(o, { v: num, duration: 1.8, ease: 'power3.out', onUpdate: () => { el.innerHTML = Math.round(o.v) + suffix + sup; } }) });
    });
    $$('[data-parallax]').forEach((el) => {
      const k = parseFloat(el.dataset.parallax);
      gsap.fromTo(el, { yPercent: -k * 100 }, { yPercent: k * 100, ease: 'none', scrollTrigger: { trigger: el.parentElement, start: 'top bottom', end: 'bottom top', scrub: true } });
    });
  }

  function initManifest() {
    const el = $('.manifest__text');
    if (!el) return;
    wrapWordsForScrub(el);
    if (!hasGsap || reduced) return;
    gsap.to($$('.word', el), { opacity: 1, ease: 'none', stagger: 0.1, scrollTrigger: { trigger: el, start: 'top 80%', end: 'bottom 45%', scrub: 0.6 } });
  }

  function initMarquee() {
    $$('.marquee__track').forEach((track) => {
      track.innerHTML += track.innerHTML;
      if (!hasGsap || reduced) return;
      const tw = gsap.to(track, { xPercent: -50, duration: 38, ease: 'none', repeat: -1 });
      let dir = 1;
      window.ScrollTrigger.create({
        onUpdate: (self) => {
          const v = self.getVelocity();
          dir = self.direction;
          gsap.to(tw, { timeScale: dir * Math.min(4, 1 + Math.abs(v) / 600), duration: 0.3, overwrite: true });
          gsap.to(tw, { timeScale: dir, duration: 1.2, delay: 0.3, overwrite: false });
        }
      });
    });
  }

  function initHScroll() {
    const sec = $('.hscroll');
    if (!sec || !hasGsap || reduced) return;
    const mm = gsap.matchMedia();
    mm.add('(min-width: 901px)', () => {
      const track = $('.hscroll__track', sec);
      const dist = () => track.scrollWidth - window.innerWidth;
      const tween = gsap.to(track, {
        x: () => -dist(), ease: 'none',
        scrollTrigger: { trigger: sec, start: 'top top', end: () => '+=' + dist(), pin: '.hscroll__pin', scrub: 1, invalidateOnRefresh: true, anticipatePin: 1 }
      });
      gsap.to('.hscroll__progress i', { scaleX: 1, ease: 'none', scrollTrigger: { trigger: sec, start: 'top top', end: () => '+=' + dist(), scrub: true } });
      $$('.hpanel__media img', track).forEach((img) => {
        gsap.fromTo(img, { xPercent: -6 }, { xPercent: 6, ease: 'none', scrollTrigger: { trigger: img.closest('.hpanel'), containerAnimation: tween, start: 'left right', end: 'right left', scrub: true } });
      });
    });
  }

  function initProcess() {
    const steps = $('.process__steps');
    if (!steps || !hasGsap || reduced) { $$('.step').forEach((s) => s.classList.add('is-active')); return; }
    gsap.to('.process__line i', { scaleY: 1, ease: 'none', scrollTrigger: { trigger: steps, start: 'top 60%', end: 'bottom 60%', scrub: true } });
    $$('.step', steps).forEach((s) => window.ScrollTrigger.create({ trigger: s, start: 'top 62%', onToggle: (self) => s.classList.toggle('is-active', self.isActive || self.progress === 1), onLeaveBack: () => s.classList.remove('is-active'), onEnter: () => s.classList.add('is-active') }));
  }

  function initTimeline() {
    const tl = $('.tl');
    if (!tl || !hasGsap || reduced) { $$('.tl__item').forEach((s) => s.classList.add('is-active')); return; }
    gsap.to('.tl__line i', { scaleY: 1, ease: 'none', scrollTrigger: { trigger: tl, start: 'top 60%', end: 'bottom 60%', scrub: true } });
    $$('.tl__item', tl).forEach((s) => window.ScrollTrigger.create({ trigger: s, start: 'top 62%', onEnter: () => s.classList.add('is-active'), onLeaveBack: () => s.classList.remove('is-active') }));
  }

  function initHoverPreview() {
    const rows = $$('[data-preview]');
    if (!rows.length || !finePointer || !hasGsap) return;
    const box = document.createElement('div'); box.className = 'hover-preview'; box.innerHTML = '<img alt="">';
    document.body.appendChild(box);
    const img = $('img', box);
    const qx = gsap.quickTo(box, 'x', { duration: 0.6, ease: 'power3' }), qy = gsap.quickTo(box, 'y', { duration: 0.6, ease: 'power3' });
    window.addEventListener('mousemove', (e) => { qx(e.clientX + 30); qy(e.clientY - 120); });
    rows.forEach((r) => {
      r.addEventListener('mouseenter', () => { img.src = r.dataset.preview; gsap.to(box, { opacity: 1, scale: 1, rotate: -3, duration: 0.5, ease: 'power3.out' }); });
      r.addEventListener('mouseleave', () => gsap.to(box, { opacity: 0, scale: 0.6, rotate: 0, duration: 0.4, ease: 'power3.in' }));
    });
  }

  function initCards() {
    $$('.card').forEach((c) => c.addEventListener('pointermove', (e) => {
      const r = c.getBoundingClientRect();
      c.style.setProperty('--mx', `${e.clientX - r.left}px`);
      c.style.setProperty('--my', `${e.clientY - r.top}px`);
    }));
    if (!finePointer || reduced || !hasGsap) return;
    $$('[data-tilt]').forEach((c) => {
      c.addEventListener('pointermove', (e) => {
        const r = c.getBoundingClientRect();
        const px = (e.clientX - r.left) / r.width - 0.5, py = (e.clientY - r.top) / r.height - 0.5;
        gsap.to(c, { rotateY: px * 8, rotateX: -py * 8, transformPerspective: 900, duration: 0.6, ease: 'power3.out' });
      });
      c.addEventListener('pointerleave', () => gsap.to(c, { rotateX: 0, rotateY: 0, duration: 0.9, ease: 'elastic.out(1, 0.5)' }));
    });
    $$('[data-magnetic]').forEach((m) => {
      const s = parseFloat(m.dataset.magnetic) || 0.35;
      m.addEventListener('pointermove', (e) => {
        const r = m.getBoundingClientRect();
        gsap.to(m, { x: (e.clientX - r.left - r.width / 2) * s, y: (e.clientY - r.top - r.height / 2) * s, duration: 0.5, ease: 'power3.out' });
      });
      m.addEventListener('pointerleave', () => gsap.to(m, { x: 0, y: 0, duration: 1, ease: 'elastic.out(1, 0.4)' }));
    });
  }

  function initLightbox() {
    const items = $$('[data-lightbox]');
    if (!items.length) return;
    const lb = document.createElement('div');
    lb.className = 'lightbox'; lb.setAttribute('role', 'dialog'); lb.setAttribute('aria-modal', 'true');
    lb.innerHTML = '<button class="lightbox__close" type="button" aria-label="Закрыть">✕</button><figure style="margin:0"><img alt=""><p></p></figure>';
    document.body.appendChild(lb);
    const close = () => { lb.classList.remove('is-open'); window.__lenis?.start(); };
    items.forEach((it) => it.addEventListener('click', () => {
      $('img', lb).src = it.dataset.lightbox; $('img', lb).alt = it.dataset.caption || '';
      $('p', lb).textContent = it.dataset.caption || '';
      lb.classList.add('is-open'); window.__lenis?.stop();
    }));
    lb.addEventListener('click', (e) => { if (e.target === lb || e.target.closest('.lightbox__close')) close(); });
    document.addEventListener('keydown', (e) => { if (e.key === 'Escape') close(); });
  }

  /* ------------------------------------------------------------------
     Прелоадер и intro главной
     ------------------------------------------------------------------ */
  function heroIntro() {
    window.__cbIntro = true; // флаг для 3D-модуля, если он загрузится позже события
    window.dispatchEvent(new Event('cb:intro'));
    const hero = $('.hero');
    if (!hero || !hasGsap || reduced) return;
    const tl = gsap.timeline({ defaults: { ease: 'power4.out' } });
    tl.to($$('.hero__title .split-line > span'), { y: 0, duration: 1.4, stagger: 0.07 })
      .from('.hero__meta > *', { opacity: 0, y: -12, duration: 1, stagger: 0.1 }, 0.2)
      .from('.hero__sub, .hero__ctas, .scroll-cue', { opacity: 0, y: 24, duration: 1.1, stagger: 0.1 }, 0.5);
  }

  function initPreloader() {
    const pre = $('.preloader');
    if (!pre) { heroIntro(); return; }
    let seen = false;
    try { seen = !!sessionStorage.getItem('cb-loaded'); } catch (e) { /* без хранилища показываем прелоадер */ }
    if (seen || location.hash || !hasGsap || reduced) { pre.remove(); heroIntro(); return; }
    window.__lenis?.stop();
    const count = $('.preloader__count', pre), bar = $('.preloader__bar i', pre);
    const o = { v: 0 };
    const ready = new Promise((res) => { if (document.readyState === 'complete') res(); else window.addEventListener('load', res, { once: true }); });
    gsap.to(o, {
      v: 100, duration: 2, ease: 'power2.inOut',
      onUpdate: () => { count.textContent = String(Math.round(o.v)).padStart(3, '0'); bar.style.transform = `scaleX(${o.v / 100})`; },
      onComplete: async () => {
        await ready;
        try { sessionStorage.setItem('cb-loaded', '1'); } catch (e) { /* не критично */ }
        gsap.timeline()
          .to('.preloader__inner', { y: -40, opacity: 0, duration: 0.6, ease: 'power3.in' })
          .to(pre, { clipPath: 'inset(0 0 100% 0)', duration: 1, ease: 'power4.inOut' }, '-=0.1')
          .add(() => { window.__lenis?.start(); heroIntro(); }, '-=0.6')
          .add(() => pre.remove());
      }
    });
  }

  /* ------------------------------------------------------------------
     Запуск
     ------------------------------------------------------------------ */
  renderLayout();
  renderHome();
  renderProjects();
  renderProject();
  renderEvents();
  renderTeam();

  if (hasGsap) gsap.registerPlugin(window.ScrollTrigger);
  initSmoothScroll();
  initHeader();
  initCursor();
  initTransitions();
  initReveals();
  initManifest();
  initMarquee();
  initHScroll();
  initProcess();
  initTimeline();
  initHoverPreview();
  initCards();
  initLightbox();
  if (page === 'home') initPreloader();

  window.addEventListener('load', () => {
    if (hasGsap) window.ScrollTrigger.refresh();
    const t = location.hash && $(location.hash);
    if (t) setTimeout(() => (window.__lenis ? window.__lenis.scrollTo(t, { immediate: true, offset: -20, force: true }) : t.scrollIntoView()), 150);
  });
})();
