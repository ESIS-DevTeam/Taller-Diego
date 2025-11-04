import { openProductDetails } from "./product-details-ui.js";
import { openModal, deleteProductHandler } from "../../inventary.js";
import { confirmDelete } from "../modal-confirm.js";
import { getProductById } from "../../data-manager.js";

export function setupProductEvents() {
    attachProductClickListeners();
    attachButtonListeners();
}

export function attachProductClickListeners() {
    document.querySelectorAll(".product-item").forEach(productElement => {
        productElement.addEventListener('click', function(e) {
            if (!e.target.closest('.product-actions')) {
                const productID = parseInt(this.dataset.id);
                openProductDetails(productID);
            }
        });
        
        productElement.style.cursor = 'pointer';
        productElement.addEventListener('mouseenter', function() {
            this.style.backgroundColor = '#f8f9fa';
        });
        productElement.addEventListener('mouseleave', function() {
            this.style.backgroundColor = '';
        });
    });
}

function attachButtonListeners() {
    document.querySelectorAll(".btn-edit").forEach(btn => {
        btn.addEventListener('click', function(e) {
            e.stopPropagation();
            const productID = parseInt(e.currentTarget.dataset.id);
            openModal("edit", productID);
        });
    });
    
    document.querySelectorAll(".btn-delete").forEach(btn => {
        btn.addEventListener('click', function(e) {
            e.stopPropagation();
            const productID = parseInt(e.currentTarget.dataset.id);
            const product = getProductById(productID);
            
            if (product) {
                confirmDelete(
                    productID, 
                    product.name, 
                    (id) => {
                        console.log("Ejecutando eliminación para ID:", id);
                        deleteProductHandler(id);
                    }
                );
            }
        });
    });
}