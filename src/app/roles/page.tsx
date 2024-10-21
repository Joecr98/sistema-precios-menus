"use client";

import { useState, useEffect } from 'react';

export default function Roles() {
  const [roles, setRoles] = useState([]);
  const [nuevoRol, setNuevoRol] = useState('');
  const [mensaje, setMensaje] = useState('');

  // Obtener roles desde la API
  const obtenerRoles = async () => {
    try {
      const res = await fetch('/api/roles');
      const data = await res.json();
      setRoles(data);
    } catch (error) {
      console.error('Error al obtener roles:', error);
    }
  };

  // Crear un nuevo rol
  const crearRol = async () => {
    try {
      const res = await fetch('/api/roles', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nombre_rol: nuevoRol }),
      });

      if (res.ok) {
        setMensaje('Rol creado exitosamente');
        setNuevoRol('');
        obtenerRoles(); // Recargar la lista de roles
      } else {
        setMensaje('Error al crear el rol');
      }
    } catch (error) {
      console.error('Error al crear el rol:', error);
      setMensaje('Error en el servidor');
    }
  };

  // Eliminar un rol
  const eliminarRol = async (id_rol: number) => {
    try {
      const res = await fetch(`/api/roles/${id_rol}`, {
        method: 'DELETE',
      });

      if (res.ok) {
        setMensaje('Rol eliminado exitosamente');
        obtenerRoles(); // Recargar la lista de roles
      } else {
        setMensaje('Error al eliminar el rol');
      }
    } catch (error) {
      console.error('Error al eliminar el rol:', error);
      setMensaje('Error en el servidor');
    }
  };

  // Obtener roles cuando se carga el componente
  useEffect(() => {
    obtenerRoles();
  }, []);

  return (
    <div className="container">
      <h1>Gestión de Roles</h1>
      <input
        type="text"
        placeholder="Nombre del nuevo rol"
        value={nuevoRol}
        onChange={(e) => setNuevoRol(e.target.value)}
        className="form-control mb-3"
      />
      <button className="btn btn-primary mb-3" onClick={crearRol}>
        Crear Rol
      </button>

      {mensaje && <p className="text-success">{mensaje}</p>}

      <ul className="list-group">
        {roles.map((rol: any) => (
          <li key={rol.id_rol} className="list-group-item d-flex justify-content-between align-items-center">
            {rol.nombre_rol}
            <button className="btn btn-danger" onClick={() => eliminarRol(rol.id_rol)}>
              Eliminar
            </button>
          </li>
        ))}
      </ul>

      <button className="btn btn-secondary mt-4" onClick={() => window.history.back()}>
        Regresar al Menú
      </button>
    </div>
  );
}
