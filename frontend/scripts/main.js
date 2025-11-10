// main.js
// Script principal que manipula el DOM y obtiene datos dinámicos desde data-manager.js
// Todas las funciones y textos están documentados en español.

import { fetchFromApi, productUnderStock, countFromApi } from './data-manager.js';

// Helpers de DOM
const $ = (sel, ctx = document) => ctx.querySelector(sel);
const $$ = (sel, ctx = document) => Array.from(ctx.querySelectorAll(sel));

// Elementos clave del DOM (si no existen, el script no fallará)
const selectors = {
    welcomeTitle: '.welcome-alert h2',
    alertText: '.welcome-alert .alert-content h3',
    alertButton: '.welcome-alert .alert-content a',
    cardGrid: '.dashboard-card-grid',
    cards: '.dashboard-card-grid .card',
    quickActionsList: '.quick-actions .list-action',
    recentActivitiesList: '.list-recent-activities',
};

// Estado de la UI: utilidades para mostrar carga y errores
function setLoading(el, isLoading) {
    if (!el) return;
    if (isLoading) el.classList.add('loading');
    else el.classList.remove('loading');
}

function setText(selector, text) {
    const el = $(selector);
    if (el) el.textContent = text;
}

// Renderizadores básicos
function renderAlert(count) {
    const alertTextEl = $(selectors.alertText);
    const alertBtn = $(selectors.alertButton);
    if (!alertTextEl || !alertBtn) return;

    if (count > 0) {
        alertTextEl.textContent = `¡Hay ${count} productos por agotarse!`;
        alertBtn.textContent = 'Ver productos';
        alertBtn.href = '#/inventario';
        alertBtn.style.display = 'inline-block';
    } else {
        alertTextEl.textContent = 'No hay productos con bajo stock.';
        alertBtn.style.display = 'none';
    }
}

// Se espera que las tarjetas sigan el orden en el HTML actual: productos, ventas, servicios
async function renderCards() {
    const cards = $$(selectors.cards);
    if (!cards.length) return;

    // Productos (card 0)
    try {
        setLoading(cards[0], true);
        const productos = await fetchFromApi('productos');
        const productCount = Array.isArray(productos) ? productos.length : (productos?.count ?? 0);
        const titleEl = $('h3', cards[0]);
        const valueEl = $('p', cards[0]);
        if (titleEl) titleEl.textContent = 'Productos en stock';
        if (valueEl) valueEl.childNodes[0] && (valueEl.childNodes[0].nodeValue = `${productCount} `);
    } catch (e) {
        console.error('Error cargando productos:', e);
    } finally {
        setLoading(cards[0], false);
    }

    // Ventas (card 1) — intento de cargar desde endpoint 'ventas' o mantener estático
    try {
        setLoading(cards[1], true);
        const ventas = await fetchFromApi('ventas').catch(() => null);
        const ventasText = ventas && ventas.total ? `\$${ventas.total}` : '$250.000';
        const titleEl = $('h3', cards[1]);
        const valueEl = $('p', cards[1]);
        if (titleEl) titleEl.textContent = 'Ventas recientes';
        if (valueEl) valueEl.textContent = ventasText;
    } catch (e) {
        console.error('Error cargando ventas:', e);
    } finally {
        setLoading(cards[1], false);
    }

    // Servicios (card 2)
    try {
        setLoading(cards[2], true);
        const servicios = await fetchFromApi('servicios').catch(() => null);
        const serviciosCount = Array.isArray(servicios) ? servicios.length : (servicios?.count ?? 3);
        const titleEl = $('h3', cards[2]);
        const valueEl = $('p', cards[2]);
        if (titleEl) titleEl.textContent = 'Servicios activos';
        if (valueEl) valueEl.childNodes[0] && (valueEl.childNodes[0].nodeValue = `${serviciosCount} `);
    } catch (e) {
        console.error('Error cargando servicios:', e);
    } finally {
        setLoading(cards[2], false);
    }
}

// Renderiza acciones rápidas: si las acciones deben obtenerse dinámicamente, se puede cambiar aquí
function bindQuickActions() {
    const list = $(selectors.quickActionsList);
    if (!list) return;

    // Delegación de eventos: si los botones existen, asigne acciones
    list.addEventListener('click', (ev) => {
        const li = ev.target.closest('li');
        if (!li) return;
        const text = li.textContent.trim();
        // Placeholder: implementar las acciones reales (modales, rutas, etc.)
        console.log('Acción rápida clicada:', text);
        // Aquí puede abrir un modal o navegar a la página correspondiente
    });
}

// Carga y render principal
async function init() {
    // Vincular acciones estáticas
    bindQuickActions();

    // Cargar conteo de productos por agotarse y renderizar alerta
    try {
        const under = await productUnderStock().catch(() => 0);
        renderAlert(under);
    } catch (e) {
        console.error('No se pudo calcular productos en bajo stock:', e);
    }

    // Cargar y renderizar tarjetas
    await renderCards();

    // Por defecto no cargamos actividades; si existe un endpoint 'actividades' podemos poblar la lista
    const activitiesEl = $(selectors.recentActivitiesList);
    if (activitiesEl) {
        try {
            const activities = await fetchFromApi('actividades').catch(() => null);
            if (Array.isArray(activities)) {
                activitiesEl.innerHTML = activities.map(a => `
          <li class="item-recent-activities">
            <img src="../assets/icons/checked.svg" class="checked" alt="ok">
            <div class="item-recent-activities-text"><p>${a.text}</p><time>${a.time || ''}</time></div>
          </li>
        `).join('');
            }
        } catch (e) {
            console.error('Error cargando actividades:', e);
        }
    }
}

// Inicializa cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', () => {
    init().catch(err => console.error('Error inicializando main.js', err));
});

// Export para pruebas si fuera necesario
export default { init };
