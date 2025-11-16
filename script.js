/* script.js — compatible con tu HTML (li.menu-item > a + ul.submenu)
   Manejo robusto de sidebar, submenús (touch + mouse) y tabs.
*/
(function () {
  'use strict';

  const DEBUG = false; // pon true si quieres ver logs en consola

  const toggleSidebarBtn = document.getElementById('toggleSidebar');
  const sidebar = document.getElementById('sidebar');

  // detecta el último tipo de puntero (mouse, touch, pen)
  let lastPointerType = null;
  window.addEventListener('pointerdown', (e) => {
    lastPointerType = e.pointerType; // "mouse" | "touch" | "pen"
    if (DEBUG) console.log('[DBG] pointerdown:', lastPointerType);
  }, { passive: true });

  // --------------- Sidebar open/close ----------------
  if (toggleSidebarBtn && sidebar) {
    toggleSidebarBtn.addEventListener('click', (e) => {
      e.preventDefault();
      sidebar.classList.toggle('open');
      document.body.classList.toggle('noscroll', sidebar.classList.contains('open'));
      if (DEBUG) console.log('[DBG] sidebar toggled. open=', sidebar.classList.contains('open'));
    });
  }

  // cerrar sidebar al hacer click en enlaces que NO pertenezcan a un parent con submenu (solo en móvil)
  document.addEventListener('click', (e) => {
    const link = e.target.closest && e.target.closest('.sidebar a');
    if (!link) return;
    const parentItem = link.closest('.menu-item');
    // si el link está dentro de un menu-item que tiene submenu, no cerrar (se maneja en el submenu logic)
    const hasSubmenu = parentItem && parentItem.querySelector && parentItem.querySelector('.submenu');
    if (window.innerWidth <= 900 && !hasSubmenu) {
      sidebar && sidebar.classList.remove('open');
      document.body.classList.remove('noscroll');
      if (DEBUG) console.log('[DBG] sidebar closed after link click (no submenu).');
    }
  });

  // ------------------ Submenu logic -------------------
  const menuItems = Array.from(document.querySelectorAll('.menu-item')).filter(mi => mi.querySelector('.submenu'));

  // inicializar aria y estado
  menuItems.forEach((item, idx) => {
    const trigger = item.querySelector('a');
    const submenu = item.querySelector('.submenu');
    if (!trigger || !submenu) return;

    const sid = submenu.id || `submenu-${idx}`;
    submenu.id = sid;
    trigger.setAttribute('aria-haspopup', 'true');
    trigger.setAttribute('aria-controls', sid);
    trigger.setAttribute('aria-expanded', 'false');
    submenu.setAttribute('aria-hidden', 'true');

    // asegurar que css pueda usar .open tanto en li como en ul
    item.classList.remove('submenu-open');
    submenu.classList.remove('open');
  });

  function openItem(item) {
    const trigger = item.querySelector('a');
    const submenu = item.querySelector('.submenu');
    if (!submenu) return;
    // cerrar otros antes (comportamiento móvil típico)
    menuItems.forEach(mi => { if (mi !== item) closeItem(mi); });
    item.classList.add('submenu-open');
    submenu.classList.add('open');
    trigger.setAttribute('aria-expanded', 'true');
    submenu.setAttribute('aria-hidden', 'false');
    if (DEBUG) console.log('[DBG] openItem:', trigger.textContent.trim());
  }

  function closeItem(item) {
    const trigger = item.querySelector('a');
    const submenu = item.querySelector('.submenu');
    if (!submenu) return;
    item.classList.remove('submenu-open');
    submenu.classList.remove('open');
    trigger.setAttribute('aria-expanded', 'false');
    submenu.setAttribute('aria-hidden', 'true');
    if (DEBUG) console.log('[DBG] closeItem:', trigger.textContent.trim());
  }

  function closeAll() {
    menuItems.forEach(mi => closeItem(mi));
  }

  // manejar eventos por cada item con submenu
  menuItems.forEach(item => {
    const trigger = item.querySelector('a');
    const submenu = item.querySelector('.submenu');

    // click/tap en el trigger: en móvil/touch mostramos toggle y prevenimos navegación
    trigger.addEventListener('click', (ev) => {
      // detectar si queremos togglear: si hay submenu y estamos en móvil o fue touch
      if (window.innerWidth <= 992 || lastPointerType === 'touch') {
        ev.preventDefault(); // evitar navegación inmediata
        const isOpen = submenu.classList.contains('open');
        if (isOpen) closeItem(item);
        else openItem(item);
      } else {
        // en escritorio, si el usuario hace click dejamos que navegue normalmente
        // (si quieres evitar navegación en desktop, descomenta next line)
        // ev.preventDefault();
      }
    });

    // keyboard accessibility: Enter/Space toggle, Esc close
    trigger.addEventListener('keydown', (ev) => {
      if (ev.key === 'Enter' || ev.key === ' ') {
        ev.preventDefault();
        const isOpen = submenu.classList.contains('open');
        if (isOpen) closeItem(item);
        else openItem(item);
      } else if (ev.key === 'Escape' || ev.key === 'Esc') {
        closeItem(item);
        trigger.focus();
      }
    });

    // pointer hover behavior for mouse users (desktop)
    item.addEventListener('pointerenter', (ev) => {
      if (ev.pointerType === 'mouse') {
        // abre por hover en desktop
        openItem(item);
      }
    });
    item.addEventListener('pointerleave', (ev) => {
      if (ev.pointerType === 'mouse') {
        closeItem(item);
      }
    });

    // si se hace click dentro del submenu, prevenir burbujeo para no cerrar por el document click
    submenu.addEventListener('click', (ev) => {
      ev.stopPropagation();
      const a = ev.target.closest && ev.target.closest('a');
      if (a && window.innerWidth <= 900) {
        // si se selecciona un link dentro de submenu en móvil, cerramos sidebar (opcional)
        // y permitimos navegación
        sidebar && sidebar.classList.remove('open');
        document.body.classList.remove('noscroll');
      }
    });
  });

  // Click fuera cierra submenus
  document.addEventListener('click', (ev) => {
    if (!ev.target.closest('.menu-item')) {
      closeAll();
      if (DEBUG) console.log('[DBG] click outside -> closeAll');
    }
  });

  // resize: si vamos a desktop, cerramos sidebar mobile y submenus
  window.addEventListener('resize', () => {
    if (window.innerWidth > 992) {
      sidebar && sidebar.classList.remove('open');
      document.body.classList.remove('noscroll');
      closeAll();
      if (DEBUG) console.log('[DBG] resize >992 -> closed sidebar & submenus');
    }
  });

  // OPTIONAL: cerrar submenus al hacer scroll en móvil (comenta si no quieres)
  // window.addEventListener('scroll', () => {
  //   if (window.innerWidth <= 900) closeAll();
  // });

  // Manejar enlaces internos como #contact que no tienen clase .tab
document.querySelectorAll('a[href^="#"]').forEach(link => {
  link.addEventListener('click', (e) => {
    const targetId = link.getAttribute('href').substring(1);
    const panel = document.getElementById(targetId);
    if (panel && panel.classList.contains('tab-panel')) {
      e.preventDefault();
      tabs.forEach(t => t.classList.remove('active'));
      panels.forEach(p => { p.classList.remove('active'); p.hidden = true; });

      panel.classList.add('active');
      panel.hidden = false;

      // Activar la pestaña correspondiente si existe
      const matchingTab = document.querySelector(`.tab[data-target="${targetId}"]`);
      if (matchingTab) matchingTab.classList.add('active');
    }
  });
});

  // ---------------- Tabs (inicio / acerca / contacto) ----------------
  const tabs = document.querySelectorAll('.tab');
  const panels = document.querySelectorAll('.tab-panel');
  if (tabs.length && panels.length) {
    tabs.forEach(tab => {
      tab.addEventListener('click', () => {
        tabs.forEach(t => t.classList.remove('active'));
        panels.forEach(p => { p.classList.remove('active'); p.hidden = true; });

        tab.classList.add('active');
        const target = tab.dataset.target;
        const panel = document.getElementById(target);
        if (panel) {
          panel.classList.add('active');
          panel.hidden = false;
        }
      });
    });
  }

  // ---------------- Thumbnails gallery ----------------
  document.querySelectorAll('.thumbnail img').forEach(thumb => {
    thumb.addEventListener('click', function () {
      const cont = this.closest('.imagen-container');
      const main = cont && cont.querySelector('.main-display img');
      if (main) main.src = this.src;
    });
  });

  if (DEBUG) console.log('[DBG] script.js inicializado');
})();
