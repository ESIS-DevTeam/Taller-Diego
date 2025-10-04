export function loadMobileMenu(){
    return `
        <div class="mobile-actions-menu">
            <ul>
                <li>
                    <a>
                        <img src="../assets/icons/list.png" alt="Lista de productos">
                        <span>Inventario</span>
                    </a>
                </li>
                <li>
                    <a>
                        <img src="../assets/icons/add.png" alt="Agregar producto">
                        <span>Agregar producto</span>
                    </a>
                </li>
                <li>
                    <a>
                        <img src="../assets/icons/edit.png" alt="Editar producto">
                        <span>Editar producto</span>
                    </a>
                </li>
                <li>
                    <a>
                        <img src="../assets/icons/delete.png" alt="Eliminar producto">
                        <span>Eliminar producto</span>
                    </a>
                </li>
            </ul>
        </div>
    `;
}

