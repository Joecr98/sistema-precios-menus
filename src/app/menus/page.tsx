"use client";

import { useState } from 'react';
import CreacionMenu from '../../components/creacionMenu';
import { useRouter } from 'next/navigation';

export default function MenusPage() {
  const [mostrarCreacion, setMostrarCreacion] = useState(false);
  const router = useRouter();

  return (
    <div className="container mx-auto p-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Gestión de Menús</h1>
        <button
          onClick={() => setMostrarCreacion(!mostrarCreacion)}
          className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
        >
          {mostrarCreacion ? 'Volver a la Lista' : 'Crear Nuevo Menú'}
        </button>
      </div>

      {mostrarCreacion ? (
        <CreacionMenu />
      ) : (
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">Menús Existentes</h2>
          {/* para agregar una tabla o lista de menús existentes */}
          <div className="text-gray-500">
            No hay menús creados aún. Haga clic en "Crear Nuevo Menú" para comenzar.
          </div>
        </div>
      )}
    </div>
  );
}