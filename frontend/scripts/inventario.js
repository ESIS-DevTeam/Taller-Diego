import { getProductos, getAutopartes } from './api_service.js';

document.addEventListener('DOMContentLoaded', async () => {
    const listaProductos = await getProductos();
    console.log("Productos cargados:", listaProductos);

    const listaAutopartes = await getAutopartes();
    console.log("Autopartes cargadas:", listaAutopartes);
});