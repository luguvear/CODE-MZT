/* ==========================
   ✅ MENÚ HAMBURGUESA MÓVIL
   ========================== */
const toggleSidebar = document.getElementById("toggleSidebar");
const sidebar = document.getElementById("sidebar");

toggleSidebar.addEventListener("click", () => {
    sidebar.classList.toggle("open");
});

/* Cerrar el menú al tocar un enlace en móvil */
document.querySelectorAll(".sidebar a").forEach(link => {
    link.addEventListener("click", () => {
        if (window.innerWidth <= 900) {
            sidebar.classList.remove("open");
        }
    });
});


/* ==========================
   ✅ SUBMENÚS EN MÓVIL (soluciona que desaparezcan)
   ========================== */
const submenuItems = document.querySelectorAll(".has-submenu");

submenuItems.forEach(item => {
    const trigger = item.querySelector("a");
    const submenu = item.querySelector(".submenu");

    trigger.addEventListener("click", (e) => {
        // SOLO activar toggle en móvil/tablet
        if (window.innerWidth <= 900) {
            e.preventDefault();
            submenu.classList.toggle("open");
        }
    });
});

// Cerrar submenús al tocar fuera
document.addEventListener("click", (e) => {
    if (!e.target.closest(".has-submenu")) {
        document.querySelectorAll(".submenu.open")
            .forEach(s => s.classList.remove("open"));
    }
});


/* ==========================
   ✅ PESTAÑAS (Inicio / Acerca / Contacto)
   ========================== */
const tabs = document.querySelectorAll(".tab");
const panels = document.querySelectorAll(".tab-panel");

tabs.forEach(tab => {
    tab.addEventListener("click", () => {
        // Quitar activos previos
        tabs.forEach(t => t.classList.remove("active"));
        panels.forEach(p => {
            p.classList.remove("active");
            p.hidden = true;
        });

        // Activar la pestaña seleccionada
        tab.classList.add("active");
        const target = tab.dataset.target;
        const panel = document.getElementById(target);

        panel.classList.add("active");
        panel.hidden = false;
    });
});


/* ==========================
   ✅ CAMBIO DE IMÁGENES CON MINIATURAS
   ========================== */
document.querySelectorAll(".thumbnail img").forEach(thumb => {
    thumb.addEventListener("click", function () {
        const contenedor = this.closest(".imagen-container");
        const mainImg = contenedor.querySelector(".main-display img");
        mainImg.src = this.src;
    });
});


/* ==========================
   ✅ CERRAR MENÚ AL HACER SCROLL (opcional)
   ========================== */
window.addEventListener("scroll", () => {
    if (window.innerWidth <= 900) {
        sidebar.classList.remove("open");
    }
});
