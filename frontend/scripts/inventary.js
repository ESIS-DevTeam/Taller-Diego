import { loadSideBar } from "./componets/side_bar.js";
import { loadMobileMenu } from "./componets/mobile_menu.js";
import { loadHeader } from "./componets/header.js";
import { mobileMenuControler } from "./componets/menu-controler.js";
import { setupModalEvents, loadModalAddProduct,CATEGORIAS_PRODUCTOS } from "./componets/modal-add-product.js";
import { confirmDelete } from "./componets/modal-confirm.js";
import { FilterManager } from "./componets/filter/filter-manager.js";
import { setupFilterHandlers } from "./componets/filter/filterHandlers.js";
import { openProductDetails } from "./componets/product-details/product-details-ui.js";
import {
    getProducts,
    addProduct,
    updateProduct,
    deleteProduct,
    getProductById,
    saveProductWithDetails,
    getAutoparteByProductId,
    addAutoparte
} from "./data-manager.js";
import { showSuccess, showError, showWarning } from "./utils/notification.js";
const API_BASE_URL = 'http://127.0.0.1:8000/api/v1'; 

// Cargar componentes UI
const sideBarContainer = document.getElementById("side-bar-container");
const mobileMenu = document.getElementById("mobile-menu-container");
const header = document.getElementById("header");

if (sideBarContainer) sideBarContainer.innerHTML = loadSideBar();
if (mobileMenu) {
    mobileMenu.innerHTML = loadMobileMenu();
    mobileMenuControler();
}
if (header) header.innerHTML = loadHeader();

// Estado global
let products = [];
let categories = [];
let filterManager = null;
let filtersInitialized = false;
let productListEventsBound = false;

// Render dinámico de categorías
// Reemplazar la función renderCategory completa (líneas 43-115)

// Reemplazar la función renderCategory (líneas 43-130)

function renderCategory(categoriesToRender) {
    const categoryList = document.querySelector(".category-option");
    if (!categoryList) return;

    const activeCategories = filterManager?.currentFilters?.categories ?? [];
    const isMobile = window.innerWidth <= 768;
    
    if (isMobile) {
        // Dropdown simple para móvil - un solo clic aplica el filtro
        const selectedCount = activeCategories.length;
        const displayText = selectedCount === 0 
            ? 'Todas las categorías' 
            : activeCategories.map(cat => {
                const label = CATEGORIAS_PRODUCTOS.find((c) => c.toLowerCase() === cat);
                return label || cat;
            }).join(', ');
        
        categoryList.innerHTML = `
            <div class="category-dropdown">
                <button class="category-dropdown-toggle" type="button" id="category-toggle">
                    ${displayText}
                    <span class="dropdown-arrow">▼</span>
                </button>
                <div class="category-dropdown-menu" id="category-menu">
                    <button class="category-dropdown-item ${activeCategories.length === 0 ? 'active' : ''}" 
                            data-category="" type="button">
                        <span>Todas las categorías</span>
                    </button>
                    ${categoriesToRender.map(category => {
                        const value = category.toLowerCase();
                        const label = CATEGORIAS_PRODUCTOS.find((cat) => cat.toLowerCase() === value)
                            ?? value.charAt(0).toUpperCase() + value.slice(1);
                        const isActive = activeCategories.includes(value);
                        return `
                            <button class="category-dropdown-item ${isActive ? 'active' : ''}" 
                                    data-category="${value}" type="button">
                                <span>${label}</span>
                            </button>
                        `;
                    }).join('')}
                </div>
            </div>
        `;
        
        // Prevenir que los eventos se propaguen
        const dropdown = categoryList.querySelector('.category-dropdown');
        const toggle = document.getElementById('category-toggle');
        const menu = document.getElementById('category-menu');
        
        // Toggle dropdown
        toggle?.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            menu?.classList.toggle('show');
        });
        
        // Manejar clics en las opciones
        menu?.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            
            const item = e.target.closest('.category-dropdown-item');
            if (item) {
                const category = item.dataset.category;
                
                // Limpiar filtros anteriores y aplicar el nuevo
                if (category === "") {
                    // "Todas las categorías"
                    filterManager.currentFilters.categories = [];
                } else {
                    // Una categoría específica
                    filterManager.currentFilters.categories = [category];
                }
                
                // Aplicar filtros manualmente
                const filteredProducts = filterManager.getFilteredProducts();
                renderProduct(filteredProducts);
                
                // Cerrar menú
                menu.classList.remove('show');
                
                // Re-renderizar para actualizar el texto del botón
                renderCategory(categoriesToRender);
            }
        });
        
        // Cerrar al hacer clic fuera
        const closeHandler = (e) => {
            if (!dropdown.contains(e.target)) {
                menu?.classList.remove('show');
            }
        };
        
        document.addEventListener('click', closeHandler);
        
    } else {
        // Desktop version (checkboxes)
        categoryList.innerHTML = "";
        categoriesToRender.forEach((category) => {
            const value = category.toLowerCase();
            const label = CATEGORIAS_PRODUCTOS.find((cat) => cat.toLowerCase() === value)
                ?? value.charAt(0).toUpperCase() + value.slice(1);
            const checked = activeCategories.includes(value) ? "checked" : "";
            categoryList.insertAdjacentHTML(
                "beforeend",
                `
                <li>
                    <label>
                        <input type="checkbox" name="category" value="${value}" ${checked}>
                        ${label}
                    </label>
                </li>
            `
            );
        });
    }
}

// Render dinámico de productos
function renderProduct(productsToRender) {
    const productsList = document.querySelector(".product-list");
    if (!productsList) return;

    productsList.innerHTML = "";

    if (!productsToRender.length) {
        productsList.innerHTML = `
            <div class="no-products">
                <p>No se encontraron productos</p>
            </div>
        `;
        return;
    }

    productsToRender.forEach((product) => {
        const stockClass = product.stock <= product.minStock ? "low-stock" : "";

        productsList.insertAdjacentHTML(
            "beforeend",
            `
            <div class="product-item grid-layout" data-id="${product.id}">
                <div class="product-name">${product.name}</div>
                <div class="product-desc">${product.description}</div>
                <div class="product-stock ${stockClass}">${product.stock}</div>
                <div class="product-purchase-price">$${product.purchasePrice.toLocaleString()}</div>
                <div class="product-selling-price">$${product.sellingPrice.toLocaleString()}</div>
                <div class="product-actions">
                    <button class="btn-edit" data-id="${product.id}">
                        <img class="img-edit" src="../assets/icons/edit.png" alt="Editar">
                    </button>
                    <button class="btn-delete" data-id="${product.id}">
                        <img class="img-delete" src="../assets/icons/delete.png" alt="Eliminar">
                    </button>
                </div>
            </div>
        `
        );
    });
}

// Delegación de eventos en la lista de productos
function setupProductListEvents() {
    if (productListEventsBound) return;

    const productsList = document.querySelector(".product-list");
    if (!productsList) return;

    productsList.addEventListener("click", async (event) => {
        const deleteBtn = event.target.closest(".btn-delete");
        if (deleteBtn) {
            event.preventDefault();
            event.stopPropagation();
            await handleDeleteClick(deleteBtn.dataset.id);
            return;
        }

        const editBtn = event.target.closest(".btn-edit");
        if (editBtn) {
            event.preventDefault();
            event.stopPropagation();
            openModal("edit", editBtn.dataset.id);
            return;
        }

        const row = event.target.closest(".product-item");
        if (row) {
            const product = products.find((item) => item.id === Number(row.dataset.id));
            if (product) openProductDetails(product);
        }
    });

    productListEventsBound = true;
}

async function handleDeleteClick(productId) {
    const id = parseInt(productId, 10);
    if (isNaN(id) || id <= 0) {
        console.error("ID inválido:", productId);
        return;
    }

    console.log("Solicitando confirmación para eliminar producto ID:", id);
    const confirmed = await confirmDelete(id);
    
    if (confirmed) {
        console.log("Confirmación recibida, eliminando producto ID:", id);
        const success = await deleteProductHandler(id);
        console.log("Resultado de eliminación:", success ? "Éxito" : "Fallido");
    } else {
        console.log("Eliminación cancelada por el usuario");
    }
}

// CRUD handlers
async function deleteProductHandler(productId) {
    const id = Number(productId);
    try {
        await deleteProduct(id);
        await loadProducts();
        showSuccess("Producto eliminado correctamente");
        return true;
    } catch (error) {
        console.error("Error eliminando producto:", error);
        showError("No se pudo eliminar el producto");
        return false;
    }
}

async function editProductHandler(productId, productData) {
  try {
    // 1. Actualizar datos básicos del producto
    await updateProduct(productId, {
      nombre: productData.name,
      descripcion: productData.description,
      precioVenta: productData.sellingPrice,
      precioCompra: productData.purchasePrice,
      marca: productData.brand,
      categoria: productData.category,
      stock: productData.stock,
      stockMin: productData.minStock,
      img: productData.image || null,
      codBarras: productData.barcode || null,
      tipo: productData.isAutoparte ? "autoparte" : "producto"
    });
    
    // 2. Si es autoparte con datos, actualizar o crear SOLO la referencia en autopartes
    if (productData.isAutoparte && productData.model && productData.year) {
      try {
        // Intentar actualizar primero
        const response = await fetch(`${API_BASE_URL}/autopartes/producto/${productId}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            modelo: productData.model,
            anio: parseInt(productData.year) || new Date().getFullYear()
          }),
        });
        
        if (!response.ok && response.status === 404) {
          // Si no existe, crear SOLO la entrada de referencia en autopartes
          // NO crear un nuevo producto completo
          console.log(`Creando referencia de autoparte para producto ID ${productId}`);
          
          const createResponse = await fetch(`${API_BASE_URL}/autopartes/`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              productoId: Number(productId),
              modelo: productData.model,
              anio: parseInt(productData.year) || new Date().getFullYear()
            })
          });
          
          if (!createResponse.ok) {
            const errorText = await createResponse.text();
            throw new Error(`Error ${createResponse.status}: ${errorText}`);
          }
          
          console.log("Referencia de autoparte creada correctamente");
        }
      } catch (autoparteError) {
        console.error("Error gestionando datos de autoparte:", autoparteError);
        showError("El producto se actualizó pero hubo un problema con los datos de autoparte");
      }
    }
    
    // Recargar productos y mostrar mensaje
    await loadProducts();
    showSuccess("Producto actualizado correctamente");
    return true;
  } catch (error) {
    console.error("Error actualizando producto:", error);
    showError("No se pudo actualizar el producto");
    return false;
  }
}

// Arreglar la función addNewProduct:

async function addNewProduct(formData) {
  try {
    console.log("Formulario recibido:", formData);
    
    // Si es una autoparte, enviar directamente a /autopartes
    if (formData.isAutoparte && formData.model && formData.year) {
      console.log("Creando autoparte directamente");
      
      const response = await fetch(`${API_BASE_URL}/autopartes/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nombre: formData.name,
          descripcion: formData.description,
          precioVenta: formData.sellingPrice,
          precioCompra: formData.purchasePrice,
          marca: formData.brand,
          categoria: formData.category,
          stock: formData.stock,
          stockMin: formData.minStock,
          codBarras: formData.barcode ?? null,
          img: formData.image ?? null,
          tipo: "autoparte",
          modelo: formData.model,
          anio: parseInt(formData.year) || new Date().getFullYear()
        })
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Error ${response.status}: ${errorText}`);
      }
      
      console.log("Autoparte creada exitosamente");
    } 
    // Si es un producto normal, usar el endpoint de productos
    else {
      await addProduct(
        formData.name,
        formData.description,
        formData.sellingPrice,
        formData.purchasePrice,
        formData.brand,
        formData.category,
        Number(formData.stock),
        Number(formData.minStock),
        formData.barcode || null,
        formData.image || "",
        "producto"
      );
    }
    
    await loadProducts();
    showSuccess("Producto agregado correctamente");
    return true;
  } catch (error) {
    console.error("Error agregando producto:", error);
    showError("No se pudo agregar el producto");
    return false;
  }
}

// Modal helpers
document.getElementById("open-modal-btn")?.addEventListener("click", () => {
    openModal("add");
});

// Reemplazar la función openModal completa

async function openModal(typeActions, productID = null) {
    const modalContainer = document.getElementById("modal-container");
    if (!modalContainer) return;

    let productData = null;
    
    if (typeActions === "edit" && productID) {
        // Obtener datos básicos del producto
        productData = products.find((p) => p.id === Number(productID));
        
        if (productData && productData.type === "autoparte") {
            try {
                // Obtener datos específicos de la autoparte
                const autoparteData = await getAutoparteByProductId(productID);
                if (autoparteData) {
                    // Añadir datos de autoparte al objeto del producto
                    productData.model = autoparteData.modelo;
                    productData.year = autoparteData.anio;
                    productData.isAutoparte = true;
                }
            } catch (error) {
                console.error("Error cargando datos de autoparte:", error);
            }
        }
    }

    modalContainer.innerHTML = loadModalAddProduct(typeActions, productData);
    document.body.style.overflow = "hidden";

    setupModalEvents(typeActions, productID, async (formData) => {
        await handleModalSubmit(typeActions, productID, formData);
    });
}

async function handleModalSubmit(typeActions, productID, formData) {
    let success = false;

    if (typeActions === "add") {
        success = await addNewProduct(formData);
    } else if (typeActions === "edit") {
        success = await editProductHandler(productID, formData);
    }

    if (success) closeModal();
}

function closeModal() {
    const modalContainer = document.getElementById("modal-container");
    if (modalContainer) {
        modalContainer.innerHTML = "";
        document.body.style.overflow = "";
    }
}

// Filtros
function onFiltersChanged(filteredProducts) {
    renderProduct(filteredProducts ?? []);
}

// Carga de productos desde la API
async function loadProducts() {
    try {
        const apiProducts = await getProducts();
        products = apiProducts.map((p) => ({
            id: p.id,
            name: p.nombre || "",
            description: p.descripcion || "",
            stock: Number(p.stock) || 0,
            minStock: Number(p.stockMin) || 0,
            purchasePrice: Number(p.precioCompra) || 0,
            sellingPrice: Number(p.precioVenta) || 0,
            category: (p.categoria || "").toLowerCase(),
            brand: p.marca || "",
            image: p.img || "",
            barcode: p.codBarras || null,
            type: p.tipo || ""
        }));

        const defaultCategories = CATEGORIAS_PRODUCTOS.map((cat) => cat.toLowerCase());
        const productCategories = [...new Set(products.map((p) => p.category).filter(Boolean))];
        categories = Array.from(new Set([...defaultCategories, ...productCategories]));

        if (!filterManager) {
            filterManager = new FilterManager(products);
        } else {
            filterManager.updateProducts(products);
        }

        renderCategory(categories);
        renderProduct(filterManager.getFilteredProducts());

        if (!filtersInitialized) {
            setupFilterHandlers(filterManager, onFiltersChanged);
            filtersInitialized = true;
        }
    } catch (error) {
        console.error("Error cargando productos:", error);
        showError("No se pudieron cargar los productos");
    }
}


// Inicialización
async function initializeApp() {
    setupProductListEvents();
    await loadProducts();
}

document.addEventListener("DOMContentLoaded", () => {
    initializeApp();
});

// Exportaciones
export {
    getProductById,
    addNewProduct,
    editProductHandler,
    deleteProductHandler,
    openModal,
    closeModal
};