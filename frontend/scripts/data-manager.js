// data-manager.js
export const products = [
  {
    id: 1,
    name: "Aceite Motor 5W-30",
    description: "Aceite sintético para motor",
    stock: 15,
    minStock: 5,
    purchasePrice: 10000,
    sellingPrice: 25000,
    category: "aceite"
  },
  {
    id: 2,
    name: "Filtro de Aire",
    description: "Filtro de aire premium",
    stock: 2,
    minStock: 3,
    purchasePrice: 10000,
    sellingPrice: 15000,
    category: "filtro"
  },
  {
    id: 3,
    name: "Bujías Iridium",
    description: "Bujías de alto rendimiento",
    stock: 20,
    minStock: 5,
    purchasePrice: 10000,
    sellingPrice: 12000,
    category: "bujia"
  },
  {
    id: 4,
    name: "Pastillas de Freno",
    description: "Pastillas delanteras",
    stock: 5,
    minStock: 2,
    purchasePrice: 10000,
    sellingPrice: 45000,
    category: "autoparte"
  },
  {
    id: 5,
    name: "Correa de Distribución",
    description: "Correa resistente para motor",
    stock: 12,
    minStock: 4,
    purchasePrice: 15000,
    sellingPrice: 30000,
    category: "autoparte"
  },
  {
    id: 6,
    name: "Líquido de Frenos",
    description: "Líquido DOT 4",
    stock: 25,
    minStock: 10,
    purchasePrice: 5000,
    sellingPrice: 12000,
    category: "autoparte"
  },
  {
    id: 7,
    name: "Filtro de Combustible",
    description: "Filtro de gasolina y diésel",
    stock: 10,
    minStock: 3,
    purchasePrice: 8000,
    sellingPrice: 18000,
    category: "filtro"
  },
  {
    id: 8,
    name: "Amortiguador Delantero",
    description: "Amortiguador de suspensión delantera",
    stock: 6,
    minStock: 2,
    purchasePrice: 30000,
    sellingPrice: 60000,
    category: "autoparte"
  },
  {
    id: 9,
    name: "Batería 12V",
    description: "Batería para vehículos 12V",
    stock: 7,
    minStock: 3,
    purchasePrice: 20000,
    sellingPrice: 40000,
    category: "autoparte"
  },
  {
    id: 10,
    name: "Aceite de Transmisión",
    description: "Aceite para caja automática",
    stock: 14,
    minStock: 5,
    purchasePrice: 12000,
    sellingPrice: 25000,
    category: "aceite"
  },
  {
    id: 11,
    name: "Sensor de Oxígeno",
    description: "Sensor O2 para motor",
    stock: 9,
    minStock: 3,
    purchasePrice: 15000,
    sellingPrice: 32000,
    category: "autoparte"
  },
  {
    id: 12,
    name: "Pastillas de Embrague",
    description: "Juego de pastillas de embrague",
    stock: 8,
    minStock: 10,
    purchasePrice: 20000,
    sellingPrice: 45000,
    category: "autoparte"
  },
  {
    id: 13,
    name: "Filtro de Aceite",
    description: "Filtro para aceite de motor",
    stock: 18,
    minStock: 5,
    purchasePrice: 7000,
    sellingPrice: 15000,
    category: "filtro"
  },
  {
    id: 14,
    name: "Radiador",
    description: "Radiador para motor estándar",
    stock: 4,
    minStock: 6,
    purchasePrice: 50000,
    sellingPrice: 90000,
    category: "autoparte"
  }
];
export const categories = [
    "Bujia", "Filtro", "Aceite", "AutoParte"
];

// Funciones para manejar los datos
export function getProducts() {
    return products;
}

export function getProductById(id) {
    return products.find(product => product.id === id);
}

export function addProduct(productData) {
    const newProduct = {
        ...productData,
        id: generateId()
    };
    products.push(newProduct);
    return newProduct;
}

export function updateProduct(id, updatedProduct) {
    const index = products.findIndex(p => p.id === id);
    if (index !== -1) {
        products[index] = { ...products[index], ...updatedProduct };
        return products[index];
    }
    return null;
}

export function deleteProduct(id) {
    const index = products.findIndex(p => p.id === id);
    if (index !== -1) {
        return products.splice(index, 1)[0];
    }
    return null;
}

export function getProductsByCategory(category) {
    return products.filter(product => product.category === category.toLowerCase());
}

function generateId() {
    return Math.max(...products.map(p => p.id), 0) + 1;
}