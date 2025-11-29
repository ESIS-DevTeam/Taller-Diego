import { openModalForm } from '../modal-product/modal-product.js';
import { deleteResource, fetchFromApi } from '../../data-manager.js';
import { showNotification } from '../../utils/notification.js';
import { renderProducts } from './product-list.js';
import { confirmDelete } from '../modal-confirm.js';
import { deleteImage } from '../../utils/store/manager-image.js';

export function setupProductActions() {
  const productList = document.getElementById("product-list");
  
  // Delegar eventos (mejor rendimiento)
  productList?.addEventListener('click', async (e) => {
    const target = e.target;
    
    
  });
}

export function setupViewProduct(){
  const items = document.querySelectorAll('.product-item');
  items.forEach(product => {
    product.addEventListener('click' ,() =>{
      const idStr = product.getAttribute("data-product-id");
      const idProduct = parseInt(idStr);
      openModalForm('view',idProduct);
    });

    const actionButtons = product.querySelectorAll('.product-actions-product');
    actionButtons.forEach(button => {
      button.addEventListener('click', (event) => {
        event.stopPropagation();
        
        const idStr = button.getAttribute("data-id");
        const idProduct = parseInt(idStr);
        const action = button.dataset.action;
        
        console.log(`Botón clickeado: ${action}`);
        
        if(action === 'edit'){
          openModalForm('edit', idProduct);
        } 
        else if(action === 'delete') {
          handleDeleteProduct(idProduct);
        }
      });
    });
  });
}

async function handleDeleteProduct(productId) {
  const confirmed = await confirmDelete(productId);
  
  if (!confirmed) return;
  
  try {
    const product = await fetchFromApi('productos', productId);
    await deleteResource('productos', productId);

    await deleteImage(product.img,'productos');
    showNotification('Producto eliminado exitosamente', 'success');
    
    await renderProducts();
    
  } catch (error) {
    console.error('Error al eliminar producto:', error);
  }
}