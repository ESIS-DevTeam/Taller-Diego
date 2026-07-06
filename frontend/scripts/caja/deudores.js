/**
 * CAJA · Clientes deudores — saldos pendientes de vehículos entregados
 * con deuda. Permite registrar el pago de la deuda (desaparece al saldar).
 */
import { escapeHtml } from '../utils/sanitize.js';
import { showSuccess, showError, showWarning } from '../utils/notification.js';
import { apiCaja, formatCLP, formatFecha } from './api.js';
import { apiOrden } from '../orden/format.js';

export async function initDeudores(container) {
  container.innerHTML = `
  <div class="caja-deudores">
    <div class="ot-page-header">
      <h2>Clientes deudores</h2>
      <p class="ot-subtitle">Saldos pendientes de vehículos entregados con deuda</p>
    </div>
    <div id="deu-cuerpo"><p>Cargando deudores…</p></div>
  </div>`;

  await cargar();
}

async function cargar() {
  const cuerpo = document.getElementById('deu-cuerpo');
  try {
    const data = await apiCaja('/deudores');
    cuerpo.innerHTML = render(data);
    conectarAcciones(cuerpo, data);
  } catch (e) {
    showError('Error al cargar los deudores');
    cuerpo.innerHTML = '<div class="ot-card ot-vacio"><p>No se pudo cargar la lista.</p></div>';
  }
}

function iniciales(nombre) {
  const partes = (nombre || '?').split(/\s+/);
  return `${partes[0]?.[0] || ''}${partes[1]?.[0] || ''}`.toUpperCase();
}

function render(data) {
  return `
  <div class="caja-tarjetas">
    <div class="ot-card caja-tarjeta">
      <span class="caja-tarjeta-titulo caja-punto-rojo">TOTAL ADEUDADO</span>
      <strong class="caja-monto ot-rojo">${escapeHtml(formatCLP(data.total_adeudado))}</strong>
      <small>dinero por cobrar</small>
    </div>
    <div class="ot-card caja-tarjeta">
      <span class="caja-tarjeta-titulo caja-punto-amarillo">CLIENTES CON DEUDA</span>
      <strong class="caja-monto">${escapeHtml(data.clientes_con_deuda)}</strong>
      <small>clientes</small>
    </div>
    <div class="ot-card caja-tarjeta">
      <span class="caja-tarjeta-titulo caja-punto-rojo">DEUDAS VENCIDAS</span>
      <strong class="caja-monto ot-rojo">${escapeHtml(data.deudas_vencidas)}</strong>
      <small>pasaron la fecha límite (7 días tras la entrega)</small>
    </div>
  </div>

  ${data.deudores.length === 0 ? `
  <div class="ot-card ot-vacio">
    <p>No hay clientes con deudas pendientes. 🎉</p>
    <small>Cuando un vehículo se entregue con saldo pendiente aparecerá aquí.</small>
  </div>` : `
  <div class="ot-card per-tabla-card">
    <div class="caja-deu-head">
      <span>CLIENTE</span><span>CONTACTO</span><span>MONTO ADEUDADO</span>
      <span>VENCIMIENTO</span><span>ESTADO</span><span></span>
    </div>
    ${data.deudores.map(d => `
    <div class="caja-deu-fila" data-orden="${escapeHtml(d.orden_id)}">
      <div class="per-mecanico">
        <span class="per-avatar">${escapeHtml(iniciales(d.cliente_nombre))}</span>
        <div>
          <strong>${escapeHtml(d.cliente_nombre)}</strong>
          <small>${escapeHtml(d.placa)} · ${escapeHtml(d.codigo)}</small>
        </div>
      </div>
      <span>${escapeHtml(d.cliente_celular)}</span>
      <strong class="ot-rojo">${escapeHtml(formatCLP(d.monto_adeudado))}</strong>
      <span class="${d.estado === 'vencida' ? 'ot-rojo' : ''}">${escapeHtml(formatFecha(d.fecha_vencimiento))}</span>
      <span><span class="ot-badge ${d.estado === 'vencida' ? 'estado-cancelado' : 'ot-badge-warning'}">● ${d.estado === 'vencida' ? 'Vencida' : 'Pendiente'}</span></span>
      <div class="per-acciones">
        <button class="ot-btn ot-btn-primario ot-btn-mini-alto" data-accion="cobrar">Registrar pago</button>
      </div>
    </div>`).join('')}
  </div>

  <div class="ot-banner ot-banner-info caja-banner-explicacion">
    <span class="ot-banner-dot"></span>
    <div>
      <strong>¿Cómo funciona?</strong>
      <p>Cada deuda viene de un vehículo entregado sin pagar el total. El vencimiento es 7 días
      después de la entrega. Al registrar el pago completo, el cliente sale de esta lista
      automáticamente y el cobro entra al cierre de caja del día.</p>
    </div>
  </div>`}`;
}

function conectarAcciones(cuerpo, data) {
  cuerpo.querySelectorAll('[data-accion="cobrar"]').forEach(btn => {
    btn.addEventListener('click', () => {
      const ordenId = parseInt(btn.closest('.caja-deu-fila').dataset.orden, 10);
      const deudor = data.deudores.find(d => d.orden_id === ordenId);
      if (deudor) abrirModalCobro(deudor);
    });
  });
}

function abrirModalCobro(d) {
  const modalContainer = document.getElementById('modal-container');
  modalContainer.innerHTML = `
  <div class="modal-overlay" id="deu-overlay">
    <div class="ot-modal">
      <h3>Registrar pago de deuda</h3>
      <p class="ot-modal-sub">${escapeHtml(d.cliente_nombre)} · ${escapeHtml(d.placa)} · ${escapeHtml(d.codigo)}</p>

      <div class="ot-totales-row ot-totales-warning">
        <div><span>DEUDA ACTUAL</span><strong class="ot-rojo">${escapeHtml(formatCLP(d.monto_adeudado))}</strong></div>
      </div>

      <div class="ot-agregar-row">
        <input type="number" id="deu-monto" min="1" max="${escapeHtml(d.monto_adeudado)}"
               value="${escapeHtml(d.monto_adeudado)}" placeholder="Monto a cobrar">
        <select id="deu-metodo">
          <option value="efectivo">Efectivo</option>
          <option value="tarjeta">Tarjeta</option>
        </select>
      </div>
      <small class="ot-chip-mini">Puede pagar una parte: el saldo restante seguirá apareciendo como deuda.</small>

      <div class="ot-modal-acciones">
        <button class="ot-btn ot-btn-secundario" id="deu-cancelar">Cancelar</button>
        <button class="ot-btn ot-btn-primario" id="deu-cobrar">Registrar pago</button>
      </div>
    </div>
  </div>`;

  const cerrar = () => { modalContainer.innerHTML = ''; };
  document.getElementById('deu-cancelar').addEventListener('click', cerrar);
  document.getElementById('deu-overlay').addEventListener('click', (e) => {
    if (e.target.id === 'deu-overlay') cerrar();
  });

  document.getElementById('deu-cobrar').addEventListener('click', async () => {
    const monto = parseInt(document.getElementById('deu-monto').value, 10) || 0;
    const metodo = document.getElementById('deu-metodo').value;
    if (monto <= 0) { showWarning('Ingresa el monto a cobrar'); return; }
    if (monto > d.monto_adeudado) {
      showWarning(`El monto excede la deuda (${formatCLP(d.monto_adeudado)})`); return;
    }

    try {
      const orden = await apiOrden(`/${d.orden_id}/pagos`, {
        method: 'POST',
        body: { monto, metodo },
      });
      showSuccess(orden.saldo > 0
        ? `Pago de ${formatCLP(monto)} registrado · queda deuda de ${formatCLP(orden.saldo)}`
        : `Deuda saldada · ${d.cliente_nombre} ya no aparece como deudor`);
      cerrar();
      await cargar();
    } catch (e) {
      showError(e.detail || 'No se pudo registrar el pago');
    }
  });
}
