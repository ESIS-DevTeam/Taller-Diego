/**
 * Cliente HTTP del módulo CAJA (usa token fresco con auto-renovación).
 */
import { getValidToken } from '../utils/store/manager-key.js';
import { API_BASE_URL } from '../orden/format.js';

export { formatCLP, formatFecha, formatHora } from '../orden/format.js';

export async function apiCaja(path, options = {}) {
  const token = await getValidToken();
  const method = options.method || 'GET';

  // Evitar que el navegador sirva datos viejos desde su caché HTTP.
  // Sin esto, lo que cambia en otros módulos (entregas con deuda, ventas
  // de productos, cobros) tardaba en reflejarse en cierre, deudores y
  // reportes porque el GET devolvía la respuesta cacheada.
  let url = `${API_BASE_URL}/caja${path}`;
  if (method === 'GET') {
    const sep = url.includes('?') ? '&' : '?';
    url += `${sep}_t=${Date.now()}`;
  }

  const response = await fetch(url, {
    method,
    cache: 'no-store',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': token ? `Bearer ${token}` : '',
      'Cache-Control': 'no-cache',
    },
    body: options.body ? JSON.stringify(options.body) : undefined,
  });
  if (!response.ok) {
    let detail = null;
    try { detail = (await response.json())?.detail; } catch (e) { /* sin json */ }
    const error = new Error(detail || `Error HTTP: ${response.status}`);
    error.status = response.status;
    error.detail = detail;
    throw error;
  }
  return response.status === 204 ? null : response.json();
}

/** Fecha local en formato YYYY-MM-DD (para query params). */
export function fechaISO(d = new Date()) {
  const anio = d.getFullYear();
  const mes = String(d.getMonth() + 1).padStart(2, '0');
  const dia = String(d.getDate()).padStart(2, '0');
  return `${anio}-${mes}-${dia}`;
}

/** "Sábado 05 de julio, 2026" para títulos amigables. */
export function fechaLarga(d = new Date()) {
  const txt = d.toLocaleDateString('es-CL', {
    weekday: 'long', day: '2-digit', month: 'long', year: 'numeric',
  });
  return txt.charAt(0).toUpperCase() + txt.slice(1);
}
