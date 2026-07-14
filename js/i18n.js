/* i18n.js - Cambio de idioma ES/EN para la UI del portafolio */
(function () {
  'use strict';

  var STRINGS = {
    es: {
      nav_about: 'Sobre mí',
      nav_skills: 'Habilidades',
      nav_library: 'Librería',
      nav_contact: 'Contacto',
      download_cv: 'Descargar CV',
      about_title: 'Sobre mí',
      skills_title: 'Habilidades y Tecnologías',
      library_title: 'Librería de Proyectos',
      filter_all: 'Todos',
      no_projects: 'No hay proyectos con esta etiqueta.',
      contact_title: 'Contacto',
      footer_note: 'Portafolio generado desde archivos de datos editables.',
      role_label: 'Experiencia',
      years: 'años',
      motor: 'Motor',
      lenguaje: 'Lenguaje',
      estado: 'Estado',
      herramientas: 'Herramientas',
      caracteristicas: 'Características',
      ver_trailer: 'Ver trailer',
      descargar: 'Descargar',
      proximamente: 'Tráiler próximamente',
      video_local: 'Ver video',
      ver_en_youtube: 'Abrir en YouTube',
      close: 'Cerrar',
      contact_text: '¿Buscas un desarrollador de videojuegos o programador de IA? Escríbeme.',
      email_me: 'Enviar email',
      switch_to: 'EN'
    },
    en: {
      nav_about: 'About',
      nav_skills: 'Skills',
      nav_library: 'Library',
      nav_contact: 'Contact',
      download_cv: 'Download CV',
      about_title: 'About Me',
      skills_title: 'Skills & Technologies',
      library_title: 'Project Library',
      filter_all: 'All',
      no_projects: 'No projects with this tag.',
      contact_title: 'Contact',
      footer_note: 'Portfolio generated from editable data files.',
      role_label: 'Experience',
      years: 'years',
      motor: 'Engine',
      lenguaje: 'Language',
      estado: 'Status',
      herramientas: 'Tools',
      caracteristicas: 'Features',
      ver_trailer: 'Watch trailer',
      descargar: 'Download',
      proximamente: 'Trailer coming soon',
      video_local: 'Watch video',
      ver_en_youtube: 'Open in YouTube',
      close: 'Close',
      contact_text: 'Looking for a game developer or AI programmer? Get in touch.',
      email_me: 'Email me',
      switch_to: 'ES'
    }
  };

  function getInitialLang() {
    try {
      var q = new URLSearchParams(window.location.search).get('lang');
      if (q === 'es' || q === 'en') return q;
      var stored = localStorage.getItem('lang');
      if (stored === 'es' || stored === 'en') return stored;
    } catch (e) {}
    return 'es';
  }

  var I18N = {
    current: getInitialLang(),
    STRINGS: STRINGS,
    t: function (key) {
      var set = STRINGS[this.current] || STRINGS.es;
      return set[key] !== undefined ? set[key] : key;
    },
    set: function (lang) {
      if (lang !== 'es' && lang !== 'en') return;
      this.current = lang;
      try {
        localStorage.setItem('lang', lang);
        var url = new URL(window.location.href);
        url.searchParams.set('lang', lang);
        window.history.replaceState({}, '', url);
      } catch (e) {}
      document.documentElement.lang = lang;
    },
    toggle: function () {
      this.set(this.current === 'es' ? 'en' : 'es');
    }
  };

  window.I18N = I18N;
})();
