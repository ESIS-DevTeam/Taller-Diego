/**
 * Sección "Servicios" del módulo ORDEN — Recepción rápida de vehículos.
 * El mecánico llena lo mínimo (placa, cliente, celular, diagnóstico) y al
 * confirmar se crea la orden y se abre la Proforma 1 imprimible.
 */
import { escapeHtml } from '../utils/sanitize.js';
import { showSuccess, showError, showWarning } from '../utils/notification.js';
import { debounce } from '../utils/debounce.js';
import { getValidToken } from '../utils/store/manager-key.js';
import { apiOrden, API_BASE_URL, formatCLP } from './format.js';

let mecanicos = [];
let serviciosCatalogo = [];
let enviando = false;

export async function initRecepcion(container) {
  container.innerHTML = renderFormulario();
  await Promise.all([cargarMecanicos(), cargarServicios()]);
  configurarEventos(container);
}

function renderFormulario() {
  return `
  <div class="ot-recepcion">
    <div class="ot-page-header">
      <h2>Servicios</h2>
      <p class="ot-subtitle">Recepción rápida de vehículos · Diagnóstico inicial</p>
    </div>

    <div class="ot-banner ot-banner-info" id="recepcion-banner">
      <span class="ot-banner-dot"></span>
      <div>
        <strong>Diagnóstico rápido</strong>
        <p>Solo completa lo mínimo. La cajera llenará los datos ampliados en la Proforma 2 desde Historial.</p>
      </div>
    </div>

    <form id="recepcion-form" class="ot-card ot-form" novalidate>
      <div class="ot-paso">
        <div class="ot-paso-titulo"><span class="ot-paso-num">1</span>
          <div><strong>Vehículo</strong><small>La placa identifica al vehículo en todo el sistema</small></div>
        </div>
        <div class="ot-grid-3">
          <div class="ot-field">
            <label>Patente / Placa <span class="ot-req">*</span></label>
            <input type="text" id="rec-placa" placeholder="Ej. AB123CD" maxlength="10" autocomplete="off">
          </div>
          <div class="ot-field">
            <label>Modelo <small>(opcional)</small></label>
            <input type="text" id="rec-modelo" placeholder="Ej. Toyota Corolla">
          </div>
          <div class="ot-field">
            <label>Año <small>(opcional)</small></label>
            <input type="text" id="rec-anio" placeholder="Ej. 2020" maxlength="10">
          </div>
        </div>
      </div>

      <div class="ot-paso">
        <div class="ot-paso-titulo"><span class="ot-paso-num">2</span>
          <div><strong>Cliente</strong><small>Solo datos mínimos de contacto</small></div>
        </div>
        <div class="ot-grid-2">
          <div class="ot-field">
            <label>Nombre del cliente <span class="ot-req">*</span></label>
            <input type="text" id="rec-nombre" placeholder="Nombre completo">
          </div>
          <div class="ot-field">
            <label>Celular <span class="ot-req">*</span></label>
            <input type="tel" id="rec-celular" placeholder="9XX XXX XXX" maxlength="15">
          </div>
        </div>
      </div>

      <div class="ot-paso">
        <div class="ot-paso-titulo"><span class="ot-paso-num">3</span>
          <div><strong>Diagnóstico del mecánico</strong><small>Describe qué observaste y qué servicio se necesita</small></div>
        </div>
        <div class="ot-field">
          <label>Diagnóstico inicial <span class="ot-req">*</span></label>
          <textarea id="rec-diagnostico" rows="4"
            placeholder="Ej. Ruido en amortiguador delantero derecho. Requiere cambio de bujes y revisión de terminales."></textarea>
        </div>
      </div>

      <div class="ot-paso">
        <div class="ot-paso-titulo"><span class="ot-paso-num">4</span>
          <div><strong>Servicio sugerido y precio</strong><small>Opcional · si ya lo tienes claro</small></div>
        </div>
        <div class="ot-grid-3">
          <div class="ot-field">
            <label>Tipo de servicio <small>(opcional)</small></label>
            <select id="rec-servicio"><option value="">— Sin definir —</option></select>
          </div>
          <div class="ot-field">
            <label>Precio estimado (CLP) <small>(opcional)</small></label>
            <input type="number" id="rec-precio" min="0" step="1000" placeholder="Ej. 90000">
          </div>
          <div class="ot-field">
            <label>Mecánico que recibe <small>(opcional)</small></label>
            <select id="rec-mecanico"><option value="">— Sin asignar —</option></select>
          </div>
        </div>
      </div>

      <div class="ot-form-footer">
        <span class="ot-nota-obligatorios">● Los campos con <span class="ot-req">*</span> son obligatorios</span>
        <div class="ot-form-acciones">
          <button type="button" class="ot-btn ot-btn-secundario" id="rec-cancelar">Cancelar</button>
          <button type="submit" class="ot-btn ot-btn-primario" id="rec-confirmar">Confirmar e imprimir</button>
        </div>
      </div>
    </form>
  </div>`;
}

async function cargarMecanicos() {
  try {
    const token = await getValidToken();
    const resp = await fetch(`${API_BASE_URL}/empleados/`, {
      headers: { 'Authorization': token ? `Bearer ${token}` : '' },
    });
    if (!resp.ok) throw new Error();
    const empleados = await resp.json();
    // Caso especial: solo mecánicos activos son asignables
    mecanicos = empleados.filter(e => (e.estado || '').toLowerCase() === 'activo');
    const select = document.getElementById('rec-mecanico');
    if (select) {
      select.innerHTML = '<option value="">— Sin asignar —</option>' + mecanicos.map(m =>
        `<option value="${escapeHtml(m.id)}">${escapeHtml(m.nombres)} ${escapeHtml(m.apellidos)}</option>`
      ).join('');
    }
  } catch (e) {
    // Sin mecánicos no se bloquea la recepción (campo opcional)
  }
}

async function cargarServicios() {
  try {
    const token = await getValidToken();
    const resp = await fetch(`${API_BASE_URL}/servicios/`, {
      headers: { 'Authorization': token ? `Bearer ${token}` : '' },
    });
    if (!resp.ok) throw new Error();
    serviciosCatalogo = await resp.json();
    const select = document.getElementById('rec-servicio');
    if (select) {
      select.innerHTML = '<option value="">— Sin definir —</option>' + serviciosCatalogo.map(s =>
        `<option value="${escapeHtml(s.id)}">${escapeHtml(s.nombre)}</option>`
      ).join('');
    }
  } catch (e) {
    // catálogo opcional
  }
}

function configurarEventos(container) {
  const form = container.querySelector('#recepcion-form');
  const placaInput = container.querySelector('#rec-placa');

  // Lookup de placa con debounce → autocompletar si el vehículo ya existe
  placaInput.addEventListener('input', debounce(async () => {
    const placa = placaInput.value.trim().toUpperCase().replace(/[\s\-]/g, '');
    placaInput.value = placaInput.value.toUpperCase();
    if (placa.length < 5) {
      quitarBannerReconocido();
      return;
    }
    try {
      const vehiculo = await apiOrden(`/vehiculos/${encodeURIComponent(placa)}`);
      autocompletar(vehiculo);
    } catch (e) {
      if (e.status === 404) quitarBannerReconocido();
    }
  }, 350));

  container.querySelector('#rec-cancelar').addEventListener('click', () => {
    form.reset();
    quitarBannerReconocido();
  });

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    await confirmarRecepcion();
  });
}

async function autocompletar(vehiculo) {
  document.getElementById('rec-modelo').value = vehiculo.modelo || '';
  document.getElementById('rec-anio').value = vehiculo.anio || '';
  if (vehiculo.cliente) {
    document.getElementById('rec-nombre').value = vehiculo.cliente.nombre || '';
    document.getElementById('rec-celular').value = vehiculo.cliente.celular || '';
  }

  // Banner "Vehículo reconocido" con número de visitas
  let visitas = 0;
  try {
    const sugerencias = await apiOrden(`/vehiculos/buscar?q=${encodeURIComponent(vehiculo.placa)}`);
    const match = sugerencias.find(s => s.placa === vehiculo.placa);
    visitas = match ? match.visitas : 0;
  } catch (e) { /* opcional */ }

  const banner = document.getElementById('recepcion-banner');
  if (banner) {
    const nombreCliente = vehiculo.cliente?.nombre || '';
    const esRecurrente = visitas >= 1;
    banner.className = 'ot-banner ot-banner-reconocido';
    banner.innerHTML = `
      <span class="ot-banner-check" aria-hidden="true">✓</span>
      <div class="ot-banner-reconocido-texto">
        <strong>Vehículo reconocido · ${escapeHtml(vehiculo.placa)}</strong>
        <p>${esRecurrente
          ? `Cliente recurrente${nombreCliente ? ': <b>' + escapeHtml(nombreCliente) + '</b>' : ''}. Cargamos sus datos automáticamente — verifica y continúa.`
          : 'Ya existe en el historial. Cargamos los datos del cliente automáticamente — verifica y continúa.'}</p>
      </div>
      <span class="ot-visitas-badge">
        <strong>${escapeHtml(visitas)}</strong>
        <small>visita${visitas === 1 ? '' : 's'}<br>previa${visitas === 1 ? '' : 's'}</small>
      </span>`;
  }
}

function quitarBannerReconocido() {
  const banner = document.getElementById('recepcion-banner');
  if (banner && banner.classList.contains('ot-banner-reconocido')) {
    banner.className = 'ot-banner ot-banner-info';
    banner.innerHTML = `
      <span class="ot-banner-dot"></span>
      <div>
        <strong>Diagnóstico rápido</strong>
        <p>Solo completa lo mínimo. La cajera llenará los datos ampliados en la Proforma 2 desde Historial.</p>
      </div>`;
  }
}

function leerFormulario() {
  const placa = document.getElementById('rec-placa').value.trim();
  const nombre = document.getElementById('rec-nombre').value.trim();
  const celular = document.getElementById('rec-celular').value.trim();
  const diagnostico = document.getElementById('rec-diagnostico').value.trim();
  const modelo = document.getElementById('rec-modelo').value.trim();
  const anio = document.getElementById('rec-anio').value.trim();
  const servicioId = document.getElementById('rec-servicio').value;
  const precio = parseInt(document.getElementById('rec-precio').value, 10) || 0;
  const mecanicoId = document.getElementById('rec-mecanico').value;

  const datos = {
    placa,
    nombre_cliente: nombre,
    celular,
    diagnostico,
    modelo: modelo || null,
    anio: anio || null,
    mecanico_id: mecanicoId ? parseInt(mecanicoId, 10) : null,
    servicio_sugerido: null,
  };

  if (servicioId || precio > 0) {
    const servicio = serviciosCatalogo.find(s => s.id === parseInt(servicioId, 10));
    datos.servicio_sugerido = {
      servicio_id: servicio ? servicio.id : null,
      nombre: servicio ? servicio.nombre : 'Servicio por definir',
      precio,
      es_extra: false,
    };
  }
  return datos;
}

function validarFormulario(datos) {
  const errores = [];
  if (!datos.placa) errores.push('La placa es obligatoria');
  else if (!/^[A-Za-z0-9\s\-]{5,10}$/.test(datos.placa)) errores.push('Placa inválida (5 a 8 caracteres alfanuméricos)');
  if (!datos.nombre_cliente) errores.push('El nombre del cliente es obligatorio');
  if (!datos.celular) errores.push('El celular es obligatorio');
  else if (!/^[\d\s\+\-]{7,15}$/.test(datos.celular)) errores.push('Celular inválido');
  if (!datos.diagnostico) errores.push('El diagnóstico es obligatorio');
  return errores;
}

async function confirmarRecepcion() {
  if (enviando) return;
  const datos = leerFormulario();
  const errores = validarFormulario(datos);
  if (errores.length > 0) {
    showWarning(errores[0]);
    return;
  }
  abrirModalConfirmar(datos);
}

function abrirModalConfirmar(datos) {
  const modalContainer = document.getElementById('modal-container');
  if (!modalContainer) return;

  const servicioTxt = datos.servicio_sugerido
    ? `${escapeHtml(datos.servicio_sugerido.nombre)}${datos.servicio_sugerido.precio ? ' · ' + escapeHtml(formatCLP(datos.servicio_sugerido.precio)) : ''}`
    : 'Sin definir (se completará en Proforma 2)';

  modalContainer.innerHTML = `
    <div class="modal-overlay" id="ot-confirm-overlay">
      <div class="ot-modal">
        <h3>Confirmar recepción</h3>
        <p class="ot-modal-sub">Se creará la orden y se imprimirá la Proforma 1</p>
        <div class="ot-modal-resumen">
          <div><span>Placa</span><strong>${escapeHtml(datos.placa.toUpperCase())}</strong></div>
          <div><span>Cliente</span><strong>${escapeHtml(datos.nombre_cliente)}</strong></div>
          <div><span>Celular</span><strong>${escapeHtml(datos.celular)}</strong></div>
          <div><span>Servicio</span><strong>${servicioTxt}</strong></div>
        </div>
        <div class="ot-modal-acciones">
          <button class="ot-btn ot-btn-secundario" id="ot-confirm-no">Volver</button>
          <button class="ot-btn ot-btn-primario" id="ot-confirm-si">Confirmar e imprimir</button>
        </div>
      </div>
    </div>`;

  const cerrar = () => { modalContainer.innerHTML = ''; };
  document.getElementById('ot-confirm-no').addEventListener('click', cerrar);
  document.getElementById('ot-confirm-overlay').addEventListener('click', (e) => {
    if (e.target.id === 'ot-confirm-overlay') cerrar();
  });
  document.getElementById('ot-confirm-si').addEventListener('click', async () => {
    cerrar();
    await enviarRecepcion(datos);
  });
}

async function enviarRecepcion(datos) {
  enviando = true;
  const btn = document.getElementById('rec-confirmar');
  if (btn) { btn.disabled = true; btn.textContent = 'Registrando...'; }

  try {
    const orden = await apiOrden('/', { method: 'POST', body: datos });
    showSuccess(`${orden.vehiculo.placa} enviado a Pendientes e Historial. Imprimiendo…`);

    const form = document.getElementById('recepcion-form');
    if (form) form.reset();
    quitarBannerReconocido();

    // Abrir Proforma 1 imprimible en pestaña nueva
    window.open(`proforma.html?id=${orden.id}&tipo=1`, '_blank');
  } catch (error) {
    showError(error.detail || 'Error al registrar la recepción');
  } finally {
    enviando = false;
    if (btn) { btn.disabled = false; btn.textContent = 'Confirmar e imprimir'; }
  }
}
