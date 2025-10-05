export function loadModelConfirm(){
    return `
    <div class="confirmation-action" role="dialog" aria-modal="true" aria-labelledby="confirm-title">
        <div class="modal-header">
            <button class="modal-info" title="Información" aria-label="Información">&#9432;</button>
            <button class="modal-close" title="Cerrar" aria-label="Cerrar">&times;</button>
        </div>
        <h2 id="confirm-title" class="form-title">Confirmar eliminación</h2>
        <p id="confirm-message">¿Estas seguro de eliminar el producto?</p>
        <div class="form-actions">
            <button id="confirm-yes" aria-label="Confirmar eliminación">Si</button>
            <button id="confirm-no" aria-label="Cancelar eliminación">No</button>
        </div>
    </div>
    `;
}