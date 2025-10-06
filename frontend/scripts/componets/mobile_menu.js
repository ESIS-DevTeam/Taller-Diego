export function loadMobileMenu(){
    return `
        <div class="mobile-actions-menu">
            <ul>
                <li>
                    <button id="mobile-btn-list">
                        <img src="../assets/icons/list.png" alt="Lista de productos">
                        <span>Inventario</span>
                    </button>
                </li>
                <li>
                    <button id="mobile-btn-add">
                        <img src="../assets/icons/add.png" alt="Agregar producto">
                        <span>Agregar producto</span>
                    </button>
                </li>
                <li>
                    <button id="mobile-btn-edit">
                        <img src="../assets/icons/edit.png" alt="Editar producto">
                        <span>Editar producto</span>
                    </button>
                </li>
                <li>
                    <button id="mobile-btn-delete">
                        <img src="../assets/icons/delete.png" alt="Eliminar producto">
                        <span>Eliminar producto</span>
                    </button>
                </li>
            </ul>
        </div>
    `;
}

