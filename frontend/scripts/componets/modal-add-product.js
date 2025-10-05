export function loadModalAddProduct(typeActions){
    return `
    <div class="inventory-form">
        <div class="modal-header">
            <button class="modal-info" title="Información" aria-label="Información">&#9432;</button>
            <h2 class="form-title">${typeActions.toLowerCase() === 'add'? "Añadir nuevo" : "Editar"} producto</h2>
            <button class="modal-close" title="Cerrar" aria-label="Cerrar">&times;</button>
        </div>
        <form class="form-product" id="form-product" name="form-product">
            <div class="form-group">
                <label for="product-name" class="form-label">Nombre del producto</label>
                <input type="text" class="input-product-name" id="product-name" name="product-name" placeholder="Ej: Filtro de aceite">
            </div>
            <div class="form-group">
                <label for="product-brand" class="form-label">Marca</label>
                <input type="text" class="input-product-brand" id="product-brand" name="product-brand" placeholder="Ej: Toyota">
            </div>

            <div class="form-group">
                <label for="product-model" class="form-label">Modelo</label>
                <input type="text" class="input-product-model" id="product-model" name="product-model" placeholder="Ej: Corolla">
            </div>
            
            <div class="form-group">
                <label for="product-year" class="form-label">Compatible</label>
                <input type="number" class="input-product-year" id="product-year" name="product-year" placeholder="Ej: 2020">
            </div>

            <div class="form-group">
                <label for="product-category" class="form-label">Categoría</label>
                <select id="product-category" name="product-category">
                    <option value="" disabled selected>Selecciona una categoría</option>
                    <option value="oil">Aceite</option>
                    <option value="sparkPlugs">Bujia</option>
                    <option value="replacement">Repuesto</option>
                </select>
            </div>
            
            <div class="form-group">
                <label for="product-stock" class="form-label">Stock</label>
                <input type="number" class="input-product-stock" id="product-stock" name="product-stock" placeholder="Ej: 25">
            </div>

            <div class="form-group">
                <label for="product-min-stock" class="form-label">Stock mínimo</label>
                <input type="number" class="input-product-min-stock" id="product-min-stock" name="product-min-stock" placeholder="Ej: 5">
            </div>

            <div class="form-group">
                <label for="product-price" class="form-label">Precio</label>
                <input type="number" class="input-product-price" id="product-price" name="product-price" step="0.01" placeholder="Ej: 150.00">
            </div>
            <div class="form-group">
                <label for="product-description" class="form-label">Descripción</label>
                <textarea id="product-description" name="product-description" placeholder="Descripcion..."></textarea>
            </div>


            <div class="form-actions">
                <button type="submit" class="btn-save">Guardar</button>
                <button type="reset" class="btn-cancel">Cancelar</button>
            </div>
        </form>
    </div>

    `;
}