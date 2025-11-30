/**
 * Componente para manejar la generación y descarga de códigos de barras en PDF.
 * (Restaurado como placeholder tras pérdida del archivo original)
 */

import { showSuccess, showError, showWarning } from '../utils/notification.js';

export function bindBarcodeButton() {
  const btn = document.getElementById('barcode-btn');
  if (btn) {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      openBarcodeModal();
    });
  }
}

function openBarcodeModal() {
  // Lógica para abrir el modal de códigos de barras
  // TODO: Restaurar implementación completa de generación de PDF
  console.log('Abrir modal de códigos de barras');

  const modalContainer = document.getElementById('modal-barcode-container');
  if (!modalContainer) return;

  modalContainer.innerHTML = `
        <div class="modal-overlay" id="barcode-modal-overlay">
            <div class="modal-content" style="max-width: 500px;">
                <div class="modal-header">
                    <h2>Códigos de Barras</h2>
                    <button class="modal-close" id="close-barcode-modal">X</button>
                </div>
                <div class="modal-body">
                    <p>La funcionalidad de descarga de PDF está en mantenimiento.</p>
                </div>
            </div>
        </div>
    `;

  document.getElementById('close-barcode-modal').addEventListener('click', () => {
    modalContainer.innerHTML = '';
  });

  document.getElementById('barcode-modal-overlay').addEventListener('click', (e) => {
    if (e.target.id === 'barcode-modal-overlay') {
      modalContainer.innerHTML = '';
    }
  });
}
