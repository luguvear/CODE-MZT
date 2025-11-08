/* script.js — solución definitiva para tu caso:
   - Parent con href reales (cctv.html...) => 1º toque abre submenu, 2º toque navega
   - Mobile (<=900px) behavior + hover en desktop
   - Cierra submenús al tocar fuera
   - Cierra sidebar al navegar desde submenu
*/
(function () {
  'use strict';

  const DEBUG = false; // Cambiar a true si quieres ver logs

  const toggleSidebarBtn = document.getElementById('toggleSidebar');
  const sidebar = document.getElementById('sidebar');

  // Detectar el tipo de puntero más reciente
  let lastPointerType = null;
  window.addEventListener('pointerdown', (e) => {
    lastPointerType = e.pointerType;
    if (DEBUG) console.log('[DBG] pointerdown:', lastPointerType);
  }, { passive: true });

  // Obtener SOLO items que tienen submenu
  const menuItems = Array.from(document.querySelectorAll('.menu-item'))
    .filter(mi => mi.querySelector('.submenu'));

  // Inicializar atributos y estados
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

  // Helpers abrir/cerrar
  function openItem(mi) {
    const trigger = mi.querySelector('a');
    const submenu = mi.querySelector('.submenu');
    if (!submenu) return;

    menuItems.forEach(other => { if (other !== mi) closeItem(other); });

    mi.classList.add('open');
    submenu.classList.add('open');

    trigger.setAttribute('aria-expanded', 'true');
    submenu.setAttribute('aria-hidden', 'false');

    if (DEBUG) console.log('[DBG] OPEN:', trigger.textContent.trim());
  }

  function closeItem(mi) {
    const trigger = mi.querySelector('a');
    const submenu = mi.querySelector('.submenu');
    if (!submenu) return;

    mi.classList.remove('open');
    submenu.classList.remove('open');

    trigger.setAttribute('aria-expanded', 'false');
    submenu.setAttribute('aria-hidden', 'true');

    if (DEBUG) console.log('[DBG] CLOSE:', trigger.textContent.trim());
  }

  function closeAll() {
    menuItems.forEach(mi => closeItem(mi));
  }

  // Abrir / cerrar sidebar (móvil)
  if (toggleSidebarBtn && sidebar) {
    toggleSidebarBtn.addEventListener('click', (e) => {
      e.preventDefault();
      sidebar.classList.toggle('open');
      document.body.classList.toggle('noscroll', sidebar.classList.contains('open'));
    });
  }

  // Lógica del menú con submenú
  menuItems.forEach(mi => {
    const trigger = mi.querySelector('a');
    const submenu = mi.querySelector('.submenu');
    if (!trigger || !submenu) return;

    trigger.addEventListener('click', (ev) => {
      const isMobile = window.innerWidth <= 900 || lastPointerType === 'touch';
      const isOpen = mi.classList.contains('open');

      if (isMobile) {
        if (!isOpen) {
          ev.preventDefault();
          openItem(mi);

          if (mi.scrollIntoView) mi.scrollIntoView({ block: 'nearest' });
        } else {
          // Segundo toque → permitir navegación
        }
      }
    });

    // Hover desktop
    mi.addEventListener('pointerenter', (ev) => {
      if (ev.pointerType === 'mouse') openItem(mi);
    });
    mi.addEventListener('pointerleave', (ev) => {
      if (ev.pointerType === 'mouse') closeItem(mi);
    });

    // Click dentro del submenu
    submenu.addEventListener('click', (ev) => {
      ev.stopPropagation();
      const link = ev.target.closest('a');

      if (link && window.innerWidth <= 900) {
        sidebar && sidebar.classList.remove('open');
        document.body.classList.remove('noscroll');
      }
    });
  });

  // Click fuera → cerrar submenús
  document.addEventListener('click', (ev) => {
    if (!ev.target.closest('.menu-item')) {
      closeAll();
    }
  });

  // En desktop al redimensionar → reset
  window.addEventListener('resize', () => {
    if (window.innerWidth > 992) {
      sidebar && sidebar.classList.remove('open');
      document.body.classList.remove('noscroll');
      closeAll();
    }
  });

  if (DEBUG) console.log('[DBG] script listo.');
})();
