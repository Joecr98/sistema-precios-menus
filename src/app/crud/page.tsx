"use client";

import { useState, useEffect } from 'react';
import Swal from 'sweetalert2';
import AsignacionMenuModal from '../../components/AsignacionMenuModal';

// Definir el tipo Cliente
type Cliente = {
  id: number;
  nombre: string;
  direccion: string;
  telefono: string;
};

export default function Clientes() {
  const [modalAbierto, setModalAbierto] = useState(false);
  const [clienteSeleccionado, setClienteSeleccionado] = useState<Cliente | null>(null);
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [nuevoCliente, setNuevoCliente] = useState({ id: 0, nombre: '', direccion: '', telefono: '' });
  const [mensaje, setMensaje] = useState('');
  const [editando, setEditando] = useState<Cliente | null>(null);

  useEffect(() => {
    obtenerClientes();
  }, []);

  const abrirModalAsignacion = (cliente: Cliente) => {
    setClienteSeleccionado(cliente);
    setModalAbierto(true);
  };

  const obtenerClientes = async () => {
    try {
      const res = await fetch('/api/clientes');
      const data = await res.json();
      setClientes(data);
    } catch (error) {
      console.error('Error al obtener los clientes:', error);
    }
  };

  const crearCliente = async () => {
    try {
      const res = await fetch('/api/clientes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(nuevoCliente),
      });

      if (res.ok) {
        setMensaje('Cliente creado exitosamente');
        setNuevoCliente({ id: 0, nombre: '', direccion: '', telefono: '' });
        obtenerClientes();
      } else {
        setMensaje('Error al crear el cliente');
      }
    } catch (error) {
      console.error('Error al crear el cliente:', error);
    }
  };

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

  const manejarEnvio = () => {
    if (editando) {
      actualizarCliente();
    } else {
      crearCliente();
    }
  };

  const eliminarCliente = async (id: number) => {
    const result = await Swal.fire({
      title: '¿Estás seguro?',
      text: "No podrás revertir esta acción!",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Sí, eliminar!',
      cancelButtonText: 'Cancelar'
    });

    if (result.isConfirmed) {
      try {
        const res = await fetch(`/api/clientes?id=${id}`, {
          method: 'DELETE',
        });

        if (res.ok) {
          setMensaje('Cliente eliminado exitosamente');
          obtenerClientes();
          Swal.fire('Eliminado!', 'El cliente ha sido eliminado.', 'success');
        } else {
          setMensaje('Error al eliminar el cliente');
          Swal.fire('Error!', 'No se pudo eliminar el cliente.', 'error');
        }
      } catch (error) {
        console.error('Error al eliminar el cliente:', error);
        Swal.fire('Error!', 'No se pudo eliminar el cliente.', 'error');
      }
    }
  };

  return (
    <main className="flex min-h-screen flex-col p-6">
      <h1 className="text-2xl font-bold mb-4 text-center">Gestión de Clientes</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="flex flex-col justify-center gap-6 rounded-lg bg-gray-50 px-6 py-10">
          <h2 className="text-xl font-semibold mb-4">Añadir / Editar Cliente</h2>

          <input
            type="text"
            placeholder="Nombre"
            value={editando ? editando.nombre : nuevoCliente.nombre}
            onChange={(e) => editando 
              ? setEditando({ ...editando, nombre: e.target.value }) 
              : setNuevoCliente({ ...nuevoCliente, nombre: e.target.value })}
            className="w-full p-2 mb-3 border border-gray-300 rounded"
          />

          <input
            type="text"
            placeholder="Dirección"
            value={editando ? editando.direccion : nuevoCliente.direccion}
            onChange={(e) => editando 
              ? setEditando({ ...editando, direccion: e.target.value }) 
              : setNuevoCliente({ ...nuevoCliente, direccion: e.target.value })}
            className="w-full p-2 mb-3 border border-gray-300 rounded"
          />

          <input
            type="text"
            placeholder="Teléfono"
            value={editando ? editando.telefono : nuevoCliente.telefono}
            onChange={(e) => editando 
              ? setEditando({ ...editando, telefono: e.target.value }) 
              : setNuevoCliente({ ...nuevoCliente, telefono: e.target.value })}
            className="w-full p-2 mb-3 border border-gray-300 rounded"
          />

          <button
            onClick={manejarEnvio}
            className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition duration-300"
          >
            {editando ? 'Actualizar Cliente' : 'Crear Cliente'}
          </button>

          {mensaje && <p className="text-green-500 mt-2">{mensaje}</p>}
        </div>

        <div className="flex flex-col justify-start rounded-lg bg-gray-50 p-6">
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
                <div className="flex gap-2">
                  <button
                    className="bg-blue-500 text-white px-2 py-1 rounded hover:bg-blue-600 transition duration-300"
                    onClick={() => abrirModalAsignacion(cliente)}
                  >
                    Asignar Menús
                  </button>
                  <button
                    className="bg-yellow-500 text-white px-2 py-1 rounded hover:bg-yellow-600 transition duration-300"
                    onClick={() => setEditando(cliente)}
                  >
                    Editar
                  </button>
                  <button
                    className="bg-red-500 text-white px-2 py-1 rounded hover:bg-red-600 transition duration-300"
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

      {clienteSeleccionado && (
        <AsignacionMenuModal
          isOpen={modalAbierto}
          onClose={() => {
            setModalAbierto(false);
            setClienteSeleccionado(null);
          }}
          clienteId={clienteSeleccionado.id}
          clienteNombre={clienteSeleccionado.nombre}
        />
      )}
    </main>
  );
}