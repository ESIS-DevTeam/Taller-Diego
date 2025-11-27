import { fetchFromApi } from "../../data-manager.js";
import { handleApiError } from "../../utils/error-handlers.js";
import { setupProductActions, setupViewProduct } from "./product-actions.js";
import { generateProductCard } from "./product-card.js";

const ENDPOINT = "productos";

/**
 * Renderiza la lista de productos
 * @param {Array|null} products - Productos a renderizar. Si es null, los obtiene del API.
 */
export async function renderProducts(products = null) {
  const productList = document.getElementById("product-list");
  if (!productList) {
    console.error("No existe el contenedor de los productos");
    return;
  }

  try {
    // Mostrar loading solo si no tenemos productos
    if (!products) {
      productList.innerHTML = '<p class="loading">Cargando productos...</p>';
      products = await fetchFromApi(ENDPOINT);
    }

    // Verificar si hay productos
    if (!products || products.length === 0) {
      productList.innerHTML = '<p class="empty-state">No hay productos registrados</p>';
      return;
    }

    productList.innerHTML = products.map(producto =>
      generateProductCard(producto)
    ).join('');

    setupProductActions();
    setupViewProduct();

  } catch (error) {
    console.error("Error al cargar productos:", error);
    productList.innerHTML = '<p class="error-state">Error al cargar productos</p>';
    handleApiError(error);
  }
}