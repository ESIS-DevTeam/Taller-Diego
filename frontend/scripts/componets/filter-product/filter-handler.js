import { filterState } from './filtro-state.js';
import { generateProductCard } from '../product-list/product-card.js';
import { setupProductActions } from '../product-list/product-actions.js'; // ← IMPORTAR

let fuse;
let allProducts = [];

export function initializeSearch(products) {
  allProducts = products;
  
  if (typeof Fuse === 'undefined') {
    console.error('Fuse.js no está cargado. Agrégalo al HTML.');
    return;
  }
  
  fuse = new Fuse(products, {
    keys: ['nombre'],
    threshold: 0.4,
    ignoreLocation: true
  });
}

export function applyFilters() {
  let filteredProducts = [...allProducts];

  // Aplicar búsqueda
  if (filterState.searchQuery) {
    const results = fuse.search(filterState.searchQuery);
    filteredProducts = results.map(result => result.item);
  }

  // Aplicar filtro de categorías
  if (filterState.selectedCategories.length > 0) {
    filteredProducts = filteredProducts.filter(product => 
      filterState.selectedCategories.includes(product.categoria)
    );
  }

  // Aplicar filtro de stock bajo
  if (filterState.lowStock) {
    filteredProducts = filteredProducts.filter(product => 
      product.stock <= product.stockMin
    );
  }

  // Aplicar filtro de precio
  if (filterState.priceRange.min || filterState.priceRange.max) {
    filteredProducts = filteredProducts.filter(product => {
      const price = product.precioVenta;
      const min = filterState.priceRange.min || 0;
      const max = filterState.priceRange.max || Infinity;
      return price >= min && price <= max;
    });
  }

  renderFilteredProducts(filteredProducts);
}

function renderFilteredProducts(products) {
  const productList = document.getElementById('product-list');
  if (!productList) return;

  if (products.length === 0) {
    productList.innerHTML = `
      <div class="no-results">
        <p>No se encontraron productos</p>
      </div>
    `;
    return;
  }

  productList.innerHTML = products.map(generateProductCard).join('');
  
  setupProductActions();
}