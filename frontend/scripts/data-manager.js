/**
 * URL base para la API
 * @constant {string}
 */
const API_BASE_URL = 'http://127.0.0.1:8000/api/v1';

// ========================================
// FUNCIONES GENÉRICAS
// ========================================

/**
 * Realiza peticiones GET a la API.
 * @param {string} endpoint - Ruta del endpoint (ej: 'productos', 'autopartes').
 * @param {number|null} id - ID opcional para obtener un recurso específico.
 * @returns {Promise<Object|Array>} Datos de la respuesta en formato JSON.
 * @throws {Error} Si la petición falla.
 */
export async function fetchFromApi(endpoint, id = null) {
  try {
    let apiUrl = `${API_BASE_URL}/${endpoint}`;
    if (id !== null) {
      apiUrl += `/${id}`;
    }
    const response = await fetch(apiUrl);

    if (!response.ok) {
      throw new Error(`Error HTTP: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error(`Error en fetchFromApi (${endpoint}):`, error);
    throw error;
  }
}

/**
 * Crea un recurso en la API mediante POST.
 * @param {string} endpoint - Ruta del endpoint.
 * @param {Object} data - Datos a enviar en el body.
 * @returns {Promise<Object>} Recurso creado.
 * @throws {Error} Si la petición falla.
 */
export async function createResource(endpoint, data) {
  try {
    const response = await fetch(`${API_BASE_URL}/${endpoint}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
    if (!response.ok) {
      throw new Error(`Error HTTP: ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    console.error(`Error creando recurso en ${endpoint}:`, error);
    throw error;
  }
}

/**
 * Actualiza un recurso en la API mediante PUT.
 * @param {string} endpoint - Ruta del endpoint.
 * @param {number} id - ID del recurso a actualizar.
 * @param {Object} data - Datos actualizados en formato JSON.
 * @returns {Promise<Object>} Recurso actualizado.
 * @throws {Error} Si la petición falla.
 */
export async function updateResource(endpoint, id, data) {
  try {
    const response = await fetch(`${API_BASE_URL}/${endpoint}/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
    if (!response.ok) {
      throw new Error(`Error HTTP: ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    console.error(`Error actualizando recurso en ${endpoint}/${id}:`, error);
    throw error;
  }
}

/**
 * Elimina un recurso de la API mediante DELETE.
 * @param {string} endpoint - Ruta del endpoint.
 * @param {number} id - ID del recurso a eliminar.
 * @returns {Promise<Object>} Respuesta del servidor.
 * @throws {Error} Si la petición falla.
 */
export async function deleteResource(endpoint, id) {
  try {
    const response = await fetch(`${API_BASE_URL}/${endpoint}/${id}`, {
      method: 'DELETE',
    });
    if (!response.ok) {
      throw new Error(`Error HTTP: ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    console.error(`Error eliminando recurso en ${endpoint}/${id}:`, error);
    throw error;
  }
}

/**
 * Cuenta elementos de un endpoint.
 * @param {string} endpoint - Ruta del endpoint a contar elementos.
 * @returns {Promise<number>} Cantidad de elementos.
 */
export async function countFromApi(endpoint) {
  try {
    const object = await fetchFromApi(endpoint);
    if (!Array.isArray(object)) {
      console.error('La respuesta no es un array');
      return 0;
    }
    return object.length;
  } catch (error) {
    console.error(`Error contando elementos de ${endpoint}:`, error);
    return 0;
  }
}

// ========================================
// FUNCIONES ESPECÍFICAS - PRODUCTOS
// (Provisionales hasta implementación en backend)
// ========================================

/**
 * Cuenta productos con stock menor o igual al mínimo.
 * @returns {Promise<number>} Cantidad de productos en bajo stock.
 */
export async function productUnderStock() {
  try {
    const products = await fetchFromApi('productos');
    const amount = products.reduce((count, product) => {
      return count + (product.stock <= product.stockMin ? 1 : 0);
    }, 0);

    return amount;
  } catch (error) {
    console.error('Error contando productos en bajo stock:', error);
    return 0;
  }
}
