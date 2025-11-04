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

// Añadir después de getProductById

export async function getAutoparteByProductId(productId) {
  try {
    const response = await fetch(`${API_BASE_URL}/autopartes/${productId}`);
    
    if (!response.ok) {
      if (response.status === 404) {
        // No es una autoparte, retornar null
        return null;
      }
      throw new Error(`Error ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error(`Error obteniendo autoparte para producto ${productId}:`, error);
    return null;
  }
}

export async function addProduct(nombre, descripcion, precioVenta, precioCompra, marca, categoria, stock, stockMin, codBarras, img, tipo) {
  try {
    // Asegurarse que los datos tienen el formato esperado por el backend
    const payload = {
      nombre,
      descripcion,
      precioVenta: Number(precioVenta),
      precioCompra: Number(precioCompra),
      marca,
      categoria,
      stock: Number(stock),
      stockMin: Number(stockMin),
      codBarras: codBarras || null,
      img: img || "",
      tipo: tipo || "producto"
    };
    
    console.log("Enviando datos:", payload);
    
    const response = await fetch(`${API_BASE_URL}/productos`, { // Sin barra al final
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Error ${response.status}: ${errorText}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error creando producto:', error);
    throw error;
  }
}

// Mejora la función addAutoparte para manejar mejor los errores

export async function addAutoparte(productoId, modelo, anio, datosProducto = {}) {
  try {
    // Asegurarse que los tipos de datos son correctos
    const payload = {
      productoId: Number(productoId),
      modelo: modelo || "",
      anio: Number(anio) || new Date().getFullYear(),
      // Campos requeridos de ProductoBase
      nombre: datosProducto.nombre || "",
      descripcion: datosProducto.descripcion || "",
      precioCompra: Number(datosProducto.precioCompra) || 0,
      precioVenta: Number(datosProducto.precioVenta) || 0,
      marca: datosProducto.marca || "",
      categoria: datosProducto.categoria || "",
      stock: Number(datosProducto.stock) || 0,
      stockMin: Number(datosProducto.stockMin) || 0,
      codBarras: datosProducto.codBarras || null,
      img: datosProducto.img || null,
      tipo: "autoparte"
    };
    
    console.log("Enviando datos de autoparte:", payload);
    
    const response = await fetch(`${API_BASE_URL}/autopartes/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload)
    });

    const responseData = await response.text();
    console.log(`Respuesta del servidor (${response.status}):`, responseData);

    if (!response.ok) {
      throw new Error(`Error ${response.status}: ${responseData}`);
    }

    return JSON.parse(responseData);
  } catch (error) {
    console.error('Error creando autoparte:', error);
    throw error;
  }
}

// Función todo-en-uno para productos con posibilidad de ser autopartes
export async function saveProductWithDetails(productData) {
  try {
    // 1. Crear el producto básico primero
    const productResponse = await addProduct(
      productData.name,
      productData.description,
      productData.sellingPrice,
      productData.purchasePrice,
      productData.brand,
      productData.category,
      productData.stock,
      productData.minStock,
      productData.barcode || null,
      productData.image || "",
      productData.type || "producto"
    );
    
    // 2. Si es autoparte y tiene datos específicos, crear la entrada en autopartes
    if (productData.isAutoparte && productData.model && productData.year) {
      await addAutoparte(
        productResponse.id, 
        productData.model,
        productData.year
      );
    }
    
    return productResponse;
  } catch (error) {
    console.error("Error guardando producto con detalles:", error);
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
        codBarras: updatedProduct.codBarras ?? null,
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