import { loadSideBar } from "./componets/side_bar.js";
import { loadHeader } from "./componets/header.js";

// Cargar componentes UI



function renderProducts() {
  
}


addEventListener("DOMContentLoaded", () => {
  const sideBarContainer = document.getElementById("side-bar-container");
  const header = document.getElementById("header");
  if (sideBarContainer) sideBarContainer.innerHTML = loadSideBar();
  if (header) header.innerHTML = loadHeader();

});
