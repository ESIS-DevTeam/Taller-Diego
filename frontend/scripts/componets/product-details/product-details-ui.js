import { getProductById } from "../../data-manager.js";
import { openModal, closeModal } from "../../inventary.js";

export function openProductDetails(productId) {
    const product = getProductById(productId);
    if (!product) return;
    
    const modalContainer = document.getElementById('modal-container');
    if (!modalContainer) return;
    
    modalContainer.innerHTML = generateProductDetailsHTML(product);
    document.body.style.overflow = 'hidden';
    
    setupModalCloseEvents();
}

function generateProductDetailsHTML(product) {
    return `
        <div class="modal-overlay active">
            <div class="modal-content product-details-modal">
                <div class="modal-header">
                    <h2>Detalles del Producto</h2>
                    <button class="close-modal">×</button>
                </div>
                <div class="modal-body">
                    <div class="product-details-grid">
                        <div class="detail-group">
                            <label>Nombre:</label>
                            <span class="detail-value">${product.name}</span>
                        </div>
                        <div class="detail-group">
                            <label>Descripción:</label>
                            <span class="detail-value">${product.description}</span>
                        </div>
                        <div class="detail-group">
                            <label>Categoría:</label>
                            <span class="detail-value">${product.category}</span>
                        </div>
                        <div class="detail-group">
                            <label>Stock Actual:</label>
                            <span class="detail-value ${product.stock <= product.minStock ? 'low-stock' : 'normal-stock'}">
                                ${product.stock} unidades
                            </span>
                        </div>
                        <div class="detail-group">
                            <label>Stock Mínimo:</label>
                            <span class="detail-value">${product.minStock} unidades</span>
                        </div>
                        <div class="detail-group">
                            <label>Precio de Compra:</label>
                            <span class="detail-value">$${product.purchasePrice.toLocaleString()}</span>
                        </div>
                        <div class="detail-group">
                            <label>Precio de Venta:</label>
                            <span class="detail-value">$${product.sellingPrice.toLocaleString()}</span>
                        </div>
                        <div class="detail-group">
                            <label>Margen de Ganancia:</label>
                            <span class="detail-value profit-margin">
                                $${(product.sellingPrice - product.purchasePrice).toLocaleString()} 
                                (${Math.round(((product.sellingPrice - product.purchasePrice) / product.purchasePrice) * 100)}%)
                            </span>
                        </div>
                    </div>
                </div>
                <div class="modal-footer">
                    <button class="btn-secondary" id="close-details-btn">Cerrar</button>
                    <button class="btn-primary" id="edit-product-btn" data-id="${product.id}">Editar Producto</button>
                </div>
            </div>
        </div>
    `;
}

function setupModalCloseEvents() {
    const overlay = document.querySelector('.modal-overlay');
    const closeBtn = document.querySelector('.close-modal');
    const closeDetailsBtn = document.getElementById('close-details-btn');
    const editProductBtn = document.getElementById('edit-product-btn');
    
    if (overlay) {
        overlay.addEventListener('click', function(e) {
            if (e.target === overlay) {
                closeModal();
            }
        });
    }
    
    if (closeBtn) {
        closeBtn.addEventListener('click', closeModal);
    }
    
    if (closeDetailsBtn) {
        closeDetailsBtn.addEventListener('click', closeModal);
    }
    
    if (editProductBtn) {
        editProductBtn.addEventListener('click', function() {
            const productId = this.dataset.id;
            closeModal();
            setTimeout(() => openModal('edit', parseInt(productId)), 100);
        });
    }
}