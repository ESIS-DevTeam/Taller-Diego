// Cargar componentes dinámicamente
import { loadHeader } from './componets/header.js';
import { loadSideBar } from './componets/side_bar.js';
import { showSuccess, showError, showWarning } from './utils/notification.js';

// Cargar header y sidebar inmediatamente
document.getElementById("header").innerHTML = loadHeader();
document.getElementById("side-bar-container").innerHTML = loadSideBar();

// Elementos del DOM
const ordenSidebar = document.getElementById('orden-sidebar');
const mainContent = document.querySelector('.main-content');
const ordenContent = document.getElementById('orden-content');

// Estado del sidebar secundario
let sidebarVisible = true;

// Inicializar
document.addEventListener('DOMContentLoaded', () => {
  setupOrdenSidebar();
  setupSidebarToggle();
  
  // Mostrar el sidebar secundario por defecto al cargar la página
  showOrdenSidebar();
  
  // Cargar venta de producto por defecto
  loadSection('venta-producto');
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
  switch(section) {
    case 'venta-producto':
      loadVentaProducto();
      break;
    case 'servicios':
      ordenContent.innerHTML = `
        <h2>Servicios</h2>
        <p>Gestión de servicios...</p>
      `;
      break;
    case 'historial-servicios':
      ordenContent.innerHTML = `
        <h2>Historial de Servicios</h2>
        <p>Ver historial de servicios...</p>
      `;
      break;
    case 'pendiente':
      ordenContent.innerHTML = `
        <h2>Pendiente</h2>
        <p>Órdenes pendientes...</p>
      `;
      break;
    case 'revisado':
      ordenContent.innerHTML = `
        <h2>Revisado</h2>
        <p>Órdenes revisadas...</p>
      `;
      break;
    default:
      ordenContent.innerHTML = '<p>Selecciona una opción del menú</p>';
  }
}

// Cargar interfaz de venta de productos
async function loadVentaProducto() {
  ordenContent.innerHTML = `
    <div class="venta-producto-container">
      <div class="venta-form-row">
        <div class="form-field">
          <label>Nombre del producto</label>
          <input type="text" id="producto-search" placeholder="Buscar producto..." autocomplete="off">
          <div id="producto-dropdown" class="producto-dropdown" style="display: none;"></div>
        </div>
        <div class="form-field">
          <label>Cantidad</label>
          <input type="number" id="cantidad-input" min="1" value="1">
        </div>
        <div class="form-field-btn">
          <button id="add-producto-btn" class="btn-add">Añadir</button>
        </div>
      </div>

      <div class="venta-table-container">
        <div class="table-header">
          <div class="header-item">Producto</div>
          <div class="header-item">Cantidad</div>
          <div class="header-item">Precio Unitario</div>
          <div class="header-item">Precio total</div>
          <div class="header-item">Acciones</div>
        </div>
        <div class="table-body" id="productos-table-body">
        </div>
        <div class="venta-total">
          <strong>PRECIO TOTAL DE LA VENTA</strong>
          <span id="total-venta">$0</span>
        </div>
      </div>

      <div class="venta-actions">
        <button id="registrar-venta-btn" class="btn-registrar">Registrar venta</button>
      </div>
    </div>
  `;

  // Inicializar funcionalidad
  await initVentaProducto();
}

let productosDisponibles = [];
let productosVenta = [];

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
    if (productoSearch.value) {
      productoDropdown.style.display = 'block';
    }
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
    const response = await fetch('http://localhost:8000/api/v1/productos/');
    if (!response.ok) throw new Error('Error al cargar productos');
    
    productosDisponibles = await response.json();
    displayProductos(productosDisponibles);
  } catch (error) {
    console.error('Error:', error);
    showError('Error al cargar productos');
  }
}

function displayProductos(productos) {
  const dropdown = document.getElementById('producto-dropdown');
  const itemsHTML = productos.map(p => `
    <div class="dropdown-item" data-id="${p.id}" data-precio="${p.precioVenta}" data-stock="${p.stock}" data-nombre="${p.nombre}">
      ${p.nombre} ${p.marca ? `- ${p.marca}` : ''} (Stock: ${p.stock})
    </div>
  `).join('');
  
  dropdown.innerHTML = itemsHTML;
  
  // Agregar event listeners a cada item
  dropdown.querySelectorAll('.dropdown-item').forEach(item => {
    item.addEventListener('click', (e) => {
      const productoSearch = document.getElementById('producto-search');
      const stock = parseInt(e.target.dataset.stock);
      
      // Validar stock antes de seleccionar
      if (stock === 0) {
        showWarning('Este producto no tiene stock disponible');
        dropdown.style.display = 'none';
        productoSearch.value = '';
        return;
      }
      
      productoSearch.value = e.target.textContent.trim();
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
    p.marca.toLowerCase().includes(search)
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
}

function updateVentaTable() {
  const tbody = document.getElementById('productos-table-body');
  
  tbody.innerHTML = productosVenta.map((item, index) => `
    <div class="table-row" data-index="${index}">
      <div class="table-cell">${item.nombre}</div>
      <div class="table-cell editable-cantidad" data-index="${index}">${item.cantidad}</div>
      <div class="table-cell">$${item.precio_unitario}</div>
      <div class="table-cell">$${item.cantidad * item.precio_unitario}</div>
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
              value="${item.nombre}"
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
              value="${item.cantidad}"
              min="1"
              max="${producto.stock}"
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
        <h3>¿Estas seguro de eliminar el producto <strong>${truncatedName}</strong>?</h3>
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
  if (productosVenta.length === 0) {
    showWarning('Agrega al menos un producto a la venta');
    return;
  }

  const ventaData = {
    fecha: new Date().toISOString(),
    productos: productosVenta.map(p => ({
      producto_id: p.producto_id,
      cantidad: p.cantidad
    }))
  };

  try {
    const response = await fetch('http://localhost:8000/api/v1/ventas/', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
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
    console.error('Error:', error);
    showError('Error al registrar venta: ' + error.message);
  }
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
