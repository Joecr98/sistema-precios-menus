"use client";

import { useState, useEffect } from "react";
import { X, Trash2 } from "lucide-react";

interface DetalleMenu {
  id: number;
  cantidad: number;
  es_extra: boolean;
  producto: {
    descripcion: string;
    precio_unidad: number;
  };
}

interface Menu {
  id: number;
  nombre: string;
  fecha_creacion: string;
  detallesMenu: DetalleMenu[];
}

const ListaMenus = () => {
  const [menus, setMenus] = useState<Menu[]>([]);
  const [menuSeleccionado, setMenuSeleccionado] = useState<Menu | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchMenus = async () => {
    try {
      const response = await fetch("/api/menus");
      if (!response.ok) throw new Error("Error al cargar los menús");
      const data = await response.json();
      setMenus(data);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Error al cargar los menús"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMenus();
  }, []);

  const eliminarMenu = async (id: number) => {
    if (!confirm("¿Está seguro de que desea eliminar este menú?")) {
      return;
    }

    try {
      const response = await fetch(`/api/menus?id=${id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Error al eliminar el menú");
      }

      setMenus(menus.filter((menu) => menu.id !== id));
      setMenuSeleccionado(null);
      alert("Menú eliminado correctamente");
    } catch (error) {
      console.error("Error:", error);
      alert("Error al eliminar el menú");
    }
  };

  const calcularCostoTotal = (detalles: DetalleMenu[]) => {
    return detalles.reduce((total, detalle) => {
      return total + detalle.producto.precio_unidad * detalle.cantidad;
    }, 0);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return <div className="text-red-500 text-center p-4">{error}</div>;
  }

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {menus.map((menu) => (
          <div
            key={menu.id}
            className="bg-white rounded-lg shadow-md p-6 cursor-pointer hover:shadow-lg transition-shadow"
            onClick={() => setMenuSeleccionado(menu)}
          >
            <h3
              className="text-xl font-semibold mb-2 truncate"
              title={menu.nombre}
            >
              {menu.nombre}
            </h3>
            <p className="text-gray-600 text-sm mb-2">
              Creado el {new Date(menu.fecha_creacion).toLocaleDateString()}
            </p>
            <p className="text-gray-700 mb-2">
              {menu.detallesMenu.length} productos
            </p>
            <p className="font-semibold text-gray-800">
              Costo Total: Q{calcularCostoTotal(menu.detallesMenu).toFixed(2)}
            </p>
          </div>
        ))}
      </div>

      {menuSeleccionado && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg w-full max-w-2xl relative">
            <div className="absolute top-4 right-4 flex gap-2">
              {" "}
              {/* Contenedor para ambos botones */}
              <button
                onClick={() => eliminarMenu(menuSeleccionado.id)}
                className="p-2 bg-white text-red-500 hover:text-red-700 rounded-full shadow-md hover:shadow-lg transition-all"
                title="Eliminar menú"
              >
                <Trash2 className="w-6 h-6" />
              </button>
              <button
                onClick={() => setMenuSeleccionado(null)}
                className="p-2 bg-blue-500 text-white hover:bg-blue-600 rounded-full transition-colors"
                title="Cerrar"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="p-6">
              <div className="mb-6">
                <h2 className="text-2xl font-bold">
                  {menuSeleccionado.nombre}
                </h2>
                <p className="text-gray-600">
                  Creado el{" "}
                  {new Date(
                    menuSeleccionado.fecha_creacion
                  ).toLocaleDateString()}
                </p>
              </div>

              <h3 className="font-semibold mb-4">Productos del Menú</h3>
              <div className="space-y-4">
                {menuSeleccionado.detallesMenu.map((detalle) => (
                  <div
                    key={detalle.id}
                    className="flex justify-between items-center"
                  >
                    <div>
                      <p className="font-medium">
                        {detalle.producto.descripcion}
                      </p>
                      <p className="text-sm text-gray-600">
                        Cantidad: {detalle.cantidad}
                        {detalle.es_extra && (
                          <span className="ml-2 px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs">
                            Extra
                          </span>
                        )}
                      </p>
                    </div>
                    <p className="font-semibold">
                      Q
                      {(
                        detalle.producto.precio_unidad * detalle.cantidad
                      ).toFixed(2)}
                    </p>
                  </div>
                ))}
              </div>

              <div className="mt-6 pt-4 border-t border-gray-200">
                <div className="flex justify-end">
                  <p className="text-lg font-bold">
                    Total: Q
                    {calcularCostoTotal(menuSeleccionado.detallesMenu).toFixed(
                      2
                    )}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default ListaMenus;
