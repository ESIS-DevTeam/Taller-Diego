/**
 * Sección "Trabajos pendientes" — vehículos en proceso de servicio.
 * Contadores por estado, filtros, añadir ítems, cancelar y validar → Revisados.
 */
import { escapeHtml } from '../utils/sanitize.js';
import { showSuccess, showError, showWarning } from '../utils/notification.js';
import { apiOrden, API_BASE_URL, formatCLP, ESTADOS_ORDEN } from './format.js';

let ordenes = [];
let filtroEstado = 'todos';
let filtroPlaca = '';
let serviciosCatalogo = [];
let productosInventario = [];

export async function initPendientes(container) {
  container.innerHTML = `
  <div class="ot-pendientes">
    <div class="ot-page-header">
      <h2>Trabajos pendientes</h2>
      <p class="ot-subtitle">Vehículos en proceso de servicio</p>
    </div>

    <div class="ot-contadores" id="pend-contadores"></div>

    <div class="ot-card ot-filtros-row">
      <input type="text" id="pend-buscar" placeholder="Buscar por placa…" autocomplete="off">
      <div class="ot-filtros-botones">
        <button class="ot-filtro activo" data-filtro="todos">Todos</button>
        <button class="ot-filtro" data-filtro="en_proceso">En proceso</button>
        <button class="ot-filtro" data-filtro="esperando_repuestos">Esperando</button>
        <button class="ot-filtro" data-filtro="listo">Listos</button>
      </div>
    </div>

    <div id="pend-lista"></div>
  </div>`;

  container.querySelector('#pend-buscar').addEventListener('input', (e) => {
    filtroPlaca = e.target.value.trim().toUpperCase();
    renderLista();
  });

  container.querySelectorAll('.ot-filtro').forEach(btn => {
    btn.addEventListener('click', () => {
      container.querySelectorAll('.ot-filtro').forEach(b => b.classList.remove('activo'));
      btn.classList.add('activo');
      filtroEstado = btn.dataset.filtro;
      renderLista();
    });
  });

  await recargar();
}

async function recargar() {
  try {
    ordenes = await apiOrden('/?estado=en_proceso,esperando_repuestos,listo');
    renderContadores();
    renderLista();
  } catch (e) {
    showError('Error al cargar los trabajos pendientes');
  }
}

function renderContadores() {
  const enProceso = ordenes.filter(o => o.estado === 'en_proceso').length;
  const esperando = ordenes.filter(o => o.estado === 'esperando_repuestos').length;
  const listos = ordenes.filter(o => o.estado === 'listo').length;

  document.getElementById('pend-contadores').innerHTML = `
    <div class="ot-contador"><span class="ot-contador-num ot-contador-azul">${enProceso}</span>
      <div><strong>En proceso</strong><small>vehículos</small></div></div>
    <div class="ot-contador"><span class="ot-contador-num ot-contador-amarillo">${esperando}</span>
      <div><strong>Esperando repuestos</strong><small>vehículos</small></div></div>
    <div class="ot-contador"><span class="ot-contador-num ot-contador-verde">${listos}</span>
      <div><strong>Listos</strong><small>vehículos</small></div></div>`;
}

function renderLista() {
  const cont = document.getElementById('pend-lista');
  let filtradas = ordenes;
  if (filtroEstado !== 'todos') filtradas = filtradas.filter(o => o.estado === filtroEstado);
  if (filtroPlaca) filtradas = filtradas.filter(o => (o.vehiculo?.placa || '').includes(filtroPlaca));

  if (filtradas.length === 0) {
    cont.innerHTML = `<div class="ot-card ot-vacio">
      <p>No hay trabajos ${filtroEstado === 'todos' ? 'pendientes' : 'en este estado'}${filtroPlaca ? ` con placa "${escapeHtml(filtroPlaca)}"` : ''}.</p>
      <small>Los vehículos que ingresen desde <em>Servicios</em> aparecerán aquí.</small>
    </div>`;
    return;
  }

  cont.innerHTML = filtradas.map(o => renderOrden(o)).join('');
  configurarAcciones(cont);
}

function renderOrden(o) {
  const estado = ESTADOS_ORDEN[o.estado] || { label: o.estado, clase: '' };
  const cliente = o.vehiculo?.cliente?.nombre || '—';
  const mecanico = o.mecanico ? `${o.mecanico.nombres} ${o.mecanico.apellidos}` : 'Sin mecánico asignado';

  const servicios = o.servicios.length > 0
    ? o.servicios.map(s => `
        <li><span>• ${escapeHtml(s.nombre)}${s.es_extra ? ' <span class="ot-badge ot-badge-extra">EXTRA</span>' : ''}</span>
        <strong>${escapeHtml(formatCLP(s.precio))}</strong></li>`).join('')
    : '<li class="ot-vacio-texto">Sin servicios registrados</li>';

  const productos = o.productos.length > 0
    ? o.productos.map(p => `
        <li><span>• ${escapeHtml(p.nombre || 'Producto')} x${escapeHtml(p.cantidad)}</span>
        <strong>${escapeHtml(formatCLP(p.precio_unitario * p.cantidad))}</strong></li>`).join('')
    : '<li class="ot-vacio-texto">Sin repuestos usados</li>';

  const esListo = o.estado === 'listo';

  return `
  <div class="ot-card ot-trabajo" data-id="${escapeHtml(o.id)}">
    <div class="ot-trabajo-head">
      <span class="ot-placa-mini">${escapeHtml(o.vehiculo?.placa || '—')}</span>
      <div class="ot-trabajo-titulo">
        <strong>${escapeHtml(o.vehiculo?.modelo || 'Modelo sin registrar')}${o.vehiculo?.anio ? ' ' + escapeHtml(o.vehiculo.anio) : ''}</strong>
        <small>${escapeHtml(cliente)} · ${escapeHtml(mecanico)}</small>
      </div>
      <span class="ot-badge ${escapeHtml(estado.clase)}">● ${escapeHtml(estado.label)}</span>
    </div>

    <div class="ot-trabajo-detalle">
      <div class="ot-trabajo-col">
        <h4>SERVICIOS EN CURSO</h4>
        <ul>${servicios}</ul>
      </div>
      <div class="ot-trabajo-col">
        <h4>PRODUCTOS USADOS <span class="ot-chip-mini">descuenta stock</span></h4>
        <ul>${productos}</ul>
      </div>
    </div>

    <div class="ot-trabajo-footer">
      <div class="ot-totales-row">
        <div><span>TOTAL ACTUAL</span><strong>${escapeHtml(formatCLP(o.total))}</strong></div>
        <div><span>ABONADO</span><strong class="ot-verde">${escapeHtml(formatCLP(o.abonado))}</strong></div>
        <div><span>SALDO</span><strong class="${o.saldo > 0 ? 'ot-rojo' : 'ot-verde'}">${escapeHtml(formatCLP(o.saldo))}</strong></div>
      </div>
      <div class="ot-trabajo-acciones">
        <button class="ot-btn ot-btn-peligro-suave" data-accion="cancelar">Cancelar</button>
        <button class="ot-btn ot-btn-secundario" data-accion="anadir">Añadir ítem</button>
        ${o.estado === 'esperando_repuestos'
          ? '<button class="ot-btn ot-btn-secundario" data-accion="reanudar">Reanudar trabajo</button>'
          : ''}
        ${o.estado === 'en_proceso'
          ? '<button class="ot-btn ot-btn-secundario" data-accion="esperar">Esperando repuestos</button>'
          : ''}
        ${esListo
          ? '<button class="ot-btn ot-btn-primario" data-accion="validar">Validar → Revisados</button>'
          : '<button class="ot-btn ot-btn-neutro" data-accion="listo">Marcar como listo</button>'}
      </div>
    </div>
  </div>`;
}

function configurarAcciones(cont) {
  cont.querySelectorAll('.ot-trabajo [data-accion]').forEach(btn => {
    btn.addEventListener('click', () => {
      const id = parseInt(btn.closest('.ot-trabajo').dataset.id, 10);
      const orden = ordenes.find(o => o.id === id);
      if (!orden) return;
      const acciones = {
        cancelar: () => confirmarCancelar(orden),
        anadir: () => abrirModalAnadirItem(orden),
        esperar: () => cambiarEstado(orden, 'esperando_repuestos'),
        reanudar: () => cambiarEstado(orden, 'en_proceso'),
        listo: () => cambiarEstado(orden, 'listo'),
        validar: () => cambiarEstado(orden, 'listo', true),
      };
      acciones[btn.dataset.accion]?.();
    });
  });
}

async function cambiarEstado(orden, nuevoEstado, yaListo = false) {
  // "Validar → Revisados": la orden ya está en listo, solo confirmar
  if (yaListo && orden.estado === 'listo') {
    showSuccess(`${orden.vehiculo.placa} validado → aparece en Revisados`);
    await recargar();
    return;
  }
  try {
    await apiOrden(`/${orden.id}/estado`, { method: 'PATCH', body: { estado: nuevoEstado } });
    const mensajes = {
      listo: `${orden.vehiculo.placa} marcado como listo · esperando recojo en Revisados`,
      esperando_repuestos: `${orden.vehiculo.placa} en espera de repuestos`,
      en_proceso: `${orden.vehiculo.placa} de vuelta en proceso`,
    };
    showSuccess(mensajes[nuevoEstado] || 'Estado actualizado');
    await recargar();
  } catch (e) {
    showError(e.detail || 'No se pudo cambiar el estado');
  }
}

function confirmarCancelar(orden) {
  const modalContainer = document.getElementById('modal-container');
  modalContainer.innerHTML = `
  <div class="modal-overlay" id="ot-cancelar-overlay">
    <div class="ot-modal">
      <h3>Cancelar trabajo</h3>
      <p class="ot-modal-sub">${escapeHtml(orden.vehiculo?.placa || '')} · ${escapeHtml(orden.vehiculo?.cliente?.nombre || '')}</p>
      <p>Se cancelará la orden <strong>${escapeHtml(orden.codigo)}</strong> y se repondrá el stock
      de los repuestos usados${orden.abonado > 0 ? `. Ojo: tiene abonos por <strong>${escapeHtml(formatCLP(orden.abonado))}</strong> que deberás devolver` : ''}.</p>
      <div class="ot-modal-acciones">
        <button class="ot-btn ot-btn-secundario" id="ot-cancelar-no">Volver</button>
        <button class="ot-btn ot-btn-peligro" id="ot-cancelar-si">Cancelar trabajo</button>
      </div>
    </div>
  </div>`;

  const cerrar = () => { modalContainer.innerHTML = ''; };
  document.getElementById('ot-cancelar-no').addEventListener('click', cerrar);
  document.getElementById('ot-cancelar-overlay').addEventListener('click', (e) => {
    if (e.target.id === 'ot-cancelar-overlay') cerrar();
  });
  document.getElementById('ot-cancelar-si').addEventListener('click', async () => {
    try {
      await apiOrden(`/${orden.id}/estado`, { method: 'PATCH', body: { estado: 'cancelado' } });
      showSuccess(`Trabajo ${orden.codigo} cancelado · stock repuesto`);
      cerrar();
      await recargar();
    } catch (e) {
      showError(e.detail || 'No se pudo cancelar');
    }
  });
}

// ---------- Añadir ítem (servicio del catálogo o repuesto del inventario) ----------

async function cargarCatalogos() {
  const token = localStorage.getItem('supabase_token');
  const headers = { 'Authorization': token ? `Bearer ${token}` : '' };
  const [servResp, prodResp] = await Promise.all([
    fetch(`${API_BASE_URL}/servicios/`, { headers }),
    fetch(`${API_BASE_URL}/productos/`, { headers }),
  ]);
  serviciosCatalogo = servResp.ok ? await servResp.json() : [];
  productosInventario = prodResp.ok ? await prodResp.json() : [];
}

async function abrirModalAnadirItem(orden) {
  try {
    await cargarCatalogos();
  } catch (e) {
    showError('No se pudieron cargar los catálogos');
    return;
  }

  const modalContainer = document.getElementById('modal-container');
  modalContainer.innerHTML = `
  <div class="modal-overlay" id="ot-item-overlay">
    <div class="ot-modal ot-modal-ancho">
      <h3>Añadir ítem a ${escapeHtml(orden.vehiculo?.placa || '')}</h3>
      <p class="ot-modal-sub">Los ítems añadidos se marcan como EXTRA y suben el saldo de la orden</p>

      <div class="ot-tabs">
        <button class="ot-tab activo" data-tab="servicio">Servicio del catálogo</button>
        <button class="ot-tab" data-tab="producto">Repuesto del inventario</button>
      </div>

      <div id="ot-tab-servicio" class="ot-tab-panel">
        <div class="ot-agregar-row">
          <select id="item-servicio-select">
            <option value="">Selecciona un servicio…</option>
            ${serviciosCatalogo.map(s => `<option value="${escapeHtml(s.id)}">${escapeHtml(s.nombre)}</option>`).join('')}
          </select>
          <input type="number" id="item-servicio-precio" min="0" step="1000" placeholder="Precio CLP">
        </div>
      </div>

      <div id="ot-tab-producto" class="ot-tab-panel" hidden>
        <div class="ot-agregar-row">
          <select id="item-producto-select">
            <option value="">Selecciona un repuesto…</option>
            ${productosInventario.map(p =>
              `<option value="${escapeHtml(p.id)}" ${p.stock <= 0 ? 'disabled' : ''}>${escapeHtml(p.nombre)} · stock ${escapeHtml(p.stock)} · ${escapeHtml(formatCLP(p.precioVenta))}</option>`).join('')}
          </select>
          <input type="number" id="item-producto-cant" min="1" value="1">
        </div>
        <small class="ot-chip-mini">El stock se descuenta al añadir y se repone si se quita o cancela</small>
      </div>

      <div class="ot-modal-acciones">
        <button class="ot-btn ot-btn-secundario" id="ot-item-cancelar">Cancelar</button>
        <button class="ot-btn ot-btn-primario" id="ot-item-anadir">Añadir a la orden</button>
      </div>
    </div>
  </div>`;

  let tabActiva = 'servicio';
  modalContainer.querySelectorAll('.ot-tab').forEach(tab => {
    tab.addEventListener('click', () => {
      modalContainer.querySelectorAll('.ot-tab').forEach(t => t.classList.remove('activo'));
      tab.classList.add('activo');
      tabActiva = tab.dataset.tab;
      document.getElementById('ot-tab-servicio').hidden = tabActiva !== 'servicio';
      document.getElementById('ot-tab-producto').hidden = tabActiva !== 'producto';
    });
  });

  const cerrar = () => { modalContainer.innerHTML = ''; };
  document.getElementById('ot-item-cancelar').addEventListener('click', cerrar);
  document.getElementById('ot-item-overlay').addEventListener('click', (e) => {
    if (e.target.id === 'ot-item-overlay') cerrar();
  });

  document.getElementById('ot-item-anadir').addEventListener('click', async () => {
    try {
      if (tabActiva === 'servicio') {
        const select = document.getElementById('item-servicio-select');
        const precio = parseInt(document.getElementById('item-servicio-precio').value, 10) || 0;
        if (!select.value) { showWarning('Selecciona un servicio'); return; }
        const servicio = serviciosCatalogo.find(s => s.id === parseInt(select.value, 10));
        await apiOrden(`/${orden.id}/servicios`, {
          method: 'POST',
          body: { servicio_id: servicio.id, nombre: servicio.nombre, precio, es_extra: true },
        });
        showSuccess('Servicio extra añadido a la orden');
      } else {
        const select = document.getElementById('item-producto-select');
        const cantidad = parseInt(document.getElementById('item-producto-cant').value, 10) || 0;
        if (!select.value) { showWarning('Selecciona un repuesto'); return; }
        if (cantidad <= 0) { showWarning('La cantidad debe ser mayor a 0'); return; }
        await apiOrden(`/${orden.id}/productos`, {
          method: 'POST',
          body: { producto_id: parseInt(select.value, 10), cantidad },
        });
        showSuccess('Repuesto añadido · stock descontado');
      }
      cerrar();
      await recargar();
    } catch (e) {
      showError(e.detail || 'No se pudo añadir el ítem');
    }
  });
}
