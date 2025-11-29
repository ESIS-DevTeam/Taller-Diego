// Cargar componentes dinámicamente
import { loadHeader } from './componets/header.js';
import { loadSideBar } from './componets/side_bar.js';

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
      ordenContent.innerHTML = `
        <h2>Venta de Producto</h2>
        <p>Gestión de venta de productos...</p>
      `;
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
