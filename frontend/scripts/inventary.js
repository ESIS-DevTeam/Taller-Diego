import { loadSideBar } from "./componets/side_bar.js";
import { loadMobileMenu } from "./componets/mobile_menu.js";
import { loadHeader } from "./componets/header.js";

const sideBarContainer = document.getElementById("side-bar-container");
sideBarContainer.innerHTML = loadSideBar();

const mobileMenu = document.getElementById("mobile-menu-container");
mobileMenu.innerHTML = loadMobileMenu();

const header = document.getElementById('header');
header.innerHTML = loadHeader();

//Datos inventados
const products = [
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

const category = [
    "Bujía", "Filtro", "Aceite", "AutoParte"
];

//Cargar los datos de categoria de forma dinamica
function renderCategory(categoryToRender){
    const categoryList = document.querySelector(".category-option");
    categoryList.innerHTML = "";
    categoryToRender.forEach(ctg => {
        const categoryHTML = `
            <li><label><input type="button" name="category" value="${ctg}"></label></li>
        `;
        categoryList.innerHTML+=categoryHTML
    })
}


//Cargar los datos de productos de forma dinamica
function renderProduct(productsToRender){
    const productsList = document.querySelector(".product-list");
    productsList.innerHTML = "";
    productsToRender.forEach(product=> {
        const verify = (product.stock <= product.minStock) ? "low-stock" : "normal-stock";
        const productoHTML = `
        <div class="product-item grid-layout" role="row" data-id="${product.id}">
            <div class="product-name" role="cell">${product.name}</div>
            <div class="product-desc" role="cell">${product.description}</div>
            <div class="product-stock ${verify}" role="cell">${product.stock}</div>
            <div class="product-purchase-price" role="cell">${product.purchasePrice}</div>
            <div class="product-selling-price" role="cell">${product.sellingPrice}</div>
            <div class="product-actions" role="cell">
                <button class="btn-edit" data-id="${product.id}" title="Modificar">
                    <img src="../assets/icons/edit.png" alt="Editar producto">
                </button>
                <button class="btn-delete" data-id="${product.id}" title="Eliminar">
                    <img src="../assets/icons/delete.png" alt="Eliminar producto">
                </button>
            </div>
        </div>
        `
        productsList.innerHTML += productoHTML;
    });
    attachButtonListeners();
}

//Funcionalidad de los botones
function attachButtonListeners(){
    document.querySelectorAll(".btn-edit").forEach(btn => {
        btn.addEventListener('click', (e) =>{
            const productID = e.currentTarget.dataset.id;
            editProduct(productID);
        })
        
    });
    document.querySelectorAll(".btn-delete").forEach(btn =>{
        btn.addEventListener('click', (e) =>{
            const productID = e.currentTarget.dataset.id;
            deleteProduct(productID);
        })
    })

    document.querySelectorAll(".btn-agregar").forEach(btn=>{
      btn.addEventListener('click', (e) =>{
        addProduct();
      })
    })
}

function editProduct(ID){
}
function deleteProduct(ID){
}
function addProduct(){
}


renderCategory(category);
renderProduct(products);
attachButtonListeners();