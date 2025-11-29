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
import { bindAddProductButton } from "./componets/modal-product/modal-product.js";
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
    
    loadFilterUI();
    
    setupFilterEvents();
    
    initializeSearch(products);
    
    await renderProducts();
    
    setupProductActions();
  } catch (error) {
    console.error('Error al inicializar inventario:', error);
  }
}

function setupMobileInventoryMenu() {
  const mobileMenu = document.getElementById("mobile-menu-container");
  const btnList = document.getElementById("inventory-mobile-btn-list");
  const btnAdd = document.getElementById("inventory-mobile-btn-add");
  const btnBack = document.getElementById("inventory-mobile-back-btn");
  const mainContent = document.querySelector(".main-content");

  const safeAdd = (el, handler) => {
    if (!el) return;
    el.addEventListener("click", handler, { passive: false });
  };

  // Ver inventario
  safeAdd(btnList, () => {
    if (!mobileMenu || !mainContent) return;
    mobileMenu.classList.add("active"); // oculta menú
    mainContent.classList.add("active"); // muestra inventario
    document.body.classList.remove("menu-open");
    document.body.classList.add("inventory-open"); 
  });

  // Agregar producto - SOLO abre modal, NO muestra inventario
  safeAdd(btnAdd, (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    // Ocultar menú móvil pero NO mostrar inventario
    if (mobileMenu && mainContent) {
      mobileMenu.classList.add("active"); // oculta menú
      mainContent.classList.add("active"); // muestra inventario
      document.body.classList.remove("menu-open");
      document.body.classList.add("inventory-open"); 
    }
    
    // Abrir modal
    setTimeout(() => {
      openModalForm("add");
    }, 100);
  });

  // Volver al menú
  safeAdd(btnBack, () => {
    if (!mobileMenu || !mainContent) return;
    mobileMenu.classList.remove("active");
    mainContent.classList.remove("active");
    document.body.classList.add("menu-open");
    document.body.classList.remove("inventory-open"); 
    if (mobileMenu) {
      mobileMenu.style.display = 'flex';
    }
  });
}

// Botón agregar producto (desktop)
document.getElementById("open-modal-btn")?.addEventListener("click", (e) => {
  e.preventDefault();
  openModalForm('add');
});

async function init() {
  try {
    bindAddProductButton();
    setupFilterEvents();
    await renderProducts();

    const params = new URLSearchParams(window.location.search);
    if (params.get('open') === 'new-product') {
      openModalForm('add');
      history.replaceState(null, '', window.location.pathname);
    }
  } catch (error) {
    console.error('Error inicializando inventario:', error);
  }
}

// Inicializar cuando cargue el DOM
document.addEventListener('DOMContentLoaded', async () => {
  const mobileMenuContainer = document.getElementById("mobile-menu-container");
  if (mobileMenuContainer) {
    mobileMenuContainer.innerHTML = loadInventoryMobileMenu();
  }
  init();
  await initializeInventory();
  setupMobileInventoryMenu();
});

