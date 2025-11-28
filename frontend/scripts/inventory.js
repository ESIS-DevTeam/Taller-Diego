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
  try {
    // 1. Cargar UI de filtros primero (sin esperar datos)
    loadFilterUI();

    // 2. Configurar eventos de filtros
    setupFilterEvents();

    // 3. Mostrar skeleton loader inmediatamente
    const productList = document.getElementById("product-list");
    if (productList) {
      productList.innerHTML = `
        <div class="product-item skeleton">
          <div class="skeleton-text"></div>
          <div class="skeleton-text"></div>
          <div class="skeleton-text"></div>
          <div class="skeleton-text"></div>
          <div class="skeleton-text"></div>
          <div class="skeleton-actions"></div>
        </div>
      `.repeat(5);
    }

    // 4. Cargar productos del API (en paralelo con UI)
    const products = await fetchFromApi('productos');

    // 5. Inicializar búsqueda con Fuse.js
    initializeSearch(products);

    // 6. Renderizar productos (pasa los productos ya cargados)
    await renderProducts(products);

    // 7. Configurar acciones de productos  
    setupProductActions();

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