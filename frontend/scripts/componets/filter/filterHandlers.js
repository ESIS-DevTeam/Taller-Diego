import { FilterManager } from './filter-manager.js';

// Configurar todos los event listeners de filtros
export function setupFilterHandlers(filterManager, onFiltersChanged) {
    setupSearchFilter(filterManager, onFiltersChanged);
    setupCategoryFilters(filterManager, onFiltersChanged);
    setupStockFilter(filterManager, onFiltersChanged);
    setupPriceFilters(filterManager, onFiltersChanged);
    setupClearFilters(filterManager, onFiltersChanged);
}

// Handler para búsqueda
function setupSearchFilter(filterManager, callback) {
    const searchInput = document.querySelector('input[name="search"]');
    if (!searchInput) return;

    let timeout;
    searchInput.addEventListener('input', function(e) {
        clearTimeout(timeout);
        timeout = setTimeout(() => {
            filterManager.updateFilters({ search: e.target.value });
            callback();
        }, 300);
    });
}

// Handler para categorías
function setupCategoryFilters(filterManager, callback) {
    const categoryCheckboxes = document.querySelectorAll('input[name="category"]');
    
    categoryCheckboxes.forEach(checkbox => {
        checkbox.addEventListener('change', function(e) {
            if (e.target.checked) {
                // Deseleccionar todos los otros checkboxes
                categoryCheckboxes.forEach(otherCheckbox => {
                    if (otherCheckbox !== e.target) {
                        otherCheckbox.checked = false;
                    }
                });
                filterManager.updateFilters({ categories: [e.target.value] });
            } else {
                // Si se deseleccionó, limpiar filtro
                filterManager.updateFilters({ categories: [] });
            }
            callback();
        });
    });
}

// Handler para stock bajo
function setupStockFilter(filterManager, callback) {
    const stockCheckbox = document.querySelector('input[name="stock"]');
    if (!stockCheckbox) return;

    stockCheckbox.addEventListener('change', function(e) {
        filterManager.updateFilters({ lowStock: e.target.checked });
        callback();
    });
}

// Handler para precios
function setupPriceFilters(filterManager, callback) {
    const minPriceInput = document.querySelector('input[name="min-price"]');
    const maxPriceInput = document.querySelector('input[name="max-price"]');

    let timeout;
    function debouncedCallback() {
        clearTimeout(timeout);
        timeout = setTimeout(callback, 300);
    }

    if (minPriceInput) {
        minPriceInput.addEventListener('input', function(e) {
            const minPrice = e.target.value ? parseFloat(e.target.value) : null;
            filterManager.updateFilters({ minPrice });
            debouncedCallback();
        });
    }

    if (maxPriceInput) {
        maxPriceInput.addEventListener('input', function(e) {
            const maxPrice = e.target.value ? parseFloat(e.target.value) : null;
            filterManager.updateFilters({ maxPrice });
            debouncedCallback();
        });
    }
}

// Handler para limpiar filtros
function setupClearFilters(filterManager, callback) {
    const filterForm = document.getElementById('inventory-form');
    if (!filterForm) return;

    filterForm.addEventListener('reset', function(e) {
        e.preventDefault();
        filterManager.clearFilters();
        
        // Limpiar UI
        document.querySelector('input[name="search"]').value = '';
        document.querySelectorAll('input[name="category"]').forEach(cb => cb.checked = false);
        document.querySelector('input[name="stock"]').checked = false;
        document.querySelector('input[name="min-price"]').value = '';
        document.querySelector('input[name="max-price"]').value = '';

        callback();
    });
}