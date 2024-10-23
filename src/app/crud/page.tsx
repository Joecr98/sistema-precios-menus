"use client";

import { useState, useEffect } from 'react';

// Definir el tipo Cliente
type Cliente = {
  id: number;
  nombre: string;
  direccion: string;
  telefono: string;
};

export default function Clientes() {
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [nuevoCliente, setNuevoCliente] = useState({ nombre: '', direccion: '', telefono: '' });
  const [mensaje, setMensaje] = useState('');
  const [editando, setEditando] = useState<Cliente | null>(null);

  // Obtener la lista de clientes al cargar el componente
  useEffect(() => {
    obtenerClientes();
  }, []);

  const obtenerClientes = async () => {
    try {
      const res = await fetch('/api/clientes');
      const data = await res.json();
      setClientes(data);
    } catch (error) {
      console.error('Error al obtener los clientes:', error);
    }
  };

  // Crear un nuevo cliente
  const crearCliente = async () => {
    try {
      const res = await fetch('/api/clientes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(nuevoCliente),
      });

      if (res.ok) {
        setMensaje('Cliente creado exitosamente');
        setNuevoCliente({ nombre: '', direccion: '', telefono: '' });
        obtenerClientes();
      } else {
        setMensaje('Error al crear el cliente');
      }
    } catch (error) {
      console.error('Error al crear el cliente:', error);
    }
  };

  // Actualizar cliente
  const actualizarCliente = async () => {
    if (!editando) return;

    try {
      const res = await fetch('/api/clientes', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editando),
      });

      if (res.ok) {
        setMensaje('Cliente actualizado exitosamente');
        setEditando(null);
        obtenerClientes();
      } else {
        setMensaje('Error al actualizar el cliente');
      }
    } catch (error) {
      console.error('Error al actualizar el cliente:', error);
    }
  };

  // Eliminar cliente
  const eliminarCliente = async (id: number) => {
    try {
      const res = await fetch(`/api/clientes?id=${id}`, {
        method: 'DELETE',
      });

      if (res.ok) {
        setMensaje('Cliente eliminado exitosamente');
        obtenerClientes();
      } else {
        setMensaje('Error al eliminar el cliente');
      }
    } catch (error) {
      console.error('Error al eliminar el cliente:', error);
    }
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Gestión de Clientes</h1>

      <input
        type="text"
        placeholder="Nombre"
        value={nuevoCliente.nombre}
        onChange={(e) => setNuevoCliente({ ...nuevoCliente, nombre: e.target.value })}
        className="form-control mb-3"
      />

      <input
        type="text"
        placeholder="Dirección"
        value={nuevoCliente.direccion}
        onChange={(e) => setNuevoCliente({ ...nuevoCliente, direccion: e.target.value })}
        className="form-control mb-3"
      />

      <input
        type="text"
        placeholder="Teléfono"
        value={nuevoCliente.telefono}
        onChange={(e) => setNuevoCliente({ ...nuevoCliente, telefono: e.target.value })}
        className="form-control mb-3"
      />

      <button onClick={crearCliente} className="btn btn-primary mb-3">
        {editando ? 'Actualizar Cliente' : 'Crear Cliente'}
      </button>

      {mensaje && <p className="text-success">{mensaje}</p>}

      <h2 className="text-xl font-semibold">Lista de Clientes</h2>
      <ul className="list-group">
        {clientes.map((cliente) => (
          <li key={cliente.id} className="list-group-item d-flex justify-content-between">
            <span>
              {cliente.nombre} - {cliente.direccion} - {cliente.telefono}
            </span>
            <div>
              <button className="btn btn-warning mr-2" onClick={() => setEditando(cliente)}>
                Editar
              </button>
              <button className="btn btn-danger" onClick={() => eliminarCliente(cliente.id)}>
                Eliminar
              </button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
