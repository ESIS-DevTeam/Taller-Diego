/**
 * Sección "Revisados" — vehículos listos esperando el recojo del dueño.
 * Registrar recojo (con cobro de saldo o entrega con deuda) o volver a pendientes.
 */
import { escapeHtml } from '../utils/sanitize.js';
import { showSuccess, showError, showWarning } from '../utils/notification.js';
import { apiOrden, formatCLP, formatFecha, formatHora } from './format.js';

let ordenes = [];
let filtroPlaca = '';

export async function initRevisados(container) {
  container.innerHTML = `
  <div class="ot-revisados">
    <div class="ot-page-header">
      <h2>Revisados</h2>
      <p class="ot-subtitle">Vehículos listos · esperando recojo del dueño</p>
    </div>

    <div class="ot-card ot-filtros-row">
      <input type="text" id="rev-buscar" placeholder="Buscar por placa…" autocomplete="off">
      <span class="ot-badge ot-badge-listo" id="rev-contador"></span>
    </div>

    <div id="rev-lista"></div>
  </div>`;

  container.querySelector('#rev-buscar').addEventListener('input', (e) => {
    filtroPlaca = e.target.value.trim().toUpperCase();
    renderLista();
  });

  await recargar();
}

async function recargar() {
  try {
    ordenes = await apiOrden('/?estado=listo');
    document.getElementById('rev-contador').textContent =
      `${ordenes.length} esperando recojo`;
    renderLista();
  } catch (e) {
    showError('Error al cargar los vehículos revisados');
  }
}

function esHoy(fecha) {
  const d = new Date(fecha);
  const hoy = new Date();
  return d.toDateString() === hoy.toDateString();
}

function renderLista() {
  const cont = document.getElementById('rev-lista');
  let filtradas = ordenes;
  if (filtroPlaca) filtradas = filtradas.filter(o => (o.vehiculo?.placa || '').includes(filtroPlaca));

  if (filtradas.length === 0) {
    cont.innerHTML = `<div class="ot-card ot-vacio">
      <p>No hay vehículos esperando recojo${filtroPlaca ? ` con placa "${escapeHtml(filtroPlaca)}"` : ''}.</p>
      <small>Cuando valides un trabajo en <em>Trabajos pendientes</em> aparecerá aquí.</small>
    </div>`;
    return;
  }

  cont.innerHTML = filtradas.map(o => renderOrden(o)).join('');
  configurarAcciones(cont);
}

function renderOrden(o) {
  const cliente = o.vehiculo?.cliente || {};
  const listoDesde = o.fecha_listo
    ? `${esHoy(o.fecha_listo) ? 'Hoy' : formatFecha(o.fecha_listo)} · ${formatHora(o.fecha_listo)}`
    : '—';

  const pagoBadge = o.saldo > 0
    ? `<span class="ot-badge ot-badge-warning">● SALDO ${escapeHtml(formatCLP(o.saldo))}</span>`
    : '<span class="ot-badge ot-badge-listo">● PAGADO COMPLETO</span>';

  return `
  <div class="ot-card ot-revisado" data-id="${escapeHtml(o.id)}">
    <div class="ot-trabajo-head">
      <span class="ot-placa-mini">${escapeHtml(o.vehiculo?.placa || '—')}</span>
      <div class="ot-trabajo-titulo">
        <strong>${escapeHtml(o.vehiculo?.modelo || 'Modelo sin registrar')}${o.vehiculo?.anio ? ' ' + escapeHtml(o.vehiculo.anio) : ''}</strong>
        <small>${escapeHtml(cliente.nombre || '—')} · ${escapeHtml(cliente.celular || '—')}</small>
      </div>
      <div class="ot-listo-desde">
        <span>LISTO DESDE (AUTO)</span>
        <strong>${escapeHtml(listoDesde)}</strong>
      </div>
    </div>

    <div class="ot-trabajo-footer">
      <div class="ot-totales-row">
        <div><span>TOTAL</span><strong>${escapeHtml(formatCLP(o.total))}</strong></div>
        ${pagoBadge}
      </div>
      <div class="ot-trabajo-acciones">
        <button class="ot-btn ot-btn-secundario" data-accion="volver">Volver a pendientes</button>
        <button class="ot-btn ot-btn-primario" data-accion="recojo">Registrar recojo</button>
      </div>
    </div>
  </div>`;
}

function configurarAcciones(cont) {
  cont.querySelectorAll('.ot-revisado [data-accion]').forEach(btn => {
    btn.addEventListener('click', () => {
      const id = parseInt(btn.closest('.ot-revisado').dataset.id, 10);
      const orden = ordenes.find(o => o.id === id);
      if (!orden) return;
      if (btn.dataset.accion === 'volver') volverAPendientes(orden);
      else registrarRecojo(orden);
    });
  });
}

async function volverAPendientes(orden) {
  try {
    await apiOrden(`/${orden.id}/estado`, { method: 'PATCH', body: { estado: 'en_proceso' } });
    showSuccess(`${orden.vehiculo.placa} de vuelta en Trabajos pendientes`);
    await recargar();
  } catch (e) {
    showError(e.detail || 'No se pudo mover a pendientes');
  }
}

async function registrarRecojo(orden) {
  // Caso simple: sin saldo → entregar directo
  if (orden.saldo <= 0) {
    try {
      await apiOrden(`/${orden.id}/estado`, { method: 'PATCH', body: { estado: 'entregado' } });
      showSuccess(`${orden.vehiculo.placa} entregado · registrado en el historial con fecha y hora`);
      await recargar();
    } catch (e) {
      showError(e.detail || 'No se pudo registrar el recojo');
    }
    return;
  }

  // Caso especial: tiene saldo pendiente → cobrar o entregar con deuda
  abrirModalSaldo(orden);
}

function abrirModalSaldo(orden) {
  const modalContainer = document.getElementById('modal-container');
  const cliente = orden.vehiculo?.cliente || {};

  modalContainer.innerHTML = `
  <div class="modal-overlay" id="ot-saldo-overlay">
    <div class="ot-modal">
      <div class="ot-modal-icono-warning">⚠</div>
      <h3>Este vehículo tiene saldo pendiente</h3>
      <p class="ot-modal-sub">${escapeHtml(orden.vehiculo?.placa || '')} · ${escapeHtml(cliente.nombre || '')} aún debe una parte del servicio.
      Puedes registrar el recojo igual o cobrar el saldo ahora.</p>

      <div class="ot-totales-row ot-totales-warning">
        <div><span>TOTAL</span><strong>${escapeHtml(formatCLP(orden.total))}</strong></div>
        <div><span>ABONADO</span><strong class="ot-verde">${escapeHtml(formatCLP(orden.abonado))}</strong></div>
        <div><span>SALDO</span><strong class="ot-rojo">${escapeHtml(formatCLP(orden.saldo))}</strong></div>
      </div>

      <div class="ot-agregar-row">
        <input type="number" id="saldo-monto" min="1" max="${escapeHtml(orden.saldo)}" value="${escapeHtml(orden.saldo)}">
        <select id="saldo-metodo">
          <option value="">Método (efectivo, tarjeta…)</option>
          <option value="efectivo">Efectivo</option>
          <option value="tarjeta">Tarjeta</option>
        </select>
      </div>

      <div class="ot-modal-acciones">
        <button class="ot-btn ot-btn-secundario" id="saldo-con-deuda">Entregar con deuda</button>
        <button class="ot-btn ot-btn-primario" id="saldo-cobrar">Cobrar saldo y entregar</button>
      </div>
    </div>
  </div>`;

  const cerrar = () => { modalContainer.innerHTML = ''; };
  document.getElementById('ot-saldo-overlay').addEventListener('click', (e) => {
    if (e.target.id === 'ot-saldo-overlay') cerrar();
  });

  // Entregar con deuda: queda registrado como deudor
  document.getElementById('saldo-con-deuda').addEventListener('click', async () => {
    try {
      await apiOrden(`/${orden.id}/estado`, {
        method: 'PATCH',
        body: { estado: 'entregado', entregar_con_deuda: true },
      });
      showSuccess(`${orden.vehiculo.placa} entregado con deuda de ${formatCLP(orden.saldo)} · quedará como cliente deudor`);
      cerrar();
      await recargar();
    } catch (e) {
      showError(e.detail || 'No se pudo entregar');
    }
  });

  // Cobrar (total o parcial) y entregar
  document.getElementById('saldo-cobrar').addEventListener('click', async () => {
    const monto = parseInt(document.getElementById('saldo-monto').value, 10) || 0;
    const metodo = document.getElementById('saldo-metodo').value;
    if (monto <= 0) { showWarning('Ingresa el monto a cobrar'); return; }
    if (monto > orden.saldo) { showWarning(`El monto excede el saldo (${formatCLP(orden.saldo)})`); return; }
    if (!metodo) { showWarning('Selecciona el método de pago'); return; }

    try {
      const actualizada = await apiOrden(`/${orden.id}/pagos`, {
        method: 'POST',
        body: { monto, metodo },
      });
      const quedaSaldo = actualizada.saldo > 0;
      await apiOrden(`/${orden.id}/estado`, {
        method: 'PATCH',
        body: { estado: 'entregado', entregar_con_deuda: quedaSaldo },
      });
      showSuccess(quedaSaldo
        ? `Abono de ${formatCLP(monto)} registrado · entregado con deuda de ${formatCLP(actualizada.saldo)}`
        : `Saldo cobrado (${formatCLP(monto)}) · ${orden.vehiculo.placa} entregado`);
      cerrar();
      await recargar();
    } catch (e) {
      showError(e.detail || 'No se pudo completar la operación');
    }
  });
}
