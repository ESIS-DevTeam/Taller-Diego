import { generateProductCard } from "../product-card.js";

describe("generateProductCard", () => {
	test("marks low stock when stockMin is greater than stock", () => {
		const html = generateProductCard({
			id: 1,
			nombre: "Filtro",
			descripcion: "Producto",
			stock: 2,
			stockMin: 5,
			precioCompra: 1000,
			precioVenta: 1500
		});

		expect(html).toContain("product-stock low-stock");
	});

	test("marks normal stock when stock equals stockMin (boundary)", () => {
		const html = generateProductCard({
			id: 2,
			nombre: "Aceite",
			descripcion: "Producto",
			stock: 5,
			stockMin: 5,
			precioCompra: 1000,
			precioVenta: 1500
		});

		expect(html).toContain("product-stock normal-stock");
	});

	test("formats invalid prices as $0", () => {
		const html = generateProductCard({
			id: 3,
			nombre: "Bujia",
			descripcion: "Producto",
			stock: 1,
			stockMin: 0,
			precioCompra: "no-number",
			precioVenta: NaN
		});

		expect(html).toMatch(/product-purchase-price\">[^<]*\$0/);
		expect(html).toMatch(/product-selling-price\">[^<]*\$0/);
	});
});
