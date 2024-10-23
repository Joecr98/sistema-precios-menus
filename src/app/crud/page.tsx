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
      <h1 className="text-2xl font-bold mb-4 text-center">Gestión de Clientes</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-white p-6 rounded-lg shadow-lg">
          <h2 className="text-xl font-semibold mb-4">Añadir / Editar Cliente</h2>

          <input
            type="text"
            placeholder="Nombre"
            value={nuevoCliente.nombre}
            onChange={(e) => setNuevoCliente({ ...nuevoCliente, nombre: e.target.value })}
            className="w-full p-2 mb-3 border border-gray-300 rounded"
          />

          <input
            type="text"
            placeholder="Dirección"
            value={nuevoCliente.direccion}
            onChange={(e) => setNuevoCliente({ ...nuevoCliente, direccion: e.target.value })}
            className="w-full p-2 mb-3 border border-gray-300 rounded"
          />

          <input
            type="text"
            placeholder="Teléfono"
            value={nuevoCliente.telefono}
            onChange={(e) => setNuevoCliente({ ...nuevoCliente, telefono: e.target.value })}
            className="w-full p-2 mb-3 border border-gray-300 rounded"
          />

          <button
            onClick={crearCliente}
            className="w-full p-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition duration-300"
          >
            {editando ? 'Actualizar Cliente' : 'Crear Cliente'}
          </button>

          {mensaje && <p className="text-green-500 mt-2">{mensaje}</p>}
        </div>

        <div className="bg-white p-6 rounded-lg shadow-lg">
          <h2 className="text-xl font-semibold mb-4">Lista de Clientes</h2>
          <ul className="space-y-2">
            {clientes.map((cliente) => (
              <li
                key={cliente.id}
                className="p-3 bg-gray-100 rounded-lg flex justify-between items-center"
              >
                <span>
                  {cliente.nombre} - {cliente.direccion} - {cliente.telefono}
                </span>
                <div>
                  <button
                    className="p-2 bg-yellow-500 text-white rounded mr-2 hover:bg-yellow-600 transition duration-300"
                    onClick={() => setEditando(cliente)}
                  >
                    Editar
                  </button>
                  <button
                    className="p-2 bg-red-500 text-white rounded hover:bg-red-600 transition duration-300"
                    onClick={() => eliminarCliente(cliente.id)}
                  >
                    Eliminar
                  </button>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
