/* script.js — solución definitiva para tu caso:
   - parents con href reales (cctv.html...) => 1º toque abre submenu, 2º toca navega
   - mobile (<=900px) behavior, hover en desktop
   - cierra al tocar fuera, cierra sidebar al navegar desde submenu
*/
(function () {
  'use strict';

  const DEBUG = false; // poner true para ver logs en consola

  const toggleSidebarBtn = document.getElementById('toggleSidebar');
  const sidebar = document.getElementById('sidebar');

  // Detecta último tipo de puntero
  let lastPointerType = null;
  window.addEventListener('pointerdown', (e) => {
    lastPointerType = e.pointerType;
    if (DEBUG) console.log('[DBG] pointerdown', lastPointerType);
  }, { passive: true });

  // Helper: get menu items que tienen submenu
  const menuItems = Array.from(document.querySelectorAll('.menu-item'))
    .filter(mi => mi.querySelector('.submenu'));

  // Inicializar atributos ARIA y estado
  menuItems.forEach((mi, i) => {
    const trigger = mi.querySelector('a');
    const submenu = mi.querySelector('.submenu');
    if (!trigger || !submenu) return;
    const sid = submenu.id || `submenu-${i}`;
    submenu.id = sid;
    trigger.setAttribute('aria-haspopup', 'true');
    trigger.setAttribute('aria-controls', sid);
    trigger.setAttribute('aria-expanded', 'false');
    submenu.setAttribute('aria-hidden', 'true');
    mi.classList.remove('open');
    submenu.classList.remove('open');
  });

  // Abrir / cerrar helpers
  function openItem(mi) {
    const trigger = mi.querySelector('a');
    const submenu = mi.querySelector('.submenu');
    if (!submenu) return;
    // cerrar otros
    menuItems.forEach(other => { if (other !== mi) closeItem(other); });
    mi.classList.add('open');
    submenu.classList.add('open');
    trigger.setAttribute('aria-expanded', 'true');
    submenu.setAttribute('aria-hidden', 'false');
    if (DEBUG) console.log('[DBG] open', trigger.textContent.trim());
  }
  function closeItem(mi) {
    const trigger = mi.querySelector('a');
    const submenu = mi.querySelector('.submenu');
    if (!submenu) return;
    mi.classList.remove('open');
    submenu.classList.remove('open');
    trigger.setAttribute('aria-expanded', 'false');
    submenu.setAttribute('aria-hidden', 'true');
    if (DEBUG) console.log('[DBG] close', trigger.textContent.trim());
  }
  function closeAll() { menuItems.forEach(mi => closeItem(mi)); }

  // Sidebar toggle
  if (toggleSidebarBtn && sidebar) {
    toggleSidebarBtn.addEventListener('click', (e) => {
      e.preventDefault();
      sidebar.classList.toggle('open');
      document.body.classList.toggle('noscroll', sidebar.classList.contains('open'));
      if (DEBUG) console.log('[DBG] sidebar toggled:', sidebar.classList.contains('open'));
    });
  }

  // Comportamiento para cada menu-item con submenu
  menuItems.forEach(mi => {
    const trigger = mi.querySelector('a');
    const submenu = mi.querySelector('.submenu');
    if (!trigger || !submenu) return;

    /* Strategy:
       - En móvil (<=900) y si existe submenu:
         * Si el submenu NO está abierto: 1º toque -> PREVENT default y abrir submenu.
         * Si el submenu YA está abierto: 2º toque -> permitir navegación normal.
    */

    trigger.addEventListener('click', (ev) => {
      // Solo intervenir en pantallas móviles o cuando el usuario use touch
      if (window.innerWidth <= 900 || lastPointerType === 'touch') {
        const isOpen = mi.classList.contains('open');
        if (!isOpen) {
          // Abrir y evitar navegación la primera vez
          ev.preventDefault();
          openItem(mi);
          // opcional: desplazar un poco para mostrar submenu si está fuera de vista
          if (mi.scrollIntoView) mi.scrollIntoView({ block: 'nearest' });
        } else {
          // Si ya está abierto, dejamos que la navegación ocurra (no preventDefault)
          // Esto permite que el 2do toque navegue a cctv.html, etc.
          // También puedes forzar la navegación con: window.location = trigger.href;
          // No hacemos nada aquí.
          if (DEBUG) console.log('[DBG] second tap -> allow navigation on', trigger.href);
        }
      } else {
        // Desktop: no interferimos (click navegará normalmente)
      }
    });

    // Soporte keyboard
    trigger.addEventListener('keydown', (ev) => {
      if (ev.key === 'Enter' || ev.key === ' ') {
        ev.preventDefault();
        const isOpen = mi.classList.contains('open');
        if (!isOpen) openItem(mi);
        else {
          // si ya abierto y el href existe, navegar
          const href = trigger.getAttribute('href');
          if (href && href !== '#') window.location.href = href;
        }
      } else if (ev.key === 'Escape' || ev.key === 'Esc') {
        closeItem(mi);
        trigger.focus();
      }
    });

    // Hover para desktop (pointer enter/leave)
    mi.addEventListener('pointerenter', (ev) => {
      if (ev.pointerType === 'mouse') openItem(mi);
    });
    mi.addEventListener('pointerleave', (ev) => {
      if (ev.pointerType === 'mouse') closeItem(mi);
    });

    // Clicks dentro del submenu: permitir navegación y cerrar sidebar si mobile
    submenu.addEventListener('click', (ev) => {
      ev.stopPropagation();
      const a = ev.target.closest && ev.target.closest('a');
      if (a && window.innerWidth <= 900) {
        // cerramos sidebar para que la navegación sea limpia
        sidebar && sidebar.classList.remove('open');
        document.body.classList.remove('noscroll');
      }
    });
  });

  // Click fuera: cierra submenus
  document.addEventListener('click', (ev) => {
    if (!ev.target.closest('.menu-item')) {
      closeAll();
    }
  });

  // Resize: al volver a desktop, cerrar todo
  window.addEventListener('resize', () => {
    if (window.innerWidth > 992) {
      sidebar && sidebar.classList.remove('open');
      document.body.classList.remove('noscroll');
      closeAll();
    }
  });

  // Cerrar sidebar al hacer scroll en mobile (opcional)
  window.addEventListener('scroll', () => {
    if (window.innerWidth <= 900) {
      // sidebar && sidebar.classList.remove('open');
      // document.body.classList.remove('noscroll');
      // comentado por defecto
    }
  });

  if (DEBUG) console.log('[DBG] menú script listo.');
})();
