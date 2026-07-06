/**
 * Utilidades compartidas del módulo ORDEN: formato CLP, fechas y
 * cliente HTTP para el endpoint /ordenes-trabajo.
 */

/** Datos del taller que se imprimen en las proformas (editar aquí). */
export const DATOS_TALLER = {
  nombre: 'TALLER DE DIEGO',
  rubro: 'Mecánica automotriz · Repuestos y servicios',
  direccion: 'Av. Principal 1234, Arica · Chile',
  telefono: '+56 9 1234 5678',
  correo: 'contacto@tallerdediego.cl',
  web: 'www.tallerdediego.cl',
};

export const API_BASE_URL =
  window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
    ? 'http://localhost:8000/api/v1'
    : '/api/v1';

/**
 * Formatea un monto en pesos chilenos: 45000 → "$ 45.000"
 * @param {number} value
 * @returns {string}
 */
export function formatCLP(value) {
  const amount = Number(value) || 0;
  return `$ ${amount.toLocaleString('es-CL')}`;
}

/**
 * Formatea fecha corta: "05/07/2026"
 * @param {string|Date} value
 */
export function formatFecha(value) {
  if (!value) return '—';
  const d = new Date(value);
  if (isNaN(d)) return '—';
  return d.toLocaleDateString('es-CL', { day: '2-digit', month: '2-digit', year: 'numeric' });
}

/**
 * Formatea hora: "09:42 hrs"
 * @param {string|Date} value
 */
export function formatHora(value) {
  if (!value) return '—';
  const d = new Date(value);
  if (isNaN(d)) return '—';
  return `${d.toLocaleTimeString('es-CL', { hour: '2-digit', minute: '2-digit', hour12: false })} hrs`;
}

import { getValidToken } from '../utils/store/manager-key.js';

/**
 * Cliente HTTP del módulo ORDEN. Obtiene un token fresco en cada request
 * (se renueva automáticamente si está por expirar).
 * Lanza Error con `.status` y `.detail` si la respuesta no es 2xx.
 * @param {string} path - ruta relativa a /ordenes-trabajo (ej: '/', '/5/pagos')
 * @param {Object} [options] - { method, body }
 */
export async function apiOrden(path, options = {}) {
  const token = await getValidToken();
  const response = await fetch(`${API_BASE_URL}/ordenes-trabajo${path}`, {
    method: options.method || 'GET',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': token ? `Bearer ${token}` : '',
    },
    body: options.body ? JSON.stringify(options.body) : undefined,
  });

  if (!response.ok) {
    let detail = null;
    try {
      detail = (await response.json())?.detail;
    } catch (e) { /* respuesta sin JSON */ }
    const error = new Error(detail || `Error HTTP: ${response.status}`);
    error.status = response.status;
    error.detail = detail;
    throw error;
  }

  if (response.status === 204) return null;
  return response.json();
}

/** Etiquetas y colores de los estados de una orden de trabajo. */
export const ESTADOS_ORDEN = {
  en_proceso: { label: 'EN PROCESO', clase: 'estado-proceso' },
  esperando_repuestos: { label: 'ESPERANDO REPUESTOS', clase: 'estado-esperando' },
  listo: { label: 'LISTO', clase: 'estado-listo' },
  entregado: { label: 'ENTREGADO', clase: 'estado-entregado' },
  cancelado: { label: 'CANCELADO', clase: 'estado-cancelado' },
};
