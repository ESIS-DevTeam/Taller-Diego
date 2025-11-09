import { createResource } from "../../data-manager.js";
import { showNotification } from "../../utils/notification.js";
import { closeModalForm } from "./modal-add-product.js";




export function setupModalEvents() {
  const modalOverlay = document.querySelector(".modal-overlay");
  const form = document.getElementById('form-product');
  const btnCancel = document.querySelector('.btn-cancel'); 
  const btnClose = document.querySelector('.modal-close'); 
  const autopartCheckbox = document.getElementById('product-autopart');


  setupCloseHandlers(btnCancel, btnClose);

  seuptAutopartTogge(autopartCheckbox);

  setupFormSubmit(form, autopartCheckbox);
}

function seuptAutopartTogge (autopartCheckbox) {
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

    if (autopartCheckbox) {
      toggleAutopartFields();
      autopartCheckbox.addEventListener("change", toggleAutopartFields);
    }


  }
}

function setupCloseHandlers(btnCancel, btnClose) {
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
}

function setupFormSubmit (form, autopartCheckbox) {
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