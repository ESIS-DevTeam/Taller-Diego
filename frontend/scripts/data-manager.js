const API_BASE_URL = 'http://127.0.0.1:8000/api/v1';

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
