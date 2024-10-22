"use client";

import { useState, useEffect } from 'react';

interface Client {
  id: number;
  name: string;
  email: string;
  phone: string;
}

export default function ClientCrudPage() {
  const [clients, setClients] = useState<Client[]>([]);
  const [formData, setFormData] = useState({ name: '', email: '', phone: '' });
  const [editMode, setEditMode] = useState<number | null>(null);

  // Cargar clientes desde localStorage al iniciar
  useEffect(() => {
    const storedClients = localStorage.getItem('clients');
    if (storedClients) {
      setClients(JSON.parse(storedClients));
    }
  }, []);

  // Guardar clientes en localStorage al cambiar
  useEffect(() => {
    localStorage.setItem('clients', JSON.stringify(clients));
  }, [clients]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = () => {
    if (editMode !== null) {
      setClients(
        clients.map((client) =>
          client.id === editMode ? { ...client, ...formData } : client
        )
      );
      setEditMode(null);
    } else {
      setClients([...clients, { id: clients.length + 1, ...formData }]);
    }
    setFormData({ name: '', email: '', phone: '' });
  };

  const handleEdit = (id: number) => {
    const client = clients.find((client) => client.id === id);
    if (client) {
      setFormData({ name: client.name, email: client.email, phone: client.phone });
      setEditMode(id);
    }
  };

  const handleDelete = (id: number) => {
    setClients(clients.filter((client) => client.id !== id));
  };

  return (
    <main className="flex min-h-screen flex-col p-6">
      <div className="flex h-20 shrink-0 items-end rounded-lg bg-blue-500 p-4 md:h-52">
        <h1 className="text-white text-3xl font-bold">Gestión de Clientes</h1>
      </div>
      <div className="mt-4 flex grow flex-col gap-4 md:flex-row">
        
        {/* Gestión de clientes (formulario) */}
        <div className="flex flex-col justify-center gap-6 rounded-lg bg-gray-50 px-6 py-10 md:w-2/5 md:px-20">
          {/* Formulario */}
          <form
            className="mb-6 p-6 bg-white shadow-md rounded-lg transition-transform hover:scale-105"
            onSubmit={(e) => {
              e.preventDefault();
              handleSubmit();
            }}
          >
            <div className="mb-4">
              <label className="block mb-2 font-semibold text-gray-700">Nombre</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className="w-full p-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
                required
              />
            </div>
            <div className="mb-4">
              <label className="block mb-2 font-semibold text-gray-700">Correo</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className="w-full p-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
                required
              />
            </div>
            <div className="mb-4">
              <label className="block mb-2 font-semibold text-gray-700">Teléfono</label>
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                className="w-full p-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
                required
              />
            </div>
            <button
              type="submit"
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-500 transition-colors font-semibold"
            >
              {editMode !== null ? 'Actualizar Cliente' : 'Agregar Cliente'}
            </button>
          </form>
        </div>

        {/* Lista de clientes */}
        <div className="flex flex-col justify-start rounded-lg bg-gray-50 shadow-md p-6 md:w-3/5 md:px-20">
          <h2 className="text-2xl font-semibold text-gray-800 mb-4">Lista de Clientes</h2>
          {clients.length > 0 ? (
            <table className="w-full text-left table-auto border-collapse">
              <thead className="bg-blue-500 text-white">
                <tr>
                  <th className="px-4 py-2">Nombre</th>
                  <th className="px-4 py-2">Correo</th>
                  <th className="px-4 py-2">Teléfono</th>
                  <th className="px-4 py-2">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {clients.map((client) => (
                  <tr key={client.id} className="hover:bg-gray-100 transition">
                    <td className="border px-4 py-2">{client.name}</td>
                    <td className="border px-4 py-2">{client.email}</td>
                    <td className="border px-4 py-2">{client.phone}</td>
                    <td className="border px-4 py-2">
                      <button
                        className="bg-yellow-500 text-white px-3 py-1 rounded-lg mr-2 hover:bg-yellow-400 transition"
                        onClick={() => handleEdit(client.id)}
                      >
                        Editar
                      </button>
                      <button
                        className="bg-red-500 text-white px-3 py-1 rounded-lg hover:bg-red-400 transition"
                        onClick={() => handleDelete(client.id)}
                      >
                        Eliminar
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <p className="text-gray-600">No se encontraron clientes.</p>
          )}
        </div>
      </div>
    </main>
  );
}
