/**
 * CAJA · Reportes de ventas — ingresos por período (productos vs servicios).
 * Incluye un gráfico de barras apiladas y un "Resumen simple" en lenguaje
 * claro para el cliente (mejor día, proporción, promedio y comparación).
 * Paleta validada (CVD y contraste): productos #3d6fb5 · servicios #0d9668.
 */
import { escapeHtml } from '../utils/sanitize.js';
import { showError } from '../utils/notification.js';
import { apiCaja, formatCLP, fechaISO } from './api.js';

const COLOR_PRODUCTOS = '#3d6fb5';
const COLOR_SERVICIOS = '#0d9668';

let modo = 'semana';

export async function initReportes(container) {
  modo = 'semana';
  container.innerHTML = `
  <div class="caja-reportes">
    <div class="ot-page-header">
      <h2>Reportes de ventas</h2>
      <p class="ot-subtitle">Ingresos por período · productos vs. servicios</p>
    </div>

    <div class="ot-card ot-filtros-row caja-reporte-filtros">
      <div class="ot-filtros-botones">
        <button class="ot-filtro" data-modo="dia">Día</button>
        <button class="ot-filtro activo" data-modo="semana">Semana</button>
        <button class="ot-filtro" data-modo="mes">Mes</button>
      </div>
      <div class="caja-rango">
        <input type="date" id="rep-desde" class="caja-fecha-input">
        <span>—</span>
        <input type="date" id="rep-hasta" class="caja-fecha-input">
        <button class="ot-btn ot-btn-secundario" id="rep-aplicar">Aplicar</button>
      </div>
    </div>

    <div id="rep-cuerpo"><p>Generando reporte…</p></div>
  </div>`;

  // Rango por defecto: la semana actual (lunes a hoy→domingo)
  aplicarRangoPorDefecto();

  container.querySelectorAll('[data-modo]').forEach(btn => {
    btn.addEventListener('click', () => {
      container.querySelectorAll('[data-modo]').forEach(b => b.classList.remove('activo'));
      btn.classList.add('activo');
      modo = btn.dataset.modo;
      aplicarRangoPorDefecto();
      cargar();
    });
  });
  container.querySelector('#rep-aplicar').addEventListener('click', cargar);

  await cargar();
}

function aplicarRangoPorDefecto() {
  const hoy = new Date();
  let desde = new Date(hoy);
  let hasta = new Date(hoy);
  if (modo === 'dia') {
    desde.setDate(hoy.getDate() - 6); // últimos 7 días
  } else if (modo === 'semana') {
    desde.setDate(hoy.getDate() - 7 * 5 + 1); // últimas ~6 semanas
  } else {
    desde = new Date(hoy.getFullYear(), hoy.getMonth() - 5, 1); // últimos 6 meses
  }
  document.getElementById('rep-desde').value = fechaISO(desde);
  document.getElementById('rep-hasta').value = fechaISO(hasta);
}

async function cargar() {
  const cuerpo = document.getElementById('rep-cuerpo');
  const desde = document.getElementById('rep-desde').value;
  const hasta = document.getElementById('rep-hasta').value;
  if (!desde || !hasta) return;

  try {
    const agrupar = modo;
    const rep = await apiCaja(`/reporte-ventas?desde=${desde}&hasta=${hasta}&agrupar=${agrupar}`);
    cuerpo.innerHTML = render(rep);
    activarTooltips(cuerpo);
  } catch (e) {
    showError(e.detail || 'No se pudo generar el reporte');
    cuerpo.innerHTML = '<div class="ot-card ot-vacio"><p>No se pudo generar el reporte.</p></div>';
  }
}

// ---------- Gráfico SVG de barras apiladas ----------

function renderGrafico(rep) {
  const puntos = rep.puntos;
  if (puntos.length === 0 || rep.total_general === 0) {
    return `<div class="ot-vacio"><p>Sin ventas en este período.</p>
      <small>Cuando registres ventas o cobros aparecerán en el gráfico.</small></div>`;
  }

  const ancho = 720, alto = 240, margenInf = 28, margenSup = 12;
  const areaAlto = alto - margenInf - margenSup;
  const max = Math.max(...puntos.map(p => p.total), 1);
  const paso = ancho / puntos.length;
  const barraAncho = Math.min(44, paso * 0.55);

  const barras = puntos.map((p, i) => {
    const x = i * paso + (paso - barraAncho) / 2;
    const hProd = (p.productos / max) * areaAlto;
    const hServ = (p.servicios / max) * areaAlto;
    const yServ = margenSup + areaAlto - hServ - (hServ > 0 && hProd > 0 ? 2 : 0) - hProd;
    const yProd = margenSup + areaAlto - hProd;

    // Barra productos (base, extremo inferior recto, borde superior redondeado si no hay servicios encima)
    const rectProd = hProd > 0
      ? `<rect x="${x}" y="${yProd}" width="${barraAncho}" height="${hProd}" rx="${hServ > 0 ? 0 : 4}" fill="${COLOR_PRODUCTOS}"
          class="rep-barra" data-i="${i}" data-serie="Productos" data-valor="${p.productos}"/>`
      : '';
    // Barra servicios (encima, con separación de 2px y extremo redondeado)
    const rectServ = hServ > 0
      ? `<rect x="${x}" y="${yServ}" width="${barraAncho}" height="${hServ}" rx="4" fill="${COLOR_SERVICIOS}"
          class="rep-barra" data-i="${i}" data-serie="Servicios" data-valor="${p.servicios}"/>`
      : '';

    const etiqueta = `<text x="${x + barraAncho / 2}" y="${alto - 8}" text-anchor="middle" class="rep-eje">${escapeHtml(p.etiqueta)}</text>`;
    // Zona de hover más amplia que la barra
    const hit = `<rect x="${i * paso}" y="0" width="${paso}" height="${alto}" fill="transparent" class="rep-hit" data-i="${i}"/>`;
    return rectProd + rectServ + etiqueta + hit;
  }).join('');

  return `
  <div class="rep-grafico-head">
    <h3>Ventas ${modo === 'dia' ? 'por día' : modo === 'semana' ? 'por semana' : 'por mes'}</h3>
    <div class="rep-leyenda">
      <span><i style="background:${COLOR_PRODUCTOS}"></i> Productos</span>
      <span><i style="background:${COLOR_SERVICIOS}"></i> Servicios</span>
    </div>
  </div>
  <div class="rep-grafico-scroll">
    <svg viewBox="0 0 ${ancho} ${alto}" class="rep-svg" role="img"
         aria-label="Gráfico de ventas: productos y servicios por período">
      <line x1="0" y1="${margenSup + areaAlto}" x2="${ancho}" y2="${margenSup + areaAlto}" class="rep-baseline"/>
      ${barras}
    </svg>
    <div id="rep-tooltip" class="rep-tooltip" hidden></div>
  </div>`;
}

function activarTooltips(cuerpo) {
  const svg = cuerpo.querySelector('.rep-svg');
  const tooltip = cuerpo.querySelector('#rep-tooltip');
  if (!svg || !tooltip) return;

  const puntos = ultimoReporte?.puntos || [];

  svg.querySelectorAll('.rep-hit').forEach(hit => {
    hit.addEventListener('mousemove', (e) => {
      const p = puntos[parseInt(hit.dataset.i, 10)];
      if (!p) return;
      tooltip.innerHTML = `
        <strong>${escapeHtml(p.etiqueta)}</strong>
        <div><i style="background:${COLOR_PRODUCTOS}"></i> Productos <b>${escapeHtml(formatCLP(p.productos))}</b></div>
        <div><i style="background:${COLOR_SERVICIOS}"></i> Servicios <b>${escapeHtml(formatCLP(p.servicios))}</b></div>
        <div class="rep-tooltip-total">Total <b>${escapeHtml(formatCLP(p.total))}</b> · ${escapeHtml(p.transacciones)} transacc.</div>`;
      tooltip.hidden = false;
      const rect = svg.getBoundingClientRect();
      let x = e.clientX - rect.left + 14;
      if (x > rect.width - 190) x = e.clientX - rect.left - 195;
      tooltip.style.left = `${x}px`;
      tooltip.style.top = `${e.clientY - rect.top - 10}px`;
    });
    hit.addEventListener('mouseleave', () => { tooltip.hidden = true; });
  });
}

// ---------- Resumen simple (lenguaje claro para el cliente) ----------

function renderResumen(rep) {
  const r = rep.resumen;
  if (rep.total_general === 0) return '';

  return `
  <div class="ot-card rep-resumen">
    <div class="ot-seccion-titulo"><h3>Resumen simple de tu reporte</h3>
      <span class="ot-chip">en palabras</span></div>

    <div class="rep-resumen-grid">
      <div class="rep-resumen-item">
        <span class="rep-resumen-icono">📅</span>
        <div>
          <strong>${r.mejor_dia ? `Tu mejor ${modo === 'dia' ? 'día' : modo} fue ${escapeHtml(r.mejor_dia)}` : 'Aún sin mejor período'}</strong>
          <small>${r.mejor_dia ? `con ${escapeHtml(formatCLP(r.mejor_dia_monto))} en ventas` : ''}</small>
        </div>
      </div>
      <div class="rep-resumen-item">
        <span class="rep-resumen-icono">🧾</span>
        <div>
          <strong>Cada cliente gasta en promedio ${escapeHtml(formatCLP(r.promedio_por_transaccion))}</strong>
          <small>${escapeHtml(rep.total_transacciones)} transacciones en el período</small>
        </div>
      </div>
      ${r.comparacion_anterior ? `
      <div class="rep-resumen-item">
        <span class="rep-resumen-icono">${r.comparacion_anterior.startsWith('Subieron') ? '📈' : r.comparacion_anterior.startsWith('Bajaron') ? '📉' : '➖'}</span>
        <div>
          <strong>${escapeHtml(r.comparacion_anterior)}</strong>
          <small>comparado con los ${modo === 'dia' ? 'días' : modo === 'semana' ? 'semanas' : 'meses'} anteriores</small>
        </div>
      </div>` : ''}
    </div>

    <div class="rep-proporcion">
      <p>¿De dónde viene tu dinero?</p>
      <div class="rep-barra-doble">
        <div class="rep-barra-prod" style="width:${r.porcentaje_productos}%">
          ${r.porcentaje_productos >= 15 ? `${r.porcentaje_productos}%` : ''}
        </div>
        <div class="rep-barra-serv" style="width:${r.porcentaje_servicios}%">
          ${r.porcentaje_servicios >= 15 ? `${r.porcentaje_servicios}%` : ''}
        </div>
      </div>
      <div class="rep-proporcion-leyenda">
        <span><i style="background:${COLOR_PRODUCTOS}"></i> Venta de productos (${r.porcentaje_productos}%)</span>
        <span><i style="background:${COLOR_SERVICIOS}"></i> Servicios del taller (${r.porcentaje_servicios}%)</span>
      </div>
    </div>
  </div>`;
}

let ultimoReporte = null;

function render(rep) {
  ultimoReporte = rep;
  return `
  <div class="ot-card rep-grafico-card">
    ${renderGrafico(rep)}
  </div>

  <div class="caja-tarjetas">
    <div class="ot-card caja-tarjeta">
      <span class="caja-tarjeta-titulo"><i class="rep-punto" style="background:${COLOR_PRODUCTOS}"></i> PRODUCTOS</span>
      <strong class="caja-monto" style="color:${COLOR_PRODUCTOS}">${escapeHtml(formatCLP(rep.total_productos))}</strong>
      <small>venta directa en tienda</small>
    </div>
    <div class="ot-card caja-tarjeta">
      <span class="caja-tarjeta-titulo"><i class="rep-punto" style="background:${COLOR_SERVICIOS}"></i> SERVICIOS</span>
      <strong class="caja-monto" style="color:${COLOR_SERVICIOS}">${escapeHtml(formatCLP(rep.total_servicios))}</strong>
      <small>efectivo ${escapeHtml(formatCLP(rep.efectivo))} · tarjeta ${escapeHtml(formatCLP(rep.tarjeta))}</small>
    </div>
    <div class="ot-card caja-tarjeta caja-tarjeta-balance">
      <span class="caja-tarjeta-titulo">TOTAL DEL PERÍODO</span>
      <strong class="caja-monto">${escapeHtml(formatCLP(rep.total_general))}</strong>
      <small>${escapeHtml(rep.total_transacciones)} transacciones</small>
    </div>
  </div>

  ${renderResumen(rep)}`;
}
