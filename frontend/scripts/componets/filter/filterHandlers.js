export function setupFilterHandlers(filterManager, onFilterChange) {
    if (!filterManager) {
        console.error("FilterManager no inicializado");
        return;
    }
    
    // Barra de búsqueda
    const searchInput = document.querySelector('[data-search-input]');
    if (searchInput) {
        let searchTimeout;
        
        searchInput.addEventListener('input', (e) => {
            clearTimeout(searchTimeout);
            searchTimeout = setTimeout(() => {
                filterManager.updateFilters({ search: e.target.value });
                if (onFilterChange) onFilterChange(filterManager.getFilteredProducts());
            }, 300);
        });
    }
    
    // Filtros de categoría
    const categoryInputs = document.querySelectorAll('.category-option input[type="checkbox"]');
    categoryInputs.forEach(input => {
        input.addEventListener('change', () => {
            // Recolectar todas las categorías seleccionadas
            const selectedCategories = Array.from(categoryInputs)
                .filter(cb => cb.checked)
                .map(cb => cb.value);
                
            filterManager.updateFilters({ categories: selectedCategories });
            if (onFilterChange) onFilterChange(filterManager.getFilteredProducts());
        });
    });
    
    // Botón limpiar filtros
    const clearBtn = document.querySelector('[data-clear-filters]');
    if (clearBtn) {
        clearBtn.addEventListener('click', () => {
            // Limpiar UI
            if (searchInput) searchInput.value = '';
            categoryInputs.forEach(cb => cb.checked = false);
            
            // Limpiar filtros
            filterManager.clearFilters();
            if (onFilterChange) onFilterChange(filterManager.getFilteredProducts());
        });
    }
}