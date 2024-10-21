"use client";

import { useState, useEffect } from 'react';

export default function Areas() {
  const [areas, setAreas] = useState([]);
  const [nuevaArea, setNuevaArea] = useState('');
  const [mensaje, setMensaje] = useState('');

  // Función para obtener las áreas desde la API
  const obtenerAreas = async () => {
    try {
      const res = await fetch('/api/areas');
      const data = await res.json();
      setAreas(data);
    } catch (error) {
      console.error('Error al obtener áreas:', error);
    }
  };

  // Función para crear una nueva área
  const crearArea = async () => {
    try {
      const res = await fetch('/api/areas', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nombrearea: nuevaArea }), // Enviar el nombre del área
      });

      if (res.ok) {
        setMensaje('Área creada exitosamente');
        setNuevaArea('');
        obtenerAreas(); // Recargar la lista de áreas
      } else {
        setMensaje('Error al crear el área');
      }
    } catch (error) {
      console.error('Error al crear el área:', error);
      setMensaje('Error en el servidor');
    }
  };

  // Función para eliminar un área específica
  const eliminarArea = async (id_area: number) => {
    try {
      const res = await fetch(`/api/areas/${id_area}`, {  // URL dinámica que incluye el `id_area`
        method: 'DELETE',
      });

      if (res.ok) {
        setMensaje('Área eliminada exitosamente');
        obtenerAreas(); // Recargar la lista de áreas
      } else {
        setMensaje('Error al eliminar el área');
      }
    } catch (error) {
      console.error('Error al eliminar el área:', error);
      setMensaje('Error en el servidor');
    }
  };

  // Ejecutar obtenerAreas cuando el componente se monte
  useEffect(() => {
    obtenerAreas();
  }, []);

  return (
    <div className="container">
      <h1>Gestión de Áreas</h1>
      <input
        type="text"
        placeholder="Nombre de la nueva área"
        value={nuevaArea}
        onChange={(e) => setNuevaArea(e.target.value)}
        className="form-control mb-3"
      />
      <button className="btn btn-primary mb-3" onClick={crearArea}>
        Crear Área
      </button>

      {mensaje && <p className="text-success">{mensaje}</p>}

      <ul className="list-group">
        {areas.map((area: any) => (
          <li key={area.id_area} className="list-group-item d-flex justify-content-between align-items-center">
            {area.nombrearea}
            <button className="btn btn-danger" onClick={() => eliminarArea(area.id_area)}>
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
