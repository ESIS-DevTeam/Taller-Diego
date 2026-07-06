/**
 * Página imprimible de Proformas 1 y 2.
 * Lee ?id=<ordenId>&tipo=1|2, carga la orden y lanza window.print().
 *  - Proforma 1: diagnóstico inicial (datos mínimos del mecánico).
 *  - Proforma 2: detalle completo (servicios, repuestos, pagos y saldo).
 */
import { escapeHtml } from './utils/sanitize.js';
import { apiOrden, formatCLP, formatFecha, formatHora, DATOS_TALLER } from './orden/format.js';

const params = new URLSearchParams(window.location.search);
const ordenId = parseInt(params.get('id'), 10);
const tipo = params.get('tipo') === '2' ? 2 : 1;

document.addEventListener('DOMContentLoaded', async () => {
  const doc = document.getElementById('pf-documento');
  const titulo = document.getElementById('pf-toolbar-titulo');
  titulo.textContent = `Vista previa de impresión — Proforma ${tipo}`;

  document.getElementById('pf-imprimir').addEventListener('click', () => window.print());

  if (!ordenId) {
    doc.innerHTML = '<p class="pf-error">Falta el parámetro ?id de la orden.</p>';
    return;
  }

  try {
    const orden = await apiOrden(`/${ordenId}`);
    doc.innerHTML = tipo === 2 ? renderProforma2(orden) : renderProforma1(orden);
    document.title = `${codigoProforma(orden)} - Taller de Diego`;
    // Impresión automática al cargar
    setTimeout(() => window.print(), 400);
  } catch (e) {
    doc.innerHTML = `<p class="pf-error">No se pudo cargar la orden: ${escapeHtml(e.detail || e.message)}</p>`;
  }
});

function codigoProforma(orden) {
  return tipo === 2 ? orden.codigo.replace('PF1-', 'PF2-') : orden.codigo;
}

function cabecera(orden) {
  return `
  <header class="pf-header">
    <div class="pf-header-marca">
      <div class="pf-logo"></div>
      <div>
        <h1>${escapeHtml(DATOS_TALLER.nombre)}</h1>
        <p>${escapeHtml(DATOS_TALLER.rubro)}</p>
        <p>${escapeHtml(DATOS_TALLER.direccion)}</p>
      </div>
    </div>
    <div class="pf-header-contacto">
      <p>${escapeHtml(DATOS_TALLER.telefono)}</p>
      <p>${escapeHtml(DATOS_TALLER.correo)}</p>
      <p>${escapeHtml(DATOS_TALLER.web)}</p>
    </div>
  </header>`;
}

function bloqueTitulo(orden, subtitulo) {
  return `
  <div class="pf-titulo">
    <div>
      <h2>PROFORMA DE SERVICIO</h2>
      <p>${escapeHtml(subtitulo)}</p>
    </div>
    <div class="pf-codigo">
      <span>N° PROFORMA</span>
      <strong>${escapeHtml(codigoProforma(orden))}</strong>
    </div>
  </div>`;
}

function bloqueFecha(orden) {
  const mecanico = orden.mecanico
    ? `${orden.mecanico.nombres} ${orden.mecanico.apellidos} (Mecánico)`
    : '—';
  return `
  <div class="pf-fecha-row">
    <div><span>FECHA</span><strong>${escapeHtml(formatFecha(orden.fecha_ingreso))}</strong></div>
    <div><span>HORA</span><strong>${escapeHtml(formatHora(orden.fecha_ingreso))}</strong></div>
    <div><span>ATENDIÓ</span><strong>${escapeHtml(mecanico)}</strong></div>
    <span class="pf-chip">Automático</span>
  </div>`;
}

function bloqueClienteVehiculo(orden) {
  const cliente = orden.vehiculo?.cliente || {};
  const vehiculo = orden.vehiculo || {};
  return `
  <div class="pf-dos-columnas">
    <div class="pf-tarjeta">
      <h3>CLIENTE</h3>
      <div class="pf-linea"><span>Nombre</span><strong>${escapeHtml(cliente.nombre || '—')}</strong></div>
      <div class="pf-linea"><span>Celular</span><strong>${escapeHtml(cliente.celular || '—')}</strong></div>
      <div class="pf-linea"><span>Correo</span><strong>${escapeHtml(cliente.correo || '—')}</strong></div>
    </div>
    <div class="pf-tarjeta">
      <h3>VEHÍCULO</h3>
      <div class="pf-linea"><span>Placa</span><strong>${escapeHtml(vehiculo.placa || '—')}</strong></div>
      <div class="pf-linea"><span>Modelo</span><strong>${escapeHtml(vehiculo.modelo || '—')}</strong></div>
      <div class="pf-linea"><span>Año</span><strong>${escapeHtml(vehiculo.anio || '—')}</strong></div>
      ${tipo === 2 ? `
      <div class="pf-linea"><span>Color</span><strong>${escapeHtml(vehiculo.color || '—')}</strong></div>
      <div class="pf-linea"><span>Kilometraje</span><strong>${escapeHtml(vehiculo.kilometraje || '—')}</strong></div>` : ''}
    </div>
  </div>`;
}

function bloqueFirmas() {
  return `
  <footer class="pf-firmas">
    <div><div class="pf-firma-linea"></div><span>Firma del cliente</span></div>
    <div><div class="pf-firma-linea"></div><span>Firma / sello del taller</span></div>
  </footer>`;
}

function renderProforma1(orden) {
  const servicio = orden.servicios.length > 0 ? orden.servicios[0] : null;
  return `
  ${cabecera(orden)}
  <div class="pf-cuerpo">
    ${bloqueTitulo(orden, 'Diagnóstico inicial · Documento válido')}
    ${bloqueFecha(orden)}
    ${bloqueClienteVehiculo(orden)}

    <div class="pf-tarjeta pf-diagnostico">
      <h3>DIAGNÓSTICO DEL MECÁNICO</h3>
      <p>${escapeHtml(orden.diagnostico)}</p>
    </div>

    ${servicio ? `
    <div class="pf-servicio-estimado">
      <div>
        <span>Servicio estimado</span>
        <strong>${escapeHtml(servicio.nombre)}</strong>
      </div>
      <div class="pf-precio-estimado">
        <span>PRECIO ESTIMADO</span>
        <strong>${escapeHtml(formatCLP(servicio.precio))} CLP</strong>
      </div>
    </div>` : ''}

    <p class="pf-nota"><span class="pf-nota-dot"></span>
      Este documento es una proforma de diagnóstico inicial. El detalle final de repuestos y
      servicios se registrará en la Proforma 2. Precios en pesos chilenos (CLP).
    </p>
  </div>
  ${bloqueFirmas()}`;
}

function renderProforma2(orden) {
  const filasServicios = orden.servicios.map(s => `
    <tr>
      <td>${escapeHtml(s.nombre)}${s.es_extra ? ' <span class="pf-extra">EXTRA</span>' : ''}</td>
      <td class="pf-num">1</td>
      <td class="pf-num">${escapeHtml(formatCLP(s.precio))}</td>
    </tr>`).join('');

  const filasProductos = orden.productos.map(p => `
    <tr>
      <td>${escapeHtml(p.nombre || 'Producto #' + p.producto_id)}</td>
      <td class="pf-num">x${escapeHtml(p.cantidad)}</td>
      <td class="pf-num">${escapeHtml(formatCLP(p.precio_unitario * p.cantidad))}</td>
    </tr>`).join('');

  const filasPagos = orden.pagos.map(p => `
    <div class="pf-linea">
      <span>Abono · ${escapeHtml(formatFecha(p.fecha))} ${escapeHtml(formatHora(p.fecha))} · ${escapeHtml(p.metodo)}</span>
      <strong>${escapeHtml(formatCLP(p.monto))}</strong>
    </div>`).join('');

  const garantiaMeses = Math.round(orden.garantia_dias / 30);

  return `
  ${cabecera(orden)}
  <div class="pf-cuerpo">
    ${bloqueTitulo(orden, 'Detalle completo del servicio · Documento válido')}
    ${bloqueFecha(orden)}
    ${bloqueClienteVehiculo(orden)}

    <div class="pf-tarjeta pf-diagnostico">
      <h3>DIAGNÓSTICO DEL MECÁNICO</h3>
      <p>${escapeHtml(orden.diagnostico)}</p>
    </div>

    <div class="pf-tarjeta">
      <h3>SERVICIOS Y REPUESTOS</h3>
      <table class="pf-tabla">
        <thead><tr><th>Detalle</th><th class="pf-num">Cant.</th><th class="pf-num">Importe</th></tr></thead>
        <tbody>
          ${filasServicios || ''}
          ${filasProductos || ''}
          ${!filasServicios && !filasProductos ? '<tr><td colspan="3">Sin ítems registrados</td></tr>' : ''}
        </tbody>
      </table>
      <div class="pf-totales">
        <div class="pf-linea"><span>TOTAL</span><strong>${escapeHtml(formatCLP(orden.total))}</strong></div>
        ${filasPagos}
        <div class="pf-linea pf-saldo ${orden.saldo > 0 ? 'pf-saldo-pendiente' : ''}">
          <span>SALDO</span><strong>${escapeHtml(formatCLP(orden.saldo))}</strong>
        </div>
      </div>
    </div>

    <p class="pf-nota"><span class="pf-nota-dot"></span>
      Garantía de ${escapeHtml(garantiaMeses)} meses (${escapeHtml(orden.garantia_dias)} días) desde la
      entrega del vehículo. Precios en pesos chilenos (CLP).
    </p>
  </div>
  ${bloqueFirmas()}`;
}
