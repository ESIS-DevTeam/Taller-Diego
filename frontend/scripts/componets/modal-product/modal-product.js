import { generateModalHTML } from './modal-template.js';
import { setupModalEvents } from './modal-events.js';
export { CATEGORIAS_PRODUCTOS } from './constants.js';

export function openModalForm(type = 'add', data = {}) {
  const modalContainer = document.getElementById('modal-container');
  if(!modalContainer) return;
  
  modalContainer.innerHTML = generateModalHTML(type, data);
  document.body.style.overflow = 'hidden';
  setupModalEvents();
}

export function closeModalForm() {
  const modalContainer = document.getElementById('modal-container');
  if (modalContainer) modalContainer.innerHTML = "";
  document.body.style.overflow = "";
}