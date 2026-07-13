/* main.js - Render del portafolio desde window.SITE_DATA */
(function () {
  'use strict';

  var DATA = window.SITE_DATA || { profile: {}, projects: [] };
  var P = DATA.profile || {};
  var PLACEHOLDER = 'assets/placeholder.svg';

  function $(sel, root) { return (root || document).querySelector(sel); }
  function el(tag, cls, html) {
    var e = document.createElement(tag);
    if (cls) e.className = cls;
    if (html !== undefined) e.innerHTML = html;
    return e;
  }
  // Devuelve el texto en el idioma actual de un campo {es,en} o string
  function T(field) {
    if (field && typeof field === 'object') return field[I18N.current] || field.es || field.en || '';
    return field || '';
  }
  function esc(s) {
    return String(s == null ? '' : s)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
  }
  function isYoutube(v) { return typeof v === 'string' && v.indexOf('youtube:') === 0; }
  function ytId(v) { return v.slice('youtube:'.length).trim(); }
  /* ---------- RENDER ---------- */
  function renderHero() {
    $('#brandName').textContent = P.name || 'Portafolio';
    $('#heroName').textContent = P.name || '';
    $('#heroRole').textContent = T(P.role);
    $('#heroTagline').textContent = T(P.tagline);
    var av = $('#heroAvatar');
    if (P.avatar) av.src = P.avatar; else av.src = PLACEHOLDER;
    av.alt = P.name || '';
    var cv = $('#heroCv');
    if (P.cv) { cv.href = P.cv; } else { cv.style.display = 'none'; }
    var li = $('#heroLinkedin');
    if (P.linkedin) li.href = P.linkedin; else li.style.display = 'none';
    $('#footerName').textContent = P.name || '';
  }

  function renderAbout() {
    $('#aboutBio').innerHTML = '<p>' + esc(T(P.bio)).replace(/\n/g, '</p><p>') + '</p>';
    var stats = $('#aboutStats');
    stats.innerHTML = '';
    if (P.experience) {
      stats.appendChild(el('li', 'stat',
        '<span class="stat-num">' + esc(P.experience) + '</span><span class="stat-label">' +
        I18N.t('years') + '</span>'));
    }
    if (P.location) {
      stats.appendChild(el('li', 'stat',
        '<span class="stat-num">📍</span><span class="stat-label">' + esc(P.location) + '</span>'));
    }
    if ((P.skills || []).length) {
      stats.appendChild(el('li', 'stat',
        '<span class="stat-num">' + P.skills.length + '</span><span class="stat-label">' +
        I18N.t('herramientas') + '</span>'));
    }
  }

  function renderSkills() {
    var cloud = $('#skillsCloud');
    cloud.innerHTML = '';
    (P.skills || []).forEach(function (s) {
      cloud.appendChild(el('span', 'skill-tag', esc(s)));
    });
  }

  function renderLibrary() {
    var grid = $('#projectGrid');
    grid.innerHTML = '';
    DATA.projects.forEach(function (pr) {
      var card = el('article', 'card');
      card.id = pr.slug;
      card.tabIndex = 0;
      card.setAttribute('role', 'button');
      card.setAttribute('aria-label', T(pr.title));

      var media = el('div', 'card-media');
      var cover = P.thumbnail || PLACEHOLDER;
      var img = el('img');
      img.src = pr.thumbnail || PLACEHOLDER;
      img.alt = T(pr.title);
      img.loading = 'lazy';
      img.onerror = function () { if (this.src !== PLACEHOLDER) this.src = PLACEHOLDER; };
      media.appendChild(img);

      if (pr.video) {
        var ov = el('div', 'card-overlay', '<span class="play">▶</span>');
        media.appendChild(ov);
      }
      card.appendChild(media);

      var body = el('div', 'card-body');
      var h3 = el('h3', 'card-title', esc(T(pr.title)));
      body.appendChild(h3);

      var badges = el('div', 'card-badges');
      if (pr.engine) badges.appendChild(el('span', 'badge', esc(pr.engine)));
      if (pr.language) badges.appendChild(el('span', 'badge badge-alt', esc(pr.language)));
      if (T(pr.status)) badges.appendChild(el('span', 'badge badge-status', esc(T(pr.status))));
      body.appendChild(badges);

      body.appendChild(el('p', 'card-short', esc(T(pr.short))));

      if ((pr.tools || []).length) {
        var tools = el('div', 'card-tools');
        pr.tools.slice(0, 4).forEach(function (t) {
          tools.appendChild(el('span', 'tool-mini', esc(t)));
        });
        body.appendChild(tools);
      }
      card.appendChild(body);

      function open() { openModal(pr); }
      card.addEventListener('click', open);
      card.addEventListener('keydown', function (e) {
        if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); open(); }
      });

      grid.appendChild(card);
    });
  }

  function renderContact() {
    $('#contactText').textContent = I18N.t('contact_text');
    var actions = $('#contactActions');
    actions.innerHTML = '';
    if (P.email) {
      var mail = el('a', 'btn btn-primary', I18N.t('email_me'));
      mail.href = 'mailto:' + P.email;
      actions.appendChild(mail);
    }
    if (P.linkedin) {
      var li = el('a', 'btn btn-ghost', 'LinkedIn');
      li.href = P.linkedin; li.target = '_blank'; li.rel = 'noopener';
      actions.appendChild(li);
    }
    if (P.cv) {
      var cv = el('a', 'btn btn-ghost', I18N.t('download_cv'));
      cv.href = P.cv; cv.target = '_blank'; cv.rel = 'noopener';
      actions.appendChild(cv);
    }
  }

  function renderAll() {
    document.documentElement.lang = I18N.current;
    $('#langLabel').textContent = I18N.t('switch_to');
    // textos estaticos data-i18n
    document.querySelectorAll('[data-i18n]').forEach(function (n) {
      n.textContent = I18N.t(n.getAttribute('data-i18n'));
    });
    document.title = (P.name || 'Portafolio') + ' — ' + T(P.role);
    renderHero(); renderAbout(); renderSkills(); renderLibrary(); renderContact();
    injectJsonLd();
  }

  /* ---------- MODAL ---------- */
  var modal = $('#modal');
  var modalBody = $('#modalBody');

  function openModal(pr) {
    var html = '';
    html += '<h2 id="modalTitle" class="modal-title">' + esc(T(pr.title)) + '</h2>';

    if (pr.video) {
      if (isYoutube(pr.video)) {
        var vid = ytId(pr.video);
        html += '<div class="modal-video"><iframe src="https://www.youtube.com/embed/' + esc(vid) +
          '?enablejsapi=1&origin=https://dannizj.github.io&rel=0" ' +
          'frameborder="0" allow="encrypted-media; fullscreen" allowfullscreen></iframe></div>';
        html += '<div class="modal-ytlink"><a class="btn btn-ghost" href="https://youtu.be/' + esc(vid) + '" target="_blank" rel="noopener">' + I18N.t('ver_en_youtube') + ' ↗</a></div>';
      } else {
        html += '<div class="modal-video"><video src="' + esc(pr.video) + '" controls autoplay></video></div>';
      }
    } else {
      html += '<p class="muted">' + I18N.t('proximamente') + '</p>';
    }

    html += '<div class="modal-meta">';
    if (pr.engine) html += metaRow(I18N.t('motor'), pr.engine);
    if (pr.language) html += metaRow(I18N.t('lenguaje'), pr.language);
    if (T(pr.status)) html += metaRow(I18N.t('estado'), T(pr.status));
    if (pr.year) html += metaRow('Año / Year', pr.year);
    html += '</div>';

    if ((pr.tools || []).length) {
      html += '<h3>' + I18N.t('herramientas') + '</h3><div class="modal-tools">';
      pr.tools.forEach(function (t) { html += '<span class="skill-tag">' + esc(t) + '</span>'; });
      html += '</div>';
    }
    if ((pr.features && (pr.features[I18N.current] || pr.features.es || [])).length) {
      var feats = pr.features[I18N.current] || pr.features.es || [];
      html += '<h3>' + I18N.t('caracteristicas') + '</h3><ul class="feature-list">';
      feats.forEach(function (f) { html += '<li>' + esc(f) + '</li>'; });
      html += '</ul>';
    }
    if (pr.download) {
      html += '<a class="btn btn-primary modal-dl" href="' + esc(pr.download) +
        '" target="_blank" rel="noopener">' + I18N.t('descargar') + ' ↗</a>';
    }

    modalBody.innerHTML = html;
    modal.hidden = false;
    modal.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
    var closeBtn = $('.modal-close', modal);
    if (closeBtn) closeBtn.focus();
  }
  function metaRow(k, v) {
    return '<div class="meta-row"><span class="meta-k">' + esc(k) + '</span><span class="meta-v">' + esc(v) + '</span></div>';
  }
  function closeModal() {
    modal.hidden = true;
    modal.setAttribute('aria-hidden', 'true');
    modalBody.innerHTML = '';
    document.body.style.overflow = '';
  }
  modal.addEventListener('click', function (e) {
    if (e.target.hasAttribute('data-close')) closeModal();
  });
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && !modal.hidden) closeModal();
  });

  /* ---------- JSON-LD (SEO + IAs) ---------- */
  function injectJsonLd() {
    var olds = document.querySelectorAll('.jsonld-generated');
    for (var i = 0; i < olds.length; i++) olds[i].remove();
    var person = {
      '@context': 'https://schema.org',
      '@type': 'Person',
      name: P.name,
      jobTitle: T(P.role),
      description: T(P.bio),
      url: location.href
    };
    if (P.linkedin) person.sameAs = [P.linkedin];
    if ((P.skills || []).length) person.knowsAbout = P.skills;
    if (P.email) person.email = P.email;

    var itemList = {
      '@context': 'https://schema.org',
      '@type': 'ItemList',
      itemListElement: DATA.projects.map(function (pr, i) {
        var item = {
          '@type': 'ListItem',
          position: i + 1,
          item: {
            '@type': 'SoftwareApplication',
            name: T(pr.title),
            description: T(pr.short),
            applicationCategory: 'Game',
            operatingSystem: 'Cross-platform'
          }
        };
        if ((pr.tools || []).length) item.item.keywords = pr.tools.join(', ');
        if (pr.download) item.item.url = pr.download;
        if (pr.engine) item.item.softwareRequirements = pr.engine;
        return item;
      })
    };

    var s1 = document.createElement('script');
    s1.type = 'application/ld+json'; s1.className = 'jsonld-generated';
    s1.textContent = JSON.stringify(person);
    document.head.appendChild(s1);
    var s2 = document.createElement('script');
    s2.type = 'application/ld+json'; s2.className = 'jsonld-generated';
    s2.textContent = JSON.stringify(itemList);
    document.head.appendChild(s2);
  }

  /* ---------- INIT ---------- */
  $('#langSwitch').addEventListener('click', function () {
    I18N.toggle();
    renderAll();
  });

  renderAll();
})();
