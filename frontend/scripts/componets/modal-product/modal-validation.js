export function validateField(input, message) {
  const errorElement = input.parentElement.querySelector(".error-message");
  if(errorElement) errorElement.remove();

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

export function validateFormData(form, formData, isAutopart) {
  let isValid = true;
  
  if (!formData.nombre) {
    validateField(form['product-name'], "El nombre es obligatorio");
    isValid = false;
  }
  
  if (formData.precioVenta <= formData.precioCompra) {
    validateField(form['product-selling-price'], "El precio de venta debe ser mayor al de compra");
    isValid = false;
  }
  
  if (!formData.nombre) {
      validateField(form['product-name'], "El nombre es obligatorio");
      isValid = false;
  }
  if (!formData.marca) {
    validateField(form['product-brand'], "La marca es obligatoria");
    isValid = false;
  }
  if (!formData.categoria) {
    validateField(form['product-category'], "Selecciona una categoría");
    isValid = false;
  }
  if (formData.stock < 0) {
    validateField(form['product-stock'], "El stock debe ser un número válido");
    isValid = false;
  }
  if (formData.precioVenta <= 0) {
    validateField(form['product-selling-price'], "El precio debe ser un número positivo");
    isValid = false;
  }
  if (formData.precioVenta <= formData.precioCompra) {
    validateField(form['product-selling-price'], "El precio de venta debe ser mayor al de compra");
    isValid = false;
  }
  
  if(isAutopart) {
    if(!formData.modelo) {
      validateField(form['product-model'], "Debe colocar modelos");
      isValid = false;
    }
    if(!formData.anio) {
      validateField(form['product-year'], "Coloque los años de los modelos");
      isValid = false;
    }
  }

  
  return isValid;
}