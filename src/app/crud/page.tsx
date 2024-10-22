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
        </div>
        <div className="mt-4 flex grow flex-col gap-4 md:flex-row">
          
          {/* Gestión de clientes (formulario) */}
          <div className="flex flex-col justify-center gap-6 rounded-lg bg-gray-50 px-6 py-10 md:w-2/5 md:px-20">
            {/* Formulario */}
            <form
              className="mb-6 p-4 bg-gray-100 rounded-lg"
              onSubmit={(e) => {
                e.preventDefault();
                handleSubmit();
              }}
            >
              <div className="mb-4">
                <label className="block mb-2 font-medium">Nombre</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className="w-full p-2 border rounded-lg"
                  required
                />
              </div>
              <div className="mb-4">
                <label className="block mb-2 font-medium">Correo</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full p-2 border rounded-lg"
                  required
                />
              </div>
              <div className="mb-4">
                <label className="block mb-2 font-medium">Teléfono</label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  className="w-full p-2 border rounded-lg"
                  required
                />
              </div>
              <button
                type="submit"
                className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-400 transition-colors"
              >
                {editMode !== null ? 'Actualizar Cliente' : 'Agregar Cliente'}
              </button>
            </form>
          </div>
  
          {/* Lista de clientes */}
          <div className="flex flex-col justify-start rounded-lg bg-gray-50 p-6 md:w-3/5 md:px-20">
            <h2 className="text-xl font-semibold mb-4">Lista de Clientes</h2>
            {clients.length > 0 ? (
              <table className="w-full text-left table-auto">
                <thead>
                  <tr>
                    <th className="px-4 py-2">Nombre</th>
                    <th className="px-4 py-2">Correo</th>
                    <th className="px-4 py-2">Teléfono</th>
                    <th className="px-4 py-2">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {clients.map((client) => (
                    <tr key={client.id}>
                      <td className="border px-4 py-2">{client.name}</td>
                      <td className="border px-4 py-2">{client.email}</td>
                      <td className="border px-4 py-2">{client.phone}</td>
                      <td className="border px-4 py-2">
                        <button
                          className="bg-yellow-500 text-white px-2 py-1 rounded-lg mr-2 hover:bg-yellow-400"
                          onClick={() => handleEdit(client.id)}
                        >
                          Editar
                        </button>
                        <button
                          className="bg-red-500 text-white px-2 py-1 rounded-lg hover:bg-red-400"
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
              <p>No se encontraron clientes.</p>
            )}
          </div>
        </div>
      </main>
    );
  }