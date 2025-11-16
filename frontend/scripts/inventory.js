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
const mobileMenuContainer = document.getElementById("mobile-menu-container");
if (mobileMenuContainer) {
  mobileMenuContainer.innerHTML = loadInventoryMobileMenu();
}

// Inicializar inventario
async function initializeInventory() {
  try {
    const products = await fetchFromApi('productos');
    
    // ✅ 1. PRIMERO cargar UI (crea checkboxes y dropdown)
    loadFilterUI();
    
    // ✅ 2. DESPUÉS configurar eventos (ahora los elementos existen)
    setupFilterEvents();
    
    // ✅ 3. Inicializar búsqueda
    initializeSearch(products);
    
    // ✅ 4. Renderizar productos
    await renderProducts();
    
    // ✅ 5. Configurar acciones
    setupProductActions();
  } catch (error) {
    console.error('Error al inicializar inventario:', error);
  }
}

// Configurar menú móvil
function setupMobileInventoryMenu() {
  const mobileMenu = document.getElementById("mobile-menu-container");
  const btnList = document.getElementById("inventory-mobile-btn-list");
  const btnAdd = document.getElementById("inventory-mobile-btn-add");
  const btnBack = document.getElementById("inventory-mobile-back-btn");
  const mainContent = document.querySelector(".main-content");

  const safeAdd = (el, handler) => {
    if (!el) return;
    // usar pointerup (compatible touch/mouse). sin preventDefault para evitar efectos raros
    el.addEventListener("pointerup", (ev) => {
      handler(ev);
    }, { passive: true });
  };

  // toggle para que no haga falta presionar dos veces
  safeAdd(btnList, () => {
    if (!mobileMenu || !mainContent) return;
    mobileMenu.classList.toggle("active");
    mainContent.classList.toggle("active");
  });

  safeAdd(btnAdd, () => {
    openModalForm("add");
  });

  safeAdd(btnBack, () => {
    if (!mobileMenu || !mainContent) return;
    mobileMenu.classList.add("active");
    mainContent.classList.remove("active");
    window.scrollTo({ top: 0, behavior: "smooth" });
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