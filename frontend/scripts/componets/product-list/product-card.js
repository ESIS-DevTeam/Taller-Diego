export function generateProductCard (product) {
  let classStock = 'product-stock'; 
  if(product.stockMin > product.stock) {
    classStock += ' low-stock';
  }else{
    classStock += ' normal-stock';
  }
  return `
  <div class="product-item" data-product-id="${product.id}">
    <div class="product-name">${product.nombre}</div>
    <div class="product-desc">${product.descripcion || 'Sin descripcion'}</div>
    <div class="${classStock}">${product.stock}</div>
    <div class="product-purchase-price">$${product.precioVenta}</div>
    <div class="product-selling-price">$${product.precioCompra}</div>
    <div class="product-actions">
      <button class="btn-edit" data-id="${product.id}">
        <img class="img-edit" src="../assets/icons/edit.png" alt="Editar">
      </button>
      <button class="btn-delete" data-id="${product.id}">
        <img class="img-delete" src="../assets/icons/delete.png" alt="Eliminar">
      </button>
    </div>
  </div>`;
}