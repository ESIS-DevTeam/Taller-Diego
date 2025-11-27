import { loadSideBar } from "./componets/side_bar.js";
import { loadHeader } from "./componets/header.js";
import { loadInventoryMobileMenu } from "./mobile-menu.js";
import { openModalForm } from "./componets/modal-product/modal-product.js";
import { renderProducts } from "./componets/product-list/product-list.js";
import { setupProductActions } from "./componets/product-list/product-actions.js";
import { loadFilterUI } from "./componets/filter-product/filter-loader.js";
import { setupFilterEvents } from "./componets/filter-product/filter-events.js";
import { initializeSearch } from "./componets/filter-product/filter-handler.js";
import { fetchFromApi } from "./data-manager.js";

// Cargar componentes UI
document.getElementById("side-bar-container").innerHTML = loadSideBar();
document.getElementById("header").innerHTML = loadHeader();

// Cargar menú móvil
// Removed duplicate mobile menu loading; it will be loaded on DOMContentLoaded

// Inicializar inventario
async function initializeInventory() {
  const perfStart = performance.now();

  try {
    // 1. Cargar productos del API (una sola vez)
    const fetchStart = performance.now();
    const products = await fetchFromApi('productos');
    const fetchEnd = performance.now();

    // 2. Cargar UI de filtros (categorías)
    const filterUIStart = performance.now();
    loadFilterUI();
    const filterUIEnd = performance.now();

    // 3. Configurar eventos de filtros
    const eventsStart = performance.now();
    setupFilterEvents();
    const eventsEnd = performance.now();

    // 4. Inicializar búsqueda con Fuse.js
    const searchStart = performance.now();
    initializeSearch(products);
    const searchEnd = performance.now();

    // 5. Renderizar productos (pasa los productos ya cargados)
    const renderStart = performance.now();
    await renderProducts(products);
    const renderEnd = performance.now();

    // 6. Configurar acciones de productos  
    const actionsStart = performance.now();
    setupProductActions();
    const actionsEnd = performance.now();

    const perfEnd = performance.now();
    const totalTime = perfEnd - perfStart;

  } catch (error) {
    console.error('❌ Error al inicializar inventario:', error);
  }
}

function setupMobileInventoryMenu() {
  const mobileMenu = document.querySelector("#mobile-menu-container");
  const btnList = document.getElementById("inventory-mobile-btn-list");
  const btnAdd = document.getElementById("inventory-mobile-btn-add");
  const btnBack = document.getElementById("inventory-mobile-back-btn");
  const btnBackMenu = document.querySelector(".btn-back-menu"); // ← NUEVO: botón volver al menú
  const mainContent = document.querySelector(".main-content");
  const container = document.querySelector(".container");
  const safeAdd = (el, handler) => {
    if (!el) return;
    el.addEventListener("click", handler, { passive: false });
  };

  // Ver inventario
  safeAdd(btnList, () => {
    if (!mobileMenu || !mainContent || !container) return;
    mobileMenu.classList.add("active"); // oculta menú
    mainContent.classList.add("active"); // muestra inventario
    container.classList.add("active"); // mantiene side‑bar visible en móvil
    document.body.classList.remove("menu-open");
    document.body.classList.add("inventory-open");
  });

  // Agregar producto - SOLO abre modal, NO muestra inventario
  safeAdd(btnAdd, (e) => {
    e.preventDefault();
    e.stopPropagation();
    // Solo abrir el modal para agregar producto, sin mostrar inventario ni ocultar el menú
    setTimeout(() => {
      openModalForm("add");
    }, 100);
  });

  // Volver al menú desde el botón de la parte superior
  safeAdd(btnBack, () => {
    if (!mobileMenu || !mainContent || !container) return;
    mobileMenu.classList.remove("active");
    mainContent.classList.remove("active");
    container.classList.remove("active");
    document.body.classList.add("menu-open");
    document.body.classList.remove("inventory-open");
    if (mobileMenu) {
      mobileMenu.style.display = '';
    }
  });

  // Volver al menú desde el botón dentro del formulario (NUEVO)
  safeAdd(btnBackMenu, () => {
    if (!mobileMenu || !mainContent || !container) return;
    mobileMenu.classList.remove("active");
    mainContent.classList.remove("active");
    container.classList.remove("active");
    document.body.classList.add("menu-open");
    document.body.classList.remove("inventory-open");
    if (mobileMenu) {
      mobileMenu.style.display = '';
    }
  });
}

// Botón agregar producto (desktop)
document.getElementById("open-modal-btn")?.addEventListener("click", (e) => {
  e.preventDefault();
  openModalForm('add');
});

// Inicializar cuando cargue el DOM
document.addEventListener('DOMContentLoaded', async () => {
  const mobileMenuContainer = document.getElementById("mobile-menu-container");
  if (mobileMenuContainer) {
    mobileMenuContainer.innerHTML = loadInventoryMobileMenu();
  }
  await initializeInventory();
  setupMobileInventoryMenu();
});