/**
 * Módulo PERSONAL — gestión de mecánicos del taller.
 * Alta, edición, activar/desactivar y eliminación con caso especial:
 * un mecánico con servicios registrados no se elimina, se desactiva.
 */
import { loadComponent } from './utils/component-loader.js';
import { showSuccess, showError, showWarning } from './utils/notification.js';
import { resetBodyDefaults } from './utils/state-manager.js';
import { escapeHtml } from './utils/sanitize.js';
import { getValidToken } from './utils/store/manager-key.js';

loadComponent("header", "includes/header.html");
loadComponent("side-bar-container", "includes/sidebar.html");

const API_BASE_URL = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
  ? 'http://localhost:8000/api/v1'
  : '/api/v1';

let mecanicos = [];
let filtroEstado = 'todos';
let filtroTexto = '';
// Mecánicos con un cambio en curso (evita doble clic en el switch)
const cambiosEnCurso = new Set();

document.addEventListener('DOMContentLoaded', async () => {
  resetBodyDefaults();
  renderLayout();
  await recargar();
});

async function api(path, options = {}) {
  const token = await getValidToken();
  const method = options.method || 'GET';

  // Evitar que el navegador sirva la lista vieja desde su caché HTTP.
  // Sin esto, tras editar o cambiar el estado la recarga mostraba el
  // valor anterior (el switch "se reactivaba solo", el cambio no se veía).
  let url = `${API_BASE_URL}/empleados${path}`;
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

function renderLayout() {
  document.getElementById('personal-content').innerHTML = `
    <div class="ot-page-header personal-header">
      <div>
        <h2>Personal</h2>
        <p class="ot-subtitle">Gestión de mecánicos del taller</p>
      </div>
      <button class="ot-btn ot-btn-primario" id="per-nuevo">+ Nuevo mecánico</button>
    </div>

    <div class="ot-card ot-filtros-row">
      <input type="text" id="per-buscar" placeholder="Buscar mecánico…" autocomplete="off">
      <div class="ot-filtros-botones">
        <button class="ot-filtro activo" data-filtro="todos">Todos</button>
        <button class="ot-filtro" data-filtro="activo">Activos</button>
        <button class="ot-filtro" data-filtro="inactivo">Inactivos</button>
      </div>
    </div>

    <div class="ot-card per-tabla-card">
      <div class="per-tabla-head">
        <span>MECÁNICO</span><span>ESPECIALIDAD</span><span>TELÉFONO</span>
        <span>CORREO</span><span>ESTADO</span><span>ACCIONES</span>
      </div>
      <div id="per-tabla-body"></div>
    </div>`;

  document.getElementById('per-nuevo').addEventListener('click', () => abrirModal());
  document.getElementById('per-buscar').addEventListener('input', (e) => {
    filtroTexto = e.target.value.trim().toLowerCase();
    renderTabla();
  });
  document.querySelectorAll('.ot-filtro').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.ot-filtro').forEach(b => b.classList.remove('activo'));
      btn.classList.add('activo');
      filtroEstado = btn.dataset.filtro;
      renderTabla();
    });
  });
}

async function recargar() {
  try {
    mecanicos = await api('/');
    renderTabla();
  } catch (e) {
    showError('Error al cargar el personal');
  }
}

function iniciales(m) {
  return `${(m.nombres || '?')[0] || ''}${(m.apellidos || '')[0] || ''}`.toUpperCase();
}

function renderTabla() {
  const body = document.getElementById('per-tabla-body');
  let lista = mecanicos;
  if (filtroEstado !== 'todos') {
    lista = lista.filter(m => (m.estado || '').toLowerCase() === filtroEstado);
  }
  if (filtroTexto) {
    lista = lista.filter(m =>
      `${m.nombres} ${m.apellidos}`.toLowerCase().includes(filtroTexto) ||
      (m.especialidad || '').toLowerCase().includes(filtroTexto));
  }

  if (lista.length === 0) {
    body.innerHTML = `<div class="ot-vacio"><p>No hay mecánicos ${filtroEstado !== 'todos' ? filtroEstado + 's' : 'registrados'}${filtroTexto ? ` que coincidan con "${escapeHtml(filtroTexto)}"` : ''}.</p>
      <small>Usa el botón “+ Nuevo mecánico” para registrar personal.</small></div>`;
    return;
  }

  body.innerHTML = lista.map(m => {
    const activo = (m.estado || '').toLowerCase() === 'activo';
    return `
    <div class="per-fila" data-id="${escapeHtml(m.id)}">
      <div class="per-mecanico">
        <span class="per-avatar ${activo ? '' : 'per-avatar-off'}">${escapeHtml(iniciales(m))}</span>
        <div>
          <strong>${escapeHtml(m.nombres)} ${escapeHtml(m.apellidos)}</strong>
          <small>${escapeHtml(m.documento || '—')}</small>
        </div>
      </div>
      <span>${escapeHtml(m.especialidad || '—')}</span>
      <span>${escapeHtml(m.telefono || '—')}</span>
      <span class="per-correo">${escapeHtml(m.correo || '—')}</span>
      <span><span class="ot-badge ${activo ? 'ot-badge-listo' : 'per-badge-inactivo'}">● ${activo ? 'Activo' : 'Inactivo'}</span></span>
      <div class="per-acciones">
        <button class="per-btn-icono" data-accion="editar" title="Editar">✎</button>
        <button class="per-btn-icono per-btn-eliminar" data-accion="eliminar" title="Eliminar">🗑</button>
        <label class="per-switch" title="${activo ? 'Desactivar' : 'Activar'}">
          <input type="checkbox" data-accion="toggle" ${activo ? 'checked' : ''}>
          <span class="per-slider"></span>
        </label>
      </div>
    </div>`;
  }).join('');

  body.querySelectorAll('[data-accion]').forEach(el => {
    const evento = el.dataset.accion === 'toggle' ? 'change' : 'click';
    el.addEventListener(evento, () => {
      const id = parseInt(el.closest('.per-fila').dataset.id, 10);
      const m = mecanicos.find(x => x.id === id);
      if (!m) return;
      if (el.dataset.accion === 'editar') abrirModal(m);
      else if (el.dataset.accion === 'eliminar') confirmarEliminar(m);
      else toggleEstado(m);
    });
  });
}

// ---------- Activar / desactivar ----------

async function toggleEstado(m) {
  // Evitar doble envío mientras el cambio está en curso
  if (cambiosEnCurso.has(m.id)) return;
  cambiosEnCurso.add(m.id);

  const anterior = m.estado;
  const nuevo = (m.estado || '').toLowerCase() === 'activo' ? 'inactivo' : 'activo';

  // OPTIMISTA: el badge (verde↔rojo) y el switch cambian al instante;
  // si el backend falla, se revierte.
  m.estado = nuevo;
  renderTabla();

  try {
    const actualizado = await api(`/${m.id}`, { method: 'PUT', body: { ...m } });
    Object.assign(m, actualizado); // dato autoritativo del servidor
    renderTabla();
    showSuccess(nuevo === 'inactivo'
      ? `${m.nombres} ${m.apellidos} quedó inactivo · no recibirá nuevas órdenes`
      : `${m.nombres} ${m.apellidos} quedó activo`);
  } catch (e) {
    m.estado = anterior; // revertir el switch y el badge
    renderTabla();
    showError(e.detail || 'No se pudo cambiar el estado');
  } finally {
    cambiosEnCurso.delete(m.id);
  }
}

// ---------- Modal nuevo / editar ----------

function abrirModal(m = null) {
  const modalContainer = document.getElementById('modal-container');
  const esEdicion = !!m;

  modalContainer.innerHTML = `
  <div class="modal-overlay" id="per-overlay">
    <div class="ot-modal ot-modal-ancho">
      <h3>${esEdicion ? 'Editar mecánico' : 'Nuevo mecánico'}</h3>
      <p class="ot-modal-sub">${esEdicion ? 'Modifica los datos del personal' : 'Registra un nuevo mecánico del taller'}</p>

      <div class="ot-grid-2">
        <div class="ot-field"><label>Nombres <span class="ot-req">*</span></label>
          <input type="text" id="per-nombres" value="${escapeHtml(m?.nombres || '')}" placeholder="Ej. Sebastián"></div>
        <div class="ot-field"><label>Apellidos <span class="ot-req">*</span></label>
          <input type="text" id="per-apellidos" value="${escapeHtml(m?.apellidos || '')}" placeholder="Ej. Tapia"></div>
      </div>
      <div class="ot-grid-2">
        <div class="ot-field"><label>Documento (RUT) <small>(opcional)</small></label>
          <input type="text" id="per-documento" value="${escapeHtml(m?.documento || '')}" placeholder="12.345.678-9"></div>
        <div class="ot-field"><label>Especialidad <span class="ot-req">*</span></label>
          <input type="text" id="per-especialidad" value="${escapeHtml(m?.especialidad || '')}" placeholder="Ej. Motor y suspensión"></div>
      </div>
      <div class="ot-grid-2">
        <div class="ot-field"><label>Teléfono <small>(opcional)</small></label>
          <input type="tel" id="per-telefono" value="${escapeHtml(m?.telefono || '')}" placeholder="911 222 333"></div>
        <div class="ot-field"><label>Correo <small>(opcional)</small></label>
          <input type="email" id="per-correo" value="${escapeHtml(m?.correo || '')}" placeholder="mecanico@correo.cl"></div>
      </div>
      <div class="ot-field"><label>Estado</label>
        <select id="per-estado">
          <option value="activo" ${(m?.estado || 'activo') === 'activo' ? 'selected' : ''}>Activo</option>
          <option value="inactivo" ${m?.estado === 'inactivo' ? 'selected' : ''}>Inactivo</option>
        </select>
      </div>

      <div class="ot-modal-acciones">
        <button class="ot-btn ot-btn-secundario" id="per-cancelar">Cancelar</button>
        <button class="ot-btn ot-btn-primario" id="per-guardar">${esEdicion ? 'Guardar cambios' : 'Registrar mecánico'}</button>
      </div>
    </div>
  </div>`;

  const cerrar = () => { modalContainer.innerHTML = ''; };
  document.getElementById('per-cancelar').addEventListener('click', cerrar);
  document.getElementById('per-overlay').addEventListener('click', (e) => {
    if (e.target.id === 'per-overlay') cerrar();
  });

  document.getElementById('per-guardar').addEventListener('click', async () => {
    const datos = {
      nombres: document.getElementById('per-nombres').value.trim(),
      apellidos: document.getElementById('per-apellidos').value.trim(),
      documento: document.getElementById('per-documento').value.trim() || null,
      especialidad: document.getElementById('per-especialidad').value.trim(),
      telefono: document.getElementById('per-telefono').value.trim() || null,
      correo: document.getElementById('per-correo').value.trim() || null,
      estado: document.getElementById('per-estado').value,
    };
    if (!datos.nombres) { showWarning('Los nombres son obligatorios'); return; }
    if (!datos.apellidos) { showWarning('Los apellidos son obligatorios'); return; }
    if (!datos.especialidad) { showWarning('La especialidad es obligatoria'); return; }
    if (datos.correo && !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(datos.correo)) {
      showWarning('El correo no tiene un formato válido'); return;
    }

    const btnGuardar = document.getElementById('per-guardar');
    btnGuardar.disabled = true;
    btnGuardar.textContent = esEdicion ? 'Guardando…' : 'Registrando…';
    try {
      if (esEdicion) {
        const actualizado = await api(`/${m.id}`, { method: 'PUT', body: datos });
        // Reflejar el cambio en memoria y en la tabla al instante
        Object.assign(m, actualizado);
        showSuccess('Mecánico actualizado');
      } else {
        const nuevo = await api('/', { method: 'POST', body: datos });
        mecanicos.push(nuevo);
        showSuccess(`${datos.nombres} ${datos.apellidos} registrado`);
      }
      cerrar();
      renderTabla();
    } catch (e) {
      btnGuardar.disabled = false;
      btnGuardar.textContent = esEdicion ? 'Guardar cambios' : 'Registrar mecánico';
      showError(e.detail || 'No se pudo guardar');
    }
  });
}

// ---------- Eliminar (con caso especial) ----------

function confirmarEliminar(m) {
  const modalContainer = document.getElementById('modal-container');
  modalContainer.innerHTML = `
  <div class="modal-overlay" id="per-del-overlay">
    <div class="ot-modal">
      <h3>Eliminar mecánico</h3>
      <p class="ot-modal-sub">${escapeHtml(m.nombres)} ${escapeHtml(m.apellidos)} · ${escapeHtml(m.especialidad || '')}</p>
      <p>Esta acción es permanente. Si el mecánico tiene servicios registrados,
      el sistema no permitirá eliminarlo para conservar el historial.</p>
      <div class="ot-modal-acciones">
        <button class="ot-btn ot-btn-secundario" id="per-del-no">Cancelar</button>
        <button class="ot-btn ot-btn-peligro" id="per-del-si">Eliminar</button>
      </div>
    </div>
  </div>`;

  const cerrar = () => { modalContainer.innerHTML = ''; };
  document.getElementById('per-del-no').addEventListener('click', cerrar);
  document.getElementById('per-del-overlay').addEventListener('click', (e) => {
    if (e.target.id === 'per-del-overlay') cerrar();
  });
  document.getElementById('per-del-si').addEventListener('click', async (ev) => {
    const btn = ev.currentTarget;
    btn.disabled = true;
    btn.textContent = 'Eliminando…';
    try {
      await api(`/${m.id}`, { method: 'DELETE' });
      // Quitar de la lista local al instante
      mecanicos = mecanicos.filter(x => x.id !== m.id);
      showSuccess(`${m.nombres} ${m.apellidos} eliminado`);
      cerrar();
      renderTabla();
    } catch (e) {
      cerrar();
      if (e.status === 409) {
        // Caso especial: tiene servicios → ofrecer desactivar
        ofrecerDesactivar(m, e.detail);
      } else {
        showError(e.detail || 'No se pudo eliminar');
      }
    }
  });
}

function ofrecerDesactivar(m, motivo) {
  const modalContainer = document.getElementById('modal-container');
  modalContainer.innerHTML = `
  <div class="modal-overlay" id="per-desact-overlay">
    <div class="ot-modal">
      <div class="ot-modal-icono-warning">⚠</div>
      <h3>No se puede eliminar</h3>
      <p class="ot-modal-sub">${escapeHtml(m.nombres)} ${escapeHtml(m.apellidos)}</p>
      <p>${escapeHtml(motivo || 'El mecánico tiene servicios registrados en el historial.')}</p>
      <div class="ot-modal-acciones">
        <button class="ot-btn ot-btn-secundario" id="per-desact-no">Entendido</button>
        ${(m.estado || '').toLowerCase() === 'activo'
          ? '<button class="ot-btn ot-btn-primario" id="per-desact-si">Desactivar mecánico</button>' : ''}
      </div>
    </div>
  </div>`;

  const cerrar = () => { modalContainer.innerHTML = ''; };
  document.getElementById('per-desact-no').addEventListener('click', cerrar);
  document.getElementById('per-desact-overlay').addEventListener('click', (e) => {
    if (e.target.id === 'per-desact-overlay') cerrar();
  });
  const btnSi = document.getElementById('per-desact-si');
  if (btnSi) {
    btnSi.addEventListener('click', async () => {
      cerrar();
      await toggleEstado(m);
    });
  }
}
