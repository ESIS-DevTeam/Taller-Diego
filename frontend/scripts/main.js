// main.js
// Dashboard de INICIO (Propuesta A): KPIs reales del negocio,
// fecha destacada, alerta de stock y actividades recientes.
// Maneja casos especiales: carga (skeleton), API caída, listas vacías.

import { fetchFromApi } from './data-manager.js';
import { apiOrden, formatCLP, parseFecha } from './orden/format.js';
import { apiCaja, fechaISO, fechaLarga } from './caja/api.js';

// ========================================
// HELPERS DE DOM
// ========================================

const $ = (sel, ctx = document) => ctx.querySelector(sel);

/** Pluraliza en español: plural(3, 'cliente') → "3 clientes" */
function plural(n, singular, pluralForm = `${singular}s`) {
  return `${n} ${n === 1 ? singular : pluralForm}`;
}

/**
 * Escribe valor y subtítulo en una tarjeta KPI y quita el skeleton.
 * @param {string} id - id de la tarjeta (ej: 'kpi-ingresos')
 * @param {string|Node[]} valor - texto o nodos para el valor principal
 * @param {string} [sub] - subtítulo bajo el valor
 */
function setKpi(id, valor, sub = '') {
  const card = document.getElementById(id);
  if (!card) return;

  const valEl = $('.k-val', card);
  const subEl = $('.k-sub', card);

  if (valEl) {
    valEl.classList.remove('skeleton');
    valEl.textContent = '';
    if (Array.isArray(valor)) {
      valor.forEach(node => valEl.appendChild(node));
    } else {
      valEl.textContent = valor;
    }
  }
  if (subEl) subEl.textContent = sub || ' ';
}

/** Marca una tarjeta como "sin conexión" (caso especial: API caída). */
function setKpiError(id) {
  setKpi(id, '—', 'Sin conexión con el servidor');
}

/** Crea un chip pequeño (ej: "1 vencida") para insertar junto al valor. */
function crearChip(texto, clase) {
  const chip = document.createElement('span');
  chip.className = `chip ${clase}`;
  chip.textContent = texto;
  return chip;
}

// ========================================
// FECHA DESTACADA
// ========================================

/** Muestra la fecha de hoy en la insignia superior ("Martes 07 de julio, 2026"). */
function renderFecha() {
  const el = document.getElementById('fecha-hoy-valor');
  if (el) el.textContent = fechaLarga();
}

// ========================================
// FRANJA DE ALERTA
// ========================================

/**
 * Pinta la franja de alerta según el estado:
 * - 'stock'   → rojo: hay productos por agotarse
 * - 'ok'      → verde suave: todo en orden
 * - 'offline' → sin conexión con el backend
 */
function renderAlerta(estado, count = 0) {
  const banner = document.getElementById('alerta-banner');
  if (!banner) return;

  banner.hidden = false;
  banner.className = 'alert-content';
  banner.textContent = '';

  const h3 = document.createElement('h3');
  const link = document.createElement('a');

  if (estado === 'stock') {
    banner.classList.add('alerta-roja');
    h3.textContent = `¡Hay ${plural(count, 'producto')} por agotarse!`;
    link.textContent = 'Ver productos';
    link.href = 'inventory.html?stock=bajo';
    banner.append(h3, link);
  } else if (estado === 'ok') {
    banner.classList.add('alerta-verde');
    h3.textContent = '✓ Todos los productos tienen stock suficiente.';
    banner.append(h3);
  } else {
    banner.classList.add('alerta-offline');
    h3.textContent = 'No se pudo conectar con el servidor. Verifica que el backend esté encendido.';
    link.textContent = 'Reintentar';
    link.href = '';
    link.addEventListener('click', (e) => { e.preventDefault(); window.location.reload(); });
    banner.append(h3, link);
  }
}

// ========================================
// TARJETAS KPI
// ========================================

/** KPI 1 — Ingresos de hoy (desde /caja/cierre). */
function renderIngresos(cierre) {
  const pagos = (cierre.num_ventas || 0) + (cierre.num_servicios_cobrados || 0);
  const sub = pagos > 0
    ? `${plural(pagos, 'cobro')} registrados hoy`
    : 'Sin cobros registrados aún';
  setKpi('kpi-ingresos', formatCLP(cierre.total_ingresos), sub);
}

/** KPI 2 — Trabajos pendientes (órdenes no entregadas ni canceladas). */
function renderPendientes(ordenes) {
  const activas = ordenes.filter(o => o.estado !== 'entregado' && o.estado !== 'cancelado');
  const listos = activas.filter(o => o.estado === 'listo').length;

  let sub;
  if (activas.length === 0) {
    sub = 'Todo al día, sin trabajos en espera';
  } else if (listos > 0) {
    sub = `${plural(listos, 'vehículo')} listo${listos === 1 ? '' : 's'} para entrega`;
  } else {
    sub = 'En proceso en el taller';
  }
  setKpi('kpi-pendientes', String(activas.length), sub);
}

/** KPI 3 — Clientes deudores (desde /caja/deudores). */
function renderDeudores(data) {
  if (!data.clientes_con_deuda) {
    setKpi('kpi-deudores', [crearChip('Sin deudas', 'chip-ok')], 'Nadie debe dinero al taller');
    return;
  }
  const nodos = [document.createTextNode(formatCLP(data.total_adeudado))];
  if (data.deudas_vencidas > 0) {
    nodos.push(crearChip(`${data.deudas_vencidas} vencida${data.deudas_vencidas === 1 ? '' : 's'}`, 'chip-vencida'));
  }
  setKpi('kpi-deudores', nodos, `${plural(data.clientes_con_deuda, 'cliente')} con deuda`);
}

/** KPI 4 — Notas pendientes de pago (desde /caja/notas). */
function renderNotas(data) {
  const pendientes = (data.notas || []).filter(n => n.estado_visual !== 'pagada');
  const { por_vencer = 0, vencidas = 0 } = data.alertas || {};

  if (pendientes.length === 0) {
    setKpi('kpi-notas', [crearChip('Al día', 'chip-ok')], 'No hay notas pendientes de pago');
    return;
  }

  const nodos = [document.createTextNode(String(pendientes.length))];
  if (vencidas > 0) {
    nodos.push(crearChip(`${vencidas} vencida${vencidas === 1 ? '' : 's'}`, 'chip-vencida'));
  }
  const sub = por_vencer > 0
    ? `${plural(por_vencer, 'nota')} por vencer en 7 días`
    : 'Sin vencimientos próximos';
  setKpi('kpi-notas', nodos, sub);
}

// ========================================
// ACTIVIDADES RECIENTES (datos reales)
// ========================================

/** Convierte una fecha a texto relativo: "Hace 5 min", "Hoy, 10:15", "Ayer", "05/07/2026". */
function tiempoRelativo(fecha) {
  const d = parseFecha(fecha);
  if (!d) return '';

  const ahora = new Date();
  const difMin = Math.floor((ahora - d) / 60000);

  if (difMin < 1) return 'Ahora mismo';
  if (difMin < 60) return `Hace ${plural(difMin, 'minuto')}`;

  const hora = d.toLocaleTimeString('es-CL', { hour: '2-digit', minute: '2-digit', hour12: false });
  const esHoy = d.toDateString() === ahora.toDateString();
  if (esHoy) return `Hoy, ${hora}`;

  const ayer = new Date(ahora);
  ayer.setDate(ahora.getDate() - 1);
  if (d.toDateString() === ayer.toDateString()) return `Ayer, ${hora}`;

  return d.toLocaleDateString('es-CL', { day: '2-digit', month: '2-digit', year: 'numeric' });
}

/** Descripción corta del vehículo de una orden: "Toyota Yaris · GJKL-82". */
function describirVehiculo(orden) {
  const v = orden.vehiculo;
  if (!v) return 'vehículo sin datos';
  return [v.modelo, v.placa].filter(Boolean).join(' · ') || 'vehículo sin datos';
}

/**
 * Construye los eventos de actividad a partir de las órdenes reales:
 * recepciones, pagos, órdenes listas y entregas.
 */
function construirEventos(ordenes) {
  const eventos = [];

  for (const orden of ordenes) {
    const vehiculo = describirVehiculo(orden);

    if (orden.fecha_ingreso) {
      eventos.push({
        fecha: orden.fecha_ingreso,
        tipo: 'nuevo',
        icono: '+',
        texto: `Nueva recepción — ${vehiculo}: ${orden.diagnostico || 'sin diagnóstico'}`,
      });
    }

    for (const pago of orden.pagos || []) {
      eventos.push({
        fecha: pago.fecha,
        tipo: 'pago',
        icono: '$',
        texto: `Pago recibido ${formatCLP(pago.monto)} (${pago.metodo}) — orden ${orden.codigo}`,
      });
    }

    if (orden.fecha_listo && orden.estado !== 'entregado') {
      eventos.push({
        fecha: orden.fecha_listo,
        tipo: 'ok',
        icono: '✓',
        texto: `Orden ${orden.codigo} lista para entrega — ${vehiculo}`,
      });
    }

    if (orden.fecha_entrega) {
      const deuda = orden.entregado_con_deuda ? ' (con saldo pendiente)' : '';
      eventos.push({
        fecha: orden.fecha_entrega,
        tipo: 'ok',
        icono: '✓',
        texto: `Orden ${orden.codigo} entregada — ${vehiculo}${deuda}`,
      });
    }
  }

  return eventos
    .filter(e => parseFecha(e.fecha))
    .sort((a, b) => parseFecha(b.fecha) - parseFecha(a.fecha))
    .slice(0, 5);
}

/** Pinta la lista de actividades (o su estado vacío / de error). */
function renderActividades(ordenes) {
  const lista = document.getElementById('lista-actividades');
  if (!lista) return;
  lista.textContent = '';

  if (ordenes === null) {
    const aviso = document.createElement('li');
    aviso.className = 'actividades-error';
    aviso.textContent = 'No se pudieron cargar las actividades (sin conexión con el servidor).';
    lista.appendChild(aviso);
    return;
  }

  const eventos = construirEventos(ordenes);

  if (eventos.length === 0) {
    const vacio = document.createElement('li');
    vacio.className = 'actividades-vacio';
    vacio.textContent = 'Aún no hay actividad registrada. Cuando recibas un vehículo o registres un pago, aparecerá aquí.';
    lista.appendChild(vacio);
    return;
  }

  for (const evento of eventos) {
    const li = document.createElement('li');
    li.className = 'item-recent-activities';

    const dot = document.createElement('span');
    dot.className = `dot dot-${evento.tipo}`;
    dot.textContent = evento.icono;

    const cuerpo = document.createElement('div');
    cuerpo.className = 'item-recent-activities-text';

    const p = document.createElement('p');
    p.textContent = evento.texto;

    const time = document.createElement('time');
    const d = parseFecha(evento.fecha);
    if (d) time.dateTime = d.toISOString();
    time.textContent = tiempoRelativo(evento.fecha);

    cuerpo.append(p, time);
    li.append(dot, cuerpo);
    lista.appendChild(li);
  }
}

// ========================================
// INICIALIZACIÓN
// ========================================

/** Carga todos los datos en paralelo; cada tarjeta maneja su propio error. */
async function init() {
  renderFecha();

  const [cierre, ordenes, deudores, notas, productos, servicios] = await Promise.allSettled([
    apiCaja(`/cierre?fecha=${fechaISO()}`),
    apiOrden('/'),
    apiCaja('/deudores'),
    apiCaja('/notas?estado=todas'),
    fetchFromApi('productos'),
    fetchFromApi('servicios'),
  ]);

  // KPI: ingresos de hoy
  if (cierre.status === 'fulfilled' && cierre.value) renderIngresos(cierre.value);
  else setKpiError('kpi-ingresos');

  // KPI: trabajos pendientes + actividades (comparten la misma consulta)
  if (ordenes.status === 'fulfilled' && Array.isArray(ordenes.value)) {
    renderPendientes(ordenes.value);
    renderActividades(ordenes.value);
  } else {
    setKpiError('kpi-pendientes');
    renderActividades(null);
  }

  // KPI: deudores
  if (deudores.status === 'fulfilled' && deudores.value) renderDeudores(deudores.value);
  else setKpiError('kpi-deudores');

  // KPI: notas de pago
  if (notas.status === 'fulfilled' && notas.value) renderNotas(notas.value);
  else setKpiError('kpi-notas');

  // Fila secundaria (fetchFromApi devuelve undefined si falló)
  const listaProductos = productos.status === 'fulfilled' && Array.isArray(productos.value) ? productos.value : null;
  const listaServicios = servicios.status === 'fulfilled' && Array.isArray(servicios.value) ? servicios.value : null;
  if (listaProductos) setKpi('kpi-productos', String(listaProductos.length));
  else setKpiError('kpi-productos');
  if (listaServicios) setKpi('kpi-servicios', String(listaServicios.length));
  else setKpiError('kpi-servicios');

  // Franja de alerta: prioridad → sin conexión > bajo stock > todo en orden
  if (!listaProductos) {
    renderAlerta('offline');
  } else {
    const bajoStock = listaProductos.filter(p => p.stock <= p.stockMin).length;
    renderAlerta(bajoStock > 0 ? 'stock' : 'ok', bajoStock);
  }
}

// Iniciar cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', async () => {
  // Cargar componentes dinámicamente (si no están ya cargados por SSI)
  const { loadComponent } = await import('./utils/component-loader.js');
  await loadComponent('header', 'includes/header.html');
  await loadComponent('side-bar', 'includes/sidebar.html');

  init();
});
