const API_BASE_URL = 'http://127.0.0.1:8000/api/v1'; 

// data-manager.js


// Funciones para manejar los datos
export async function getProducts() {
  try{
    const response = await fetch(`${API_BASE_URL}/productos`)
    if(!response.ok){
      throw new Error("Network response was not ok");
    }
    return await response.json();
  }catch (error){
    console.error('Error fetching products: ',error);
    throw error;
  }
}

export async function getProductById(id) {
    try{
      const response = await fetch(`${API_BASE_URL}/productos/${id}`);
      if(!response.ok){
        throw new Error("Network response was not ok");
      }
      return await response.json();
    }catch(error){
      console.error(`Error fetching product ${id}`, error);
       throw error;
    }
}

export async function addProduct(nameP, description, salePrice, purchasePrice, brand, category, stock, minStock, barcode, image, type) {
    if (!nameP || !category || stock < 0) {
        throw new Error("Datos de producto inválidos");
    }
    
    try {
        const response = await fetch(`${API_BASE_URL}/productos/`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                nombre: nameP,
                descripcion: description,
                precioVenta: salePrice,
                precioCompra: purchasePrice,
                marca: brand,
                categoria: category,
                stock: stock,
                stockMin: minStock,
                img: image,
                codBarras: barcode,
                tipo: type
            })
        });
        
        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.detail || "Error al crear producto");
        }
        
        return await response.json();
    } catch(error) {
        console.error(`Error post product`, error);
        throw error;
    }
}

export async function updateProduct(id, updatedProduct) {
  try{
    const response = await fetch(`${API_BASE_URL}/productos/${id}`,{
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        nombre: updatedProduct.nombre,
        descripcion: updatedProduct.descripcion,
        precioVenta: updatedProduct.precioVenta,
        precioCompra: updatedProduct.precioCompra,
        marca: updatedProduct.marca,
        categoria: updatedProduct.categoria,
        stock: updatedProduct.stock,
        stockMin: updatedProduct.stockMin,
        img: updatedProduct.img,
        codBarras: updatedProduct.codBarras,
        tipo: updatedProduct.tipo
      })
    });
    if(!response.ok){
      throw new Error("Network response was not ok");
    }
    return await response.json();
  }catch(error){
    console.error(`Error update product`,error);
    throw error;
  }
}

export async function deleteProduct(id) {
  try {
    console.log(`Eliminando producto ${id}...`);
    const response = await fetch(`${API_BASE_URL}/productos/${id}`, {
      method: 'DELETE',
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Error ${response.status}: ${errorText}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error eliminando producto:', error);
    throw error;
  }
}

export async function getProductsByCategory(category) {
  const data = await getProducts();
  return data.filter(product => product.categoria === category.toLowerCase());
}