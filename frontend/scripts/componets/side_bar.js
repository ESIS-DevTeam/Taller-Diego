export function loadSideBar(){
    return `
        <aside id="sidebar" class="sidebar">
            <nav class="sidebar-nav">
                <ul>
                    <li>
                        <a href="#">
                            <img src="../assets/icons/home.png" alt="Home" class="icon">
                            <span>Inicio</span>
                        </a>
                    </li>
                    <li>
                        <a href="#">
                            <img src="../assets/icons/package.png" alt="Inventario" class="icon">
                            <span>Inventario</span>
                        </a>
                    </li>
                    <li>
                        <a href="#">
                            <img src="../assets/icons/toolbox.png" alt="Servicios" class="icon">
                            <span>Servicios</span>
                        </a>
                    </li>
                    <li>
                        <a href="#">
                            <img src="../assets/icons/checklist.png" alt="Orden de servicio" class="icon">
                            <span>Orden</span>
                        </a>
                    </li>
                    <li>
                        <a href="#">
                            <img src="../assets/icons/leader.png" alt="Personal" class="icon">
                            <span>Personal</span>
                        </a>
                    </li>
                </ul>
            </nav>
        </aside>`;
}