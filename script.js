/* ==========================
   ✅ MENÚ HAMBURGUESA MÓVIL
   ========================== */
const toggleSidebar = document.getElementById("toggleSidebar");
const sidebar = document.getElementById("sidebar");

toggleSidebar.addEventListener("click", () => {
    sidebar.classList.toggle("open");
});


/* ==========================
   ✅ SUBMENÚ PARA MÓVIL (SIN HOVER)
   ========================== */
document.querySelectorAll(".has-submenu").forEach(item => {
    item.addEventListener("click", (e) => {
        e.preventDefault(); // evita que cambie de página
        e.stopPropagation(); // evita que cierre el menú
        item.classList.toggle("open");
    });
});


/* ==========================
   ✅ NO CERRAR EL MENÚ SI EL CLIC ES EN SUBMENÚ
   ========================== */
document.querySelectorAll(".sidebar a").forEach(link => {
    link.addEventListener("click", (e) => {
        // Detectar si pertenece a un submenú
        const isSubmenuLink = link.closest(".submenu");

        if (window.innerWidth <= 900 && !isSubmenuLink) {
            sidebar.classList.remove("open");
        }
    });
});


/* ==========================
   ✅ PESTAÑAS (Inicio / Acerca / Contacto)
   ========================== */
const tabs = document.querySelectorAll(".tab");
const panels = document.querySelectorAll(".tab-panel");

tabs.forEach(tab => {
    tab.addEventListener("click", () => {
        tabs.forEach(t => t.classList.remove("active"));
        panels.forEach(p => {
            p.classList.remove("active");
            p.hidden = true;
        });

        tab.classList.add("active");
        const panel = document.getElementById(tab.dataset.target);
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
