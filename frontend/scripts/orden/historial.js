/**
 * Sección "Historial de servicios" — búsqueda en vivo por placa o nombre,
 * historial de visitas del vehículo y llenado de la Proforma 2.
 */
import { escapeHtml } from '../utils/sanitize.js';
import { showSuccess, showError, showWarning } from '../utils/notification.js';
import { debounce } from '../utils/debounce.js';
import { getValidToken } from '../utils/store/manager-key.js';
import { apiOrden, API_BASE_URL, formatCLP, formatFecha, ESTADOS_ORDEN } from './format.js';

let historialActual = null;
let filtroVisitas = 'todas';
let serviciosCatalogo = [];
let productosInventario = [];

export function initHistorial(container) {
  container.innerHTML = `
  <div class="ot-historial">
    <div class="ot-page-header">
      <h2>Historial de servicios</h2>
      <p class="ot-subtitle">Busca por placa o nombre del cliente</p>
    </div>

    <div class="ot-card ot-busqueda-card">
      <div class="ot-busqueda-row">
        <input type="text" id="hist-buscar" placeholder="Placa o nombre del cliente…" autocomplete="off">
        <button class="ot-btn ot-btn-primario" id="hist-buscar-btn">Buscar</button>
      </div>
      <div id="hist-sugerencias" class="ot-sugerencias" hidden></div>
    </div>

    <div id="hist-resultado"></div>
  </div>`;

  const input = container.querySelector('#hist-buscar');
  const btn = container.querySelector('#hist-buscar-btn');

  input.addEventListener('input', debounce(buscarSugerencias, 300));
  btn.addEventListener('click', () => {
    const q = input.value.trim();
    if (q) buscarYSeleccionarPrimero(q);
  });
  input.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      const q = input.value.trim();
      if (q) buscarYSeleccionarPrimero(q);
    }
  });

  // Al entrar, mostrar los últimos vehículos registrados
  cargarRecientes();
}

// ---------- Últimos vehículos registrados (listado por defecto) ----------

async function cargarRecientes() {
  const cont = document.getElementById('hist-resultado');
  cont.innerHTML = `<div class="ot-card ot-vacio"><p>Cargando últimos vehículos…</p></div>`;

  try {
    const recientes = await apiOrden('/vehiculos/buscar?q=');

    if (!recientes || recientes.length === 0) {
      cont.innerHTML = `<div class="ot-card ot-vacio">
        <p>Aún no hay vehículos registrados.</p>
        <small>Registra la primera recepción desde <em>Servicios</em> y aparecerá aquí.</small>
      </div>`;
      return;
    }

    cont.innerHTML = `
      <div class="ot-card">
        <div class="ot-seccion-titulo">
          <h3>Últimos vehículos registrados</h3>
          <span class="ot-chip">${escapeHtml(recientes.length)} vehículo${recientes.length === 1 ? '' : 's'}</span>
        </div>
        ${recientes.map(s => `
          <div class="ot-sugerencia" data-placa="${escapeHtml(s.placa)}">
            <div class="ot-sugerencia-icono"></div>
            <div class="ot-sugerencia-datos">
              <strong>${escapeHtml(s.placa)}</strong> · ${escapeHtml(s.cliente_nombre)}
              <small>${escapeHtml(s.modelo || 'Modelo sin registrar')}${s.anio ? ' ' + escapeHtml(s.anio) : ''} · ${escapeHtml(s.visitas)} visita${s.visitas === 1 ? '' : 's'}</small>
            </div>
            <span class="ot-ver-link">Ver ›</span>
          </div>`).join('')}
      </div>`;

    cont.querySelectorAll('.ot-sugerencia').forEach(el => {
      el.addEventListener('click', () => cargarHistorial(el.dataset.placa));
    });
  } catch (e) {
    cont.innerHTML = `<div class="ot-card ot-vacio">
      <p>No se pudieron cargar los últimos vehículos.</p>
      <small>Revisa la conexión con el servidor y recarga la página.</small>
    </div>`;
  }
}

// ---------- Búsqueda en vivo ----------

async function buscarSugerencias() {
  const input = document.getElementById('hist-buscar');
  const cont = document.getElementById('hist-sugerencias');
  const q = input.value.trim();

  if (q.length < 1) {
    cont.hidden = true;
    cont.innerHTML = '';
    return;
  }

  try {
    const sugerencias = await apiOrden(`/vehiculos/buscar?q=${encodeURIComponent(q)}`);
    if (sugerencias.length === 0) {
      cont.innerHTML = `<p class="ot-sin-resultados">Sin coincidencias para "<strong>${escapeHtml(q)}</strong>".
        Verifica la placa o el nombre, o registra el vehículo desde <em>Servicios</em>.</p>`;
      cont.hidden = false;
      return;
    }

    cont.innerHTML = `
      <p class="ot-sugerencias-titulo">${sugerencias.length} coincidencia${sugerencias.length === 1 ? '' : 's'}</p>
      ${sugerencias.map(s => `
        <div class="ot-sugerencia" data-placa="${escapeHtml(s.placa)}">
          <div class="ot-sugerencia-icono"></div>
          <div class="ot-sugerencia-datos">
            <strong>${escapeHtml(s.placa)}</strong> · ${escapeHtml(s.cliente_nombre)}
            <small>${escapeHtml(s.modelo || 'Modelo sin registrar')}${s.anio ? ' ' + escapeHtml(s.anio) : ''} · ${escapeHtml(s.visitas)} visita${s.visitas === 1 ? '' : 's'}</small>
          </div>
          <span class="ot-ver-link">Ver ›</span>
        </div>`).join('')}`;
    cont.hidden = false;

    cont.querySelectorAll('.ot-sugerencia').forEach(el => {
      el.addEventListener('click', () => cargarHistorial(el.dataset.placa));
    });
  } catch (e) {
    cont.hidden = true;
  }
}

async function buscarYSeleccionarPrimero(q) {
  try {
    const sugerencias = await apiOrden(`/vehiculos/buscar?q=${encodeURIComponent(q)}`);
    if (sugerencias.length === 0) {
      document.getElementById('hist-resultado').innerHTML = `
        <div class="ot-card ot-vacio">
          <p>Sin resultados para "<strong>${escapeHtml(q)}</strong>"</p>
          <small>Este vehículo aún no tiene historial en el taller.</small>
        </div>`;
      return;
    }
    await cargarHistorial(sugerencias[0].placa);
  } catch (e) {
    showError('Error al buscar');
  }
}

// ---------- Historial del vehículo ----------

async function cargarHistorial(placa) {
  const cont = document.getElementById('hist-resultado');
  const sugerencias = document.getElementById('hist-sugerencias');
  sugerencias.hidden = true;

  try {
    historialActual = await apiOrden(`/historial/${encodeURIComponent(placa)}`);
    filtroVisitas = 'todas';
    renderHistorial(cont);
  } catch (e) {
    showError(e.detail || 'Error al cargar el historial');
  }
}

/** Filtra las visitas según el chip elegido (similar a Trabajos pendientes). */
function filtrarVisitas(visitas) {
  const enTaller = ['en_proceso', 'esperando_repuestos', 'listo'];
  if (filtroVisitas === 'taller') return visitas.filter(v => enTaller.includes(v.estado));
  if (filtroVisitas === 'entregado') return visitas.filter(v => v.estado === 'entregado');
  if (filtroVisitas === 'con_saldo') return visitas.filter(v => v.saldo > 0);
  return visitas;
}

/** Re-pinta solo la lista de visitas (al cambiar de chip). */
function renderListaVisitas() {
  const lista = document.getElementById('hist-visitas-lista');
  if (!lista || !historialActual) return;
  const filtradas = filtrarVisitas(historialActual.visitas);

  lista.innerHTML = filtradas.length === 0
    ? `<p class="ot-vacio-texto">No hay visitas ${filtroVisitas === 'todas' ? 'registradas' : 'en este filtro'}.</p>`
    : filtradas.map(v => renderVisita(v)).join('');

  lista.querySelectorAll('.ot-visita-toggle').forEach(btn => {
    btn.addEventListener('click', () => {
      const detalle = document.getElementById(`visita-detalle-${btn.dataset.id}`);
      const visible = !detalle.hidden;
      detalle.hidden = visible;
      btn.textContent = visible ? 'Ver detalle' : 'Ocultar';
    });
  });
}

function ordenPendienteDeProforma() {
  // La proforma 2 se completa sobre la visita más reciente no cancelada
  if (!historialActual || historialActual.visitas.length === 0) return null;
  const ultima = historialActual.visitas[0];
  return ultima.proforma2_completa ? null : ultima;
}

function renderHistorial(cont) {
  const { vehiculo, visitas, total_visitas } = historialActual;
  const cliente = vehiculo.cliente || {};
  const pendiente = ordenPendienteDeProforma();

  cont.innerHTML = `
    <div class="ot-card ot-vehiculo-card">
      <div class="ot-placa-box">
        <span>PLACA</span>
        <strong>${escapeHtml(vehiculo.placa)}</strong>
      </div>
      <div class="ot-vehiculo-datos">
        <div><span>MODELO</span><strong>${escapeHtml(vehiculo.modelo || '—')}${vehiculo.anio ? ' ' + escapeHtml(vehiculo.anio) : ''}</strong></div>
        <div><span>CLIENTE</span><strong>${escapeHtml(cliente.nombre || '—')}</strong></div>
        <div><span>CONTACTO</span><strong>${escapeHtml(cliente.celular || '—')}</strong></div>
        <div><span>TOTAL VISITAS</span><strong>${escapeHtml(total_visitas)} al taller</strong></div>
      </div>
      <div class="ot-vehiculo-acciones">
        ${pendiente
          ? `<button class="ot-btn ot-btn-primario" id="hist-completar-p2">Completar Proforma 2</button>
             <span class="ot-badge ot-badge-warning">PROFORMA INCOMPLETA</span>`
          : `<button class="ot-btn ot-btn-secundario" id="hist-ver-p2" ${visitas.length === 0 ? 'disabled' : ''}>Proforma completa</button>
             <button class="ot-btn ot-btn-neutro" id="hist-editar-p2" ${visitas.length === 0 ? 'disabled' : ''}>Editar Proforma 2</button>`}
      </div>
    </div>

    <div class="ot-card">
      <div class="ot-seccion-titulo">
        <h3>Historial de visitas al taller</h3>
        <span class="ot-chip">${escapeHtml(visitas.length)} registro${visitas.length === 1 ? '' : 's'}</span>
      </div>
      <div class="ot-filtros-botones ot-filtros-visitas">
        <button class="ot-filtro ${filtroVisitas === 'todas' ? 'activo' : ''}" data-vfiltro="todas">Todas</button>
        <button class="ot-filtro ${filtroVisitas === 'taller' ? 'activo' : ''}" data-vfiltro="taller">En taller</button>
        <button class="ot-filtro ${filtroVisitas === 'entregado' ? 'activo' : ''}" data-vfiltro="entregado">Entregadas</button>
        <button class="ot-filtro ${filtroVisitas === 'con_saldo' ? 'activo' : ''}" data-vfiltro="con_saldo">Con saldo</button>
      </div>
      <div id="hist-visitas-lista"></div>
    </div>`;

  if (pendiente) {
    document.getElementById('hist-completar-p2').addEventListener('click', () => abrirModalProforma2(pendiente));
  } else if (visitas.length > 0) {
    const btn = document.getElementById('hist-ver-p2');
    if (btn) btn.addEventListener('click', () => window.open(`proforma.html?id=${visitas[0].id}&tipo=2`, '_blank'));
    // Reabrir la Proforma 2 para corregir datos aunque ya esté completa
    const btnEditar = document.getElementById('hist-editar-p2');
    if (btnEditar) btnEditar.addEventListener('click', () => abrirModalProforma2(visitas[0]));
  }

  // Chips de filtro de visitas
  cont.querySelectorAll('.ot-filtros-visitas .ot-filtro').forEach(chip => {
    chip.addEventListener('click', () => {
      cont.querySelectorAll('.ot-filtros-visitas .ot-filtro').forEach(c => c.classList.remove('activo'));
      chip.classList.add('activo');
      filtroVisitas = chip.dataset.vfiltro;
      renderListaVisitas();
    });
  });

  renderListaVisitas();
}

function renderVisita(v) {
  const titulo = v.servicios.length > 0 ? v.servicios.map(s => s.nombre).join(' + ') : 'Diagnóstico';
  const estado = ESTADOS_ORDEN[v.estado] || { label: v.estado, clase: '' };
  const mecanico = v.mecanico ? `${v.mecanico.nombres} ${v.mecanico.apellidos}` : '—';
  const repuestos = v.productos.length > 0
    ? v.productos.map(p => `${p.nombre || 'Producto'} (${p.cantidad})`).join(', ')
    : '—';

  return `
  <div class="ot-visita">
    <div class="ot-visita-fila">
      <span class="ot-visita-fecha">${escapeHtml(formatFecha(v.fecha_ingreso))}</span>
      <span class="ot-visita-titulo">${escapeHtml(titulo)}</span>
      <span class="ot-badge ${escapeHtml(estado.clase)}">${escapeHtml(estado.label)}</span>
      <strong class="ot-visita-precio">${escapeHtml(formatCLP(v.total))}</strong>
      <button class="ot-btn ot-btn-mini ot-visita-toggle" data-id="${escapeHtml(v.id)}">Ver detalle</button>
    </div>
    <div class="ot-visita-detalle" id="visita-detalle-${escapeHtml(v.id)}" hidden>
      <p><span>Código:</span> ${escapeHtml(v.codigo)}</p>
      <p><span>Diagnóstico:</span> ${escapeHtml(v.diagnostico)}</p>
      <p><span>Servicios:</span> ${escapeHtml(v.servicios.map(s => s.nombre).join(', ') || '—')}</p>
      <p><span>Repuestos:</span> ${escapeHtml(repuestos)}</p>
      <p><span>Mecánico:</span> ${escapeHtml(mecanico)}</p>
      <p><span>Pagos:</span> abonado ${escapeHtml(formatCLP(v.abonado))} · saldo ${escapeHtml(formatCLP(v.saldo))} (${escapeHtml(v.estado_pago)})</p>
      ${v.fecha_entrega ? `<p><span>Entregado:</span> ${escapeHtml(formatFecha(v.fecha_entrega))}</p>` : ''}
      <div class="ot-visita-detalle-acciones">
        <button class="ot-btn ot-btn-mini" onclick="window.open('proforma.html?id=${escapeHtml(v.id)}&tipo=1','_blank')">Proforma 1</button>
        <button class="ot-btn ot-btn-mini" onclick="window.open('proforma.html?id=${escapeHtml(v.id)}&tipo=2','_blank')">Proforma 2</button>
      </div>
    </div>
  </div>`;
}

// ---------- Modal Proforma 2 ----------

async function cargarCatalogos() {
  // Token con renovación automática (el token crudo expira a la hora)
  const token = await getValidToken();
  const headers = { 'Authorization': token ? `Bearer ${token}` : '' };
  try {
    const [servResp, prodResp] = await Promise.all([
      fetch(`${API_BASE_URL}/servicios/`, { headers }),
      fetch(`${API_BASE_URL}/productos/`, { headers }),
    ]);
    serviciosCatalogo = servResp.ok ? await servResp.json() : [];
    productosInventario = prodResp.ok ? await prodResp.json() : [];
  } catch (e) {
    serviciosCatalogo = [];
    productosInventario = [];
  }
}

async function abrirModalProforma2(ordenResumen) {
  const modalContainer = document.getElementById('modal-container');
  if (!modalContainer) return;

  // Recargar orden completa y catálogos
  let orden;
  try {
    [orden] = await Promise.all([apiOrden(`/${ordenResumen.id}`), cargarCatalogos()]);
  } catch (e) {
    showError('No se pudo cargar la orden');
    return;
  }

  renderModalProforma2(orden);
}

function renderModalProforma2(orden) {
  const modalContainer = document.getElementById('modal-container');
  const cliente = orden.vehiculo?.cliente || {};
  const vehiculo = orden.vehiculo || {};

  modalContainer.innerHTML = `
  <div class="modal-overlay ot-p2-overlay" id="p2-overlay">
    <div class="ot-p2-panel">
      <div class="ot-p2-header">
        <div>
          <h3>Completar Proforma 2</h3>
          <p>${escapeHtml(vehiculo.placa)} · ${escapeHtml(cliente.nombre || '')} · completa los datos faltantes de la Proforma 1</p>
        </div>
        <button class="ot-p2-cerrar" id="p2-cerrar">✕</button>
      </div>

      <div class="ot-p2-body">
        <h4 class="ot-p2-seccion">Datos ampliados del vehículo y dueño</h4>
        <div class="ot-card-plana">
          <div class="ot-grid-2">
            <div class="ot-field"><label>Color del vehículo</label>
              <input type="text" id="p2-color" placeholder="Ej. Rojo platinado" value="${escapeHtml(vehiculo.color || '')}"></div>
            <div class="ot-field"><label>Kilometraje</label>
              <input type="text" id="p2-km" placeholder="Ej. 45.200 km" value="${escapeHtml(vehiculo.kilometraje || '')}"></div>
          </div>
          <div class="ot-grid-2">
            <div class="ot-field"><label>Correo electrónico <small>(opcional)</small></label>
              <input type="email" id="p2-correo" placeholder="cliente@correo.com" value="${escapeHtml(cliente.correo || '')}"></div>
            <div class="ot-field"><label>Fecha de ingreso</label>
              <input type="text" id="p2-fecha" value="${escapeHtml(formatFecha(orden.fecha_ingreso))}" disabled></div>
          </div>
        </div>

        <h4 class="ot-p2-seccion">Servicios realizados</h4>
        <div class="ot-card-plana" id="p2-servicios">${renderServiciosP2(orden)}</div>
        <div class="ot-agregar-row">
          <select id="p2-servicio-select">
            <option value="">+ Agregar servicio del catálogo</option>
            ${serviciosCatalogo.map(s => `<option value="${escapeHtml(s.id)}">${escapeHtml(s.nombre)}</option>`).join('')}
          </select>
          <input type="number" id="p2-servicio-precio" min="0" step="1000" placeholder="Precio CLP">
          <button class="ot-btn ot-btn-secundario" id="p2-servicio-add">Añadir</button>
        </div>

        <h4 class="ot-p2-seccion">Materiales y repuestos usados <span class="ot-chip">DESCUENTA STOCK</span></h4>
        <div class="ot-card-plana" id="p2-productos">${renderProductosP2(orden)}</div>
        <div class="ot-agregar-row">
          <select id="p2-producto-select">
            <option value="">+ Agregar repuesto del inventario</option>
            ${productosInventario.map(p =>
              `<option value="${escapeHtml(p.id)}" ${p.stock <= 0 ? 'disabled' : ''}>${escapeHtml(p.nombre)} · stock ${escapeHtml(p.stock)}</option>`).join('')}
          </select>
          <input type="number" id="p2-producto-cant" min="1" value="1">
          <button class="ot-btn ot-btn-secundario" id="p2-producto-add">Añadir</button>
        </div>

        <h4 class="ot-p2-seccion">Pagos y abonos <span class="ot-chip">PUEDE PAGAR EN PARTES</span></h4>
        <div class="ot-card-plana">
          <div class="ot-totales-row">
            <div><span>TOTAL</span><strong id="p2-total">${escapeHtml(formatCLP(orden.total))}</strong></div>
            <div><span>ABONADO</span><strong id="p2-abonado" class="ot-verde">${escapeHtml(formatCLP(orden.abonado))}</strong></div>
            <div><span>SALDO</span><strong id="p2-saldo" class="${orden.saldo > 0 ? 'ot-rojo' : 'ot-verde'}">${escapeHtml(formatCLP(orden.saldo))}</strong></div>
          </div>
          <div class="ot-agregar-row">
            <input type="number" id="p2-pago-monto" min="1" placeholder="$ Monto del abono">
            <select id="p2-pago-metodo">
              <option value="efectivo">Efectivo</option>
              <option value="tarjeta">Tarjeta</option>
            </select>
            <button class="ot-btn ot-btn-secundario" id="p2-pago-add">Registrar abono</button>
          </div>
        </div>
      </div>

      <div class="ot-p2-footer">
        <button class="ot-btn ot-btn-secundario" id="p2-cancelar">Cancelar</button>
        <button class="ot-btn ot-btn-neutro" id="p2-guardar">Guardar sin imprimir</button>
        <button class="ot-btn ot-btn-primario" id="p2-guardar-imprimir">Guardar e imprimir P2</button>
      </div>
    </div>
  </div>`;

  configurarEventosP2(orden);
}

function renderServiciosP2(orden) {
  if (orden.servicios.length === 0) return '<p class="ot-vacio-texto">Sin servicios registrados aún.</p>';
  return orden.servicios.map(s => `
    <div class="ot-item-row">
      <span class="ot-item-check"></span>
      <span class="ot-item-nombre">${escapeHtml(s.nombre)}${s.es_extra ? ' <span class="ot-badge ot-badge-extra">EXTRA</span>' : ''}</span>
      <strong>${escapeHtml(formatCLP(s.precio))}</strong>
      <button class="ot-item-quitar" data-tipo="servicio" data-id="${escapeHtml(s.id)}" title="Quitar">✕</button>
    </div>`).join('');
}

function renderProductosP2(orden) {
  if (orden.productos.length === 0) return '<p class="ot-vacio-texto">Sin repuestos registrados aún.</p>';
  return orden.productos.map(p => `
    <div class="ot-item-row">
      <span class="ot-item-check"></span>
      <span class="ot-item-nombre">${escapeHtml(p.nombre || 'Producto #' + p.producto_id)}</span>
      <span class="ot-chip">x${escapeHtml(p.cantidad)}</span>
      <strong>${escapeHtml(formatCLP(p.precio_unitario * p.cantidad))}</strong>
      <button class="ot-item-quitar" data-tipo="producto" data-id="${escapeHtml(p.id)}" title="Quitar (repone stock)">✕</button>
    </div>`).join('');
}

function actualizarPanelP2(orden) {
  document.getElementById('p2-servicios').innerHTML = renderServiciosP2(orden);
  document.getElementById('p2-productos').innerHTML = renderProductosP2(orden);
  document.getElementById('p2-total').textContent = formatCLP(orden.total);
  document.getElementById('p2-abonado').textContent = formatCLP(orden.abonado);
  const saldo = document.getElementById('p2-saldo');
  saldo.textContent = formatCLP(orden.saldo);
  saldo.className = orden.saldo > 0 ? 'ot-rojo' : 'ot-verde';
  configurarQuitarItems(orden);
}

function configurarQuitarItems(orden) {
  document.querySelectorAll('.ot-item-quitar').forEach(btn => {
    btn.addEventListener('click', async () => {
      try {
        const ruta = btn.dataset.tipo === 'servicio' ? 'servicios' : 'productos';
        const actualizada = await apiOrden(`/${orden.id}/${ruta}/${btn.dataset.id}`, { method: 'DELETE' });
        Object.assign(orden, actualizada);
        actualizarPanelP2(orden);
        showSuccess(btn.dataset.tipo === 'producto' ? 'Repuesto quitado · stock repuesto' : 'Servicio quitado');
      } catch (e) {
        showError(e.detail || 'No se pudo quitar el ítem');
      }
    });
  });
}

function configurarEventosP2(orden) {
  const cerrar = () => {
    document.getElementById('modal-container').innerHTML = '';
    // Refrescar historial al cerrar
    if (historialActual) cargarHistorial(historialActual.vehiculo.placa);
  };

  document.getElementById('p2-cerrar').addEventListener('click', cerrar);
  document.getElementById('p2-cancelar').addEventListener('click', cerrar);

  configurarQuitarItems(orden);

  // Añadir servicio
  document.getElementById('p2-servicio-add').addEventListener('click', async () => {
    const select = document.getElementById('p2-servicio-select');
    const precio = parseInt(document.getElementById('p2-servicio-precio').value, 10) || 0;
    if (!select.value) { showWarning('Selecciona un servicio del catálogo'); return; }
    const servicio = serviciosCatalogo.find(s => s.id === parseInt(select.value, 10));
    try {
      const actualizada = await apiOrden(`/${orden.id}/servicios`, {
        method: 'POST',
        body: { servicio_id: servicio.id, nombre: servicio.nombre, precio, es_extra: true },
      });
      Object.assign(orden, actualizada);
      actualizarPanelP2(orden);
      select.value = '';
      document.getElementById('p2-servicio-precio').value = '';
      showSuccess('Servicio añadido');
    } catch (e) {
      showError(e.detail || 'No se pudo añadir el servicio');
    }
  });

  // Añadir producto (descuenta stock)
  document.getElementById('p2-producto-add').addEventListener('click', async () => {
    const select = document.getElementById('p2-producto-select');
    const cantidad = parseInt(document.getElementById('p2-producto-cant').value, 10) || 0;
    if (!select.value) { showWarning('Selecciona un repuesto del inventario'); return; }
    if (cantidad <= 0) { showWarning('La cantidad debe ser mayor a 0'); return; }
    try {
      const actualizada = await apiOrden(`/${orden.id}/productos`, {
        method: 'POST',
        body: { producto_id: parseInt(select.value, 10), cantidad },
      });
      Object.assign(orden, actualizada);
      actualizarPanelP2(orden);
      select.value = '';
      document.getElementById('p2-producto-cant').value = '1';
      showSuccess('Repuesto añadido · stock descontado');
    } catch (e) {
      showError(e.detail || 'No se pudo añadir el repuesto');
    }
  });

  // Registrar abono
  document.getElementById('p2-pago-add').addEventListener('click', async () => {
    const monto = parseInt(document.getElementById('p2-pago-monto').value, 10) || 0;
    const metodo = document.getElementById('p2-pago-metodo').value;
    if (monto <= 0) { showWarning('Ingresa un monto válido'); return; }
    try {
      const actualizada = await apiOrden(`/${orden.id}/pagos`, {
        method: 'POST',
        body: { monto, metodo },
      });
      Object.assign(orden, actualizada);
      actualizarPanelP2(orden);
      document.getElementById('p2-pago-monto').value = '';
      showSuccess('Abono registrado');
    } catch (e) {
      showError(e.detail || 'No se pudo registrar el abono');
    }
  });

  // Guardar datos ampliados
  const guardar = async () => {
    const body = {
      color: document.getElementById('p2-color').value.trim() || null,
      kilometraje: document.getElementById('p2-km').value.trim() || null,
      correo: document.getElementById('p2-correo').value.trim() || null,
      marcar_completa: true,
    };
    const actualizada = await apiOrden(`/${orden.id}/proforma2`, { method: 'PUT', body });
    Object.assign(orden, actualizada);
    return actualizada;
  };

  document.getElementById('p2-guardar').addEventListener('click', async () => {
    try {
      await guardar();
      showSuccess('Proforma 2 guardada');
      cerrar();
    } catch (e) {
      showError(e.detail || 'No se pudo guardar');
    }
  });

  document.getElementById('p2-guardar-imprimir').addEventListener('click', async () => {
    try {
      await guardar();
      showSuccess('Proforma 2 guardada. Imprimiendo…');
      window.open(`proforma.html?id=${orden.id}&tipo=2`, '_blank');
      cerrar();
    } catch (e) {
      showError(e.detail || 'No se pudo guardar');
    }
  });
}
