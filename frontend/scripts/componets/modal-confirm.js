export function loadModalConfirm(message = "¿Estás seguro de que quieres realizar esta acción?") {
    return `
        <div class="modal-overlay" id="confirm-overlay">
            <div class="confirmation-action">
                <div class="modal-header">
                    <button class="modal-info" title="Información" aria-label="Información">&#9432;</button>
                    <h2 class="form-title">Confirmar acción</h2>
                    <button class="modal-close" title="Cerrar" aria-label="Cerrar">&times;</button>
                </div>
                <p id="confirm-message">${message}</p>
                <div class="form-actions">
                    <button type="button" id="confirm-yes">Sí, confirmar</button>
                    <button type="button" id="confirm-no">Cancelar</button>
                </div>
            </div>
        </div>
    `;
}

export function setupConfirmModal(onConfirm, onCancel = null, customMessage = null) {
    const modalContainer = document.getElementById('modal-container');
    const message = customMessage || "¿Estás seguro de que quieres realizar esta acción?";
    
    modalContainer.innerHTML = loadModalConfirm(message);
    
    const overlay = document.getElementById('confirm-overlay');
    const closeBtn = document.querySelector('.modal-close');
    const cancelBtn = document.getElementById('confirm-no');
    const confirmBtn = document.getElementById('confirm-yes');
    
    // Función para cerrar el modal
    function closeConfirmModal() {
        modalContainer.innerHTML = '';
        document.body.style.overflow = 'auto';
    }
    
    // Confirmar acción
    confirmBtn.addEventListener('click', function() {
        if (typeof onConfirm === 'function') {
            onConfirm();
        }
        closeConfirmModal();
    });
    
    // Cancelar acción
    function handleCancel() {
        if (typeof onCancel === 'function') {
            onCancel();
        }
        closeConfirmModal();
    }
    
    cancelBtn.addEventListener('click', handleCancel);
    closeBtn.addEventListener('click', handleCancel);
    
    // Cerrar al hacer click fuera del modal
    overlay.addEventListener('click', function(e) {
        if (e.target === overlay) {
            handleCancel();
        }
    });
    
    // Cerrar con tecla Escape
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') {
            handleCancel();
        }
    });
    
    // Deshabilitar scroll del body
    document.body.style.overflow = 'hidden';
}

// Función de conveniencia para eliminar productos
export function confirmDelete(productId, productName, onDeleteConfirmed) {
    const message = `¿Estás seguro de que quieres eliminar el producto "${productName}"? Esta acción no se puede deshacer.`;
    
    setupConfirmModal(
        () => {
            // Función que se ejecuta cuando confirman
            if (typeof onDeleteConfirmed === 'function') {
                onDeleteConfirmed(productId);
            }
        },
        () => {
            // Función que se ejecuta cuando cancelan
            console.log("Eliminación cancelada");
        },
        message
    );
}