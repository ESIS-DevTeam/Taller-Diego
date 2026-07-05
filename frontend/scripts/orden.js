// Cargar componentes dinámicamente
import { loadComponent } from './utils/component-loader.js';
import { fetchForBarCode } from './data-manager.js';
import { showSuccess, showError, showWarning } from './utils/notification.js';
import { resetBodyDefaults } from './utils/state-manager.js';
import { escapeHtml } from './utils/sanitize.js';

// Cargar header y sidebar dinámicamente (Hybrid)
loadComponent("header", "includes/header.html");
loadComponent("side-bar-container", "includes/sidebar.html");

// Elementos del DOM
const ordenSidebar = document.getElementById('orden-sidebar');
const mainContent = document.querySelector('.main-content');
const ordenContent = document.getElementById('orden-content');


const API_BASE_URL = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
  ? 'http://localhost:8000/api/v1'  // Desarrollo local
  : '/api/v1';

// Estado del sidebar secundario
let sidebarVisible = true;

// Inicializar
document.addEventListener('DOMContentLoaded', () => {
  // Limpiar estado previo de otros módulos
  resetBodyDefaults();

  setupOrdenSidebar();
  setupSidebarToggle();

  // Mostrar el sidebar secundario por defecto al cargar la página
  showOrdenSidebar();

  // Cargar venta de producto por defecto
  loadSection('venta-producto');
  barcodeReader();
});

// Configurar eventos del sidebar secundario
function setupOrdenSidebar() {
  const menuItems = document.querySelectorAll('.orden-sidebar-menu a');

  menuItems.forEach(item => {
    item.addEventListener('click', (e) => {
      e.preventDefault();

      // Remover clase active de todos
      menuItems.forEach(link => link.classList.remove('active'));

      // Agregar clase active al clickeado
      item.classList.add('active');

      // Obtener la sección
      const section = item.dataset.section;
      loadSection(section);
    });
  });
}

// Cargar contenido según la sección
function loadSection(section) {
  switch (section) {
    case 'venta-producto':
      loadVentaProducto();
      break;
    case 'servicios':
      loadServiciosProforma();
      break;
    case 'historial-servicios':
      loadHistorialServicios();
      break;
    case 'pendiente':
      loadTrabajosPendientes();
      break;
    case 'revisado':
      loadTrabajosRevisados();
      break;
    default:
      ordenContent.innerHTML = '<p>Selecciona una opción del menú</p>';
  }
}

// Cargar interfaz de venta de productos
async function loadVentaProducto() {
  const tpl = document.getElementById('venta-producto-template');
  ordenContent.innerHTML = '';
  if (!tpl) {
    // fallback: crear HTML mínimo si no hay template
    ordenContent.innerHTML = '<p>Error: template de venta no encontrado.</p>';
    return;
  }

  const clone = tpl.content.cloneNode(true);
  ordenContent.appendChild(clone);

  // inicializar lógica (carga productos, attach events, etc.)
  await initVentaProducto();
}

let productosDisponibles = [];
let productosVenta = [];
let ventaRegistrandose = false;
let proformaProductos = [];

function formatCurrency(value) {
  const amount = Number(value) || 0;
  return `$${amount.toLocaleString('es-CL')}`;
}

async function initVentaProducto() {
  // Cargar productos desde el backend
  await loadProductos();

  // Event listeners
  const productoSearch = document.getElementById('producto-search');
  const productoDropdown = document.getElementById('producto-dropdown');
  const addBtn = document.getElementById('add-producto-btn');
  const registrarBtn = document.getElementById('registrar-venta-btn');

  productoSearch.addEventListener('input', filterProductos);
  productoSearch.addEventListener('focus', () => {
    if (!productoSearch.value) {
      displayProductos(productosDisponibles);
    }
    productoDropdown.style.display = 'block';
  });

  addBtn.addEventListener('click', addProductoToVenta);
  registrarBtn.addEventListener('click', registrarVenta);

  // Ocultar dropdown al hacer click fuera
  document.addEventListener('click', (e) => {
    if (!e.target.closest('.form-field')) {
      productoDropdown.style.display = 'none';
    }
  });
}

async function loadProductos() {
  try {
    const response = await fetch(`${API_BASE_URL}/productos/`, {
      headers: {
        'Authorization': localStorage.getItem('supabase_token') ? `Bearer ${localStorage.getItem('supabase_token')}` : ''
      }
    });
    if (!response.ok) throw new Error('Error al cargar productos');

    productosDisponibles = await response.json();
    displayProductos(productosDisponibles);
  } catch (error) {
    showError('Error al cargar productos');
  }
}

async function barcodeReader() {
  // Listener global al documento para capturar escaneos sin necesidad de focus
  let buffer = "";
  let lastTime = 0;

  document.addEventListener("keydown", async (event) => {
    // Verificar si estamos en la vista de venta (si existe el input de búsqueda)
    const reader = document.getElementById('producto-search');
    if (!reader) return;

    const currentTime = Date.now();
    const timeDiff = currentTime - lastTime;
    lastTime = currentTime;

    // Si es Enter, verificamos si tenemos un código escaneado acumulado
    if (event.key === "Enter") {
      if (buffer.length > 2) {
        event.preventDefault(); // Evitar acciones por defecto del Enter

        const barCode = buffer.replaceAll("'", "-");

        await processScannedProduct(barCode, reader);

        buffer = ""; // Limpiar buffer tras procesar
      } else {
        buffer = ""; // Enter manual o buffer sucio
      }
      return;
    }

    // Ignorar teclas especiales (Shift, Ctrl, Alt, etc.)
    if (event.key.length > 1) return;

    // Lógica de detección de escáner basada en velocidad (< 60ms entre teclas)
    if (timeDiff < 60) {
      // Ráfaga detectada: Es el lector de códigos
      event.preventDefault(); // Evitar que se escriba en cualquier input activo

      // Corrección del primer carácter:
      // El primer carácter del código siempre llega "lento" (timeDiff alto).
      // Si el foco estaba en un input, ese carácter se escribió. Aquí intentamos borrarlo.
      if (buffer.length === 1 && document.activeElement.tagName === 'INPUT') {
        const input = document.activeElement;
        // Verificamos si el input termina con ese carácter para borrarlo con seguridad
        if (input.value.endsWith(buffer)) {
          input.value = input.value.slice(0, -1);
        }
      }

      buffer += event.key;
    } else {
      // Tiempo largo: Puede ser escritura manual o el PRIMER carácter de un escaneo
      // Lo guardamos en el buffer por si acaso, pero dejamos que se escriba (no preventDefault)
      buffer = event.key;
    }
  });
}

async function processScannedProduct(barCode, reader) {
  try {
    const producto = await fetchForBarCode(barCode);

    if (!producto) {
      showWarning(`Producto no encontrado: ${barCode}`);
      return;
    }

    if (producto.stock === 0) {
      showWarning(`Sin stock: ${producto.nombre}`);
      return;
    }

    // Llenar datos
    reader.value = producto.nombre;
    reader.dataset.selectedId = producto.id;
    reader.dataset.precio = producto.precioVenta;
    reader.dataset.stock = producto.stock;

    // Asegurar que el dropdown esté cerrado (ya que es una selección automática)
    const dropdown = document.getElementById('producto-dropdown');
    if (dropdown) dropdown.style.display = 'none';

    showSuccess(`Producto detectado: ${producto.nombre}`);

    // Mover foco a cantidad
    const cantidadInput = document.getElementById('cantidad-input');
    if (cantidadInput) {
      cantidadInput.value = 1;
      cantidadInput.focus();
      cantidadInput.select();
    }

  } catch (error) {
    showError('Error al procesar código de barras');
  }
}

function displayProductos(productos) {
  const dropdown = document.getElementById('producto-dropdown');
  const itemsHTML = productos.map(p => `
    <div class="dropdown-item" data-id="${escapeHtml(p.id)}" data-precio="${escapeHtml(p.precioVenta)}" data-stock="${escapeHtml(p.stock)}" data-nombre="${escapeHtml(p.nombre)}">
      ${escapeHtml(p.nombre)} ${p.marca ? `- ${escapeHtml(p.marca)}` : ''} - ${escapeHtml(formatCurrency(p.precioVenta))} (Stock: ${escapeHtml(p.stock)})
    </div>
  `).join('');

  dropdown.innerHTML = itemsHTML;

  // Agregar event listeners a cada item
  dropdown.querySelectorAll('.dropdown-item').forEach(item => {
    item.addEventListener('click', (e) => {
      const productoSearch = document.getElementById('producto-search');
      const stock = parseInt(e.target.dataset.stock);
      const nombre = e.target.dataset.nombre;

      // Validar stock antes de seleccionar
      if (stock === 0) {
        showWarning('Este producto no tiene stock disponible');
        dropdown.style.display = 'none';
        productoSearch.value = '';
        return;
      }

      productoSearch.value = nombre;
      productoSearch.dataset.selectedId = e.target.dataset.id;
      productoSearch.dataset.precio = e.target.dataset.precio;
      productoSearch.dataset.stock = e.target.dataset.stock;
      dropdown.style.display = 'none';
    });
  });
}

function filterProductos() {
  const search = document.getElementById('producto-search').value.toLowerCase();
  const dropdown = document.getElementById('producto-dropdown');

  if (!search) {
    displayProductos(productosDisponibles);
    dropdown.style.display = 'none';
    return;
  }

  const filtered = productosDisponibles.filter(p =>
    p.nombre.toLowerCase().includes(search) ||
    (p.marca || '').toLowerCase().includes(search)
  );

  displayProductos(filtered);
  dropdown.style.display = 'block';
}

function addProductoToVenta() {
  const productoSearch = document.getElementById('producto-search');
  const cantidadInput = document.getElementById('cantidad-input');

  if (!productoSearch.dataset.selectedId) {
    showWarning('Selecciona un producto');
    return;
  }

  const productoId = parseInt(productoSearch.dataset.selectedId);
  const cantidad = parseInt(cantidadInput.value);
  const stock = parseInt(productoSearch.dataset.stock);
  const precio = parseInt(productoSearch.dataset.precio);

  if (cantidad <= 0) {
    showWarning('La cantidad debe ser mayor a 0');
    return;
  }

  if (stock === 0) {
    showWarning('Este producto no tiene stock disponible');
    return;
  }

  if (cantidad > stock) {
    showWarning(`Stock insuficiente. Disponible: ${stock}`);
    return;
  }

  // Verificar si el producto ya está en la venta
  const existingIndex = productosVenta.findIndex(p => p.producto_id === productoId);
  if (existingIndex >= 0) {
    const nuevaCantidadTotal = productosVenta[existingIndex].cantidad + cantidad;
    if (nuevaCantidadTotal > stock) {
      showWarning(`Stock insuficiente. Disponible: ${stock}`);
      return;
    }
    productosVenta[existingIndex].cantidad += cantidad;
  } else {
    const producto = productosDisponibles.find(p => p.id === productoId);
    productosVenta.push({
      producto_id: productoId,
      nombre: producto.nombre,
      cantidad: cantidad,
      precio_unitario: precio
    });
  }

  updateVentaTable();
  cantidadInput.value = 1;

  // Limpiar búsqueda
  document.getElementById('producto-search').value = '';
  delete productoSearch.dataset.selectedId;
  delete productoSearch.dataset.precio;
  delete productoSearch.dataset.stock;
  document.getElementById('producto-dropdown').style.display = 'none';
  productoSearch.focus();
}

function updateVentaTable() {
  const tbody = document.getElementById('productos-table-body');

  tbody.innerHTML = productosVenta.map((item, index) => `
    <div class="table-row" data-index="${index}">
      <div class="table-cell">${escapeHtml(item.nombre)}</div>
      <div class="table-cell editable-cantidad" data-index="${index}">${escapeHtml(item.cantidad)}</div>
      <div class="table-cell">$${escapeHtml(item.precio_unitario)}</div>
      <div class="table-cell">$${escapeHtml(item.cantidad * item.precio_unitario)}</div>
      <div class="table-cell table-actions">
        <button class="btn-edit" data-index="${index}" title="Editar">
          <img class="img-edit" src="../assets/icons/edit.png" alt="Editar">
        </button>
        <button class="btn-delete" data-index="${index}" title="Eliminar">
          <img class="img-delete" src="../assets/icons/delete.png" alt="Eliminar">
        </button>
      </div>
    </div>
  `).join('');

  // Calcular total
  const total = productosVenta.reduce((sum, item) =>
    sum + (item.cantidad * item.precio_unitario), 0
  );
  document.getElementById('total-venta').textContent = `$${total}`;

  // Agregar event listeners a los botones
  attachTableEvents();
}

function attachTableEvents() {
  // Botones de editar
  document.querySelectorAll('.btn-edit').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const index = parseInt(e.currentTarget.dataset.index);
      editCantidad(index);
    });
  });

  // Botones de eliminar
  document.querySelectorAll('.btn-delete').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const index = parseInt(e.currentTarget.dataset.index);
      removeProductoFromVenta(index);
    });
  });
}

function editCantidad(index) {
  const item = productosVenta[index];
  const producto = productosDisponibles.find(p => p.id === item.producto_id);

  const modalContainer = document.getElementById('modal-container');
  if (!modalContainer) return;

  const precioTotal = item.cantidad * item.precio_unitario;

  modalContainer.innerHTML = `
    <div class="modal-overlay" id="edit-modal-overlay">
      <div class="modal-content">
        <div class="modal-header">
          <h2>Editar Producto</h2>
          <button class="modal-close" id="close-edit-modal">X</button>
        </div>
        <form id="edit-form" class="modal-body">
          <div class="form-group">
            <label for="producto-nombre">Nombre:</label>
            <input 
              type="text" 
              id="producto-nombre" 
              value="${escapeHtml(item.nombre)}"
              disabled
              style="background-color: #f5f5f5; cursor: not-allowed;"
            />
          </div>
          
          <div class="form-group">
            <label for="cantidad-edit">Cantidad:</label>
            <input 
              type="number" 
              id="cantidad-edit" 
              name="cantidad" 
              value="${escapeHtml(item.cantidad)}"
              min="1"
              max="${escapeHtml(producto.stock)}"
              required
            />
          </div>
          
          <div class="form-row">
            <div class="form-group">
              <label for="precio-unitario">Precio Unitario:</label>
              <input 
                type="text" 
                id="precio-unitario" 
                value="$${item.precio_unitario}"
                disabled
                style="background-color: #f5f5f5; cursor: not-allowed;"
              />
            </div>
            
            <div class="form-group">
              <label for="precio-total">Precio total:</label>
              <input 
                type="text" 
                id="precio-total" 
                value="$${precioTotal}"
                disabled
                style="background-color: #f5f5f5; cursor: not-allowed;"
              />
            </div>
          </div>
          
          <div class="modal-actions">
            <button type="submit" class="btn-primary">Modificar</button>
          </div>
        </form>
      </div>
    </div>
  `;

  // Event listeners del modal
  const closeBtn = document.getElementById('close-edit-modal');
  const overlay = document.getElementById('edit-modal-overlay');
  const form = document.getElementById('edit-form');
  const cantidadInput = document.getElementById('cantidad-edit');
  const precioTotalInput = document.getElementById('precio-total');

  // Actualizar precio total cuando cambia la cantidad
  if (cantidadInput) {
    cantidadInput.addEventListener('input', () => {
      const nuevaCantidad = parseInt(cantidadInput.value) || 0;
      const nuevoTotal = nuevaCantidad * item.precio_unitario;
      precioTotalInput.value = `$${nuevoTotal}`;
    });
  }

  if (closeBtn) {
    closeBtn.addEventListener('click', closeModal);
  }

  if (overlay) {
    overlay.addEventListener('click', (e) => {
      if (e.target.id === 'edit-modal-overlay') closeModal();
    });
  }

  if (form) {
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const nuevaCantidad = parseInt(document.getElementById('cantidad-edit').value);

      if (isNaN(nuevaCantidad) || nuevaCantidad <= 0) {
        showWarning('La cantidad debe ser un número mayor a 0');
        return;
      }

      if (nuevaCantidad > producto.stock) {
        showWarning(`Stock insuficiente. Disponible: ${producto.stock}`);
        return;
      }

      productosVenta[index].cantidad = nuevaCantidad;
      updateVentaTable();
      showSuccess('Cantidad actualizada');
      closeModal();
    });
  }
}

function removeProductoFromVenta(index) {
  const item = productosVenta[index];

  const modalContainer = document.getElementById('modal-container');
  if (!modalContainer) return;

  // Truncar nombre si es muy largo
  const truncatedName = item.nombre.length > 50
    ? item.nombre.substring(0, 50) + '...'
    : item.nombre;

  modalContainer.innerHTML = `
    <div class="modal-overlay" id="confirm-modal-overlay">
      <div class="modal-confirm">
        <div class="modal-icon">⚠️</div>
        <h3>¿Estás seguro de eliminar el producto <strong>${escapeHtml(truncatedName)}</strong>?</h3>
        <div class="modal-confirm-actions">
          <button class="btn-confirm-yes" id="confirm-delete">Sí</button>
          <button class="btn-confirm-no" id="cancel-delete">No</button>
        </div>
      </div>
    </div>
  `;

  document.getElementById('confirm-delete').addEventListener('click', () => {
    productosVenta.splice(index, 1);
    updateVentaTable();
    showSuccess('Producto eliminado de la venta');
    closeModal();
  });

  document.getElementById('cancel-delete').addEventListener('click', closeModal);
  document.getElementById('confirm-modal-overlay').addEventListener('click', (e) => {
    if (e.target.id === 'confirm-modal-overlay') closeModal();
  });
}

function closeModal() {
  const modalContainer = document.getElementById('modal-container');
  if (modalContainer) modalContainer.innerHTML = '';
}

async function registrarVenta() {
  if (ventaRegistrandose) {
    return;
  }

  if (productosVenta.length === 0) {
    showWarning('Agrega al menos un producto a la venta');
    return;
  }

  ventaRegistrandose = true;
  const registrarBtn = document.getElementById('registrar-venta-btn');
  if (registrarBtn) {
    registrarBtn.disabled = true;
    registrarBtn.textContent = 'Registrando...';
  }

  const ventaData = {
    fecha: new Date().toISOString(),
    productos: productosVenta.map(p => ({
      producto_id: p.producto_id,
      cantidad: p.cantidad
    }))
  };

  try {
    const response = await fetch(`${API_BASE_URL}/ventas/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': localStorage.getItem('supabase_token') ? `Bearer ${localStorage.getItem('supabase_token')}` : ''
      },
      body: JSON.stringify(ventaData)
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || 'Error al registrar venta');
    }

    showSuccess('Venta registrada exitosamente');

    // Limpiar la venta
    productosVenta = [];
    updateVentaTable();

    // Recargar productos para actualizar stock
    await loadProductos();

  } catch (error) {
    showError('Error al registrar venta: ' + error.message);
  } finally {
    ventaRegistrandose = false;
    if (registrarBtn) {
      registrarBtn.disabled = false;
      registrarBtn.textContent = 'Registrar venta';
    }
  }
}

async function apiFetchProformas(path = '', options = {}) {
  const token = localStorage.getItem('supabase_token');
  const headers = {
    ...(options.headers || {}),
    'Authorization': token ? `Bearer ${token}` : '',
  };

  if (options.body && !headers['Content-Type']) {
    headers['Content-Type'] = 'application/json';
  }

  const response = await fetch(`${API_BASE_URL}/proformas/rapidas${path}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    let detail = `Error HTTP: ${response.status}`;
    try {
      const data = await response.json();
      detail = data.detail || detail;
    } catch (error) {
    }
    throw new Error(detail);
  }

  return response.json();
}

async function loadServiciosProforma() {
  if (!productosDisponibles.length) {
    await loadProductos();
  }

  proformaProductos = [];
  ordenContent.innerHTML = `
    <div class="proforma-page">
      <div class="proforma-heading">
        <h1>Servicios - Proforma 1 simple</h1>
        <p>El mecánico solo llena lo mínimo: placa, cliente, celular y diagnóstico. El sistema agrega fecha, hora, datos del taller, historial y pendiente.</p>
      </div>

      <div class="proforma-info-banner">
        Al guardar, se genera la Proforma 1, se manda a impresión y queda registrada en Historial de servicios y Trabajos pendientes.
      </div>

      <div class="proforma-layout">
        <form id="proforma-rapida-form" class="proforma-card proforma-form">
          <div class="form-grid three">
            <label>
              <span>Placa *</span>
              <input name="placa" type="text" placeholder="AB-CD-12" required>
            </label>
            <label>
              <span>Nombre del cliente *</span>
              <input name="cliente_nombre" type="text" placeholder="Juan Pérez" required>
            </label>
            <label>
              <span>Celular *</span>
              <input name="celular" type="tel" placeholder="+56 9 1234 5678" required>
            </label>
          </div>

          <label>
            <span>Diagnóstico *</span>
            <textarea name="diagnostico" rows="5" placeholder="Ruido delantero. Revisar frenos y posible cambio de aceite." required></textarea>
          </label>

          <h3>Campos opcionales</h3>
          <div class="form-grid three">
            <label>
              <span>Precio estimado</span>
              <input name="precio_estimado" type="text" placeholder="Opcional">
            </label>
            <label>
              <span>Servicio sugerido</span>
              <input name="servicio_sugerido" type="text" placeholder="Opcional">
            </label>
            <label>
              <span>Modelo del carro</span>
              <input name="modelo_vehiculo" type="text" placeholder="Opcional">
            </label>
          </div>

          <div class="proforma-products-box">
            <h3>Productos sugeridos de tienda</h3>
            <div class="venta-form-row proforma-product-row">
              <div class="form-field">
                <label>Producto</label>
                <input type="text" id="proforma-product-search" placeholder="Buscar producto..." autocomplete="off">
                <div id="proforma-product-dropdown" class="producto-dropdown"></div>
              </div>
              <div class="form-field small">
                <label>Cantidad</label>
                <input type="number" id="proforma-product-cantidad" min="1" value="1">
              </div>
              <div class="form-field-btn">
                <button type="button" id="proforma-add-producto-btn" class="btn-add">Añadir</button>
              </div>
            </div>
            <div id="proforma-productos-list" class="proforma-productos-list">
              <p>No hay productos agregados. Puedes guardar la proforma sin productos si aún es solo diagnóstico.</p>
            </div>
          </div>

          <div class="proforma-actions">
            <button type="submit" class="btn-save-proforma">Guardar e imprimir Proforma 1</button>
            <button type="reset" class="btn-clear-proforma">Limpiar</button>
          </div>
        </form>

        <aside class="proforma-card proforma-side">
          <h2>Qué hace el sistema automáticamente</h2>
          <ul>
            <li>Genera código único P1-000001</li>
            <li>Agrega fecha y hora actual</li>
            <li>Agrega datos del taller</li>
            <li>Guarda en Historial de servicios</li>
            <li>Crea trabajo en Pendiente</li>
            <li>Genera impresión/PDF de Proforma 1</li>
          </ul>
          <div class="proforma-preview-box">
            <h3>Vista previa Proforma 1</h3>
            <p><strong>Placa:</strong> <span data-preview="placa">-</span></p>
            <p><strong>Cliente:</strong> <span data-preview="cliente">-</span></p>
            <p><strong>Celular:</strong> <span data-preview="celular">-</span></p>
            <p><strong>Diagnóstico:</strong> <span data-preview="diagnostico">-</span></p>
          </div>
          <div class="special-cases">
            <h3>Casos especiales</h3>
            <p>Si aún no hay precio, servicio, modelo o repuestos, deja esos campos vacíos. Caja los completará después en Proforma 2.</p>
          </div>
        </aside>
      </div>
    </div>
  `;

  bindProformaRapidaEvents();
}

function bindProformaRapidaEvents() {
  const form = document.getElementById('proforma-rapida-form');
  const productSearch = document.getElementById('proforma-product-search');
  const productDropdown = document.getElementById('proforma-product-dropdown');
  const addProductBtn = document.getElementById('proforma-add-producto-btn');

  form?.addEventListener('input', updateProformaPreview);
  form?.addEventListener('submit', handleProformaRapidaSubmit);
  form?.addEventListener('reset', () => {
    proformaProductos = [];
    setTimeout(() => {
      updateProformaPreview();
      renderProformaProductos();
    }, 0);
  });

  productSearch?.addEventListener('input', () => {
    renderProformaProductDropdown(productSearch.value);
  });
  productSearch?.addEventListener('focus', () => {
    renderProformaProductDropdown(productSearch.value);
    productDropdown.style.display = 'block';
  });
  addProductBtn?.addEventListener('click', addProductoToProforma);

  document.addEventListener('click', (event) => {
    if (!event.target.closest('.proforma-product-row')) {
      if (productDropdown) productDropdown.style.display = 'none';
    }
  });

  updateProformaPreview();
  renderProformaProductos();
}

function updateProformaPreview() {
  const form = document.getElementById('proforma-rapida-form');
  if (!form) return;

  const values = new FormData(form);
  const previewMap = {
    placa: values.get('placa') || '-',
    cliente: values.get('cliente_nombre') || '-',
    celular: values.get('celular') || '-',
    diagnostico: values.get('diagnostico') || '-',
  };

  Object.entries(previewMap).forEach(([key, value]) => {
    const element = document.querySelector(`[data-preview="${key}"]`);
    if (element) {
      element.textContent = String(value).slice(0, key === 'diagnostico' ? 100 : 40);
    }
  });
}

function renderProformaProductDropdown(query = '') {
  const dropdown = document.getElementById('proforma-product-dropdown');
  if (!dropdown) return;

  const search = query.trim().toLowerCase();
  const filtered = productosDisponibles
    .filter(product =>
      !search ||
      product.nombre.toLowerCase().includes(search) ||
      (product.marca || '').toLowerCase().includes(search)
    )
    .slice(0, 12);

  if (!filtered.length) {
    dropdown.innerHTML = '<div class="dropdown-item muted">No se encontraron productos</div>';
    dropdown.style.display = 'block';
    return;
  }

  dropdown.innerHTML = filtered.map(product => `
    <div class="dropdown-item" data-id="${escapeHtml(product.id)}">
      ${escapeHtml(product.nombre)} ${product.marca ? `- ${escapeHtml(product.marca)}` : ''} - ${escapeHtml(formatCurrency(product.precioVenta))} (Stock: ${escapeHtml(product.stock)})
    </div>
  `).join('');

  dropdown.querySelectorAll('.dropdown-item[data-id]').forEach(item => {
    item.addEventListener('click', () => {
      const selected = productosDisponibles.find(product => String(product.id) === item.dataset.id);
      const input = document.getElementById('proforma-product-search');
      if (!selected || !input) return;
      if (selected.stock <= 0) {
        showWarning('Producto sin stock disponible');
        return;
      }
      input.value = selected.nombre;
      input.dataset.selectedId = selected.id;
      dropdown.style.display = 'none';
    });
  });

  dropdown.style.display = 'block';
}

function addProductoToProforma() {
  const input = document.getElementById('proforma-product-search');
  const cantidadInput = document.getElementById('proforma-product-cantidad');
  const productoId = parseInt(input?.dataset.selectedId || '', 10);
  const cantidad = parseInt(cantidadInput?.value || '1', 10);
  const producto = productosDisponibles.find(item => item.id === productoId);

  if (!producto) {
    showWarning('Selecciona un producto de la lista');
    return;
  }
  if (cantidad <= 0) {
    showWarning('La cantidad debe ser mayor a 0');
    return;
  }
  if (cantidad > producto.stock) {
    showWarning(`Stock insuficiente. Disponible: ${producto.stock}`);
    return;
  }

  const existing = proformaProductos.find(item => item.producto_id === producto.id);
  if (existing) {
    const nuevaCantidad = existing.cantidad + cantidad;
    if (nuevaCantidad > producto.stock) {
      showWarning(`Stock insuficiente. Disponible: ${producto.stock}`);
      return;
    }
    existing.cantidad = nuevaCantidad;
    existing.subtotal = existing.cantidad * existing.precioVenta;
  } else {
    proformaProductos.push({
      producto_id: producto.id,
      nombre: producto.nombre,
      cantidad,
      precioVenta: producto.precioVenta,
      subtotal: cantidad * producto.precioVenta,
    });
  }

  input.value = '';
  delete input.dataset.selectedId;
  cantidadInput.value = 1;
  renderProformaProductos();
}

function renderProformaProductos() {
  const list = document.getElementById('proforma-productos-list');
  if (!list) return;

  if (!proformaProductos.length) {
    list.innerHTML = '<p>No hay productos agregados. Puedes guardar la proforma sin productos si aún es solo diagnóstico.</p>';
    return;
  }

  list.innerHTML = proformaProductos.map((item, index) => `
    <div class="proforma-product-item">
      <div>
        <strong>${escapeHtml(item.nombre)}</strong>
        <span>Cant. ${escapeHtml(item.cantidad)} · ${escapeHtml(formatCurrency(item.precioVenta))}</span>
      </div>
      <button type="button" data-remove-proforma-product="${index}">Quitar</button>
    </div>
  `).join('');

  list.querySelectorAll('[data-remove-proforma-product]').forEach(button => {
    button.addEventListener('click', () => {
      proformaProductos.splice(parseInt(button.dataset.removeProformaProduct, 10), 1);
      renderProformaProductos();
    });
  });
}

async function handleProformaRapidaSubmit(event) {
  event.preventDefault();
  const form = event.currentTarget;
  const submit = form.querySelector('.btn-save-proforma');
  const values = new FormData(form);

  const payload = {
    placa: values.get('placa'),
    cliente_nombre: values.get('cliente_nombre'),
    celular: values.get('celular'),
    diagnostico: values.get('diagnostico'),
    precio_estimado: values.get('precio_estimado') || null,
    servicio_sugerido: values.get('servicio_sugerido') || null,
    modelo_vehiculo: values.get('modelo_vehiculo') || null,
    productos: proformaProductos,
  };

  try {
    submit.disabled = true;
    submit.textContent = 'Guardando...';
    const proforma = await apiFetchProformas('', {
      method: 'POST',
      body: JSON.stringify(payload),
    });

    showSuccess('Proforma 1 guardada y enviada a impresión');
    renderProformaGuardada(proforma);
    printProformaRapida(proforma);
  } catch (error) {
    showError('No se pudo guardar la proforma: ' + error.message);
  } finally {
    submit.disabled = false;
    submit.textContent = 'Guardar e imprimir Proforma 1';
  }
}

function renderProformaGuardada(proforma) {
  ordenContent.innerHTML = `
    <div class="proforma-saved-page">
      <div class="proforma-card saved-summary">
        <h1>Proforma 1 lista</h1>
        <h2>Código: ${escapeHtml(proforma.codigo)}</h2>
        <p class="status-pill success">Guardado automático completado.</p>
        <p class="status-pill success">Impresión enviada.</p>
        <p class="status-pill info">Registro creado en Historial y Pendiente.</p>
        <button class="btn-primary-wide" data-go-section="pendiente">Ir a Pendiente</button>
        <button class="btn-secondary-wide" data-go-section="servicios">Nueva Proforma 1</button>
      </div>
      <div class="proforma-card printable-preview">
        ${generateProformaPreviewHTML(proforma)}
      </div>
    </div>
  `;

  ordenContent.querySelectorAll('[data-go-section]').forEach(button => {
    button.addEventListener('click', () => {
      setActiveOrdenSection(button.dataset.goSection);
      loadSection(button.dataset.goSection);
    });
  });
}

function generateProformaPreviewHTML(proforma) {
  const fecha = formatDateTime(proforma.fecha_creacion);
  const productos = Array.isArray(proforma.productos) && proforma.productos.length
    ? proforma.productos.map(item => `<li>${escapeHtml(item.nombre)} · Cant. ${escapeHtml(item.cantidad)}</li>`).join('')
    : '<li>Sin productos definidos en diagnóstico inicial.</li>';

  return `
    <div class="proforma-document">
      <div class="proforma-doc-header">
        <div>
          <h1>${escapeHtml(proforma.taller_nombre)}</h1>
          <h2>PROFORMA 1 - Diagnóstico rápido</h2>
        </div>
        <div class="proforma-code">${escapeHtml(proforma.codigo)}</div>
      </div>
      <div class="proforma-doc-meta">
        <span>Fecha y hora: ${escapeHtml(fecha)}</span>
        <span>Estado: ${escapeHtml(proforma.estado)}</span>
      </div>
      <div class="proforma-doc-box">
        <p><strong>Placa:</strong> ${escapeHtml(proforma.placa)}</p>
        <p><strong>Cliente:</strong> ${escapeHtml(proforma.cliente_nombre)}</p>
        <p><strong>Celular:</strong> ${escapeHtml(proforma.celular)}</p>
        <p><strong>Diagnóstico:</strong> ${escapeHtml(proforma.diagnostico)}</p>
        <p><strong>Precio estimado:</strong> ${escapeHtml(proforma.precio_estimado || 'Opcional/no llenado')}</p>
        <p><strong>Servicio sugerido:</strong> ${escapeHtml(proforma.servicio_sugerido || 'Opcional/no llenado')}</p>
        <p><strong>Modelo:</strong> ${escapeHtml(proforma.modelo_vehiculo || 'Opcional/no llenado')}</p>
      </div>
      <div class="proforma-doc-products">
        <h3>Productos sugeridos</h3>
        <ul>${productos}</ul>
      </div>
      <p class="proforma-note">Los materiales, servicios finales y datos completos se completarán en Proforma 2.</p>
    </div>
  `;
}

function printProformaRapida(proforma) {
  const printWindow = window.open('', '_blank', 'width=900,height=700');
  if (!printWindow) {
    showWarning('El navegador bloqueó la impresión automática. Usa la vista previa para imprimir.');
    return;
  }

  printWindow.document.write(`
    <!DOCTYPE html>
    <html lang="es">
      <head>
        <meta charset="UTF-8">
        <title>${escapeHtml(proforma.codigo)} - Proforma 1</title>
        <style>
          body { font-family: Arial, sans-serif; background: #f4f8fb; margin: 0; padding: 24px; color: #1f2937; }
          .proforma-document { max-width: 760px; margin: 0 auto; background: white; border: 1px solid #d7e1ea; border-radius: 12px; padding: 28px; }
          .proforma-doc-header { display: flex; justify-content: space-between; gap: 16px; border-bottom: 3px solid #2f80ed; padding-bottom: 14px; }
          h1 { margin: 0; font-size: 24px; }
          h2 { margin: 6px 0 0; font-size: 16px; color: #2f80ed; }
          .proforma-code { background: #e7f1ff; color: #1d4ed8; border-radius: 8px; padding: 10px 14px; font-weight: 700; height: fit-content; }
          .proforma-doc-meta { display: flex; justify-content: space-between; margin: 16px 0; color: #5b6472; font-size: 13px; }
          .proforma-doc-box { border: 1px solid #d7e1ea; border-radius: 10px; padding: 16px; line-height: 1.5; }
          .proforma-doc-products { margin-top: 16px; border: 1px solid #e5e7eb; border-radius: 10px; padding: 14px 16px; }
          .proforma-note { margin-top: 16px; background: #fff7df; color: #8a5a00; padding: 10px 12px; border-radius: 8px; font-size: 13px; }
          @media print { body { background: white; padding: 0; } .proforma-document { border: none; } }
        </style>
      </head>
      <body>${generateProformaPreviewHTML(proforma)}</body>
    </html>
  `);
  printWindow.document.close();
  printWindow.focus();
  setTimeout(() => printWindow.print(), 300);
}

async function loadHistorialServicios(search = '') {
  ordenContent.innerHTML = `
    <div class="proforma-page">
      <div class="proforma-heading">
        <h1>Historial de servicios</h1>
        <p>Busca por placa o nombre del dueño. Aquí aparecen las Proformas 1 guardadas y luego se completará Proforma 2.</p>
      </div>
      <div class="history-search">
        <input id="historial-search-input" type="text" placeholder="Buscar placa o dueño..." value="${escapeHtml(search)}">
      </div>
      <div id="historial-results" class="proforma-list"></div>
    </div>
  `;

  const input = document.getElementById('historial-search-input');
  input?.addEventListener('input', () => loadHistorialResults(input.value));
  await loadHistorialResults(search);
}

async function loadHistorialResults(search = '') {
  const container = document.getElementById('historial-results');
  if (!container) return;
  container.innerHTML = '<p>Cargando historial...</p>';
  try {
    const query = search.trim() ? `?search=${encodeURIComponent(search.trim())}` : '';
    const proformas = await apiFetchProformas(query);
    renderProformaList(container, proformas, { empty: 'No hay historial para esa búsqueda.' });
  } catch (error) {
    container.innerHTML = '<p class="error-state">No se pudo cargar el historial.</p>';
  }
}

async function loadTrabajosPendientes() {
  ordenContent.innerHTML = `
    <div class="proforma-page">
      <div class="proforma-heading">
        <h1>Trabajos pendientes</h1>
        <p>Autos en proceso luego de confirmar la Proforma 1.</p>
      </div>
      <div class="history-search">
        <input id="pendiente-search-input" type="text" placeholder="Buscar placa...">
      </div>
      <div id="pendiente-results" class="proforma-list"></div>
    </div>
  `;
  const input = document.getElementById('pendiente-search-input');
  input?.addEventListener('input', () => loadPendienteResults(input.value));
  await loadPendienteResults('');
}

async function loadPendienteResults(search = '') {
  const container = document.getElementById('pendiente-results');
  if (!container) return;
  container.innerHTML = '<p>Cargando pendientes...</p>';
  try {
    const params = new URLSearchParams({ estado: 'pendiente' });
    if (search.trim()) params.set('search', search.trim());
    const proformas = await apiFetchProformas(`?${params.toString()}`);
    renderProformaList(container, proformas, {
      empty: 'No hay trabajos pendientes.',
      showReviewAction: true,
    });
  } catch (error) {
    container.innerHTML = '<p class="error-state">No se pudo cargar trabajos pendientes.</p>';
  }
}

async function loadTrabajosRevisados() {
  ordenContent.innerHTML = `
    <div class="proforma-page">
      <div class="proforma-heading">
        <h1>Revisados</h1>
        <p>Autos cuyo servicio fue terminado y están esperando recojo del dueño.</p>
      </div>
      <div id="revisado-results" class="proforma-list"></div>
    </div>
  `;
  const container = document.getElementById('revisado-results');
  container.innerHTML = '<p>Cargando revisados...</p>';
  try {
    const proformas = await apiFetchProformas('?estado=revisado');
    renderProformaList(container, proformas, { empty: 'No hay trabajos revisados.' });
  } catch (error) {
    container.innerHTML = '<p class="error-state">No se pudo cargar revisados.</p>';
  }
}

function renderProformaList(container, proformas, options = {}) {
  if (!Array.isArray(proformas) || !proformas.length) {
    container.innerHTML = `<p class="empty-state">${escapeHtml(options.empty || 'No hay registros.')}</p>`;
    return;
  }

  container.innerHTML = proformas.map(proforma => `
    <article class="proforma-list-card">
      <div>
        <span class="status-pill ${proforma.estado === 'revisado' ? 'info' : 'success'}">${escapeHtml(proforma.estado)}</span>
        <h2>${escapeHtml(proforma.placa)} · ${escapeHtml(proforma.cliente_nombre)}</h2>
        <p>${escapeHtml(proforma.diagnostico)}</p>
        <small>${escapeHtml(proforma.codigo)} · ${escapeHtml(formatDateTime(proforma.fecha_creacion))}</small>
      </div>
      <div class="proforma-list-actions">
        <button type="button" data-print-proforma="${escapeHtml(proforma.id)}">Imprimir</button>
        ${options.showReviewAction ? `<button type="button" class="primary" data-review-proforma="${escapeHtml(proforma.id)}">Pasar a revisado</button>` : ''}
      </div>
    </article>
  `).join('');

  container.querySelectorAll('[data-print-proforma]').forEach(button => {
    button.addEventListener('click', async () => {
      const proforma = await apiFetchProformas(`/${button.dataset.printProforma}`);
      printProformaRapida(proforma);
    });
  });

  container.querySelectorAll('[data-review-proforma]').forEach(button => {
    button.addEventListener('click', async () => {
      await updateProformaEstado(button.dataset.reviewProforma, 'revisado');
      showSuccess('Trabajo pasado a revisado');
      await loadPendienteResults(document.getElementById('pendiente-search-input')?.value || '');
    });
  });
}

async function updateProformaEstado(id, estado) {
  return apiFetchProformas(`/${id}/estado`, {
    method: 'PUT',
    body: JSON.stringify({ estado }),
  });
}

function setActiveOrdenSection(section) {
  document.querySelectorAll('.orden-sidebar-menu a').forEach(link => {
    link.classList.toggle('active', link.dataset.section === section);
  });
}

function formatDateTime(value) {
  if (!value) return '-';
  return new Date(value).toLocaleString('es-CL', {
    dateStyle: 'short',
    timeStyle: 'short',
  });
}

// Exponer función globalmente para el onclick
window.removeProductoFromVenta = removeProductoFromVenta;

// Configurar toggle del sidebar desde el menú principal
function setupSidebarToggle() {
  // Escuchar clicks en el botón "Orden" del sidebar principal
  document.addEventListener('click', (e) => {
    const ordenLink = e.target.closest('a[href="orden.html"]');

    if (ordenLink && window.location.pathname.includes('orden.html')) {
      e.preventDefault();
      toggleOrdenSidebar();
    }
  });
}

// Mostrar/ocultar sidebar secundario
function toggleOrdenSidebar() {
  sidebarVisible = !sidebarVisible;

  if (sidebarVisible) {
    showOrdenSidebar();
  } else {
    hideOrdenSidebar();
  }
}

function showOrdenSidebar() {
  ordenSidebar.classList.remove('hidden');
  mainContent.classList.add('with-orden-sidebar');
  sidebarVisible = true;
}

function hideOrdenSidebar() {
  ordenSidebar.classList.add('hidden');
  mainContent.classList.remove('with-orden-sidebar');
  sidebarVisible = false;
}

// Exportar funciones si se necesitan
export { toggleOrdenSidebar, loadSection };
