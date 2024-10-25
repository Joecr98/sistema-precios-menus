import React, { useEffect, useState } from "react";
import { Table } from "lucide-react";

interface DetalleMenu {
  id: number;
  cantidad: number;
  es_extra: boolean;
  producto: {
    id: number;
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
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [menuSeleccionado, setMenuSeleccionado] = useState<Menu | null>(null);

  useEffect(() => {
    cargarMenus();
  }, []);

  const cargarMenus = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/menus");
      if (!response.ok) {
        throw new Error("Error al cargar los menús");
      }
      const data = await response.json();
      console.log("Datos recibidos:", data); // Para debugging
      setMenus(data);
    } catch (err) {
      setError("Error al cargar los menús");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const calcularCostoTotal = (detalles: DetalleMenu[]) => {
    return detalles.reduce((sum, detalle) => {
      //  precio_unidad y cantidad deben ser números
      const precioUnidad = Number(detalle.producto?.precio_unidad) || 0;
      const cantidad = Number(detalle.cantidad) || 0;
      return sum + precioUnidad * cantidad;
    }, 0);
  };

  const formatearFecha = (fecha: string) => {
    return new Date(fecha).toLocaleDateString("es-ES", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
        {error}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {menus.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          <Table className="mx-auto h-12 w-12 text-gray-400 mb-4" />
          <p>No hay menús creados aún.</p>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {menus.map((menu) => {
            const costoTotal = calcularCostoTotal(menu.detallesMenu);
            return (
              <div
                key={menu.id}
                className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow cursor-pointer p-6"
                onClick={() => setMenuSeleccionado(menu)}
              >
                <h3 className="text-lg font-semibold text-gray-800 mb-2">
                  {menu.nombre}
                </h3>
                <p className="text-sm text-gray-500 mb-4">
                  Creado el {formatearFecha(menu.fecha_creacion)}
                </p>
                <div className="space-y-2">
                  <p className="text-sm text-gray-600">
                    {menu.detallesMenu.length} productos
                  </p>
                  <p className="font-medium text-gray-800">
                    Costo Total: Q{costoTotal.toFixed(2)}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modal para ver detalles del menú */}
      {menuSeleccionado && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[80vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-xl font-semibold text-gray-800">
                    {menuSeleccionado.nombre}
                  </h3>
                  <p className="text-sm text-gray-500">
                    Creado el {formatearFecha(menuSeleccionado.fecha_creacion)}
                  </p>
                </div>
                <button
                  onClick={() => setMenuSeleccionado(null)}
                  className="text-gray-400 hover:text-gray-500"
                >
                  <span className="sr-only">Cerrar</span>
                  <svg
                    className="h-6 w-6"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </div>

              <div className="mt-6">
                <h4 className="font-medium text-gray-700 mb-3">
                  Productos del Menú
                </h4>
                <div className="space-y-3">
                  {menuSeleccionado.detallesMenu.map((detalle) => (
                    <div
                      key={detalle.id}
                      className="flex justify-between items-center p-3 bg-gray-50 rounded"
                    >
                      <div>
                        <p className="font-medium text-gray-800">
                          {detalle.producto.descripcion}
                          {detalle.es_extra && (
                            <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800">
                              Extra
                            </span>
                          )}
                        </p>
                        <p className="text-sm text-gray-500">
                          Cantidad: {detalle.cantidad}
                        </p>
                      </div>
                      <p className="font-medium text-gray-700">
                        Q
                        {(
                          detalle.producto.precio_unidad * detalle.cantidad
                        ).toFixed(2)}
                      </p>
                    </div>
                  ))}
                </div>
                <div className="mt-4 pt-4 border-t border-gray-200">
                  <div className="flex justify-between items-center">
                    <p className="font-semibold text-gray-800">Total</p>
                    <p className="font-semibold text-gray-800">
                      Q
                      {calcularCostoTotal(
                        menuSeleccionado.detallesMenu
                      ).toFixed(2)}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ListaMenus;
