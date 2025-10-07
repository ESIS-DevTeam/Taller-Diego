import { loadSideBar } from "./componets/side_bar.js";
import { loadMobileMenu } from "./componets/mobile_menu.js";
import { loadHeader } from "./componets/header.js";
import { mobileMenuControler } from "./componets/menu-controler.js";
import { setupModalEvents, loadModalAddProduct } from "./componets/modal-add-product.js";
import { confirmDelete } from "./componets/modal-confirm.js";
import { FilterManager } from "./componets/filter/filter-manager.js";
import { setupFilterHandlers } from "./componets/filter/filterHandlers.js";
import { setupProductEvents } from "./componets/product-details/product-events.js";
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
const header = document.getElementById('header');

sideBarContainer.innerHTML = loadSideBar();
mobileMenu.innerHTML = loadMobileMenu();
mobileMenuControler();
header.innerHTML = loadHeader();

//Var globales
let products = [];
let categories = []
let filterManager = null;

// Cargar los datos de categoria de forma dinamica
function renderCategory(categoriesToRender) {
    const categoryList = document.querySelector(".category-option");
    if (!categoryList) return;
    
    categoryList.innerHTML = "";
    categoriesToRender.forEach(ctg => {
        categoryList.insertAdjacentHTML("beforeend", `
            <li>
                <label>
                    <input type="checkbox" name="category" value="${ctg}">
                    ${ctg.charAt(0).toUpperCase() + ctg.slice(1)}
                </label>
            </li>
        `);
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
        const stockClass = product.stock <= product.minStock ? "low-stock" : "normal-stock";
        
        productsList.insertAdjacentHTML("beforeend", `
            <div class="product-item" data-id="${product.id}">
                <h3>${product.name}</h3>
                <p>${product.description}</p>
                <div class="product-info">
                    <span class="stock ${stockClass}">Stock: ${product.stock}</span>
                    <span class="price">Precio: $${product.sellingPrice.toLocaleString()}</span>
                </div>
                <div class="actions">
                    <button class="btn-edit" data-id="${product.id}">Editar</button>
                    <button class="btn-delete" data-id="${product.id}">Eliminar</button>
                </div>
            </div>
        `);
    });
    
    // Configurar eventos de productos
    setupProductEvents();
}

// Funciones de productos usando data-manager.js
async function deleteProductHandler(productId) {
    console.log("🗑️ Eliminando producto:", productId);
    
    try {
        await deleteProduct(productId);
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
    console.log("✏️ Editando producto:", productId);
    
    try {
        // Adaptar formato de datos para la API
        const apiData = {
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
        
        await updateProduct(productId, apiData);
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
    console.log(" Agregando nuevo producto");
    
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

// Modal functions
document.getElementById('open-modal-btn')?.addEventListener('click', function() {
    openModal("add");
});

function openModal(typeActions, productID = null) {
    const modalContainer = document.getElementById('modal-container');
    if (!modalContainer) return;

    let productData = null;
    if (typeActions === "edit" && productID) {
        productData = products.find(p => p.id == productID);
    }

    modalContainer.innerHTML = loadModalAddProduct(typeActions, productData);
    document.body.style.overflow = 'hidden';

    setupModalEvents(typeActions, productID, (formData) => {
        handleModalSubmit(typeActions, productID, formData);
    });
}

async function handleModalSubmit(typeActions, productID, formData) {
    let success = false;
    
    if (typeActions === "add") {
        success = await addNewProduct(formData);
    } else if (typeActions === "edit") {
        success = await editProductHandler(productID, formData);
    }
    
    if (success) {
        closeModal();
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
function onFiltersChanged(filteredProducts) {
    renderProduct(filteredProducts);
}

async function loadProducts() {
    try {
        const apiProducts = await getProducts();
        
        // Transformar formato de API a frontend
        products = apiProducts.map(p => ({
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
        
        // Extraer categorías únicas
        categories = [...new Set(products.map(p => p.category))].filter(Boolean);
        
        // Reinicializar FilterManager
        filterManager = new FilterManager(products);
        
        // Configurar manejo de filtros
        setupFilterHandlers(filterManager, onFiltersChanged);
        
        // Renderizar UI
        renderCategory(categories);
        renderProduct(products);
    } catch (error) {
        console.error("Error cargando productos:", error);
        showError("No se pudieron cargar los productos");
    }
}

function showError(message) {
    // Implementar notificación (temporal)
    alert(message);
}

function showSuccess(message) {
    // Implementar notificación (temporal)
    alert(message);
}

// Inicialización
async function initializeApp() {
    await loadProducts();
}

// Iniciar la aplicación cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', function() {
    initializeApp();
});

// Exportar funciones para uso en otros módulos
export { 
    getProductById, 
    addNewProduct, 
    editProductHandler, 
    deleteProductHandler,
    openModal,
    closeModal
};