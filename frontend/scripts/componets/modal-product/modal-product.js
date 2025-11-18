import { generateModalHTML } from './modal-template.js';
import { setupModalEvents } from "./modal-event.js"; 
import { setupFilterEvents } from '../filter-product/filter-events.js';
import { renderProducts } from '../product-list/product-list.js';

export async function openModalForm(type = 'add', id = null) {
  const modalContainer = document.getElementById('modal-container');
  if(!modalContainer) return;
  
  modalContainer.innerHTML = await generateModalHTML(type, id);
  document.body.style.overflow = 'hidden';
  setupModalEvents(type,id);
}

export function closeModalForm() {
  const modalContainer = document.getElementById('modal-container');
  if (modalContainer) modalContainer.innerHTML = "";
  document.body.style.overflow = "";
}


export function bindAddProductButton() {
  const addButton = document.getElementById('open-modal-btn');
  
  if (!addButton) {
    console.warn('Botón "Nuevo producto" no encontrado');
    return;
  }

  addButton.addEventListener('click', () => {
    console.log('Abriendo modal para agregar producto...');
    openModalForm('add');
  });
}