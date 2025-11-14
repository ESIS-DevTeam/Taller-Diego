import { fetchFromApi } from '../../data-manager.js';
import { CATEGORIAS_PRODUCTOS } from './constants.js';

export function generateCategoryOptions(selectedCategory = '') {
    return CATEGORIAS_PRODUCTOS.map(cat => 
        `<option value="${cat}" ${selectedCategory === cat ? 'selected' : ''}>${cat}</option>`
    ).join('');
}

export async function generateModalHTML(type = 'add', id = null) {
  const isEdit = (type === 'edit' && id !== null);
  const title = isEdit ? "Editar" : "Agregar";
  const required = isEdit ? '' : 'required';  
  
  let data = {
    nombre: '',
    marca: '',
    categoria: '',
    stock: '',
    stockMin: '',
    precioCompra: '',
    precioVenta: '',
    descripcion: '',
    modelo: '',
    anio: ''
  };
  
  if(isEdit) {
    data = await fetchFromApi("productos", id);
    if(data.tipo === "autoparte") {
      let autoparte = await fetchFromApi("autopartes", id);
      data.anio = autoparte.anio;
      data.modelo = autoparte.modelo;
    }
  }
  console.log(data);
  
  const categoryOptions = generateCategoryOptions(data.categoria);

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
                  <input type="text" id="product-name" name="product-name" 
                         placeholder="${isEdit ? data.nombre : 'Ej: Filtro de aceite'}"
                         value="${data.nombre}" ${required}>
              </div>
              <div class="form-group">
                  <label for="product-brand" class="form-label">Marca</label>
                  <input type="text" id="product-brand" name="product-brand" 
                         placeholder="${isEdit ? data.marca : 'Ej: Toyota'}"
                         value="${data.marca}">
              </div>
              <div class="form-group">
                  <label for="product-category" class="form-label">Categoría</label>
                  <select id="product-category" name="product-category" ${required}>
                      <option value="" disabled ${!data.categoria ? 'selected' : ''}>Selecciona una categoría</option>
                      ${categoryOptions}
                  </select>
              </div>
              <div class="form-group">
                  <label for="product-stock" class="form-label">Stock</label>
                  <input type="number" id="product-stock" name="product-stock" 
                         placeholder="${isEdit ? data.stock : 'Ej: 25'}"
                         value="${data.stock}" ${required} min="0">
              </div>
              <div class="form-group">
                  <label for="product-min-stock" class="form-label">Stock mínimo</label>
                  <input type="number" id="product-min-stock" name="product-min-stock" 
                         placeholder="${isEdit ? data.stockMin : 'Ej: 5'}"
                         value="${data.stockMin}" ${required} min="0">
              </div>
              <div class="form-group">
                  <label for="product-purchase-price" class="form-label">Precio de compra</label>
                  <input type="number" id="product-purchase-price" name="product-purchase-price" 
                         step="0.01" placeholder="${isEdit ? data.precioCompra : 'Ej: 150.00'}"
                         value="${data.precioCompra}" ${required} min="0">
              </div>
              <div class="form-group">
                  <label for="product-selling-price" class="form-label">Precio de venta</label>
                  <input type="number" id="product-selling-price" name="product-selling-price" 
                         step="0.01" placeholder="${isEdit ? data.precioVenta : 'Ej: 200.00'}"
                         value="${data.precioVenta}" ${required} min="0">
              </div>
              <div class="form-group">
                  <label for="product-description" class="form-label">Descripción</label>
                  <textarea id="product-description" name="product-description" 
                            placeholder="${isEdit ? data.descripcion : 'Descripción del producto...'}">${data.descripcion}</textarea>
              </div>
              <div class="autopart-toggle">
                  <label class="autopart-toggle-label">
                      <input type="checkbox" id="product-autopart" ${data.modelo || data.anio ? 'checked disabled' : ''}>
                      <span>Producto Autoparte</span>
                  </label>
              </div>
              <div class="auto-part-fields ${data.modelo || data.anio ? 'is-visible' : ''}" data-autopart-fields>
                  <div class="form-group">
                      <label for="product-model" class="form-label">Modelo compatible</label>
                      <input type="text" id="product-model" name="product-model" 
                             placeholder="${isEdit ? data.modelo : 'Ej: Toyota Corolla'}"
                             value="${data.modelo || ''}">
                  </div>
                  <div class="form-group">
                      <label for="product-year" class="form-label">Año compatible</label>
                      <input type="text" id="product-year" name="product-year" 
                             placeholder="${isEdit ? data.anio : 'Ej: 2022, 2023'}"
                             value="${data.anio || ''}">
                  </div>
              </div>
              <div class = "form-img">
                <label class="form-label">Imagen del producto</label>
                <div class="image-upload-wrapper">
                    <label class="custom-file-upload">
                        <input type="file" id="product-img" name="product-img" accept="image/jpeg, image/jpg, image/png, image/webp">
                        Seleccionar imagen
                    </label>
                    <span class="file-name" id="file-name">Ningún archivo seleccionado</span>
                </div>
                <img id="product-preview" class="product-preview" alt="Vista previa">
                <div class="image-info">
                    <span>Formatos permitidos: JPG, PNG, WEBP</span>
                    <span>Tamaño máximo: 20 MB</span>
                </div>
              </div>
              <div class="form-actions">
                  <button type="submit" class="btn-save">${isEdit ? 'Actualizar' : 'Guardar'}</button>
                  <button type="button" class="btn-cancel">Cancelar</button>
              </div>
          </form>
      </div>
  </div>
    `;
}