import { setupModalEvents, loadModalAddProduct } from "./modal-add-product.js";

export function mobileMenuControler(){
    const btnList = document.getElementById("mobile-btn-list");
    const btnAdd = document.getElementById("mobile-btn-add");
    const btnEdit = document.getElementById("mobile-btn-edit");
    const btnDelete = document.getElementById("mobile-btn-delete");
    
    const mainContent = document.querySelector(".main-content");
    const movileMenu = document.querySelector("#mobile-menu-container");
    
    btnList.addEventListener('click', () => {
        mainContent.classList.add('active');
        movileMenu.classList.add('active');
    });
    
    btnAdd.addEventListener('click', () => {
        // Abrir modal directamente, no agregar otro event listener
        openModal("add");
    });
    
    btnEdit.addEventListener('click', () => {
        mainContent.classList.add('active');
        movileMenu.classList.add('active');
    });
    
    btnDelete.addEventListener('click', () => {
        mainContent.classList.add('active');
        movileMenu.classList.add('active');
    });
}

function openModal(typeActions, productID = null) {
    const modalContainer = document.getElementById('modal-container');
    if (!modalContainer) {
        console.error("No se encontró el modal-container");
        return;
    }
    
    modalContainer.innerHTML = loadModalAddProduct(typeActions);

    // Deshabilitar scroll del body cuando el modal está abierto
    document.body.style.overflow = 'hidden';

    setupModalEvents();

    setTimeout(() => {
        const firstInput = document.getElementById('product-name');
        if (firstInput) {
            firstInput.focus();
        }
    }, 100);
}