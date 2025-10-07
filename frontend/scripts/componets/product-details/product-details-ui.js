import { openModal, closeModal } from "../../inventary.js";

const currencyFormatter = new Intl.NumberFormat("es-CL", {
  style: "currency",
  currency: "CLP",
  minimumFractionDigits: 0
});

function formatCurrency(value) {
  return currencyFormatter.format(Number(value ?? 0));
}

export function openProductDetails(product) {
    if (!product) return;

    const modalContainer = document.getElementById("modal-container");
    if (!modalContainer) return;

    modalContainer.innerHTML = generateProductDetailsHTML(product);
    document.body.style.overflow = "hidden";

    setupModalCloseEvents(product);
}


function generateProductDetailsHTML(product) {
    const profit = Number(product.sellingPrice ?? 0) - Number(product.purchasePrice ?? 0);
    const profitPercent =
        Number(product.purchasePrice) > 0
            ? Math.round((profit / Number(product.purchasePrice)) * 100)
            : 0;

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
                            <span class="detail-value">${product.name || "Sin nombre"}</span>
                        </div>
                        <div class="detail-group">
                            <label>Descripción:</label>
                            <span class="detail-value">${product.description || "Sin descripción"}</span>
                        </div>
                        <div class="detail-group">
                            <label>Categoría:</label>
                            <span class="detail-value">${product.category || "Sin categoría"}</span>
                        </div>
                        <div class="detail-group">
                            <label>Stock Actual:</label>
                            <span class="detail-value ${product.stock <= product.minStock ? "low-stock" : "normal-stock"}">
                                ${product.stock} unidades
                            </span>
                        </div>
                        <div class="detail-group">
                            <label>Stock Mínimo:</label>
                            <span class="detail-value">${product.minStock} unidades</span>
                        </div>
                        <div class="detail-group">
                            <label>Precio de Compra:</label>
                            <span class="detail-value">${formatCurrency(product.purchasePrice)}</span>
                        </div>
                        <div class="detail-group">
                            <label>Precio de Venta:</label>
                            <span class="detail-value">${formatCurrency(product.sellingPrice)}</span>
                        </div>
                        <div class="detail-group">
                            <label>Margen de Ganancia:</label>
                            <span class="detail-value profit-margin">
                                ${formatCurrency(profit)} (${profitPercent}%)
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


function setupModalCloseEvents(product) {
    const modalContainer = document.getElementById("modal-container");
    if (!modalContainer) return;

    const overlay = modalContainer.querySelector(".modal-overlay");
    const closeBtn = modalContainer.querySelector(".close-modal");
    const closeFooterBtn = modalContainer.querySelector("#close-details-btn");
    const editBtn = modalContainer.querySelector("#edit-product-btn");

    const handleClose = () => closeModal();

    if (overlay) {
        overlay.addEventListener("click", (event) => {
            if (event.target === overlay) handleClose();
        });
    }

    closeBtn?.addEventListener("click", handleClose);
    closeFooterBtn?.addEventListener("click", handleClose);

    editBtn?.addEventListener("click", () => {
        handleClose();
        const productID = editBtn.dataset.id;
        if (product?.id) {
            openModal("edit", Number(productID));
        }
    });
}