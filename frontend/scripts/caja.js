/**
 * Módulo CAJA — shell con sidebar secundario que carga las secciones:
 * Cierre diario, Notas de pago, Reportes de ventas y Clientes deudores.
 */
import { loadComponent } from './utils/component-loader.js';
import { resetBodyDefaults } from './utils/state-manager.js';
import { initCierre } from './caja/cierre.js';
import { initNotas } from './caja/notas.js';
import { initReportes } from './caja/reportes.js';
import { initDeudores } from './caja/deudores.js';

loadComponent("header", "includes/header.html");
loadComponent("side-bar-container", "includes/sidebar.html");

document.addEventListener('DOMContentLoaded', () => {
  resetBodyDefaults();

  const contenido = document.getElementById('caja-content');
  const menuItems = document.querySelectorAll('.orden-sidebar-menu a');

  const cargarSeccion = (seccion) => {
    switch (seccion) {
      case 'cierre': initCierre(contenido); break;
      case 'notas': initNotas(contenido); break;
      case 'reportes': initReportes(contenido); break;
      case 'deudores': initDeudores(contenido); break;
      default: contenido.innerHTML = '<p>Selecciona una opción del menú</p>';
    }
  };

  menuItems.forEach(item => {
    item.addEventListener('click', (e) => {
      e.preventDefault();
      menuItems.forEach(link => link.classList.remove('active'));
      item.classList.add('active');
      cargarSeccion(item.dataset.section);
    });
  });

  cargarSeccion('cierre');
});
