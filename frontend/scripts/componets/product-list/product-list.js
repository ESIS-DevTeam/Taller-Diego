import { fetchFromApi } from "../../data-manager.js";
import { handleApiError } from "../../utils/error-handlers.js";
import { setupProductActions } from "./product-actions.js";
import { generateProductCard } from "./product-card.js";

const ENDPOINT = "productos"; 

export async function renderProducts () {
  const productList = document.getElementById("product-list");
  if(!productList) {
    console.error("No existe el contenedor de los productos");
    return;
  }

  try {
    // Mostrar loading
    productList.innerHTML = '<p class="loading">Cargando productos...</p>';
    
    const products = await fetchFromApi(ENDPOINT);
    
    // Verificar si hay productos
    if (!products || products.length === 0) {
      productList.innerHTML = '<p class="empty-state">No hay productos registrados</p>';
      return;
    }

    productList.innerHTML = products.map(producto => 
      generateProductCard(producto)
    ).join('');
    
    setupProductActions();
    
  } catch (error) {
    console.error("Error al cargar productos:", error);
    productList.innerHTML = '<p class="error-state">Error al cargar productos</p>';
    handleApiError(error);
  }
}