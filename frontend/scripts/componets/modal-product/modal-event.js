import { createResource, updateResource } from "../../data-manager.js";
import { showNotification } from "../../utils/notification.js";
import { closeModalForm } from "./modal-product.js";

export function setupModalEvents(type = 'add', productId = null ) {
  const modalOverlay = document.querySelector(".modal-overlay");
  const form = document.getElementById('form-product');
  const btnCancel = document.querySelector('.btn-cancel'); 
  const btnClose = document.querySelector('.modal-close'); 
  const autopartCheckbox = document.getElementById('product-autopart');

  setupCloseHandlers(modalOverlay, btnCancel, btnClose);
  setupAutopartToggle(autopartCheckbox); 
  setupFormSubmit(form, autopartCheckbox,type,productId);
}

function setupAutopartToggle(autopartCheckbox) { 
  const autopartFields = document.querySelector("[data-autopart-fields]");
  
  
  const toggleAutopartFields = () => {
    if(!autopartCheckbox) return;
    
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
}

function setupCloseHandlers(modalOverlay, btnCancel, btnClose) { 
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
}

function setupFormSubmit(form, autopartCheckbox, type = 'add', productId = null) {
  let isEdit = (type === 'edit' && productId !== null);
  let endpoint = "productos";
  form?.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    // DATOS DEL FORMULARIO
    let formData = {
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
      formData.anio = parseInt(form['product-year'].value, 10) || 0;
      endpoint = "autopartes";
    }

    // ENVIO DE DATOS
    try {
      const endpoint = isAutopart ? 'autopartes' : 'productos';
      if(isEdit){
        await updateResource(endpoint,productId, formData);
      }else{
        await createResource(endpoint,formData)
      }
      
      showNotification("Producto agregado exitosamente", "success");
      closeModalForm();
      
    } catch (error) {
      console.error("Error al crear producto:", error);
    }
  });
}