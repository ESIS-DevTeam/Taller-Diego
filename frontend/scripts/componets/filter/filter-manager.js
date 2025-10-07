// Gestor principal de filtros con búsqueda difusa
export class FilterManager {
    constructor(products) {
        this.products = products;
        this.filteredProducts = [...products];
        this.currentFilters = {
            search: '',
            categories: [],
            lowStock: false,
            minPrice: null,
            maxPrice: null
        };
        this.fuse = null;
        this.initializeFuse();
    }

    // Inicializar Fuse.js para búsqueda difusa
    initializeFuse() {
        if (typeof Fuse !== 'undefined') {
            this.fuse = new Fuse(this.products, {
                keys: [
                    { name: 'name', weight: 0.6 },
                    { name: 'description', weight: 0.3 },
                    { name: 'category', weight: 0.1 }
                ],
                threshold: 0.3, // Tolerancia a errores (0 = exacto, 1 = muy flexible)
                ignoreLocation: true,
                minMatchCharLength: 2,
                includeScore: true,
                shouldSort: true
            });
        }
    }

    // Aplicar todos los filtros
    applyFilters() {
        this.filteredProducts = this.products.filter(product => {
            const matchesSearch = this._matchesSearch(product);
            const matchesCategory = this._matchesCategory(product);
            const matchesStock = this._matchesStock(product);
            const matchesPrice = this._matchesPrice(product);

            return matchesSearch && matchesCategory && matchesStock && matchesPrice;
        });

        return this.filteredProducts;
    }

    // Actualizar filtros
    updateFilters(newFilters) {
        this.currentFilters = { ...this.currentFilters, ...newFilters };
        return this.applyFilters();
    }

    // Limpiar todos los filtros
    clearFilters() {
        this.currentFilters = {
            search: '',
            categories: [],
            lowStock: false,
            minPrice: null,
            maxPrice: null
        };
        return this.applyFilters();
    }

    // Obtener productos filtrados
    getFilteredProducts() {
        return this.filteredProducts;
    }

    // Obtener filtros actuales
    getCurrentFilters() {
        return this.currentFilters;
    }

    // Actualizar productos (para cuando se añaden/eliminan)
    updateProducts(newProducts) {
        this.products = newProducts;
        this.initializeFuse();
        return this.applyFilters();
    }

    // Métodos privados para cada tipo de filtro
    _matchesSearch(product) {
        if (!this.currentFilters.search) return true;
        
        const searchTerm = this.currentFilters.search.toLowerCase().trim();
        
        // Para búsquedas muy cortas, usar búsqueda simple
        if (searchTerm.length < 2) {
            return product.name.toLowerCase().includes(searchTerm) ||
                   product.description.toLowerCase().includes(searchTerm);
        }

        // Si Fuse.js está disponible, usar búsqueda difusa
        if (this.fuse) {
            const results = this.fuse.search(searchTerm);
            return results.some(result => result.item.id === product.id);
        } else {
            // Fallback a búsqueda simple si Fuse no está cargado
            return this._simpleFuzzySearch(product, searchTerm);
        }
    }

    // Búsqueda simple como fallback
    _simpleFuzzySearch(product, searchTerm) {
        const normalize = (text) => {
            return text.toLowerCase()
                .normalize("NFD")
                .replace(/[\u0300-\u036f]/g, "")
                .replace(/[^a-z0-9]/g, " ");
        };

        const normalizedSearch = normalize(searchTerm);
        const normalizedName = normalize(product.name);
        const normalizedDesc = normalize(product.description);

        // Buscar si todas las palabras del searchTerm están en name o description
        const searchWords = normalizedSearch.split(' ').filter(word => word.length > 1);
        
        if (searchWords.length === 0) return true;

        return searchWords.every(word => 
            normalizedName.includes(word) || normalizedDesc.includes(word)
        );
    }

    _matchesCategory(product) {
        if (this.currentFilters.categories.length === 0) return true;
        return this.currentFilters.categories.includes(product.category.toLowerCase());
    }

    _matchesStock(product) {
        if (!this.currentFilters.lowStock) return true;
        return product.stock <= product.minStock;
    }

    _matchesPrice(product) {
        const matchesMin = this.currentFilters.minPrice === null || 
                          product.sellingPrice >= this.currentFilters.minPrice;
        const matchesMax = this.currentFilters.maxPrice === null || 
                          product.sellingPrice <= this.currentFilters.maxPrice;
        return matchesMin && matchesMax;
    }
}