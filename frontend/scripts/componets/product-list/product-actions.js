import { openModalForm } from '../modal-product/modal-product.js';
import { deleteResource, fetchFromApi } from '../../data-manager.js';
import { showNotification } from '../../utils/notification.js';
import { renderProducts } from './product-list.js';
import { confirmDelete } from '../modal-confirm.js';
import { deleteImage } from '../../utils/store/manager-image.js';
/**
 * Configura los eventos de las acciones de productos
 */
export function setupProductActions() {
  const productList = document.getElementById("product-list");
  
  // Delegar eventos (mejor rendimiento)
  productList?.addEventListener('click', async (e) => {
    const target = e.target;
    
    // Botón Editar
    if (target.classList.contains('btn-edit')) {
      const productId = target.dataset.id;
      await openModalForm('edit', parseInt(productId));
    }
    
    // Botón Eliminar
    if (target.classList.contains('btn-delete')) {
      const productId = target.dataset.id;
      await handleDeleteProduct(productId);
    }
  });
}

/**
 * Maneja la eliminación de un producto
 * @param {number} productId - ID del producto a eliminar
 */
async function handleDeleteProduct(productId) {

  const confirmed = await confirmDelete(productId);
  
  if (!confirmed) return;
  
  try {
    const product = await fetchFromApi('productos', productId);
    await deleteResource('productos', productId);


    await deleteImage(product.img,'productos');
    showNotification('Producto eliminado exitosamente', 'success');
    
    // Recargar la lista
    await renderProducts();
    
  } catch (error) {
    console.error('Error al eliminar producto:', error);
  }
}