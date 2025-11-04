// Lista de categorías predefinidas (al inicio del archivo, antes de las funciones)
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

export function loadModalAddProduct(typeActions, productData = null) {
    const isEdit = typeActions.toLowerCase() === 'edit';
    const title = isEdit ? "Editar" : "Añadir nuevo";
    const buttonText = isEdit ? "Actualizar" : "Guardar";

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
        description: '',
        type: ''
    };

    // Determinar si es autoparte
    const isAutoPart = (data.type || '').toLowerCase() === 'autoparte' || 
                       data.isAutoparte === true ||
                       (data.model && data.year);
    
    // Nueva lógica: Si es edición de un producto normal (no autoparte), ocultar el toggle
    const isRegularProductEdit = isEdit && !isAutoPart;
    const showAutopartToggle = !isRegularProductEdit;

    // Generar opciones de categorías dinámicamente
    const categoryOptions = CATEGORIAS_PRODUCTOS.map(cat => 
        `<option value="${cat}" ${data.category === cat ? 'selected' : ''}>${cat}</option>`
    ).join('');

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
                    <label for="product-category" class="form-label">Categoría</label>
                    <select id="product-category" name="product-category" required>
                        <option value="" disabled ${!data.category ? 'selected' : ''}>Selecciona una categoría</option>
                        ${categoryOptions}
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

                ${showAutopartToggle ? `
                <div class="autopart-toggle">
                    <label class="autopart-toggle-label">
                        <input type="checkbox" id="product-autopart" ${isAutoPart ? "checked" : ""} ${isAutoPart && isEdit ? "disabled" : ""}>
                        <span>Producto Autoparte</span>
                    </label>
                </div>

                <div class="auto-part-fields ${isAutoPart ? "is-visible" : ""}" data-autopart-fields>
                    <div class="form-group">
                        <label for="product-model" class="form-label">Modelo compatible</label>
                        <input type="text" id="product-model" placeholder="Toyota Corolla" name="product-model" value="${data.model || ""}">
                    </div>
                    <div class="form-group">
                        <label for="product-year" class="form-label">Año compatible</label>
                        <input type="text" id="product-year" placeholder="2022,2023" name="product-year" value="${data.year || ""}">
                    </div>
                </div>
                ` : ''}

                <div class="form-actions">
                    <button type="submit" class="btn-save">${buttonText}</button>
                    <button type="button" class="btn-cancel">Cancelar</button>
                </div>
            </form>
        </div>
    </div>
    `;
}


function closeModalForm() {
  const modalContainer = document.getElementById("modal-container");
  if (modalContainer) {
    modalContainer.innerHTML = "";
  }
  document.body.style.overflow = "";
}

export function setupModalEvents(typeActions, productID, onSubmitCallback) {
  const modalOverlay = document.querySelector(".modal-overlay");
  const closeBtn = document.querySelector(".modal-close");
  const cancelBtn = document.querySelector(".btn-cancel");
  const form = document.getElementById("form-product");
  const autopartCheckbox = document.getElementById("product-autopart");
  const autopartFields = document.querySelector("[data-autopart-fields]");

  const toggleAutopartFields = () => {
    if (!autopartCheckbox) return; // Si no existe el checkbox, no hacer nada
    
    const show = autopartCheckbox.checked ?? false;
    autopartFields?.classList.toggle("is-visible", show);
    autopartFields?.querySelectorAll("input").forEach((input) => {
      input.disabled = !show;
      if (!show) input.value = "";
    });
  };
  
  if (autopartCheckbox) {
    toggleAutopartFields();
    autopartCheckbox.addEventListener("change", toggleAutopartFields);
  }

  const closeHandlers = () => closeModalForm();

  closeBtn?.addEventListener("click", closeHandlers);
  cancelBtn?.addEventListener("click", closeHandlers);

  modalOverlay?.addEventListener("click", (event) => {
    if (event.target === modalOverlay) closeHandlers();
  });

  const escapeHandler = (event) => {
    if (event.key === "Escape") {
      closeHandlers();
      document.removeEventListener("keydown", escapeHandler);
    }
  };
  document.addEventListener("keydown", escapeHandler);

  form?.addEventListener("submit", (event) => {
    event.preventDefault();
    
    // Determinar si es autoparte
    const isAutoparte = autopartCheckbox?.checked ?? false;
    
    // Recolectar datos del formulario
    const formData = {
      name: document.getElementById("product-name").value.trim(),
      description: document.getElementById("product-description").value.trim(),
      brand: document.getElementById("product-brand").value.trim(),
      category: document.getElementById("product-category").value,
      stock: parseInt(document.getElementById("product-stock").value) || 0,
      minStock: parseInt(document.getElementById("product-min-stock").value) || 0,
      purchasePrice: parseFloat(document.getElementById("product-purchase-price").value) || 0,
      sellingPrice: parseFloat(document.getElementById("product-selling-price").value) || 0,
      barcode: null,
      image: "",
      isAutoparte: isAutoparte,
      model: isAutoparte ? document.getElementById("product-model")?.value?.trim() || "" : "",
      year: isAutoparte ? document.getElementById("product-year")?.value?.trim() || "" : ""
    };

    // Validaciones
    if (!formData.name) {
      alert("El nombre del producto es obligatorio");
      return;
    }

    if (formData.sellingPrice <= formData.purchasePrice) {
      alert("El precio de venta debe ser mayor al precio de compra");
      return;
    }

    if (isAutoparte && !formData.model) {
      alert("El modelo es obligatorio para autopartes");
      return;
    }
    
    console.log("Enviando formData:", formData);
    
    if (typeof onSubmitCallback === "function") {
      onSubmitCallback(formData);
    }
  });
}