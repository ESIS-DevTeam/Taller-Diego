import { createResource, updateResource, fetchFromApi } from "../../data-manager.js";
import { showNotification } from "../../utils/notification.js";
import { uploadImage, updateImage, compressImage } from "../../utils/store/manager-image.js";
import { closeModalForm } from "./modal-product.js";
import { renderProducts } from "../product-list/product-list.js";

// ========================================
// GENERADOR DE CÓDIGOS DE BARRAS
// ========================================

/**
 * Genera un código de barras único con el formato: TALLER-XXXXX-CAT
 * Verifica que no exista en la base de datos antes de retornarlo
 * 
 * @param {string} categoria - Categoría del producto (ej: "Filtros", "Aceites")
 * @param {number} lastId - Último ID registrado en la base de datos
 * @param {Array} existingBarcodes - Array de códigos existentes para verificar unicidad
 * @returns {string} Código de barras único generado (ej: "TALLER-00001-FIL")
 * 
 * @example
 * generateBarcode("Filtros", 45, ["TALLER-00046-ACE"]) // "TALLER-00046-FIL"
 * generateBarcode("Aceites", 0, [])  // "TALLER-00001-ACE"
 */
function generateBarcode(categoria, lastId, existingBarcodes = []) {
  // Prefijo fijo del taller
  const prefix = "TALLER";

  // Generar sufijo de 3 letras basado en la categoría
  const categorySuffix = getCategorySuffix(categoria);

  let attempts = 0;
  const maxAttempts = 100; // Límite de intentos para evitar bucles infinitos

  // Intentar generar un código único
  while (attempts < maxAttempts) {
    // Generar número correlativo con padding de 5 dígitos
    const nextNumber = (lastId + 1 + attempts).toString().padStart(5, '0');

    // Formato final: TALLER-00001-FIL
    const barcode = `${prefix}-${nextNumber}-${categorySuffix}`;

    // Verificar si el código ya existe
    if (!existingBarcodes.includes(barcode)) {
      console.log(`📊 Código de barras único generado: ${barcode} (intentos: ${attempts + 1})`);
      return barcode;
    }

    console.warn(`⚠️ Código ${barcode} ya existe, generando nuevo...`);
    attempts++;
  }

  // Si después de 100 intentos no se encuentra un código único, agregar timestamp
  const timestamp = Date.now().toString().slice(-4);
  const fallbackBarcode = `${prefix}-${timestamp}-${categorySuffix}`;
  console.error(`❌ No se pudo generar código único, usando timestamp: ${fallbackBarcode}`);
  return fallbackBarcode;
}

/**
 * Obtiene un sufijo de 3 letras basado en la categoría del producto
 * 
 * @param {string} categoria - Nombre de la categoría
 * @returns {string} Sufijo de 3 letras en mayúsculas
 * 
 * @example
 * getCategorySuffix("Filtros")        // "FIL"
 * getCategorySuffix("Aceites")        // "ACE"
 * getCategorySuffix("Llantas")        // "LLA"
 * getCategorySuffix("Herramientas")   // "HER"
 */
function getCategorySuffix(categoria) {
  // Mapeo de categorías comunes a códigos de 3 letras
  const categoryMap = {
    'Filtros': 'FIL',
    'Aceites': 'ACE',
    'Llantas': 'LLA',
    'Baterías': 'BAT',
    'Frenos': 'FRE',
    'Lubricantes': 'LUB',
    'Herramientas': 'HER',
    'Repuestos': 'REP',
    'Accesorios': 'ACC',
    'Iluminación': 'ILU',
    'Eléctricos': 'ELE',
    'Suspensión': 'SUS',
    'Motor': 'MOT',
    'Transmisión': 'TRA',
    'Refrigeración': 'REF',
    'Combustible': 'COM',
    'Escape': 'ESC',
    'Carrocería': 'CAR',
    'Limpieza': 'LIM',
    'Seguridad': 'SEG'
  };

  // Si la categoría existe en el mapa, usar ese código
  if (categoryMap[categoria]) {
    return categoryMap[categoria];
  }

  // Si no, generar código a partir de las primeras 3 letras
  // Eliminar espacios y acentos, convertir a mayúsculas
  const cleanCategory = categoria
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "") // Eliminar acentos
    .replace(/\s+/g, "") // Eliminar espacios
    .toUpperCase()
    .substring(0, 3);

  return cleanCategory || 'GEN'; // 'GEN' para "General" si falla
}

/**
 * Obtiene el último ID de producto registrado en la base de datos
 * 
 * @returns {Promise<number>} El ID más alto encontrado, o 0 si no hay productos
 * 
 * @example
 * const lastId = await getLastProductId(); // 45
 */
async function getLastProductId() {
  try {
    // Obtener todos los productos de la base de datos
    const productos = await fetchFromApi('productos');

    if (!productos || productos.length === 0) {
      console.log('📦 No hay productos en la BD. Iniciando desde 0');
      return 0;
    }

    // Encontrar el ID más alto
    const maxId = Math.max(...productos.map(p => p.id));
    console.log(`📦 Último ID en BD: ${maxId}`);

    return maxId;
  } catch (error) {
    console.error('❌ Error al obtener último ID:', error);
    return 0;
  }
}

/**
 * Obtiene todos los códigos de barras existentes en la base de datos
 * para verificar unicidad al generar nuevos códigos
 * 
 * @returns {Promise<Array<string>>} Array de códigos de barras existentes
 * 
 * @example
 * const existingBarcodes = await getExistingBarcodes();
 * // ["TALLER-00001-FIL", "TALLER-00002-ACE", ...]
 */
async function getExistingBarcodes() {
  try {
    // Obtener todos los productos de la base de datos
    const productos = await fetchFromApi('productos');

    if (!productos || productos.length === 0) {
      console.log('📦 No hay códigos de barras existentes');
      return [];
    }

    // Filtrar solo los códigos de barras que no sean null o vacíos
    const barcodes = productos
      .map(p => p.codBarras)
      .filter(code => code != null && code !== '');

    console.log(`🔖 Códigos de barras existentes: ${barcodes.length}`);

    // Mostrar algunos ejemplos en consola para debug
    if (barcodes.length > 0) {
      console.log(`📋 Ejemplos: ${barcodes.slice(0, 3).join(', ')}${barcodes.length > 3 ? '...' : ''}`);
    }

    return barcodes;
  } catch (error) {
    console.error('❌ Error al obtener códigos existentes:', error);
    return [];
  }
}



export function setupModalEvents(type = 'add', productId = null) {
  const modalOverlay = document.querySelector(".modal-overlay");
  const form = document.getElementById('form-product');
  const btnCancel = document.querySelector('.btn-cancel');
  const btnClose = document.querySelector('.modal-close');
  const autopartCheckbox = document.getElementById('product-autopart');

  //Seguridad de datos de entrada


  setupInputNumber();
  setupInputNumberWithCustomLimits();
  setupCloseHandlers(modalOverlay, btnCancel, btnClose);
  setupAutopartToggle(autopartCheckbox);
  setupPreviewImage('product-img', 'product-preview');

  // Solo configurar submit si NO es modo view
  if (type !== 'view') {
    setupFormSubmit(form, autopartCheckbox, type, productId);
  }
}

function setupAutopartToggle(autopartCheckbox) {
  const autopartFields = document.querySelector("[data-autopart-fields]");


  const toggleAutopartFields = () => {
    if (!autopartCheckbox) return;

    const show = autopartCheckbox.checked;
    autopartFields?.classList.toggle("is-visible", show);

    autopartFields?.querySelectorAll("input").forEach((input) => {
      input.disabled = !show;
      if (!show) {
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
    if (event.key === "Escape") {
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

    // ========================================
    // GENERACIÓN AUTOMÁTICA DE CÓDIGO DE BARRAS ÚNICO
    // Solo para productos nuevos (no edición)
    // ========================================
    if (!isEdit) {
      try {
        console.log('🔄 Generando código de barras único...');

        // Paso 1: Obtener el último ID
        const lastId = await getLastProductId();

        // Paso 2: Obtener todos los códigos existentes para verificar unicidad
        const existingBarcodes = await getExistingBarcodes();

        // Paso 3: Generar código único (verifica que no exista en BD)
        const barcode = generateBarcode(formData.categoria, lastId, existingBarcodes);

        // Paso 4: Asignar al producto
        formData.codBarras = barcode;

        console.log(`✅ Código único asignado: ${barcode}`);
        console.log(`🔍 Verificado contra ${existingBarcodes.length} códigos existentes`);
      } catch (error) {
        console.error('❌ Error generando código de barras:', error);
        showNotification('Error al generar código de barras único', 'error');
        return; // Detener el envío si falla la generación
      }
    }

    const isAutopart = autopartCheckbox?.checked ?? false;

    if (isAutopart) {
      formData.modelo = form['product-model'].value.trim();
      formData.anio = parseInt(form['product-year'].value, 10) || 0;
      endpoint = "autopartes";
    }

    // ENVIO DE DATOS
    try {
      const imgInput = document.getElementById('product-img');
      const imageFile = imgInput?.files[0];
      const imageCompress = await compressImage(imageFile, {
        maxWidth: 1200,
        maxHeight: 1200,
        quality: 0.8,
        maxSizeBytes: 5 * 1024 * 1024
      })

      if (isEdit) {
        // ========================================
        // MODO EDICIÓN - No regenerar código de barras
        // ========================================
        await updateResource(endpoint, productId, formData);


        if (imageFile) {
          const imgName = await updateImage(productId, imageCompress, 'productos', 'productos');
          formData.img = imgName;
          await updateResource(endpoint, productId, formData);
        }
        showNotification("Producto actualizado exitosamente", "success");
      } else {
        // ========================================
        // MODO CREACIÓN - Guardar con código de barras generado
        // ========================================
        console.log('📤 Enviando producto con código:', formData.codBarras);
        const newProduct = await createResource(endpoint, formData);
        console.log('✅ Producto creado:', newProduct);
        console.log(`🔖 Código guardado en BD: ${newProduct.codBarras || 'NO GUARDADO'}`);

        if (imageCompress) {
          const imgName = await uploadImage(imageCompress, newProduct.id, 'productos');
          formData.img = imgName;
          await updateResource(endpoint, newProduct.id, formData);

        }
        showNotification(`Producto agregado exitosamente. Código: ${newProduct.codBarras}`, "success");
      }

      closeModalForm();
      await renderProducts();

    } catch (error) {
      console.error("❌ Error al crear producto:", error);
      showNotification("Error al crear producto: " + error.message, "error");
    }
  });
}


async function setupPreviewImage(inputId, previewId) {
  const input = document.getElementById(inputId);
  const previewImg = document.getElementById(previewId);
  const fileNameSpan = document.getElementById('file-name');

  if (!input || !previewImg) {
    return;
  }

  input.addEventListener('change', async () => {
    const file = input.files[0];

    if (!file) {
      previewImg.style.display = 'none';
      previewImg.classList.remove('show');
      if (fileNameSpan) fileNameSpan.textContent = 'Ningún archivo seleccionado';
      return;
    }

    const validTypes = ['image/jpg', 'image/jpeg', 'image/png', 'image/webp'];
    if (!validTypes.includes(file.type)) {
      showNotification('Solo se permiten imágenes JPG, JPEG, PNG y WEBP', "info");
      input.value = '';
      previewImg.style.display = 'none';
      previewImg.classList.remove('show');
      if (fileNameSpan) fileNameSpan.textContent = 'Ningún archivo seleccionado';
      return;
    }

    const maxSize = 5 * 1024 * 1024; // 5MB
    let fileToShow = file;

    if (file.size > maxSize) {
      showNotification('La imagen supera 5MB, se comprimirá automáticamente para vista previa', 'info');
      try {
        fileToShow = await compressImage(file, {
          maxWidth: 1200,
          maxHeight: 1200,
          quality: 0.75,
          maxSizeBytes: maxSize
        });
      } catch (err) {
        showNotification('Error al comprimir imagen', 'error');
        input.value = '';
        return;
      }
    }

    if (fileNameSpan) fileNameSpan.textContent = fileToShow.name || file.name;
    previewImg.src = URL.createObjectURL(fileToShow);
    previewImg.style.display = 'block';
    previewImg.classList.add('show');
  });
}


function setupInputNumber() {
  const numberInputs = document.querySelectorAll('input[type="number"]');

  numberInputs.forEach(input => {
    // Validar en el evento "input"
    input.addEventListener('input', (e) => {
      const value = e.target.value;


      const sanitizedValue = value.replace(/[^0-9.]/g, ''); // Eliminar caracteres no numéricos
      const parts = sanitizedValue.split('.'); // Dividir por el punto decimal

      e.target.value = parts.length > 2
        ? `${parts[0]}.${parts.slice(1).join('')}`
        : sanitizedValue;
    });

    input.addEventListener('keydown', (e) => {
      const allowedKeys = [
        'Backspace', 'Tab', 'ArrowLeft', 'ArrowRight', 'Delete', 'Enter', // Teclas de navegación
        '0', '1', '2', '3', '4', '5', '6', '7', '8', '9', '.' // Números y punto decimal
      ];

      // Prevenir teclas no permitidas
      if (!allowedKeys.includes(e.key) && !e.ctrlKey && !e.metaKey) {
        e.preventDefault();
      }

      // Prevenir múltiples puntos decimales
      if (e.key === '.' && e.target.value.includes('.')) {
        e.preventDefault();
      }
    });
  });
}


function setupInputNumberWithCustomLimits() {
  // Configurar límites específicos para cada campo
  const fieldLimits = {
    'product-stock': 1000,
    'product-min-stock': 1000, // Límite máximo para el stock
    'product-purchase-price': 10000000, // Límite máximo para el precio de compra
    'product-selling-price': 10000000 // Límite máximo para el precio de venta
  };

  // Seleccionar todos los campos de tipo number
  const numberInputs = document.querySelectorAll('input[type="number"]');

  numberInputs.forEach(input => {
    const maxValue = fieldLimits[input.id]; // Obtener el límite según el id del campo

    if (maxValue) {
      // Validar en el evento "input"
      input.addEventListener('input', (e) => {
        const value = parseFloat(e.target.value);

        // Si el valor supera el máximo, ajustarlo al máximo permitido
        if (value > maxValue) {
          e.target.value = maxValue;
          showNotification(`El valor no puede ser mayor a ${maxValue}`, "warning");
        }
      });

      // Validar en el evento "keydown"
      input.addEventListener('keydown', (e) => {
        const allowedKeys = [
          'Backspace', 'Tab', 'ArrowLeft', 'ArrowRight', 'Delete', 'Enter', // Teclas de navegación
          '0', '1', '2', '3', '4', '5', '6', '7', '8', '9', '.' // Números y punto decimal
        ];

        // Prevenir teclas no permitidas
        if (!allowedKeys.includes(e.key) && !e.ctrlKey && !e.metaKey) {
          e.preventDefault();
        }

        // Prevenir múltiples puntos decimales
        if (e.key === '.' && e.target.value.includes('.')) {
          e.preventDefault();
        }
      });
    }
  });
}