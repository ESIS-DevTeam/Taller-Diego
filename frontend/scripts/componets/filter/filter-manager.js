const defaultFilters = {
  search: "",
  categories: [],
  lowStock: false,
  minPrice: null,
  maxPrice: null
};

export class FilterManager {
  constructor(products = []) {
    this.products = [...products];
    this.currentFilters = { ...defaultFilters };
    this._initFuse();
  }

  _initFuse() {
    if (typeof Fuse !== "undefined") {
      this.fuse = new Fuse(this.products, {
        keys: ["name", "description", "brand", "category"],
        threshold: 0.35,
        ignoreLocation: true
      });
    } else {
      this.fuse = null;
    }
  }

  updateProducts(products = []) {
    this.products = [...products];
    this._initFuse();
    return this.getFilteredProducts();
  }

  updateFilters(partial = {}) {
    this.currentFilters = { ...this.currentFilters, ...partial };
    return this.getFilteredProducts();
  }

  clearFilters() {
    this.currentFilters = { ...defaultFilters };
  }

  getFilteredProducts() {
    let result = [...this.products];
    const { search, categories, lowStock, minPrice, maxPrice } = this.currentFilters;

    if (search.trim()) {
      const query = search.trim();
      if (this.fuse) {
        result = this.fuse.search(query).map((item) => item.item);
      } else {
        const normalized = query.toLowerCase();
        result = result.filter(
          (p) =>
            p.name.toLowerCase().includes(normalized) ||
            p.description.toLowerCase().includes(normalized) ||
            p.brand.toLowerCase().includes(normalized) ||
            p.category.toLowerCase().includes(normalized)
        );
      }
    }

    if (categories?.length) {
      const set = new Set(categories.map((c) => c.toLowerCase()));
      result = result.filter((p) => set.has((p.category || "").toLowerCase()));
    }

    if (lowStock) {
      result = result.filter((p) => Number(p.stock) <= Number(p.minStock));
    }

    if (minPrice !== null) {
      result = result.filter((p) => Number(p.sellingPrice) >= Number(minPrice));
    }

    if (maxPrice !== null) {
      result = result.filter((p) => Number(p.sellingPrice) <= Number(maxPrice));
    }

    return result;
  }
}