export function loadSideBar(){
    return `
        <aside class="side-bar-container">
            <nav class="sidebar-nav">
                <ul>
                    <li>
                        <a href="#">
                            <img src="../assets/icons/home.png" alt="Home">
                            <span>Inicio</span>
                        </a>
                    </li>
                    <li>
                        <a href="inventary.html">
                            <img src="../assets/icons/package.png" alt="Inventario">
                            <span>Inventario</span>
                        </a>
                    </li>
                    <li>
                        <a href="service.html">
                            <img src="../assets/icons/toolbox.png" alt="Servicios">
                            <span>Servicios</span>
                        </a>
                    </li>
                    <li>
                        <a href="#">
                            <img src="../assets/icons/checklist.png" alt="Orden de servicio">
                            <span>Orden</span>
                        </a>
                    </li>
                    <li>
                        <a href="#">
                            <img src="../assets/icons/leader.png" alt="Personal">
                            <span>Personal</span>
                        </a>
                    </li>
                </ul>
            </nav>
        </aside>
    `;
}