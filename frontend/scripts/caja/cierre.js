/**
 * CAJA · Cierre diario — ingresos, egresos y balance del día,
 * explicado línea por línea para que cuadrar la caja sea simple.
 */
import { escapeHtml } from '../utils/sanitize.js';
import { showError } from '../utils/notification.js';
import { apiCaja, formatCLP, fechaISO, fechaLarga } from './api.js';

export async function initCierre(container) {
  container.innerHTML = `
  <div class="caja-cierre">
    <div class="ot-page-header caja-header-row">
      <div>
        <h2>Cierre de caja diario</h2>
        <p class="ot-subtitle" id="cierre-subtitulo">${escapeHtml(fechaLarga())}</p>
      </div>
      <input type="date" id="cierre-fecha" class="caja-fecha-input" value="${fechaISO()}">
    </div>
    <div id="cierre-cuerpo"><p>Calculando el día…</p></div>
  </div>`;

  const inputFecha = container.querySelector('#cierre-fecha');
  inputFecha.addEventListener('change', () => cargar(inputFecha.value));
  await cargar(fechaISO());
}

async function cargar(fecha) {
  const cuerpo = document.getElementById('cierre-cuerpo');
  const subtitulo = document.getElementById('cierre-subtitulo');
  try {
    const c = await apiCaja(`/cierre?fecha=${fecha}`);
    subtitulo.textContent = fechaLarga(new Date(`${fecha}T12:00:00`));
    cuerpo.innerHTML = render(c);
  } catch (e) {
    showError(e.detail || 'Error al cargar el cierre de caja');
    cuerpo.innerHTML = '<div class="ot-card ot-vacio"><p>No se pudo calcular el cierre.</p></div>';
  }
}

function filaDesglose(l) {
  return `
    <div class="caja-linea">
      <span>${escapeHtml(l.etiqueta)}${l.cantidad ? ` <small>(${escapeHtml(l.cantidad)})</small>` : ''}</span>
      <strong>${escapeHtml(formatCLP(l.monto))}</strong>
    </div>`;
}

function render(c) {
  const sinMovimientos = c.total_ingresos === 0 && c.total_egresos === 0;

  return `
  <div class="caja-tarjetas">
    <div class="ot-card caja-tarjeta">
      <span class="caja-tarjeta-titulo caja-punto-verde">INGRESOS <small>— dinero que ENTRÓ</small></span>
      <strong class="caja-monto ot-verde">${escapeHtml(formatCLP(c.total_ingresos))}</strong>
      <small>${escapeHtml(c.num_ventas)} venta${c.num_ventas === 1 ? '' : 's'} · ${escapeHtml(c.num_servicios_cobrados)} cobro${c.num_servicios_cobrados === 1 ? '' : 's'} de servicio</small>
    </div>
    <div class="ot-card caja-tarjeta">
      <span class="caja-tarjeta-titulo caja-punto-rojo">EGRESOS <small>— dinero que SALIÓ</small></span>
      <strong class="caja-monto ot-rojo">${escapeHtml(formatCLP(c.total_egresos))}</strong>
      <small>${escapeHtml(c.num_compras)} compra${c.num_compras === 1 ? '' : 's'} · ${escapeHtml(c.num_gastos)} gasto${c.num_gastos === 1 ? '' : 's'}</small>
    </div>
    <div class="ot-card caja-tarjeta caja-tarjeta-balance">
      <span class="caja-tarjeta-titulo caja-punto-azul">BALANCE DEL DÍA</span>
      <strong class="caja-monto ${c.balance >= 0 ? '' : 'ot-rojo'}">${escapeHtml(formatCLP(c.balance))}</strong>
      <small>ingresos − egresos${c.balance < 0 ? ' · hoy salió más de lo que entró' : ''}</small>
    </div>
  </div>

  ${sinMovimientos ? `
  <div class="ot-card ot-vacio">
    <p>Sin movimientos este día.</p>
    <small>Las ventas, cobros de servicios y pagos de notas aparecerán aquí automáticamente.</small>
  </div>` : `
  <div class="caja-dos-columnas">
    <div class="ot-card">
      <div class="ot-seccion-titulo"><h3>Ingresos del día</h3></div>
      ${c.ingresos.map(filaDesglose).join('')}
      <div class="caja-linea caja-linea-total">
        <span>Total ingresos</span>
        <strong class="ot-verde">${escapeHtml(formatCLP(c.total_ingresos))}</strong>
      </div>
      <div class="caja-metodos">
        <span class="ot-chip">Efectivo de servicios: ${escapeHtml(formatCLP(c.cobros_efectivo))}</span>
        <span class="ot-chip">Tarjeta de servicios: ${escapeHtml(formatCLP(c.cobros_tarjeta))}</span>
      </div>
    </div>
    <div class="ot-card">
      <div class="ot-seccion-titulo"><h3>Egresos del día</h3></div>
      ${c.egresos.map(filaDesglose).join('')}
      <div class="caja-linea caja-linea-total">
        <span>Total egresos</span>
        <strong class="ot-rojo">${escapeHtml(formatCLP(c.total_egresos))}</strong>
      </div>
      <p class="caja-nota-pie">Los egresos salen de las notas de pago marcadas como pagadas este día.</p>
    </div>
  </div>`}

  <div class="ot-banner ot-banner-info caja-banner-explicacion">
    <span class="ot-banner-dot"></span>
    <div>
      <strong>¿Cómo se calcula?</strong>
      <p>Ingresos = ventas de productos + cobros de servicios (abonos y pagos de órdenes).
      Egresos = notas de pago pagadas hoy (compras a proveedores y gastos del taller).
      El balance es la diferencia: es lo que debería reflejar tu caja al final del día.</p>
    </div>
  </div>`;
}
