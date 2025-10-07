import { loadSideBar } from "./componets/side_bar.js";
import { loadMobileMenu } from "./componets/mobile_menu.js";
import { loadHeader } from "./componets/header.js";
import { mobileMenuControler } from "./componets/menu-controler.js";
import { setupModalEvents, loadModalAddProduct } from "./componets/modal-add-product.js";
import { confirmDelete } from "./componets/modal-confirm.js";
import { FilterManager } from "./componets/filter/filter-manager.js";
import { setupFilterHandlers } from "./componets/filter/filterHandlers.js";
import { openProductDetails } from "./componets/product-details/product-details-ui.js";
import {
    getProducts,
    addProduct,
    updateProduct,
    deleteProduct,
    getProductById
} from "./data-manager.js";

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
function renderCategory(categoriesToRender) {
    const categoryList = document.querySelector(".category-option");
    if (!categoryList) return;

    const activeCategories = filterManager?.currentFilters?.categories ?? [];
    categoryList.innerHTML = "";

    categoriesToRender.forEach((category) => {
        const checked = activeCategories.includes(category) ? "checked" : "";
        categoryList.insertAdjacentHTML(
            "beforeend",
            `
            <li>
                <label>
                    <input type="checkbox" name="category" value="${category}" ${checked}>
                    ${category.charAt(0).toUpperCase() + category.slice(1)}
                </label>
            </li>
        `
        );
    });
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
                        <img src="../assets/icons/edit.png" alt="Editar">
                    </button>
                    <button class="btn-delete" data-id="${product.id}">
                        <img src="../assets/icons/delete.png" alt="Eliminar">
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
    const id = Number(productId);
    const payload = {
        nombre: productData.name,
        descripcion: productData.description,
        precioVenta: productData.sellingPrice,
        precioCompra: productData.purchasePrice,
        marca: productData.brand,
        categoria: productData.category,
        stock: productData.stock,
        stockMin: productData.minStock,
        img: productData.image,
        codBarras: productData.barcode,
        tipo: productData.type
    };

    try {
        await updateProduct(id, payload);
        await loadProducts();
        showSuccess("Producto actualizado");
        return true;
    } catch (error) {
        console.error("Error actualizando producto:", error);
        showError("No se pudo actualizar el producto");
        return false;
    }
}

async function addNewProduct(productData) {
    try {
        await addProduct(
            productData.name,
            productData.description,
            productData.sellingPrice,
            productData.purchasePrice,
            productData.brand,
            productData.category,
            productData.stock,
            productData.minStock,
            productData.barcode,
            productData.image,
            productData.type
        );
        await loadProducts();
        showSuccess("Producto agregado");
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

function openModal(typeActions, productID = null) {
    const modalContainer = document.getElementById("modal-container");
    if (!modalContainer) return;

    let productData = null;
    if (typeActions === "edit" && productID) {
        productData = products.find((p) => p.id === Number(productID));
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
            barcode: p.codBarras || "",
            type: p.tipo || ""
        }));

        categories = [...new Set(products.map((p) => p.category))].filter(Boolean);

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

// Feedback básico
function showError(message) {
    alert(message);
}

function showSuccess(message) {
    alert(message);
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