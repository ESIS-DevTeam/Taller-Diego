import { filterState } from './filtro-state.js';
import { generateProductCard } from '../product-list/product-card.js';
import { setupProductActions } from '../product-list/product-actions.js';

let fuse;
let allProducts = [];

export function initializeSearch(products) {
  allProducts = products;
  
  if (typeof Fuse === 'undefined') {
    console.error('Fuse.js no está cargado. Agrégalo al HTML.');
    return;
  }
  
  fuse = new Fuse(products, {
    keys: ['nombre', 'descripcion'],
    threshold: 0.3,
    ignoreLocation: true,
    ignoreLocation: false,
  });
}

export function applyFilters(products = null) {
  const source = products ?? allProducts;
  let filteredProducts = [...source];

  if (filterState.searchQuery && fuse) {
    const results = fuse.search(filterState.searchQuery);
    filteredProducts = results.map(result => result.item);
  }

  if (Array.isArray(filterState.selectedCategories) && filterState.selectedCategories.length > 0) {
    filteredProducts = filteredProducts.filter(product =>
      filterState.selectedCategories.includes(product.categoria)
    );
  }

  if (filterState.lowStock) {
    filteredProducts = filteredProducts.filter(product =>
      product.stock <= product.stockMin
    );
  }

  if (filterState.priceRange.min !== null || filterState.priceRange.max !== null) {
    const min = filterState.priceRange.min ?? 0;
    const max = filterState.priceRange.max ?? Infinity;
    filteredProducts = filteredProducts.filter(product => {
      const price = product.precioVenta;
      return price >= min && price <= max;
    });
  }

  renderFilteredProducts(filteredProducts);
}

function renderFilteredProducts(products) {
  const productList = document.getElementById('product-list');
  if (!productList) return;

  if (products.length === 0) {
    productList.innerHTML = '<p style="text-align: center; padding: 40px; color: #999;">No se encontraron productos</p>';
    return;
  }

  productList.innerHTML = products.map(product => generateProductCard(product)).join('');
  setupProductActions();
}