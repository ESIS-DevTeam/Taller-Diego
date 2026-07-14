/**
 * CAJA · Notas de pago — compras a proveedores y gastos del taller
 * con fecha límite y alertas de vencimiento.
 */
import { escapeHtml } from '../utils/sanitize.js';
import { showSuccess, showError, showWarning } from '../utils/notification.js';
import { apiCaja, formatCLP, formatFecha, fechaISO } from './api.js';

let filtro = 'todas';
// Notas con una acción en curso (evita doble clic en eliminar)
const accionesEnCurso = new Set();

const ESTADOS_NOTA = {
  vigente: { label: 'Vigente', clase: 'ot-badge-listo' },
  por_vencer: { label: 'Por vencer', clase: 'ot-badge-warning' },
  vencida: { label: 'Vencida', clase: 'estado-cancelado' },
  pagada: { label: 'Pagada', clase: 'estado-entregado' },
};

export async function initNotas(container) {
  container.innerHTML = `
  <div class="caja-notas">
    <div class="ot-page-header caja-header-row">
      <div>
        <h2>Notas de pago</h2>
        <p class="ot-subtitle">Pagos a proveedores y gastos del taller</p>
      </div>
      <button class="ot-btn ot-btn-primario" id="nota-nueva">+ Nueva nota</button>
    </div>

    <div class="ot-card ot-filtros-row">
      <div class="ot-filtros-botones caja-filtros-notas">
        <button class="ot-filtro activo" data-filtro="todas">Todas</button>
        <button class="ot-filtro" data-filtro="vigente">Vigentes</button>
        <button class="ot-filtro" data-filtro="por_vencer">Por vencer</button>
        <button class="ot-filtro" data-filtro="vencida">Vencidas</button>
        <button class="ot-filtro" data-filtro="pagada">Pagadas</button>
      </div>
    </div>

    <div class="ot-card per-tabla-card">
      <div class="caja-notas-head">
        <span>CONCEPTO</span><span>PROVEEDOR / GASTO</span><span>MONTO</span>
        <span>FECHA LÍMITE</span><span>ESTADO</span><span></span>
      </div>
      <div id="notas-body"></div>
    </div>

    <div id="notas-alertas"></div>
  </div>`;

  filtro = 'todas';
  container.querySelector('#nota-nueva').addEventListener('click', abrirModalNueva);
  container.querySelectorAll('.ot-filtro').forEach(btn => {
    btn.addEventListener('click', () => {
      container.querySelectorAll('.ot-filtro').forEach(b => b.classList.remove('activo'));
      btn.classList.add('activo');
      filtro = btn.dataset.filtro;
      cargar();
    });
  });

  await cargar();
}

async function cargar() {
  const body = document.getElementById('notas-body');
  const alertas = document.getElementById('notas-alertas');
  try {
    const data = await apiCaja(`/notas?estado=${filtro}`);
    renderNotas(body, data.notas);
    alertas.innerHTML = data.alertas.mensaje ? `
      <div class="ot-banner caja-banner-alerta">
        <span class="ot-banner-dot"></span>
        <div>
          <strong>${escapeHtml(data.alertas.mensaje)}</strong>
          <p>Revisa las fechas límite para evitar atrasos con tus proveedores.</p>
        </div>
      </div>` : '';
  } catch (e) {
    showError('Error al cargar las notas de pago');
  }
}

function renderNotas(body, notas) {
  if (notas.length === 0) {
    body.innerHTML = `<div class="ot-vacio"><p>No hay notas ${filtro === 'todas' ? 'registradas' : 'en este estado'}.</p>
      <small>Registra compras a proveedores o gastos con “+ Nueva nota”.</small></div>`;
    return;
  }

  body.innerHTML = notas.map(n => {
    const estado = ESTADOS_NOTA[n.estado_visual] || ESTADOS_NOTA.vigente;
    const vencida = n.estado_visual === 'vencida';
    return `
    <div class="caja-nota-fila" data-id="${escapeHtml(n.id)}">
      <div>
        <strong>${escapeHtml(n.concepto)}</strong>
        ${n.observacion ? `<small>${escapeHtml(n.observacion)}</small>` : ''}
      </div>
      <span>${escapeHtml(n.proveedor)} <small class="ot-chip-mini">${n.tipo === 'gasto' ? 'gasto' : 'compra'}</small></span>
      <strong>${escapeHtml(formatCLP(n.monto))}</strong>
      <span class="${vencida ? 'ot-rojo' : ''}">${escapeHtml(formatFecha(n.fecha_limite))}</span>
      <span><span class="ot-badge ${estado.clase}">● ${estado.label}</span></span>
      <div class="per-acciones">
        ${n.estado === 'pendiente' ? `
          <button class="ot-btn ot-btn-mini" data-accion="pagar">Marcar pagada</button>
          <button class="per-btn-icono per-btn-eliminar" data-accion="eliminar" title="Eliminar">🗑</button>`
        : `<small class="ot-chip-mini">pagada el ${escapeHtml(formatFecha(n.fecha_pago))}</small>`}
      </div>
    </div>`;
  }).join('');

  body.querySelectorAll('[data-accion]').forEach(el => {
    el.addEventListener('click', () => {
      const id = parseInt(el.closest('.caja-nota-fila').dataset.id, 10);
      if (el.dataset.accion === 'pagar') pagarNota(id);
      else eliminarNota(id);
    });
  });
}

async function pagarNota(id) {
  const modalContainer = document.getElementById('modal-container');
  modalContainer.innerHTML = `
  <div class="modal-overlay" id="nota-pagar-overlay">
    <div class="ot-modal">
      <h3>Marcar como pagada</h3>
      <p>El monto se registrará como <strong>egreso de hoy</strong> en el cierre de caja diario. Esta acción no se puede deshacer.</p>
      <div class="ot-modal-acciones">
        <button class="ot-btn ot-btn-secundario" id="nota-pagar-no">Cancelar</button>
        <button class="ot-btn ot-btn-primario" id="nota-pagar-si">Confirmar pago</button>
      </div>
    </div>
  </div>`;
  const cerrar = () => { modalContainer.innerHTML = ''; };
  document.getElementById('nota-pagar-no').addEventListener('click', cerrar);
  document.getElementById('nota-pagar-overlay').addEventListener('click', (e) => {
    if (e.target.id === 'nota-pagar-overlay') cerrar();
  });
  document.getElementById('nota-pagar-si').addEventListener('click', async (ev) => {
    const btn = ev.currentTarget;
    btn.disabled = true;
    btn.textContent = 'Procesando…';
    try {
      await apiCaja(`/notas/${id}/pagar`, { method: 'PATCH' });
      showSuccess('Nota pagada · registrada como egreso del día');
      cerrar();
      await cargar();
    } catch (e) {
      btn.disabled = false;
      btn.textContent = 'Confirmar pago';
      showError(e.detail || 'No se pudo pagar la nota');
    }
  });
}

async function eliminarNota(id) {
  if (accionesEnCurso.has(id)) return; // evitar doble clic
  accionesEnCurso.add(id);
  try {
    await apiCaja(`/notas/${id}`, { method: 'DELETE' });
    showSuccess('Nota eliminada');
    await cargar();
  } catch (e) {
    // Caso especial: nota pagada no se elimina (ya afectó la caja)
    showError(e.detail || 'No se pudo eliminar la nota');
  } finally {
    accionesEnCurso.delete(id);
  }
}

function abrirModalNueva() {
  const modalContainer = document.getElementById('modal-container');
  const manana = new Date();
  manana.setDate(manana.getDate() + 7);

  modalContainer.innerHTML = `
  <div class="modal-overlay" id="nota-overlay">
    <div class="ot-modal ot-modal-ancho">
      <h3>Nueva nota de pago</h3>
      <p class="ot-modal-sub">Registra una compra a proveedor o un gasto del taller con su fecha límite</p>

      <div class="ot-grid-2">
        <div class="ot-field"><label>Concepto <span class="ot-req">*</span></label>
          <input type="text" id="nota-concepto" placeholder="Ej. Compra de aceites 10W-40"></div>
        <div class="ot-field"><label>Proveedor / origen <span class="ot-req">*</span></label>
          <input type="text" id="nota-proveedor" placeholder="Ej. Distribuidora Sur"></div>
      </div>
      <div class="ot-grid-3">
        <div class="ot-field"><label>Tipo</label>
          <select id="nota-tipo">
            <option value="compra">Compra a proveedor</option>
            <option value="gasto">Gasto del taller</option>
          </select></div>
        <div class="ot-field"><label>Monto (CLP) <span class="ot-req">*</span></label>
          <input type="number" id="nota-monto" min="1" step="1000" placeholder="95000"></div>
        <div class="ot-field"><label>Fecha límite <span class="ot-req">*</span></label>
          <input type="date" id="nota-limite" value="${fechaISO(manana)}"></div>
      </div>
      <div class="ot-field"><label>Observación <small>(opcional)</small></label>
        <input type="text" id="nota-obs" placeholder="Detalle adicional"></div>

      <div class="ot-modal-acciones">
        <button class="ot-btn ot-btn-secundario" id="nota-cancelar">Cancelar</button>
        <button class="ot-btn ot-btn-primario" id="nota-guardar">Registrar nota</button>
      </div>
    </div>
  </div>`;

  const cerrar = () => { modalContainer.innerHTML = ''; };
  document.getElementById('nota-cancelar').addEventListener('click', cerrar);
  document.getElementById('nota-overlay').addEventListener('click', (e) => {
    if (e.target.id === 'nota-overlay') cerrar();
  });
  document.getElementById('nota-guardar').addEventListener('click', async (ev) => {
    const datos = {
      concepto: document.getElementById('nota-concepto').value.trim(),
      proveedor: document.getElementById('nota-proveedor').value.trim(),
      tipo: document.getElementById('nota-tipo').value,
      monto: parseInt(document.getElementById('nota-monto').value, 10) || 0,
      fecha_limite: document.getElementById('nota-limite').value,
      observacion: document.getElementById('nota-obs').value.trim() || null,
    };
    if (!datos.concepto) { showWarning('El concepto es obligatorio'); return; }
    if (!datos.proveedor) { showWarning('El proveedor u origen es obligatorio'); return; }
    if (datos.monto <= 0) { showWarning('Ingresa un monto válido'); return; }
    if (!datos.fecha_limite) { showWarning('La fecha límite es obligatoria'); return; }

    const btn = ev.currentTarget;
    btn.disabled = true;
    btn.textContent = 'Registrando…';
    try {
      await apiCaja('/notas', { method: 'POST', body: datos });
      showSuccess('Nota de pago registrada');
      cerrar();
      await cargar();
    } catch (e) {
      btn.disabled = false;
      btn.textContent = 'Registrar nota';
      showError(e.detail || 'No se pudo registrar la nota');
    }
  });
}
