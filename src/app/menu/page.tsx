"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function Menu() {
  const [mostrarSubMenuUsuarios, setMostrarSubMenuUsuarios] = useState(false);
  const router = useRouter();

  const handleNavigation = (path: string) => {
    router.push(path);
  };

  const toggleSubMenuUsuarios = () => {
    setMostrarSubMenuUsuarios(!mostrarSubMenuUsuarios);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    router.push('/');
  };

  return (
    <div className="container mt-4">
      <h1>Menú Principal</h1>
      <ul className="list-group">
        {/* Opción Usuarios con submenú */}
        <li className="list-group-item" onClick={toggleSubMenuUsuarios}>
          Usuarios
          {mostrarSubMenuUsuarios && (
            <ul className="list-group mt-2">
              <li className="list-group-item" onClick={() => handleNavigation('/usuarios')}>
                Gestión de Usuarios
              </li>
              <li className="list-group-item" onClick={() => handleNavigation('/roles')}>
                Gestión de Roles
              </li>
              <li className="list-group-item" onClick={() => handleNavigation('/areas')}>
                Gestión de Áreas
              </li>
            </ul>
          )}
        </li>

        <li className="list-group-item" onClick={() => handleNavigation('/facturacion')}>
          Facturación
        </li>
        <li className="list-group-item" onClick={() => handleNavigation('/menus')}>
          Menús
        </li>
        <li className="list-group-item" onClick={() => handleNavigation('/productos')}>
          Productos
        </li>
        <li className="list-group-item" onClick={() => handleNavigation('/crud')}>
          Clientes
        </li>
      </ul>

      <button className="btn btn-logout mt-4" onClick={handleLogout}>
        Cerrar Sesión
      </button>
    </div>
  );
}
