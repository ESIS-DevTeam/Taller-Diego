import { loadSideBar } from "./componets/side_bar.js";
import { loadMobileMenu } from "./componets/mobile_menu.js";
import { loadHeader } from "./componets/header.js";
import { mobileMenuControler } from "./componets/menu-controler.js";
import { setupModalEvents, loadModalAddProduct } from "./componets/modal-add-product.js";
import { confirmDelete } from "./componets/modal-confirm.js";
import { FilterManager } from "./componets/filter/filter-manager.js";
import { setupFilterHandlers } from "./componets/filter/filterHandlers.js";
import { setupProductEvents, attachProductClickListeners } from "./componets/product-details/product-events.js";
import { openProductDetails } from "./componets/product-details/product-details-ui.js";
import { 
    products, 
    categories, 
    addProduct, 
    deleteProduct, 
    updateProduct, 
    getProductById 
} from "./data-manager.js";

// Cargar componentes UI
const sideBarContainer = document.getElementById("side-bar-container");
const mobileMenu = document.getElementById("mobile-menu-container");
const header = document.getElementById('header');

sideBarContainer.innerHTML = loadSideBar();
mobileMenu.innerHTML = loadMobileMenu();
mobileMenuControler();
header.innerHTML = loadHeader();

// Inicializar FilterManager con los productos importados
const filterManager = new FilterManager(products);

// Cargar los datos de categoria de forma dinamica
function renderCategory(categoriesToRender) {
    const categoryList = document.querySelector(".category-option");
    if (!categoryList) return;
    
    categoryList.innerHTML = "";
    categoriesToRender.forEach(ctg => {
        const categoryHTML = `
            <li>
                <label>
                    <input type="checkbox" name="category" value="${ctg.toLowerCase()}">
                    ${ctg}
                </label>
            </li>
        `;
        categoryList.innerHTML += categoryHTML;
    });
}

// Cargar los datos de productos de forma dinamica
function renderProduct(productsToRender) {
    const productsList = document.querySelector(".product-list");
    if (!productsList) return;

    productsList.innerHTML = "";
    
    if (productsToRender.length === 0) {
        productsList.innerHTML = `
            <div class="no-products">
                <p>No se encontraron productos que coincidan con los filtros</p>
            </div>
        `;
        return;
    }
    
    productsToRender.forEach(product => {
        const verify = (product.stock <= product.minStock) ? "low-stock" : "normal-stock";
        const productoHTML = `
        <div class="product-item grid-layout" role="row" data-id="${product.id}">
            <div class="product-name" role="cell">${product.name}</div>
            <div class="product-desc" role="cell">${product.description}</div>
            <div class="product-stock ${verify}" role="cell">${product.stock}</div>
            <div class="product-purchase-price" role="cell">$${product.purchasePrice.toLocaleString()}</div>
            <div class="product-selling-price" role="cell">$${product.sellingPrice.toLocaleString()}</div>
            <div class="product-actions" role="cell">
                <button class="btn-edit" data-id="${product.id}" title="Modificar">
                    <img src="../assets/icons/edit.png" alt="Editar producto">
                </button>
                <button class="btn-delete" data-id="${product.id}" title="Eliminar">
                    <img src="../assets/icons/delete.png" alt="Eliminar producto">
                </button>
            </div>
        </div>
        `;
        productsList.innerHTML += productoHTML;
    });
    
    // Configurar eventos de productos
    setupProductEvents();
}

// Funciones de productos usando data-manager.js
function deleteProductHandler(productId) {
    console.log("🗑️ Eliminando producto:", productId);
    
    const deleted = deleteProduct(productId);
    if (deleted) {
        filterManager.products = products;
        const filtered = filterManager.applyFilters();
        renderProduct(filtered);
    }
}

function editProductHandler(productId, productData) {
    console.log("✏️ Editando producto:", productId);
    
    const updated = updateProduct(productId, productData);
    if (updated) {
        filterManager.products = products;
        const filtered = filterManager.applyFilters();
        renderProduct(filtered);
        return true;
    }
    return false;
}

function addNewProduct(productData) {
    console.log("➕ Agregando nuevo producto");
    
    const newProduct = addProduct(productData);
    if (newProduct) {
        filterManager.products = products;
        const filtered = filterManager.applyFilters();
        renderProduct(filtered);
        return newProduct;
    }
    return null;
}

// Modal functions
document.getElementById('open-modal-btn')?.addEventListener('click', function() {
    openModal("add");
});

function openModal(typeActions, productID = null) {
    const modalContainer = document.getElementById('modal-container');
    if (!modalContainer) return;

    let productData = null;
    if (typeActions === "edit" && productID) {
        productData = getProductById(productID);
    }

    modalContainer.innerHTML = loadModalAddProduct(typeActions, productData);
    document.body.style.overflow = 'hidden';

    setupModalEvents(typeActions, productID, (formData) => {
        handleModalSubmit(typeActions, productID, formData);
    });

    setTimeout(() => {
        const firstInput = document.getElementById('product-name');
        firstInput?.focus();
    }, 100);
}

function handleModalSubmit(typeActions, productID, formData) {
    if (typeActions === "add") {
        const newProduct = addNewProduct(formData);
        if (newProduct) {
            console.log("✅ Producto agregado:", newProduct);
            closeModal();
        }
    } else if (typeActions === "edit" && productID) {
        const success = editProductHandler(productID, formData);
        if (success) {
            console.log("✅ Producto editado:", productID);
            closeModal();
        }
    }
}

function closeModal() {
    const modalContainer = document.getElementById('modal-container');
    if (modalContainer) {
        modalContainer.innerHTML = '';
        document.body.style.overflow = '';
    }
}

// Filter handling
function onFiltersChanged() {
    const filteredProducts = filterManager.getFilteredProducts();
    renderProduct(filteredProducts);
}

// Inicialización
function initializeApp() {
    renderCategory(categories);
    
    const initialProducts = filterManager.applyFilters();
    renderProduct(initialProducts);
    
    setupFilterHandlers(filterManager, onFiltersChanged);
    
    console.log("📦 Inventario inicializado con", products.length, "productos");
}

// Iniciar la aplicación cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', function() {
    initializeApp();
});

// Exportar funciones para uso en otros módulos
export { 
    products, 
    categories, 
    getProductById, 
    addNewProduct, 
    editProductHandler, 
    deleteProductHandler,
    openModal,
    closeModal
};