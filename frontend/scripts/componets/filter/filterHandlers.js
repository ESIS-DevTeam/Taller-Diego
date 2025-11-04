import { debounce } from "../../utils/debounce.js"; // crea uno si no existe

export function setupFilterHandlers(filterManager, onFilterChange) {
  if (!filterManager) return;

  const form = document.getElementById("inventory-form");
  if (!form || form.dataset.handlersAttached === "true") return;
  form.dataset.handlersAttached = "true";

  const searchInput = form.querySelector("[data-search-input]");
  const minPriceInput = form.querySelector("[data-min-price]");
  const maxPriceInput = form.querySelector("[data-max-price]");
  const lowStockInput = form.querySelector("[data-low-stock]");
  const clearBtn = form.querySelector("[data-clear-filters]");
  const categoryContainer = form.querySelector(".category-option");

  const emit = () => onFilterChange?.(filterManager.getFilteredProducts());

  if (searchInput) {
    const onSearch = debounce((value) => {
      filterManager.updateFilters({ search: value });
      emit();
    }, 250);

    searchInput.addEventListener("input", (e) => onSearch(e.target.value));
  }

  if (minPriceInput) {
    minPriceInput.addEventListener("input", (e) => {
      const value = e.target.value.trim();
      filterManager.updateFilters({ minPrice: value === "" ? null : Number(value) });
      emit();
    });
  }

  if (maxPriceInput) {
    maxPriceInput.addEventListener("input", (e) => {
      const value = e.target.value.trim();
      filterManager.updateFilters({ maxPrice: value === "" ? null : Number(value) });
      emit();
    });
  }

  if (lowStockInput) {
    lowStockInput.addEventListener("change", (e) => {
      filterManager.updateFilters({ lowStock: e.target.checked });
      emit();
    });
  }

  if (categoryContainer) {
    categoryContainer.addEventListener("change", () => {
      const selected = Array.from(
        categoryContainer.querySelectorAll('input[name="category"]:checked')
      ).map((input) => input.value);
      filterManager.updateFilters({ categories: selected });
      emit();
    });
  }

  if (clearBtn) {
    clearBtn.addEventListener("click", () => {
      if (searchInput) searchInput.value = "";
      if (minPriceInput) minPriceInput.value = "";
      if (maxPriceInput) maxPriceInput.value = "";
      if (lowStockInput) lowStockInput.checked = false;
      categoryContainer?.querySelectorAll('input[name="category"]').forEach((cb) => (cb.checked = false));
      filterManager.clearFilters();
      emit();
    });
  }
}