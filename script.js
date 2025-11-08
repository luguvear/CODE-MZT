// Espera a que el DOM esté completamente cargado
document.addEventListener('DOMContentLoaded', () => {
  // Tabs
  const tabs = document.querySelectorAll('.tab');
  const panels = document.querySelectorAll('.tab-panel');

  function activateTab(targetId) {
    tabs.forEach(t => t.classList.toggle('active', t.dataset.target === targetId));
    panels.forEach(p => {
      const match = p.id === targetId;
      p.classList.toggle('active', match);
      if (match) p.removeAttribute('hidden'); else p.setAttribute('hidden', '');
    });
  }

  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      activateTab(tab.dataset.target);
      history.replaceState(null, '', `#${tab.dataset.target}`);
    });
  });

  const hash = location.hash.replace('#','');
  activateTab(hash || 'home');

  // Make any CTA or link that points to #contact activate the contact tab
  function bindContactCTAs() {
    const ctas = Array.from(document.querySelectorAll('.cta-button'))
      .concat(Array.from(document.querySelectorAll('a[href="#contact"]')));
    ctas.forEach(node => {
      node.addEventListener('click', (ev) => {
        ev.preventDefault();
        activateTab('contact');
        // update URL hash without scrolling
        history.replaceState(null, '', '#contact');
        // Optionally focus the first input inside contact panel for accessibility
        const contactPanel = document.getElementById('contact');
        if (contactPanel) {
          const firstInput = contactPanel.querySelector('input, textarea, select');
          if (firstInput) firstInput.focus({ preventScroll: true });
        }
      });
    });
  }
  bindContactCTAs();

  // Sync CSS header offset variable to match the real header height.
  // This reduces visual gaps when the header height changes or on small screens.
  function debounce(fn, wait) {
    let t;
    return function (...args) {
      clearTimeout(t);
      t = setTimeout(() => fn.apply(this, args), wait);
    };
  }

  function syncHeaderOffset() {
    const header = document.querySelector('.site-header');
    if (!header) return;
    const h = header.offsetHeight || 0;
    // set CSS variable so CSS uses the real value
    document.documentElement.style.setProperty('--header-offset', `${h}px`);
  }

  // initial sync (small delay to account for font/load shifts)
  syncHeaderOffset();
  setTimeout(syncHeaderOffset, 220);
  window.addEventListener('resize', debounce(syncHeaderOffset, 120));

  // Sidebar toggle
  const sidebar = document.getElementById('sidebar');
  const toggle = document.getElementById('toggleSidebar');
  // small on-page debug indicator to help diagnose touch/menu issues
  const debugEl = document.createElement('div');
  debugEl.id = 'menu-debug';
  debugEl.style.cssText = 'position:fixed;left:8px;bottom:8px;z-index:9999;padding:6px 8px;background:rgba(0,0,0,0.6);color:#fff;border-radius:6px;font-size:12px;pointer-events:none;';
  debugEl.textContent = 'menu:init';
  document.body.appendChild(debugEl);
  function debug(msg) { try { console.log('[menu-debug]', msg); debugEl.textContent = String(msg); } catch (e) {} }
  if (toggle && sidebar) {
    // store scroll position when opening sidebar so we can restore it on close
    let savedScrollY = 0;
    const MOBILE_BP = 900; // px

    function handleToggleEvent(ev) {
      debug('toggle handler');
      // ignore programmatic calls that pass a MouseEvent after a touch
      // pointer events will be handled below
      const wasOpen = sidebar.classList.contains('open');
      const isOpen = !wasOpen;
      // toggle class
      sidebar.classList.toggle('open', isOpen);
      // set aria-expanded for accessibility
      try { toggle.setAttribute('aria-expanded', String(isOpen)); } catch (e) {}

      // Only apply mobile overlay/scroll-lock behavior on small viewports
      const MOBILE_BP = 900; // px
      const isMobile = (window.innerWidth || document.documentElement.clientWidth) <= MOBILE_BP;

      if (isOpen && isMobile) {
        // opening: save current scroll position and prevent background scroll
        savedScrollY = window.scrollY || window.pageYOffset || 0;
        document.body.classList.add('noscroll');
        debug('menu opened - savedScrollY=' + savedScrollY);

        // create overlay if not present
        let overlay = document.querySelector('.mobile-overlay');
        if (!overlay) {
          overlay = document.createElement('div');
          overlay.className = 'mobile-overlay';
          document.body.appendChild(overlay);
          overlay.addEventListener('click', () => {
            sidebar.classList.remove('open');
            try { toggle.setAttribute('aria-expanded', 'false'); } catch (e) {}
            document.body.classList.remove('noscroll');
            if (overlay && overlay.parentNode) overlay.parentNode.removeChild(overlay);
            setTimeout(() => { window.scrollTo(0, savedScrollY || 0); }, 60);
            debug('overlay clicked - menu closed');
          });
        }
      } else {
        // closing or desktop behavior: remove overlay and restore scroll if mobile
        const overlay = document.querySelector('.mobile-overlay');
        if (overlay && overlay.parentNode) overlay.parentNode.removeChild(overlay);
        if (isMobile) {
          document.body.classList.remove('noscroll');
          setTimeout(() => { window.scrollTo(0, savedScrollY || 0); }, 60);
          debug('menu closed - restored scroll');
        }
      }
    }

    // respond to both click and touch (pointer) so touch devices are snappy
    toggle.addEventListener('click', handleToggleEvent);
    toggle.addEventListener('pointerdown', (ev) => {
      debug('pointerdown: ' + ev.pointerType);
      if (ev.pointerType === 'touch') {
        ev.preventDefault();
        handleToggleEvent(ev);
      }
    });
    
  }

  // Set data-initial on sidebar links to prevent the blue pseudo-icon from overflowing with long text
  document.querySelectorAll('.sidebar a[data-nav]').forEach(a => {
    // prefer data-nav, fallback to link text
    const val = (a.getAttribute('data-nav') || a.textContent || '').trim();
    const initial = val ? val.trim().charAt(0).toUpperCase() : '';
    a.setAttribute('data-initial', initial);
  });

  // Touch-friendly submenu toggles: on touch devices, hovering won't open submenus,
  // so we toggle them on click/tap. We only prevent the navigation when the item
  // has a submenu and the viewport is narrow.
  document.querySelectorAll('.menu-item').forEach(item => {
    const trigger = item.querySelector('a');
    const submenu = item.querySelector('.submenu');
    if (!trigger || !submenu) return;
    trigger.addEventListener('click', (ev) => {
      const MOBILE_BP = 900;
      const isMobile = (window.innerWidth || document.documentElement.clientWidth) <= MOBILE_BP;
      if (isMobile) {
        // prevent navigating away on first tap; toggle submenu instead
        ev.preventDefault();
        debug('submenu toggle for ' + (trigger.getAttribute('data-nav') || trigger.textContent.trim()));
        const isOpen = item.classList.toggle('open');
        // optionally close other open siblings
        if (isOpen) {
          item.parentElement.querySelectorAll('.menu-item.open').forEach(sib => {
            if (sib !== item) sib.classList.remove('open');
          });
        }
      }
    });
  });

  // Contact form submit (AJAX)
  const contactForm = document.getElementById('contactForm');
  if (contactForm) {
    contactForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const formData = new FormData(contactForm);
      const payload = Object.fromEntries(formData.entries());

      try {
        const res = await fetch('http://localhost:3000/send', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
        const data = await res.json();
        if (data.ok) {
          alert('Mensaje enviado correctamente.');
          contactForm.reset();
        } else {
          alert('Error al enviar: ' + (data.error || 'Error desconocido'));
        }
      } catch (err) {
        console.error(err);
      }
    });
  }

  // Contact form submit (WhatsApp)
  if (contactForm) {
    contactForm.addEventListener('submit', (e) => {
      e.preventDefault();

      const nombre = document.getElementById('nombre') ? document.getElementById('nombre').value.trim() : '';
      const empresa = document.getElementById('empresa') ? document.getElementById('empresa').value.trim() : '';
      const email = document.getElementById('email') ? document.getElementById('email').value.trim() : '';
      const asunto = document.getElementById('asunto') ? document.getElementById('asunto').value.trim() : '';
      const mensaje = document.getElementById('mensaje') ? document.getElementById('mensaje').value.trim() : '';

      // Número de WhatsApp donde recibirás los mensajes (incluye código de país)
      const tuNumeroWhatsApp = '6692558761'; // Reemplaza con tu número

      // Construir mensaje incluyendo campos opcionales si se proporcionan
      let mensajeWhatsApp = `*Nuevo contacto desde web*%0A%0A`;
      if (nombre) mensajeWhatsApp += `*Nombre:* ${nombre}%0A`;
      if (empresa) mensajeWhatsApp += `*Empresa:* ${empresa}%0A`;
      if (email) mensajeWhatsApp += `*Email:* ${email}%0A`;
      if (asunto) mensajeWhatsApp += `*Asunto:* ${asunto}%0A%0A`;
      if (mensaje) mensajeWhatsApp += `*Mensaje:*%0A${mensaje}`;

      // Abrir WhatsApp Web
      window.open(`https://wa.me/${tuNumeroWhatsApp}?text=${mensajeWhatsApp}`);
    });
  }

  // --- Manejo de selección múltiple de imágenes por contenedor ---
  function createThumbnailElement(src) {
    const wrapper = document.createElement('div');
    wrapper.className = 'thumbnail';

    const img = document.createElement('img');
    img.src = src;
    img.alt = 'Vista previa';
    img.className = 'thumb-img';
    wrapper.appendChild(img);

    // click on thumbnail -> show in main display
    wrapper.addEventListener('click', (e) => {
      // avoid triggering when clicking remove btn
      if (e.target && e.target.classList && e.target.classList.contains('remove-btn')) return;
      const container = wrapper.closest('.imagen-container');
      if (!container) return;
      setMainImage(container, img.src);
    });

    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'remove-btn';
    btn.title = 'Eliminar imagen';
    btn.textContent = '✕';
    btn.addEventListener('click', (ev) => {
      ev.stopPropagation();
      const container = wrapper.closest('.imagen-container');
      const thumbs = container.querySelector('.thumbnails');
      const wasSelected = wrapper.classList.contains('selected');
      wrapper.remove();
      if (wasSelected) {
        const first = thumbs.querySelector('.thumbnail img');
        if (first) setMainImage(container, first.src);
        else setMainImage(container, '');
      }
    });
    wrapper.appendChild(btn);

    return wrapper;
  }

  function setMainImage(container, src) {
    const mainImg = container.querySelector('.main-img');
    if (!mainImg) return;

    // If no src provided, fade out to empty
    if (!src) {
      mainImg.style.opacity = 0;
      // after transition clear src
      setTimeout(() => { mainImg.src = ''; }, 250);
    } else {
      // Preload the image so swap is smooth
      const pre = new Image();
      pre.onload = () => {
        // start fade out
        mainImg.style.opacity = 0;
        // after a short delay swap src and fade in
        setTimeout(() => {
          mainImg.src = pre.src;
          // force a reflow before fading in (helpful in some browsers)
          // eslint-disable-next-line no-unused-expressions
          mainImg.offsetHeight;
          mainImg.style.opacity = 1;
        }, 180);
      };
      pre.src = src;
    }

    container.querySelectorAll('.thumbnail').forEach(t => {
      const img = t.querySelector('img');
      t.classList.toggle('selected', img && img.src === src);
    });
  }

  // Nota: la selección vía input file fue eliminada. Ahora se selecciona la imagen haciendo clic en la miniatura.

  // Inicializar thumbnails existentes: establecer el primer thumb como seleccionado y mostrar en grande
  document.querySelectorAll('.imagen-container').forEach(container => {
    const first = container.querySelector('.thumbnail img');
    if (first) setMainImage(container, first.src);
  });

  // Añadir listeners a miniaturas ya existentes en el HTML para que al hacer clic se muestren en grande
  document.querySelectorAll('.thumbnail').forEach(wrapper => {
    wrapper.addEventListener('click', (e) => {
      // si el clic fue en un botón de eliminar, ignorar
      if (e.target && e.target.classList && e.target.classList.contains('remove-btn')) return;
      const img = wrapper.querySelector('img');
      if (!img) return;
      const container = wrapper.closest('.imagen-container');
      if (!container) return;
      setMainImage(container, img.src);
    });
  });

  // Responsive hero: choose an optimized hero image based on DPR and viewport width
  (function chooseHeroImage() {
    function pickUrl() {
      const dpr = window.devicePixelRatio || 1;
      const w = Math.max(document.documentElement.clientWidth || 0, window.innerWidth || 0);
      let url = '';
      if (dpr > 1.5) {
        // high-density displays: pick larger variants
        if (w >= 1400) url = 'https://picsum.photos/id/1011/3200/1800';
        else if (w >= 900) url = 'https://picsum.photos/id/1011/2048/1152';
        else url = 'https://picsum.photos/id/1011/1280/720';
      } else {
        if (w >= 1400) url = 'https://picsum.photos/id/1011/1600/900';
        else if (w >= 900) url = 'https://picsum.photos/id/1011/1024/576';
        else url = 'https://picsum.photos/id/1011/640/360';
      }
      return url;
    }

    function applyHero() {
      const url = pickUrl();
      document.documentElement.style.setProperty('--hero-image', `url('${url}')`);
    }

    applyHero();

    // Update on resize/orientation change (debounced)
    let t; window.addEventListener('resize', () => { clearTimeout(t); t = setTimeout(applyHero, 220); });
  })();
});
