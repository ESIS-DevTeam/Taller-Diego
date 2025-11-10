import { CATEGORIAS_PRODUCTOS } from "../modal-product/constants.js";

export function loadFilterUI() {
  loadCategories();
  setupPriceInputs(); // ← LLAMAR a esta función
}

function loadCategories() {
  const categoryList = document.querySelector('.category-option');
  if (!categoryList) return; // ← Agregar validación
  
  categoryList.innerHTML = CATEGORIAS_PRODUCTOS.map(category => `
    <li>
      <label>
        <input type="checkbox" name="category" value="${category}">
        ${category}
      </label>
    </li>
  `).join('');
}

function setupPriceInputs() {
  const minInput = document.querySelector('[data-min-price]');
  const maxInput = document.querySelector('[data-max-price]');

  if (minInput) minInput.min = "0";
  if (maxInput) maxInput.min = "0";
}