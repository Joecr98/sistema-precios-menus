"use client";

import { useState } from 'react';
import CreacionMenu from '../../components/creacionMenu';
import ListaMenus from '../../components/listaMenus';
import { useRouter } from 'next/navigation';

interface Menu {
  id: number;
  nombre: string;
  detallesMenu: any[];
}

export default function MenusPage() {
  const [mostrarCreacion, setMostrarCreacion] = useState(false);
  const [menuParaEditar, setMenuParaEditar] = useState<Menu | null>(null);
  const router = useRouter();

  const handleEditarMenu = (menu: Menu) => {
    setMenuParaEditar(menu);
    setMostrarCreacion(true);
  };

  const handleCloseForm = () => {
    setMostrarCreacion(false);
    setMenuParaEditar(null);
    router.refresh();
  };

  return (
    <div className="container mx-auto p-4 min-w-[1200px] min-h-[500px]">
      <div className="flex justify-between items-center mb-6 px-4">
        <h1 className="text-2xl font-bold">Gestión de Menús</h1>
        <button
          onClick={() => {
            setMostrarCreacion(!mostrarCreacion);
            if (!mostrarCreacion) {
              setMenuParaEditar(null);
            }
          }}
          className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
        >
          {mostrarCreacion ? 'Volver a la Lista' : 'Crear Nuevo Menú'}
        </button>
      </div>

      <div className="flex justify-center">
        {mostrarCreacion ? (
          <CreacionMenu 
            menuParaEditar={menuParaEditar}
            onClose={handleCloseForm}
          />
        ) : (
          <ListaMenus onEditMenu={handleEditarMenu} />
        )}
      </div>
    </div>
  );
}