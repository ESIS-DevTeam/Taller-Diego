import { createResource } from '../data-manager.js';
import { showNotification } from '../utils/notification.js';

/**
 * Lista de categorías predefinidas
 * @constant {Array<string>}
 */
export const CATEGORIAS_PRODUCTOS = [
    'Aceites y Lubricantes',
    'Filtros',
    'Frenos',
    'Suspensión',
    'Motor',
    'Transmisión',
    'Refrigeración',
    'Escape',
    'Carrocería',
    'Neumáticos',
    'Baterías',
    'Iluminación',
];

/**
 * Genera las opciones del select de categorías
 * @param {string} selectedCategory - Categoría seleccionada
 * @returns {string} HTML de las opciones
 */
function generateCategoryOptions(selectedCategory = '') {
    return CATEGORIAS_PRODUCTOS.map(cat => 
        `<option value="${cat}" ${selectedCategory === cat ? 'selected' : ''}>${cat}</option>`
    ).join('');
}

/**
 * Carga el modal de agregar/editar producto
 * @returns {string} HTML del modal
 */
export function loadModalAddProduct() {
    const categoryOptions = generateCategoryOptions();

    return `
    <div class="modal-overlay">
        <div class="modal-inventory-form">
            <div class="modal-header">
                <button class="modal-info" title="Información" aria-label="Información">&#9432;</button>
                <h2 class="form-title">Nuevo producto</h2>
                <button class="modal-close" title="Cerrar" aria-label="Cerrar">&times;</button>
            </div>
            <form class="form-product" id="form-product" name="form-product">
                <div class="form-group">
                    <label for="product-name" class="form-label">Nombre del producto</label>
                    <input type="text" class="input-product-name" id="product-name" name="product-name" 
                           placeholder="Ej: Filtro de aceite" required>
                </div>

                <div class="form-group">
                    <label for="product-brand" class="form-label">Marca</label>
                    <input type="text" class="input-product-brand" id="product-brand" name="product-brand" 
                           placeholder="Ej: Toyota">
                </div>

                <div class="form-group">
                    <label for="product-category" class="form-label">Categoría</label>
                    <select id="product-category" name="product-category" required>
                        <option value="" disabled selected>Selecciona una categoría</option>
                        ${categoryOptions}
                    </select>
                </div>

                <div class="form-group">
                    <label for="product-stock" class="form-label">Stock</label>
                    <input type="number" class="input-product-stock" id="product-stock" name="product-stock" 
                           placeholder="Ej: 25" required min="0">
                </div>

                <div class="form-group">
                    <label for="product-min-stock" class="form-label">Stock mínimo</label>
                    <input type="number" class="input-product-min-stock" id="product-min-stock" name="product-min-stock" 
                           placeholder="Ej: 5" required min="0">
                </div>

                <div class="form-group">
                    <label for="product-purchase-price" class="form-label">Precio de compra</label>
                    <input type="number" class="input-product-purchase-price" id="product-purchase-price" 
                           name="product-purchase-price" step="0.01" placeholder="Ej: 150.00" required min="0">
                </div>

                <div class="form-group">
                    <label for="product-selling-price" class="form-label">Precio de venta</label>
                    <input type="number" class="input-product-selling-price" id="product-selling-price" 
                           name="product-selling-price" step="0.01" placeholder="Ej: 200.00" required min="0">
                </div>

                <div class="form-group">
                    <label for="product-description" class="form-label">Descripción</label>
                    <textarea id="product-description" name="product-description" 
                              placeholder="Descripción del producto..."></textarea>
                </div>

                <div class="autopart-toggle">
                    <label class="autopart-toggle-label">
                        <input type="checkbox" id="product-autopart">
                        <span>Producto Autoparte</span>
                    </label>
                </div>

                <div class="auto-part-fields" data-autopart-fields>
                    <div class="form-group">
                        <label for="product-model" class="form-label">Modelo compatible</label>
                        <input type="text" id="product-model" name="product-model" 
                               placeholder="Ej: Toyota Corolla">
                    </div>
                    <div class="form-group">
                        <label for="product-year" class="form-label">Año compatible</label>
                        <input type="text" id="product-year" name="product-year" 
                               placeholder="Ej: 2022, 2023">
                    </div>
                </div>

                <div class="form-actions">
                    <button type="submit" class="btn-save">Guardar</button>
                    <button type="button" class="btn-cancel">Cancelar</button>
                </div>
            </form>
        </div>
    </div>
    `;
}

export function openModalForm() {
  const modalContainer = document.getElementById('modal-container');
  if(modalContainer) {
    modalContainer.innerHTML = loadModalAddProduct();
    document.body.style.overflow = 'hidden';
    setupModalEvents();
  }
}

function closeModalForm() {
  const modalContainer = document.getElementById('modal-container');
  if (modalContainer) {
    modalContainer.innerHTML = "";
  }
  document.body.style.overflow = "";
}

export function setupModalEvents() {
  const modalOverlay = document.querySelector(".modal-overlay");
  const form = document.getElementById('form-product');
  const btnCancel = document.querySelector('.btn-cancel'); 
  const btnClose = document.querySelector('.modal-close'); 
  const autopartCheckbox = document.getElementById('product-autopart');
  const autopartFields = document.querySelector("[data-autopart-fields]");

  const toggleAutopartFields = () => {
    if(!autopartCheckbox) {
      return;
    }

    const show = autopartCheckbox.checked;
    autopartFields?.classList.toggle("is-visible", show);

    autopartFields?.querySelectorAll("input").forEach((input) => {
      input.disabled = !show;
      if(!show) {
        input.value = "";
      }
    });
  }
  
  if (autopartCheckbox) {
    toggleAutopartFields();
    autopartCheckbox.addEventListener("change", toggleAutopartFields);
  }

  // Cerrar el modal
  const closeHandlers = () => closeModalForm();
  btnClose?.addEventListener("click", closeHandlers);
  btnCancel?.addEventListener("click", closeHandlers);

  modalOverlay?.addEventListener("click", (event) => {
    if (event.target === modalOverlay) {
      closeHandlers();
    }
  });

  const escapeHandler = (event) => {
    if(event.key === "Escape") {
      closeHandlers();
      document.removeEventListener("keydown", escapeHandler);
    }
  }
  document.addEventListener("keydown", escapeHandler);

  form?.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    // DATOS DEL FORMULARIO
    const formData = {
      nombre: form['product-name'].value.trim(),
      marca: form['product-brand'].value.trim(),
      categoria: form['product-category'].value,
      stock: parseInt(form['product-stock'].value) || 0,
      stockMin: parseInt(form['product-min-stock'].value) || 0,
      precioCompra: parseFloat(form['product-purchase-price'].value) || 0,
      precioVenta: parseFloat(form['product-selling-price'].value) || 0, 
      descripcion: form['product-description'].value.trim(),
    }
    
    const isAutopart = autopartCheckbox?.checked ?? false;

    if(isAutopart) {
      formData.modelo = form['product-model'].value.trim();
      formData.anio = form['product-year'].value.trim();
    }

    
    // ENVIO DE DATOS
    try {
      const endpoint = isAutopart ? 'autopartes' : 'productos';
      const resultado = await createResource(endpoint, formData);
      
      showNotification("Producto agregado exitosamente", "success");
      
      closeModalForm();
      
      
    } catch (error) {
      console.error("Error al crear producto:", error);
      // El error ya se maneja en handleApiError
    }
  });
}

/**
 * Valida un campo y muestra mensaje de error
 * @param {HTMLElement} input - Elemento input a validar
 * @param {string} message - Mensaje de error
 * @returns {boolean} true si es válido, false si no
 */
function validateField(input, message) {
  const errorElement = input.parentElement.querySelector(".error-message");

  if(errorElement) {
    errorElement.remove();
  }

  if(!input.value.trim()) {
    const span = document.createElement("span");
    span.classList.add("error-message");
    span.textContent = message;
    input.classList.add("input-error");
    input.parentElement.appendChild(span);
    return false;
  }
  
  input.classList.remove("input-error");
  return true;
}