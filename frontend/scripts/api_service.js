const API_BASE_URL = 'http://localhost:8000/api/v1'; 

export async function getVentas() {
    try {
        const response = await fetch(`${API_BASE_URL}/ventas/`);
        if (!response.ok) {
            throw new Error(`Error al cargar Ventas: ${response.status}`);
        }
        return await response.json();
    } catch (error) {
        console.error("Fallo al obtener ventas:", error);
        return [];
    }
}


export async function getProductos() {
    try {
        const response = await fetch(`${API_BASE_URL}/productos/`);
        if (!response.ok) {
            throw new Error(`Error al cargar Productos: ${response.status}`);
        }
        return await response.json();
    } catch (error) {
        console.error("Fallo al obtener productos:", error);
        return [];
    }
}


export async function getAutopartes() {
    try {
        const response = await fetch(`${API_BASE_URL}/autopartes/`);
        if (!response.ok) {
            throw new Error(`Error al cargar Autopartes: ${response.status}`);
        }
        return await response.json();
    } catch (error) {
        console.error("Fallo al obtener autopartes:", error);
        return [];
    }
}