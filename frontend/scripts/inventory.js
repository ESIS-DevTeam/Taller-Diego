import { openModalForm } from "./componets/modal-product/modal-product.js";
import { renderProducts } from "./componets/product-list/product-list.js";
import { setupProductActions } from "./componets/product-list/product-actions.js";
import { loadFilterUI } from "./componets/filter-product/filter-loader.js";
import { setupFilterEvents } from "./componets/filter-product/filter-events.js";
import { initializeSearch } from "./componets/filter-product/filter-handler.js";
import { fetchFromApi } from "./data-manager.js";
import { bindBarcodeButton } from "./componets/modal-pdfcod.js";
import { loadComponent } from "./utils/component-loader.js";

// Cargar header y sidebar dinámicamente (Hybrid)
loadComponent("header", "includes/header.html");
loadComponent("side-bar-container", "includes/sidebar.html");
loadComponent("mobile-menu-container", "includes/mobile-menu.html");

// Iniciar fetch inmediatamente (no esperar al DOM)
const productsPromise = fetchFromApi('productos');

// Inicializar inventario
async function initializeInventory() {
  try {
    // 1. Cargar UI de filtros primero
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

    // 4. Esperar a que lleguen los datos (iniciados arriba)
    const products = await productsPromise;

    // 5. Inicializar búsqueda con Fuse.js
    initializeSearch(products);

    // 6. Renderizar productos
    await renderProducts(products);

    // 7. Configurar acciones de productos  
    setupProductActions();

  } catch (error) {
    console.error('❌ Error al inicializar inventario:', error);
  }
}

function setupMobileInventoryMenu() {
  // ... (código existente del menú móvil) ...
  const mobileMenu = document.querySelector("#mobile-menu-container");
  const btnList = document.getElementById("inventory-mobile-btn-list");
  const btnAdd = document.getElementById("inventory-mobile-btn-add");
  const btnBack = document.getElementById("inventory-mobile-back-btn");
  const btnBackMenu = document.querySelector(".btn-back-menu");
  const mainContent = document.querySelector(".main-content");
  const container = document.querySelector(".container");
  const safeAdd = (el, handler) => {
    if (!el) return;
    el.addEventListener("click", handler, { passive: false });
  };

  // Ver inventario
  safeAdd(btnList, () => {
    if (!mobileMenu || !mainContent || !container) return;
    mobileMenu.classList.add("active");
    mainContent.classList.add("active");
    container.classList.add("active");
    document.body.classList.remove("menu-open");
    document.body.classList.add("inventory-open");
  });

  // Agregar producto
  safeAdd(btnAdd, (e) => {
    e.preventDefault();
    e.stopPropagation();
    setTimeout(() => {
      openModalForm("add");
    }, 100);
  });

  // Volver al menú
  const closeMenu = () => {
    if (!mobileMenu || !mainContent || !container) return;
    mobileMenu.classList.remove("active");
    mainContent.classList.remove("active");
    container.classList.remove("active");
    document.body.classList.add("menu-open");
    document.body.classList.remove("inventory-open");
    if (mobileMenu) {
      mobileMenu.style.display = '';
    }
  };

  safeAdd(btnBack, closeMenu);
  safeAdd(btnBackMenu, closeMenu);
}

// Botón agregar producto (desktop)
document.getElementById("open-modal-btn")?.addEventListener("click", (e) => {
  e.preventDefault();
  openModalForm('add');
});

// Inicializar cuando cargue el DOM
document.addEventListener('DOMContentLoaded', async () => {
  await initializeInventory();
  setupMobileInventoryMenu();
});