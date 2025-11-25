/**
 * Carga y retorna el HTML del encabezado (header)
 * Muestra el logo y nombre del taller en la parte superior
 * @param {*} param - Parámetro opcional (no utilizado actualmente)
 * @returns {string} HTML del header con logo y título
 */
export function loadHeader(param) {
    return `
        <div class="header-container">
            <!-- Logo del taller -->
            <img src="../assets/images/logo.svg" alt="Logo Taller Diego" class="logo">
            
            <!-- Nombre del taller -->
            <h1>Taller de Diego</h1>
        </div>
    `;
}