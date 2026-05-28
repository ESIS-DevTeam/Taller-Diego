import { generateProductCard } from "../product-card.js";

describe("generateProductCard", () => {
  const baseProduct = {
    id: 1,
    nombre: "Filtro de Aire",
    descripcion: "Descripción del producto",
    stock: 10,
    stockMin: 5,
    precioCompra: 1000,
    precioVenta: 1500,
  };

  // ── Stock class ───────────────────────────────────────────────────────────
  test("marks low-stock when stockMin > stock", () => {
    const html = generateProductCard({ ...baseProduct, stock: 2, stockMin: 5 });
    expect(html).toContain("low-stock");
    expect(html).not.toContain("normal-stock");
  });

  test("marks normal-stock when stock equals stockMin (boundary)", () => {
    const html = generateProductCard({ ...baseProduct, stock: 5, stockMin: 5 });
    expect(html).toContain("normal-stock");
    expect(html).not.toContain("low-stock");
  });

  test("marks normal-stock when stock is greater than stockMin", () => {
    const html = generateProductCard({ ...baseProduct, stock: 10, stockMin: 3 });
    expect(html).toContain("normal-stock");
  });

  // ── Product name ──────────────────────────────────────────────────────────
  test("renders the product name in the card", () => {
    const html = generateProductCard({ ...baseProduct, nombre: "Bujía NGK" });
    expect(html).toContain("Bujía NGK");
  });

  // ── Description fallback ──────────────────────────────────────────────────
  test("renders provided description", () => {
    const html = generateProductCard({ ...baseProduct, descripcion: "Aceite 5W30" });
    expect(html).toContain("Aceite 5W30");
  });

  test("uses 'Sin descripción' when description is empty string", () => {
    const html = generateProductCard({ ...baseProduct, descripcion: "" });
    expect(html).toContain("Sin descripción");
  });

  test("uses 'Sin descripción' when description is undefined", () => {
    const { descripcion, ...noDesc } = baseProduct;
    const html = generateProductCard(noDesc);
    expect(html).toContain("Sin descripción");
  });

  // ── Stock value rendered ──────────────────────────────────────────────────
  test("renders the stock value in the card", () => {
    const html = generateProductCard({ ...baseProduct, stock: 42 });
    expect(html).toContain("42");
  });

  test("defaults stock to 0 when undefined", () => {
    const { stock, stockMin, ...noStock } = baseProduct;
    const html = generateProductCard(noStock);
    expect(html).toContain("normal-stock"); // both 0 → equal → normal
  });

  // ── Prices ────────────────────────────────────────────────────────────────
  test("formats invalid prices as $0", () => {
    const html = generateProductCard({
      ...baseProduct,
      precioCompra: "no-number",
      precioVenta: NaN,
    });
    expect(html).toMatch(/product-purchase-price">[^<]*\$0/);
    expect(html).toMatch(/product-selling-price">[^<]*\$0/);
  });

  test("formats valid purchase and selling prices (not $0)", () => {
    const html = generateProductCard({ ...baseProduct, precioCompra: 1000, precioVenta: 1500 });
    expect(html).not.toMatch(/product-purchase-price">[^<]*\$0/);
    expect(html).not.toMatch(/product-selling-price">[^<]*\$0/);
  });

  // ── data-product-id attribute ─────────────────────────────────────────────
  test("sets data-product-id attribute with the product id", () => {
    const html = generateProductCard({ ...baseProduct, id: 99 });
    expect(html).toContain('data-product-id="99"');
  });

  // ── Button data-id attributes ─────────────────────────────────────────────
  test("sets data-id on edit and delete buttons", () => {
    const html = generateProductCard({ ...baseProduct, id: 7 });
    const matches = html.match(/data-id="7"/g);
    expect(matches).toHaveLength(2); // edit button + delete button
  });

  test("edit button has data-action=edit", () => {
    const html = generateProductCard(baseProduct);
    expect(html).toContain('data-action="edit"');
  });

  test("delete button has data-action=delete", () => {
    const html = generateProductCard(baseProduct);
    expect(html).toContain('data-action="delete"');
  });
});
