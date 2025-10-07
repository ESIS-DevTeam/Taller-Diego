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
    }

    // Actualizar filtros
    updateFilters(newFilters) {
        this.currentFilters = { ...this.currentFilters, ...newFilters };
        return this.applyFilters();
    }

    // Aplicar todos los filtros
    applyFilters() {
        this.filteredProducts = this.products.filter(product => {
            // Filtrar por texto de búsqueda
            const searchMatch = !this.currentFilters.search ||
                product.name.toLowerCase().includes(this.currentFilters.search.toLowerCase()) ||
                product.description.toLowerCase().includes(this.currentFilters.search.toLowerCase());

            // Filtrar por categoría
            const categoryMatch = this.currentFilters.categories.length === 0 ||
                this.currentFilters.categories.includes(product.category);

            // Filtrar por stock bajo
            const stockMatch = !this.currentFilters.lowStock ||
                product.stock <= product.minStock;

            // Filtrar por precio
            const minPriceMatch = this.currentFilters.minPrice === null ||
                product.sellingPrice >= this.currentFilters.minPrice;
            const maxPriceMatch = this.currentFilters.maxPrice === null ||
                product.sellingPrice <= this.currentFilters.maxPrice;

            return searchMatch && categoryMatch && stockMatch && minPriceMatch && maxPriceMatch;
        });

        return this.filteredProducts;
    }

    // Limpiar filtros
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

    // Actualizar lista de productos
    updateProducts(newProducts) {
        this.products = newProducts;
        return this.applyFilters();
    }
}