export function loadModalAddProduct(typeActions, productData = null) {
    const isEdit = typeActions.toLowerCase() === 'edit';
    const title = isEdit ? "Editar" : "Añadir nuevo";
    const buttonText = isEdit ? "Actualizar" : "Guardar";
    
    // Pre-llenar datos si es modo edición
    const data = productData || {
        name: '',
        brand: '',
        model: '',
        year: '',
        category: '',
        stock: '',
        minStock: '',
        purchasePrice: '',
        sellingPrice: '',
        description: ''
    };
    
    return `
    <div class="modal-overlay">
        <div class="modal-inventory-form">
            <div class="modal-header">
                <button class="modal-info" title="Información" aria-label="Información">&#9432;</button>
                <h2 class="form-title">${title} producto</h2>
                <button class="modal-close" title="Cerrar" aria-label="Cerrar">&times;</button>
            </div>
            <form class="form-product" id="form-product" name="form-product">
                <div class="form-group">
                    <label for="product-name" class="form-label">Nombre del producto</label>
                    <input type="text" class="input-product-name" id="product-name" name="product-name" 
                           placeholder="${isEdit ? 'Nombre del producto' : 'Ej: Filtro de aceite'}" 
                           value="${data.name}" required>
                </div>
                
                <div class="form-group">
                    <label for="product-brand" class="form-label">Marca</label>
                    <input type="text" class="input-product-brand" id="product-brand" name="product-brand" 
                           placeholder="${isEdit ? 'Marca' : 'Ej: Toyota'}" 
                           value="${data.brand}">
                </div>

                <div class="form-group">
                    <label for="product-model" class="form-label">Modelo</label>
                    <input type="text" class="input-product-model" id="product-model" name="product-model" 
                           placeholder="${isEdit ? 'Modelo' : 'Ej: Corolla'}" 
                           value="${data.model}">
                </div>
                
                <div class="form-group">
                    <label for="product-year" class="form-label">Compatible</label>
                    <input type="text" class="input-product-year" id="product-year" name="product-year" 
                           placeholder="${isEdit ? 'Compatible' : 'Ej: 2020'}" 
                           value="${data.year}">
                </div>

                <div class="form-group">
                    <label for="product-category" class="form-label">Categoría</label>
                    <select id="product-category" name="product-category" required>
                        <option value="" disabled ${!data.category ? 'selected' : ''}>Selecciona una categoría</option>
                        <option value="oil" ${data.category === 'oil' ? 'selected' : ''}>Aceite</option>
                        <option value="sparkPlugs" ${data.category === 'sparkPlugs' ? 'selected' : ''}>Bujia</option>
                        <option value="replacement" ${data.category === 'replacement' ? 'selected' : ''}>Repuesto</option>
                    </select>
                </div>
                
                <div class="form-group">
                    <label for="product-stock" class="form-label">Stock</label>
                    <input type="number" class="input-product-stock" id="product-stock" name="product-stock" 
                           placeholder="${isEdit ? 'Stock actual' : 'Ej: 25'}" 
                           value="${data.stock}" required min="0">
                </div>

                <div class="form-group">
                    <label for="product-min-stock" class="form-label">Stock mínimo</label>
                    <input type="number" class="input-product-min-stock" id="product-min-stock" name="product-min-stock" 
                           placeholder="${isEdit ? 'Stock mínimo' : 'Ej: 5'}" 
                           value="${data.minStock}" required min="0">
                </div>

                <div class="form-group">
                    <label for="product-purchase-price" class="form-label">Precio compra</label>
                    <input type="number" class="input-product-purchase-price" id="product-purchase-price" 
                           name="product-purchase-price" step="0.01" 
                           placeholder="${isEdit ? 'Precio de compra' : 'Ej: 150.00'}" 
                           value="${data.purchasePrice}" required min="0">
                </div>
                
                <div class="form-group">
                    <label for="product-selling-price" class="form-label">Precio de venta</label>
                    <input type="number" class="input-product-selling-price" id="product-selling-price" 
                           name="product-selling-price" step="0.01" 
                           placeholder="${isEdit ? 'Precio de venta' : 'Ej: 200.00'}" 
                           value="${data.sellingPrice}" required min="0">
                </div>
                
                <div class="form-group">
                    <label for="product-description" class="form-label">Descripción</label>
                    <textarea id="product-description" name="product-description" 
                              placeholder="${isEdit ? 'Descripción del producto' : 'Descripción...'}">${data.description}</textarea>
                </div>

                <div class="form-actions">
                    <button type="submit" class="btn-save">${buttonText}</button>
                    <button type="button" class="btn-cancel">Cancelar</button>
                </div>
            </form>
        </div>
    </div>
    `;
}

export function setupModalEvents(typeActions, productID, onSubmitCallback) {
    const modalOverlay = document.querySelector('.modal-overlay');
    const closeBtn = document.querySelector('.modal-close');
    const cancelBtn = document.querySelector('.btn-cancel');
    const form = document.getElementById('form-product');
    
    // Cerrar modal con el botón X
    closeBtn?.addEventListener('click', closeModal);
    
    // Cerrar modal con botón Cancelar
    cancelBtn?.addEventListener('click', closeModal);
    
    // Cerrar modal haciendo click fuera del contenido
    modalOverlay?.addEventListener('click', function(e) {
        if (e.target === modalOverlay) {
            closeModal();
        }
    });
    
    // Cerrar con tecla Escape
    const escapeHandler = function(e) {
        if (e.key === 'Escape') {
            closeModal();
            document.removeEventListener('keydown', escapeHandler);
        }
    };
    document.addEventListener('keydown', escapeHandler);
    
    // Manejar envío del formulario
    form?.addEventListener('submit', function(e) {
        e.preventDefault();
        
        // Recoger datos del formulario
        const formData = {
            name: document.getElementById('product-name').value.trim(),
            brand: document.getElementById('product-brand').value.trim(),
            model: document.getElementById('product-model').value.trim(),
            year: document.getElementById('product-year').value.trim(),
            category: document.getElementById('product-category').value,
            stock: parseInt(document.getElementById('product-stock').value),
            minStock: parseInt(document.getElementById('product-min-stock').value),
            purchasePrice: parseFloat(document.getElementById('product-purchase-price').value),
            sellingPrice: parseFloat(document.getElementById('product-selling-price').value),
            description: document.getElementById('product-description').value.trim()
        };
        
        // Validar que el precio de venta sea mayor al de compra
        if (formData.sellingPrice <= formData.purchasePrice) {
            alert('El precio de venta debe ser mayor al precio de compra');
            return;
        }
        
        // Llamar al callback con los datos
        if (typeof onSubmitCallback === 'function') {
            onSubmitCallback(formData);
        }
    });
}

function closeModal() {
    const modalContainer = document.getElementById('modal-container');
    modalContainer.innerHTML = '';
    document.body.style.overflow = 'auto';
}