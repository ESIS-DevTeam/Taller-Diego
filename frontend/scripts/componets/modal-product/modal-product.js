import { generateModalHTML } from './modal-template.js';
import { setupModalEvents } from "./modal-event.js"; // ← QUITAR LA 'S'

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