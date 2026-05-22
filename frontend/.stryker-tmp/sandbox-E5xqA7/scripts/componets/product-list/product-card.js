// @ts-nocheck
function stryNS_9fa48() {
  var g = typeof globalThis === 'object' && globalThis && globalThis.Math === Math && globalThis || new Function("return this")();
  var ns = g.__stryker__ || (g.__stryker__ = {});
  if (ns.activeMutant === undefined && g.process && g.process.env && g.process.env.__STRYKER_ACTIVE_MUTANT__) {
    ns.activeMutant = g.process.env.__STRYKER_ACTIVE_MUTANT__;
  }
  function retrieveNS() {
    return ns;
  }
  stryNS_9fa48 = retrieveNS;
  return retrieveNS();
}
stryNS_9fa48();
function stryCov_9fa48() {
  var ns = stryNS_9fa48();
  var cov = ns.mutantCoverage || (ns.mutantCoverage = {
    static: {},
    perTest: {}
  });
  function cover() {
    var c = cov.static;
    if (ns.currentTestId) {
      c = cov.perTest[ns.currentTestId] = cov.perTest[ns.currentTestId] || {};
    }
    var a = arguments;
    for (var i = 0; i < a.length; i++) {
      c[a[i]] = (c[a[i]] || 0) + 1;
    }
  }
  stryCov_9fa48 = cover;
  cover.apply(null, arguments);
}
function stryMutAct_9fa48(id) {
  var ns = stryNS_9fa48();
  function isActive(id) {
    if (ns.activeMutant === id) {
      if (ns.hitCount !== void 0 && ++ns.hitCount > ns.hitLimit) {
        throw new Error('Stryker: Hit count limit reached (' + ns.hitCount + ')');
      }
      return true;
    }
    return false;
  }
  stryMutAct_9fa48 = isActive;
  return isActive(id);
}
import { escapeHtml } from '../../utils/sanitize.js';
function formatCurrency(value) {
  if (stryMutAct_9fa48("0")) {
    {}
  } else {
    stryCov_9fa48("0");
    const amount = Number(value);
    if (stryMutAct_9fa48("2") ? false : stryMutAct_9fa48("1") ? true : (stryCov_9fa48("1", "2"), Number.isNaN(amount))) {
      if (stryMutAct_9fa48("3")) {
        {}
      } else {
        stryCov_9fa48("3");
        return stryMutAct_9fa48("4") ? "" : (stryCov_9fa48("4"), '$0');
      }
    }
    return new Intl.NumberFormat(stryMutAct_9fa48("5") ? "" : (stryCov_9fa48("5"), 'es-CO'), stryMutAct_9fa48("6") ? {} : (stryCov_9fa48("6"), {
      style: stryMutAct_9fa48("7") ? "" : (stryCov_9fa48("7"), 'currency'),
      currency: stryMutAct_9fa48("8") ? "" : (stryCov_9fa48("8"), 'COP'),
      maximumFractionDigits: 0
    })).format(amount);
  }
}
export function generateProductCard(product) {
  if (stryMutAct_9fa48("9")) {
    {}
  } else {
    stryCov_9fa48("9");
    const stock = Number(stryMutAct_9fa48("10") ? product?.stock && 0 : (stryCov_9fa48("10"), (stryMutAct_9fa48("11") ? product.stock : (stryCov_9fa48("11"), product?.stock)) ?? 0));
    const stockMin = Number(stryMutAct_9fa48("12") ? product?.stockMin && 0 : (stryCov_9fa48("12"), (stryMutAct_9fa48("13") ? product.stockMin : (stryCov_9fa48("13"), product?.stockMin)) ?? 0));
    const classStock = stryMutAct_9fa48("14") ? `` : (stryCov_9fa48("14"), `product-stock ${(stryMutAct_9fa48("18") ? stockMin <= stock : stryMutAct_9fa48("17") ? stockMin >= stock : stryMutAct_9fa48("16") ? false : stryMutAct_9fa48("15") ? true : (stryCov_9fa48("15", "16", "17", "18"), stockMin > stock)) ? stryMutAct_9fa48("19") ? "" : (stryCov_9fa48("19"), 'low-stock') : stryMutAct_9fa48("20") ? "" : (stryCov_9fa48("20"), 'normal-stock')}`);
    const safeName = escapeHtml(stryMutAct_9fa48("21") ? product.nombre : (stryCov_9fa48("21"), product?.nombre));
    const safeDescription = escapeHtml(stryMutAct_9fa48("24") ? product?.descripcion && 'Sin descripción' : stryMutAct_9fa48("23") ? false : stryMutAct_9fa48("22") ? true : (stryCov_9fa48("22", "23", "24"), (stryMutAct_9fa48("25") ? product.descripcion : (stryCov_9fa48("25"), product?.descripcion)) || (stryMutAct_9fa48("26") ? "" : (stryCov_9fa48("26"), 'Sin descripción'))));
    const safePurchasePrice = formatCurrency(stryMutAct_9fa48("27") ? product.precioCompra : (stryCov_9fa48("27"), product?.precioCompra));
    const safeSellingPrice = formatCurrency(stryMutAct_9fa48("28") ? product.precioVenta : (stryCov_9fa48("28"), product?.precioVenta));
    return stryMutAct_9fa48("29") ? `` : (stryCov_9fa48("29"), `
  <div class="product-item" data-product-id="${escapeHtml(stryMutAct_9fa48("30") ? product.id : (stryCov_9fa48("30"), product?.id))}">
    <div class="product-name">${safeName}</div>
    <div class="product-desc">${safeDescription}</div>
    <div class="${classStock}">${escapeHtml(stock)}</div>
    <div class="product-purchase-price">${safePurchasePrice}</div>
    <div class="product-selling-price">${safeSellingPrice}</div>
    <div class="product-actions">
      <button class="btn-edit product-actions-product" data-id="${escapeHtml(stryMutAct_9fa48("31") ? product.id : (stryCov_9fa48("31"), product?.id))}" data-action="edit">
        <img class="img-edit" src="../assets/icons/edit.png" alt="Editar">
      </button>
      <button class="btn-delete product-actions-product" data-id="${escapeHtml(stryMutAct_9fa48("32") ? product.id : (stryCov_9fa48("32"), product?.id))}" data-action="delete">
        <img class="img-delete" src="../assets/icons/delete.png" alt="Eliminar">
      </button>
    </div>
  </div>`);
  }
}