import { debounce } from '../../utils/debounce.js';
import { updateFilterState, clearFilters } from './filtro-state.js'; // ← CAMBIAR a filtro-state.js
import { applyFilters } from './filter-handler.js'; // ← CAMBIAR a filter-handler.js (no search-handler.js)

export function setupFilterEvents() {
  // Búsqueda
  const searchInput = document.querySelector('[data-search-input]');
  searchInput?.addEventListener('input', debounce((e) => {
    updateFilterState('searchQuery', e.target.value.trim());
    applyFilters();
  }, 300));

  // Categorías
  const categoryInputs = document.querySelectorAll('[name="category"]');
  categoryInputs.forEach(input => {
    input.addEventListener('change', () => {
      const selectedCategories = [...categoryInputs]
        .filter(cb => cb.checked)
        .map(cb => cb.value);
      
      updateFilterState('selectedCategories', selectedCategories);
      applyFilters();
    });
  });

  // Stock bajo
  const lowStockCheckbox = document.querySelector('[data-low-stock]');
  lowStockCheckbox?.addEventListener('change', (e) => {
    updateFilterState('lowStock', e.target.checked);
    applyFilters();
  });

  // Rango de precios
  const priceInputs = document.querySelectorAll('[data-min-price], [data-max-price]');
  priceInputs.forEach(input => {
    input.addEventListener('change', debounce(() => {
      updateFilterState('priceRange', {
        min: parseFloat(document.querySelector('[data-min-price]').value) || null,
        max: parseFloat(document.querySelector('[data-max-price]').value) || null
      });
      applyFilters();
    }, 300));
  });

  // Limpiar filtros
  const clearButton = document.querySelector('[data-clear-filters]');
  clearButton?.addEventListener('click', () => {
    document.getElementById('inventory-form')?.reset();
    clearFilters();
    applyFilters();
  });
}