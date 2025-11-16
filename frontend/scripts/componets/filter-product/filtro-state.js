export const filterState = {
  searchQuery : '',
  selectCategories: [],
  lowStock : false,
  priceRange : {
    min: null,
    max : null
  }
}

export function updateFilterState (filterName, data) {
  filterState[filterName] = data;
}

export function clearFilters () {
  filterState.searchQuery = '';
  filterState.selectCategories = [];
  filterState.lowStock = false;
  filterState.priceRange.min = null;
  filterState.priceRange.max = null;

}